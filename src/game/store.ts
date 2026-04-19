import { create } from 'zustand'
import type { Unit, Tile, Position, Faction, City, UnitType, CombatResult, Ruin, RuinResult } from './types'
import { UNIT_TEMPLATES } from './types'
import { getMoveCost } from './gamelogic'
import { generateMap, createInitialUnits, getMovementRange, createInitialCities, findSpawnPosition, createUnit, resolveCombat, createInitialRuins, exploreRuin, grantXp } from './gamelogic'

const FACTIONS: Faction[] = ['player', 'orcs', 'elves', 'bane']

interface GameStore {
  tiles: Tile[][]
  units: Unit[]
  cities: City[]
  ruins: Ruin[]
  gold: Record<Faction, number>
  selectedUnitId: string | null
  selectedCityId: string | null
  movementRange: Position[]
  currentFaction: Faction
  turnNumber: number
  combatResult: CombatResult | null
  ruinResult: RuinResult | null

  selectUnit: (id: string | null) => void
  moveUnit: (x: number, y: number) => void
  endTurn: () => void
  clickTile: (x: number, y: number) => void
  setProduction: (cityId: string, unitType: UnitType | null) => void
  dismissCombat: () => void
  dismissRuinResult: () => void
}

export const useGameStore = create<GameStore>((set, get) => ({
  tiles: generateMap(),
  units: createInitialUnits(),
  cities: createInitialCities(),
  ruins: createInitialRuins(),
  gold: { player: 0, orcs: 0, elves: 0, bane: 0 },
  selectedUnitId: null,
  selectedCityId: null,
  movementRange: [],
  currentFaction: 'player',
  turnNumber: 1,
  combatResult: null,
  ruinResult: null,

  selectUnit: (id) => {
    if (id === null) {
      set({ selectedUnitId: null, selectedCityId: null, movementRange: [] })
      return
    }
    const { units, tiles, currentFaction, ruins } = get()
    const unit = units.find((u) => u.id === id)
    if (!unit || unit.faction !== currentFaction) return
    if (unit.movesLeft <= 0) {
      set({ selectedUnitId: id, selectedCityId: null, movementRange: [] })
      return
    }
    const range = getMovementRange(unit, tiles, units, ruins)
    set({ selectedUnitId: id, selectedCityId: null, movementRange: range })
  },

  moveUnit: (x, y) => {
    const { selectedUnitId, movementRange, units, tiles, cities } = get()
    if (!selectedUnitId) return
    const inRange = movementRange.some((p) => p.x === x && p.y === y)
    if (!inRange) return

    const unit = units.find((u) => u.id === selectedUnitId)
    if (!unit) return

    // Check for enemy unit on target tile
    const enemy = units.find(
      (u) => u.x === x && u.y === y && u.faction !== unit.faction
    )

    if (enemy) {
      // Combat!
      const result = resolveCombat(unit, enemy, cities)
      let updatedUnits: Unit[]

      if (result.attackerWins) {
        // Remove defender, move attacker to tile with 0 moves left
        updatedUnits = units
          .filter((u) => u.id !== enemy.id)
          .map((u) => {
            if (u.id !== selectedUnitId) return u
            let moved = { ...u, x, y, movesLeft: 0 }
            // Grant XP to hero attacker
            if (moved.unitType === 'hero' && result.xpGained) {
              moved = grantXp(moved, result.xpGained)
            }
            return moved
          })
      } else {
        // Remove attacker; grant XP to hero defender
        updatedUnits = units
          .filter((u) => u.id !== selectedUnitId)
          .map((u) => {
            if (u.id !== enemy.id) return u
            if (u.unitType === 'hero' && result.xpGained) {
              return grantXp(u, result.xpGained)
            }
            return u
          })
      }

      // Capture city if attacker wins and there's one on the tile
      const updatedCities = result.attackerWins
        ? cities.map((c) =>
            c.x === x && c.y === y && c.owner !== unit.faction
              ? { ...c, owner: unit.faction, producing: null, turnsLeft: 0 }
              : c
          )
        : cities

      set({
        units: updatedUnits,
        cities: updatedCities,
        selectedUnitId: null,
        movementRange: [],
        combatResult: result,
      })
      return
    }

    // Calculate actual move cost via BFS path
    const cost = bfsMoveCost(unit, { x, y }, tiles, units)

    let updatedUnits = units.map((u) =>
      u.id === selectedUnitId
        ? { ...u, x, y, movesLeft: Math.max(0, u.movesLeft - cost) }
        : u
    )

    // Capture city if unit moves onto one not owned by its faction
    const updatedCities = cities.map((c) =>
      c.x === x && c.y === y && c.owner !== unit.faction
        ? { ...c, owner: unit.faction, producing: null, turnsLeft: 0 }
        : c
    )

    // Check for ruin exploration (heroes only)
    const { ruins, gold } = get()
    const ruin = ruins.find((r) => r.x === x && r.y === y && !r.explored)
    let ruinResult: RuinResult | null = null

    if (ruin && unit.unitType === 'hero') {
      const movedHero = updatedUnits.find((u) => u.id === selectedUnitId)!
      const { result, updatedHero, spawnedUnit, heroKilled } = exploreRuin(movedHero, updatedUnits, tiles)
      ruinResult = result

      if (heroKilled) {
        // Dragon killed the hero
        updatedUnits = updatedUnits.filter((u) => u.id !== selectedUnitId)
      } else {
        updatedUnits = updatedUnits.map((u) =>
          u.id === selectedUnitId ? { ...updatedHero, movesLeft: 0 } : u
        )
      }

      if (spawnedUnit) {
        updatedUnits = [...updatedUnits, spawnedUnit]
      }

      const updatedRuins = ruins.map((r) =>
        r.id === ruin.id ? { ...r, explored: true } : r
      )

      const updatedGold = result.goldAmount
        ? { ...gold, [unit.faction]: gold[unit.faction] + result.goldAmount }
        : gold

      set({ ruins: updatedRuins, gold: updatedGold })
    }

    // Recompute movement range for the moved unit
    const movedUnit = updatedUnits.find((u) => u.id === selectedUnitId)
    const { ruins: currentRuins } = get()
    const newRange =
      movedUnit && movedUnit.movesLeft > 0
        ? getMovementRange(movedUnit, tiles, updatedUnits, currentRuins)
        : []

    set({ units: updatedUnits, cities: updatedCities, movementRange: newRange, ruinResult })
  },

  endTurn: () => {
    const { currentFaction, turnNumber, units, cities, tiles } = get()
    const idx = FACTIONS.indexOf(currentFaction)
    const nextFaction = FACTIONS[(idx + 1) % FACTIONS.length]
    const newTurn = nextFaction === FACTIONS[0] ? turnNumber + 1 : turnNumber

    // Advance production for the current faction's cities and spawn units
    let newUnits = [...units]
    const updatedCities = cities.map((c) => {
      if (c.owner !== currentFaction || !c.producing) return c
      const remaining = c.turnsLeft - 1
      if (remaining <= 0) {
        // Production complete — spawn unit
        const pos = findSpawnPosition(c, newUnits, tiles)
        if (pos) {
          const spawned = createUnit(currentFaction, c.producing, pos)
          newUnits = [...newUnits, spawned]
        }
        return { ...c, producing: null, turnsLeft: 0 }
      }
      return { ...c, turnsLeft: remaining }
    })

    // Restore moves for the next faction's units
    const finalUnits = newUnits.map((u) =>
      u.faction === nextFaction ? { ...u, movesLeft: u.movesPerTurn } : u
    )

    set({
      currentFaction: nextFaction,
      turnNumber: newTurn,
      units: finalUnits,
      cities: updatedCities,
      selectedUnitId: null,
      selectedCityId: null,
      movementRange: [],
    })
  },

  clickTile: (x, y) => {
    const { units, cities, selectedUnitId, currentFaction, movementRange } = get()
    const unitOnTile = units.find((u) => u.x === x && u.y === y)

    if (unitOnTile && unitOnTile.faction === currentFaction) {
      get().selectUnit(unitOnTile.id)
    } else if (
      selectedUnitId &&
      movementRange.some((p) => p.x === x && p.y === y)
    ) {
      get().moveUnit(x, y)
    } else {
      // Check if there's a city on this tile
      const cityOnTile = cities.find((c) => c.x === x && c.y === y)
      if (cityOnTile) {
        set({ selectedUnitId: null, selectedCityId: cityOnTile.id, movementRange: [] })
      } else {
        set({ selectedUnitId: null, selectedCityId: null, movementRange: [] })
      }
    }
  },

  setProduction: (cityId, unitType) => {
    const { cities, currentFaction } = get()
    const city = cities.find((c) => c.id === cityId)
    if (!city || city.owner !== currentFaction) return

    const updatedCities = cities.map((c) => {
      if (c.id !== cityId) return c
      let turns = unitType ? UNIT_TEMPLATES[unitType].productionTurns : 0
      // Orcs: instant militia production
      if (currentFaction === 'orcs' && unitType === 'militia') {
        turns = 0
      }
      return { ...c, producing: unitType, turnsLeft: turns }
    })
    set({ cities: updatedCities })
  },

  dismissCombat: () => {
    set({ combatResult: null })
  },

  dismissRuinResult: () => {
    set({ ruinResult: null })
  },
}))

