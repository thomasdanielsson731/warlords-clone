import { create } from 'zustand'
import type { Unit, Tile, Position, Faction, City, UnitType, CombatResult, Ruin, RuinResult } from './types'
import { UNIT_TEMPLATES, CITY_BONUSES } from './types'
import type { TutorialState } from './tutorial'
import { getMoveCost } from './gamelogic'
import { generateMap, createInitialUnits, getMovementRange, createInitialCities, findSpawnPosition, createUnit, resolveCombat, createInitialRuins, exploreRuin, grantXp, checkVictory, runAiTurn } from './gamelogic'
import { generateRoads, buildRoadSet } from './roads'
import type { Road } from './roads'
import { createFogState, updateFogOfWar } from './fogOfWar'
import type { FogState } from './fogOfWar'
import { createSaveData, saveGame, loadGame, autoSave, hasSave, hasAutoSave, getFogFromSave } from './saveLoad'

const FACTIONS: Faction[] = ['player', 'orcs', 'elves', 'bane']

interface GameStore {
  // Game state
  gamePhase: 'menu' | 'playing'
  playerName: string
  playerFaction: Faction
  tiles: Tile[][]
  units: Unit[]
  cities: City[]
  ruins: Ruin[]
  roads: Road[]
  roadSet: Set<string>
  fog: FogState
  gold: Record<Faction, number>
  selectedUnitId: string | null
  selectedCityId: string | null
  movementRange: Position[]
  currentFaction: Faction
  turnNumber: number
  combatResult: CombatResult | null
  ruinResult: RuinResult | null
  hoveredTile: Position | null
  victor: Faction | null
  saveMessage: string | null
  tutorialStep: number
  tutorialDismissed: boolean
  tutorial: TutorialState

  // Actions
  startGame: (playerName: string, faction: Faction) => void
  selectUnit: (id: string | null) => void
  moveUnit: (x: number, y: number) => void
  endTurn: () => void
  clickTile: (x: number, y: number) => void
  setProduction: (cityId: string, unitType: UnitType | null) => void
  dismissCombat: () => void
  dismissRuinResult: () => void
  setHoveredTile: (pos: Position | null) => void
  saveCurrentGame: () => void
  loadSavedGame: () => boolean
  dismissSaveMessage: () => void
  advanceTutorial: () => void
  dismissTutorial: () => void
}

// Generate initial world
const initialTiles = generateMap()
const initialCities = createInitialCities()
const initialRuins = createInitialRuins()
const initialRoads = generateRoads(initialTiles, initialCities, initialRuins)
const initialRoadSet = buildRoadSet(initialRoads)
const initialFog = updateFogOfWar(
  createFogState(),
  createInitialUnits(),
  initialCities,
  'player'
)