function bfsMoveCost(
  unit: Unit,
  target: Position,
  tiles: Tile[][],
  units: Unit[]
): number {
  const visited = new Map<string, number>()
  const queue: { x: number; y: number; cost: number }[] = [
    { x: unit.x, y: unit.y, cost: 0 },
  ]
  visited.set(`${unit.x},${unit.y}`, 0)

  const directions = [
    { dx: 0, dy: -1 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 0 },
    { dx: 1, dy: 0 },
  ]

  while (queue.length > 0) {
    const current = queue.shift()!
    if (current.x === target.x && current.y === target.y) return current.cost

    for (const { dx, dy } of directions) {
      const nx = current.x + dx
      const ny = current.y + dy
      if (nx < 0 || nx >= tiles[0].length || ny < 0 || ny >= tiles.length)
        continue

      const moveCost = getMoveCost(tiles[ny][nx].terrain, unit.faction)
      if (moveCost === Infinity) continue

      const totalCost = current.cost + moveCost
      const key = `${nx},${ny}`

      if (totalCost > unit.movesLeft) continue
      const prev = visited.get(key)
      if (prev !== undefined && prev <= totalCost) continue

      const occupied = units.find(
        (u) => u.x === nx && u.y === ny && u.id !== unit.id
      )
      if (occupied && occupied.faction === unit.faction) continue

      visited.set(key, totalCost)
      // Can attack enemy tile but not path through it
      if (occupied) {
        if (nx === target.x && ny === target.y) return totalCost
        continue
      }
      queue.push({ x: nx, y: ny, cost: totalCost })
    }
  }

  return unit.movesLeft // fallback
}