export const useGameStore = create<GameStore>((set, get) => ({
  gamePhase: 'menu',
  playerName: 'Player',
  playerFaction: 'player' as Faction,
  tiles: initialTiles,
  units: createInitialUnits(),
  cities: initialCities,
  ruins: initialRuins,
  roads: initialRoads,
  roadSet: initialRoadSet,
  fog: initialFog,
  gold: { player: 0, orcs: 0, elves: 0, bane: 0 },
  selectedUnitId: null,
  selectedCityId: null,
  movementRange: [],
  currentFaction: 'player',
  turnNumber: 1,
  combatResult: null,
  ruinResult: null,
  hoveredTile: null,
  victor: null,
  saveMessage: null,
  tutorialStep: 0,
  tutorialDismissed: false,
  tutorial: { heroSelected: false, cityCaptured: false, productionSet: false, ruinExplored: false, turnEnded: false },

  setHoveredTile: (pos) => set({ hoveredTile: pos }),

  startGame: (playerName, faction) => {
    const tiles = generateMap()
    const cities = createInitialCities()
    const ruins = createInitialRuins()
    const units = createInitialUnits()
    const roads = generateRoads(tiles, cities, ruins)
    const roadSet = buildRoadSet(roads)
    const fog = updateFogOfWar(createFogState(), units, cities, faction)
    set({
      gamePhase: 'playing',
      playerName,
      playerFaction: faction,
      tiles,
      cities,
      ruins,
      units,
      roads,
      roadSet,
      fog,
      gold: { player: 0, orcs: 0, elves: 0, bane: 0 },
      selectedUnitId: null,
      selectedCityId: null,
      movementRange: [],
      currentFaction: 'player',
      turnNumber: 1,
      combatResult: null,
      ruinResult: null,
      hoveredTile: null,
      victor: null,
    })
  },

  saveCurrentGame: () => {
    const s = get()
    const data = createSaveData(
      s.playerName, s.playerFaction, s.turnNumber,
      s.tiles, s.units, s.cities, s.ruins, s.roads, s.gold, s.fog
    )
    const ok = saveGame(data)
    set({ saveMessage: ok ? 'Game saved!' : 'Save failed — storage may be full' })
    setTimeout(() => set({ saveMessage: null }), 2000)
  },

  loadSavedGame: () => {
    const data = loadGame()
    if (!data) return false
    const fog = getFogFromSave(data)
    const roadSet = buildRoadSet(data.roads)
    set({
      gamePhase: 'playing',
      playerName: data.playerName,
      playerFaction: data.playerFaction,
      turnNumber: data.turnNumber,
      tiles: data.tiles,
      units: data.units,
      cities: data.cities,
      ruins: data.ruins,
      roads: data.roads,
      roadSet,
      fog,
      gold: data.gold,
      selectedUnitId: null,
      selectedCityId: null,
      movementRange: [],
      currentFaction: 'player',
      combatResult: null,
      ruinResult: null,
      hoveredTile: null,
      victor: null,
    })
    return true
  },

  dismissSaveMessage: () => set({ saveMessage: null }),

  advanceTutorial: () => {
    const { tutorialStep } = get()
    if (tutorialStep < 5) set({ tutorialStep: tutorialStep + 1 })
  },

  dismissTutorial: () => set({ tutorialDismissed: true }),

  selectUnit: (id) => {
    if (id === null) {
      set({ selectedUnitId: null, selectedCityId: null, movementRange: [] })
      return
    }
    const { units, tiles, currentFaction, ruins, roadSet } = get()
    const unit = units.find((u) => u.id === id)
    if (!unit || unit.faction !== currentFaction) return

    // Tutorial: track hero selection
    if (unit.unitType === 'hero') {
      const { tutorial, tutorialStep } = get()
      if (!tutorial.heroSelected) {
        set({ tutorial: { ...tutorial, heroSelected: true }, tutorialStep: Math.max(tutorialStep, 1) })
      }
    }

    if (unit.movesLeft <= 0) {
      set({ selectedUnitId: id, selectedCityId: null, movementRange: [] })
      return
    }
    const range = getMovementRange(unit, tiles, units, ruins, roadSet)
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
        victor: checkVictory(updatedCities),
      })
      return
    }

    // Calculate actual move cost via BFS path
    const { roadSet: rs } = get()
    const cost = bfsMoveCost(unit, { x, y }, tiles, units, rs)

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
    const { ruins: currentRuins, roadSet: currentRoadSet } = get()
    const newRange =
      movedUnit && movedUnit.movesLeft > 0
        ? getMovementRange(movedUnit, tiles, updatedUnits, currentRuins, currentRoadSet)
        : []

    // Update fog of war after movement
    const { fog, playerFaction } = get()
    const newFog = updateFogOfWar(fog, updatedUnits, updatedCities, playerFaction)

    // Tutorial tracking
    const { tutorial, tutorialStep } = get()
    const tutUpdates: Partial<TutorialState> = {}
    const cityWasCaptured = updatedCities.some((c) => c.owner === unit.faction && cities.find((oc) => oc.id === c.id && oc.owner !== unit.faction))
    if (cityWasCaptured && !tutorial.cityCaptured) tutUpdates.cityCaptured = true
    if (ruinResult && !tutorial.ruinExplored) tutUpdates.ruinExplored = true
    const newTut = Object.keys(tutUpdates).length > 0 ? { ...tutorial, ...tutUpdates } : tutorial
    let newStep = tutorialStep
    if (tutUpdates.cityCaptured) newStep = Math.max(newStep, 2)
    if (tutUpdates.ruinExplored) newStep = Math.max(newStep, 4)

    set({ units: updatedUnits, cities: updatedCities, movementRange: newRange, ruinResult, fog: newFog, tutorial: newTut, tutorialStep: newStep })
  },

  endTurn: () => {
    const { currentFaction, turnNumber, units, cities, tiles, ruins } = get()

    // Advance production for the current faction's cities and spawn units
    // Canon: continuous production — restart with same unit type after spawning
    let newUnits = [...units]
    let updatedCities = cities.map((c) => {
      if (c.owner !== currentFaction || !c.producing) return c
      const remaining = c.turnsLeft - 1
      if (remaining <= 0) {
        // Production complete — spawn unit
        const pos = findSpawnPosition(c, newUnits, tiles)
        if (pos) {
          const spawned = createUnit(currentFaction, c.producing, pos)
          // Apply city bonuses to spawned unit
          const bonus = CITY_BONUSES[c.id]
          if (bonus?.type === 'unit_strength') spawned.strength += bonus.value
          if (bonus?.type === 'special_unit' && bonus.unitType === c.producing) spawned.strength += bonus.value
          newUnits = [...newUnits, spawned]
        }
        // Continuous production: restart with same unit type
        const newTurns = UNIT_TEMPLATES[c.producing].productionTurns
        return { ...c, turnsLeft: currentFaction === 'orcs' && c.producing === 'militia' ? 1 : newTurns }
      }
      return { ...c, turnsLeft: remaining }
    })

    // Determine next faction
    const idx = FACTIONS.indexOf(currentFaction)
    let nextIdx = (idx + 1) % FACTIONS.length
    let nextFaction = FACTIONS[nextIdx]
    const newTurn = nextFaction === FACTIONS[0] ? turnNumber + 1 : turnNumber

    // Run AI for all non-player factions between now and next player turn
    let aiUnits = newUnits
    let aiCities = updatedCities
    while (nextFaction !== 'player') {
      // Restore moves for AI faction
      aiUnits = aiUnits.map((u) =>
        u.faction === nextFaction ? { ...u, movesLeft: u.movesPerTurn } : u
      )

      // AI production: advance their cities
      aiCities = aiCities.map((c) => {
        if (c.owner !== nextFaction || !c.producing) return c
        const remaining = c.turnsLeft - 1
        if (remaining <= 0) {
          const pos = findSpawnPosition(c, aiUnits, tiles)
          if (pos) {
            const spawned = createUnit(nextFaction, c.producing, pos)
            aiUnits = [...aiUnits, spawned]
          }
          const newTurns = UNIT_TEMPLATES[c.producing].productionTurns
          return { ...c, turnsLeft: newTurns }
        }
        return { ...c, turnsLeft: remaining }
      })

      // AI moves
      const aiResult = runAiTurn(nextFaction, aiUnits, aiCities, tiles, ruins)
      aiUnits = aiResult.units
      aiCities = aiResult.cities

      nextIdx = (nextIdx + 1) % FACTIONS.length
      nextFaction = FACTIONS[nextIdx]
    }

    // Restore moves for the player
    const finalUnits = aiUnits.map((u) =>
      u.faction === 'player' ? { ...u, movesLeft: u.movesPerTurn } : u
    )

    // Check victory
    const victor = checkVictory(aiCities)

    // Update fog of war
    const { fog, playerFaction, playerName, tiles: currentTiles, ruins: currentRuins, roads: currentRoads, gold: currentGold } = get()
    const newFog = updateFogOfWar(fog, finalUnits, aiCities, playerFaction)

    // City bonus gold income: each faction earns gold from owned cities with gold bonuses
    const updatedGold = { ...currentGold }
    for (const faction of FACTIONS) {
      // Base income: 1 gold per city
      const ownedCities = aiCities.filter((c) => c.owner === faction)
      updatedGold[faction] += ownedCities.length
      // Bonus income from city bonuses
      for (const c of ownedCities) {
        const bonus = CITY_BONUSES[c.id]
        if (bonus?.type === 'gold') updatedGold[faction] += bonus.value
      }
    }

    // Tutorial: track turn end
    const { tutorial, tutorialStep } = get()
    const tutTurnEnd = !tutorial.turnEnded ? { ...tutorial, turnEnded: true } : tutorial
    const newTutStep = !tutorial.turnEnded ? Math.max(tutorialStep, 5) : tutorialStep

    set({
      currentFaction: 'player',
      turnNumber: newTurn,
      units: finalUnits,
      cities: aiCities,
      selectedUnitId: null,
      selectedCityId: null,
      movementRange: [],
      victor,
      fog: newFog,
      gold: updatedGold,
      tutorial: tutTurnEnd,
      tutorialStep: newTutStep,
    })

    // Autosave at end of turn
    const s = get()
    const saveData = createSaveData(
      s.playerName, s.playerFaction, s.turnNumber,
      s.tiles, s.units, s.cities, s.ruins, s.roads, s.gold, s.fog
    )
    autoSave(saveData)
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
    const { cities, currentFaction, units, tiles } = get()
    const city = cities.find((c) => c.id === cityId)
    if (!city || city.owner !== currentFaction) return

    // Orcs: instant militia production — spawn immediately
    if (currentFaction === 'orcs' && unitType === 'militia') {
      const pos = findSpawnPosition(city, units, tiles)
      if (pos) {
        const spawned = createUnit(currentFaction, 'militia', pos)
        const updatedCities = cities.map((c) =>
          c.id !== cityId ? c : { ...c, producing: unitType, turnsLeft: 1 }
        )
        set({ units: [...units, spawned], cities: updatedCities })
        return
      }
    }

    const updatedCities = cities.map((c) => {
      if (c.id !== cityId) return c
      let turns = unitType ? UNIT_TEMPLATES[unitType].productionTurns : 0
      // City bonus: production_speed reduces turns by bonus value (min 1)
      if (unitType && turns > 1) {
        const bonus = CITY_BONUSES[c.id]
        if (bonus?.type === 'production_speed') turns = Math.max(1, turns - bonus.value)
      }
      return { ...c, producing: unitType, turnsLeft: turns }
    })

    // Tutorial: track production set
    const { tutorial, tutorialStep } = get()
    if (!tutorial.productionSet) {
      set({ cities: updatedCities, tutorial: { ...tutorial, productionSet: true }, tutorialStep: Math.max(tutorialStep, 3) })
    } else {
      set({ cities: updatedCities })
    }
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
  units: Unit[],
  roadSet?: Set<string>
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

      const onRoad = roadSet?.has(`${nx},${ny}`) ?? false
      const moveCost = getMoveCost(tiles[ny][nx].terrain, unit.faction, onRoad)
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