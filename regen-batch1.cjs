// Regeneration script — batch 1: game logic layer
const fs = require('fs');
const path = require('path');
const SRC = 'c:/dev/warlords/src';

function write(relPath, content) {
  const full = path.join(SRC, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('Wrote', relPath, '—', content.split('\n').length, 'lines');
}

// ═══════════════════════════════════════════════════════════════════════════
// store.ts
// ═══════════════════════════════════════════════════════════════════════════
write('game/store.ts', `import { create } from 'zustand'
import type { Unit, Tile, Position, Faction, City, UnitType, CombatResult, Ruin, RuinResult } from './types'
import { UNIT_TEMPLATES, CITY_BONUSES } from './types'
import type { TutorialState } from './tutorial'
import { getMoveCost } from './gamelogic'
import {
  generateMap, createInitialUnits, getMovementRange, createInitialCities,
  findSpawnPosition, createUnit, resolveCombat, createInitialRuins,
  exploreRuin, grantXp, checkVictory, runAiTurn,
} from './gamelogic'
import { generateRoads, buildRoadSet } from './roads'
import type { Road } from './roads'
import { createFogState, updateFogOfWar } from './fogOfWar'
import type { FogState } from './fogOfWar'
import { createSaveData, saveGame, loadGame, autoSave, getFogFromSave } from './saveLoad'

const FACTIONS: Faction[] = ['player', 'orcs', 'elves', 'bane']

interface GameStore {
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

const initialTiles = generateMap()
const initialCities = createInitialCities()
const initialRuins = createInitialRuins()
const initialRoads = generateRoads(initialTiles, initialCities, initialRuins)
const initialRoadSet = buildRoadSet(initialRoads)
const initialFog = updateFogOfWar(createFogState(), createInitialUnits(), initialCities, 'player')

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
      gamePhase: 'playing', playerName, playerFaction: faction,
      tiles, cities, ruins, units, roads, roadSet, fog,
      gold: { player: 0, orcs: 0, elves: 0, bane: 0 },
      selectedUnitId: null, selectedCityId: null, movementRange: [],
      currentFaction: 'player', turnNumber: 1,
      combatResult: null, ruinResult: null, hoveredTile: null, victor: null,
      tutorialStep: 0, tutorialDismissed: false,
      tutorial: { heroSelected: false, cityCaptured: false, productionSet: false, ruinExplored: false, turnEnded: false },
    })
  },

  saveCurrentGame: () => {
    const s = get()
    const data = createSaveData(s.playerName, s.playerFaction, s.turnNumber, s.tiles, s.units, s.cities, s.ruins, s.roads, s.gold, s.fog)
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
      gamePhase: 'playing', playerName: data.playerName, playerFaction: data.playerFaction,
      turnNumber: data.turnNumber, tiles: data.tiles, units: data.units,
      cities: data.cities, ruins: data.ruins, roads: data.roads, roadSet, fog,
      gold: data.gold, selectedUnitId: null, selectedCityId: null, movementRange: [],
      currentFaction: 'player', combatResult: null, ruinResult: null, hoveredTile: null, victor: null,
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
    const unit = units.find(u => u.id === id)
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
    if (!movementRange.some(p => p.x === x && p.y === y)) return

    const unit = units.find(u => u.id === selectedUnitId)
    if (!unit) return

    // Check for enemy on target
    const enemy = units.find(u => u.x === x && u.y === y && u.faction !== unit.faction)

    if (enemy) {
      const result = resolveCombat(unit, enemy, cities)
      let updatedUnits: Unit[]

      if (result.attackerWins) {
        updatedUnits = units
          .filter(u => u.id !== enemy.id)
          .map(u => {
            if (u.id !== selectedUnitId) return u
            let moved = { ...u, x, y, movesLeft: 0 }
            if (moved.unitType === 'hero' && result.xpGained) moved = grantXp(moved, result.xpGained)
            return moved
          })
      } else {
        updatedUnits = units
          .filter(u => u.id !== selectedUnitId)
          .map(u => {
            if (u.id !== enemy.id) return u
            if (u.unitType === 'hero' && result.xpGained) return grantXp(u, result.xpGained)
            return u
          })
      }

      const updatedCities = result.attackerWins
        ? cities.map(c => c.x === x && c.y === y && c.owner !== unit.faction
            ? { ...c, owner: unit.faction, producing: null, turnsLeft: 0 } : c)
        : cities

      set({
        units: updatedUnits, cities: updatedCities,
        selectedUnitId: null, movementRange: [], combatResult: result,
        victor: checkVictory(updatedCities),
      })
      return
    }

    // Normal move — calculate BFS cost
    const { roadSet: rs } = get()
    const cost = bfsMoveCost(unit, { x, y }, tiles, units, rs)

    let updatedUnits = units.map(u =>
      u.id === selectedUnitId ? { ...u, x, y, movesLeft: Math.max(0, u.movesLeft - cost) } : u
    )
    const updatedCities = cities.map(c =>
      c.x === x && c.y === y && c.owner !== unit.faction
        ? { ...c, owner: unit.faction, producing: null, turnsLeft: 0 } : c
    )

    // Ruin exploration (heroes only)
    const { ruins, gold } = get()
    const ruin = ruins.find(r => r.x === x && r.y === y && !r.explored)
    let ruinResult: RuinResult | null = null

    if (ruin && unit.unitType === 'hero') {
      const movedHero = updatedUnits.find(u => u.id === selectedUnitId)!
      const { result, updatedHero, spawnedUnit, heroKilled } = exploreRuin(movedHero, updatedUnits, tiles)
      ruinResult = result

      if (heroKilled) {
        updatedUnits = updatedUnits.filter(u => u.id !== selectedUnitId)
      } else {
        updatedUnits = updatedUnits.map(u => u.id === selectedUnitId ? { ...updatedHero, movesLeft: 0 } : u)
      }
      if (spawnedUnit) updatedUnits = [...updatedUnits, spawnedUnit]

      const updatedRuins = ruins.map(r => r.id === ruin.id ? { ...r, explored: true } : r)
      const updatedGold = result.goldAmount
        ? { ...gold, [unit.faction]: gold[unit.faction] + result.goldAmount }
        : gold
      set({ ruins: updatedRuins, gold: updatedGold })
    }

    // Recompute movement range
    const movedUnit = updatedUnits.find(u => u.id === selectedUnitId)
    const { ruins: currentRuins, roadSet: currentRoadSet } = get()
    const newRange = movedUnit && movedUnit.movesLeft > 0
      ? getMovementRange(movedUnit, tiles, updatedUnits, currentRuins, currentRoadSet)
      : []

    // Update fog
    const { fog, playerFaction } = get()
    const newFog = updateFogOfWar(fog, updatedUnits, updatedCities, playerFaction)

    // Tutorial tracking
    const { tutorial, tutorialStep } = get()
    const tutUpdates: Partial<TutorialState> = {}
    const cityWasCaptured = updatedCities.some(c =>
      c.owner === unit.faction && cities.find(oc => oc.id === c.id && oc.owner !== unit.faction)
    )
    if (cityWasCaptured && !tutorial.cityCaptured) tutUpdates.cityCaptured = true
    if (ruinResult && !tutorial.ruinExplored) tutUpdates.ruinExplored = true
    const newTut = Object.keys(tutUpdates).length > 0 ? { ...tutorial, ...tutUpdates } : tutorial
    let newStep = tutorialStep
    if (tutUpdates.cityCaptured) newStep = Math.max(newStep, 2)
    if (tutUpdates.ruinExplored) newStep = Math.max(newStep, 4)

    set({
      units: updatedUnits, cities: updatedCities, movementRange: newRange,
      ruinResult, fog: newFog, tutorial: newTut, tutorialStep: newStep,
    })
  },

  endTurn: () => {
    const { currentFaction, turnNumber, units, cities, tiles, ruins } = get()

    // Advance production + spawn
    let newUnits = [...units]
    let updatedCities = cities.map(c => {
      if (c.owner !== currentFaction || !c.producing) return c
      const remaining = c.turnsLeft - 1
      if (remaining <= 0) {
        const pos = findSpawnPosition(c, newUnits, tiles)
        if (pos) {
          const spawned = createUnit(currentFaction, c.producing, pos)
          const bonus = CITY_BONUSES[c.id]
          if (bonus?.type === 'unit_strength') spawned.strength += bonus.value
          if (bonus?.type === 'special_unit' && bonus.unitType === c.producing) spawned.strength += bonus.value
          newUnits = [...newUnits, spawned]
        }
        const newTurns = UNIT_TEMPLATES[c.producing].productionTurns
        return { ...c, turnsLeft: currentFaction === 'orcs' && c.producing === 'militia' ? 1 : newTurns }
      }
      return { ...c, turnsLeft: remaining }
    })

    // Run all AI factions
    const idx = FACTIONS.indexOf(currentFaction)
    let nextIdx = (idx + 1) % FACTIONS.length
    let nextFaction = FACTIONS[nextIdx]
    const newTurn = nextFaction === FACTIONS[0] ? turnNumber + 1 : turnNumber

    let aiUnits = newUnits
    let aiCities = updatedCities
    while (nextFaction !== 'player') {
      aiUnits = aiUnits.map(u => u.faction === nextFaction ? { ...u, movesLeft: u.movesPerTurn } : u)

      aiCities = aiCities.map(c => {
        if (c.owner !== nextFaction || !c.producing) return c
        const remaining = c.turnsLeft - 1
        if (remaining <= 0) {
          const pos = findSpawnPosition(c, aiUnits, tiles)
          if (pos) {
            const spawned = createUnit(nextFaction, c.producing, pos)
            aiUnits = [...aiUnits, spawned]
          }
          return { ...c, turnsLeft: UNIT_TEMPLATES[c.producing].productionTurns }
        }
        return { ...c, turnsLeft: remaining }
      })

      const aiResult = runAiTurn(nextFaction, aiUnits, aiCities, tiles, ruins)
      aiUnits = aiResult.units
      aiCities = aiResult.cities
      nextIdx = (nextIdx + 1) % FACTIONS.length
      nextFaction = FACTIONS[nextIdx]
    }

    const finalUnits = aiUnits.map(u => u.faction === 'player' ? { ...u, movesLeft: u.movesPerTurn } : u)
    const victor = checkVictory(aiCities)

    const { fog, playerFaction, gold: currentGold } = get()
    const newFog = updateFogOfWar(fog, finalUnits, aiCities, playerFaction)

    // Gold income
    const updatedGold = { ...currentGold }
    for (const faction of FACTIONS) {
      const ownedCities = aiCities.filter(c => c.owner === faction)
      updatedGold[faction] += ownedCities.length
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
      currentFaction: 'player', turnNumber: newTurn,
      units: finalUnits, cities: aiCities,
      selectedUnitId: null, selectedCityId: null, movementRange: [],
      victor, fog: newFog, gold: updatedGold,
      tutorial: tutTurnEnd, tutorialStep: newTutStep,
    })

    // Autosave
    const s = get()
    const saveData = createSaveData(
      s.playerName, s.playerFaction, s.turnNumber,
      s.tiles, s.units, s.cities, s.ruins, s.roads, s.gold, s.fog
    )
    autoSave(saveData)
  },

  clickTile: (x, y) => {
    const { units, cities, selectedUnitId, currentFaction, movementRange } = get()
    const unitOnTile = units.find(u => u.x === x && u.y === y)

    if (unitOnTile && unitOnTile.faction === currentFaction) {
      get().selectUnit(unitOnTile.id)
    } else if (selectedUnitId && movementRange.some(p => p.x === x && p.y === y)) {
      get().moveUnit(x, y)
    } else {
      const cityOnTile = cities.find(c => c.x === x && c.y === y)
      if (cityOnTile) {
        set({ selectedUnitId: null, selectedCityId: cityOnTile.id, movementRange: [] })
      } else {
        set({ selectedUnitId: null, selectedCityId: null, movementRange: [] })
      }
    }
  },

  setProduction: (cityId, unitType) => {
    const { cities, currentFaction, units, tiles } = get()
    const city = cities.find(c => c.id === cityId)
    if (!city || city.owner !== currentFaction) return

    // Orcs: instant militia
    if (currentFaction === 'orcs' && unitType === 'militia') {
      const pos = findSpawnPosition(city, units, tiles)
      if (pos) {
        const spawned = createUnit(currentFaction, 'militia', pos)
        const updatedCities = cities.map(c => c.id !== cityId ? c : { ...c, producing: unitType, turnsLeft: 1 })
        set({ units: [...units, spawned], cities: updatedCities })
        return
      }
    }

    const updatedCities = cities.map(c => {
      if (c.id !== cityId) return c
      let turns = unitType ? UNIT_TEMPLATES[unitType].productionTurns : 0
      if (unitType && turns > 1) {
        const bonus = CITY_BONUSES[c.id]
        if (bonus?.type === 'production_speed') turns = Math.max(1, turns - bonus.value)
      }
      return { ...c, producing: unitType, turnsLeft: turns }
    })

    const { tutorial, tutorialStep } = get()
    if (!tutorial.productionSet) {
      set({ cities: updatedCities, tutorial: { ...tutorial, productionSet: true }, tutorialStep: Math.max(tutorialStep, 3) })
    } else {
      set({ cities: updatedCities })
    }
  },

  dismissCombat: () => set({ combatResult: null }),
  dismissRuinResult: () => set({ ruinResult: null }),
}))

// ── BFS move cost helper ──────────────────────────────────────────────────
function bfsMoveCost(unit: Unit, target: Position, tiles: Tile[][], units: Unit[], roadSet?: Set<string>): number {
  const visited = new Map<string, number>()
  const queue: { x: number; y: number; cost: number }[] = [{ x: unit.x, y: unit.y, cost: 0 }]
  visited.set(\`\${unit.x},\${unit.y}\`, 0)
  const dirs = [{ dx: 0, dy: -1 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }, { dx: 1, dy: 0 }]

  while (queue.length > 0) {
    const cur = queue.shift()!
    if (cur.x === target.x && cur.y === target.y) return cur.cost

    for (const { dx, dy } of dirs) {
      const nx = cur.x + dx, ny = cur.y + dy
      if (nx < 0 || nx >= tiles[0].length || ny < 0 || ny >= tiles.length) continue

      const onRoad = roadSet?.has(\`\${nx},\${ny}\`) ?? false
      const moveCost = getMoveCost(tiles[ny][nx].terrain, unit.faction, onRoad)
      if (moveCost === Infinity) continue

      const totalCost = cur.cost + moveCost
      const key = \`\${nx},\${ny}\`
      if (totalCost > unit.movesLeft) continue
      const prev = visited.get(key)
      if (prev !== undefined && prev <= totalCost) continue

      const occupied = units.find(u => u.x === nx && u.y === ny && u.id !== unit.id)
      if (occupied && occupied.faction === unit.faction) continue

      visited.set(key, totalCost)
      if (occupied) {
        if (nx === target.x && ny === target.y) return totalCost
        continue
      }
      queue.push({ x: nx, y: ny, cost: totalCost })
    }
  }
  return unit.movesLeft
}
`);

// ═══════════════════════════════════════════════════════════════════════════
// roads.ts
// ═══════════════════════════════════════════════════════════════════════════
write('game/roads.ts', `import type { Tile, City, Ruin, Position, TerrainType } from './types'
import { MAP_WIDTH, MAP_HEIGHT, TERRAIN_MOVE_COST } from './types'

export interface RoadSegment { x: number; y: number }

export interface Road {
  id: string
  from: Position
  to: Position
  path: RoadSegment[]
}

export const ROAD_MOVE_COST = 1

const MAX_ROAD_DISTANCE = 30

export function generateRoads(tiles: Tile[][], cities: City[], ruins: Ruin[]): Road[] {
  const roads: Road[] = []
  const connectedPairs = new Set<string>()
  const roadSet = new Set<string>()

  const cityPositions = cities.map(c => ({ x: c.x, y: c.y, id: c.id }))
  const ruinPositions = ruins.slice(0, 4).map(r => ({ x: r.x, y: r.y, id: r.id }))
  const allTargets = [...cityPositions, ...ruinPositions]

  for (const city of cityPositions) {
    const sorted = allTargets
      .filter(t => t.id !== city.id)
      .map(t => ({ target: t, dist: Math.abs(t.x - city.x) + Math.abs(t.y - city.y) }))
      .filter(t => t.dist <= MAX_ROAD_DISTANCE)
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 3)

    for (const { target } of sorted) {
      const pairKey = [city.id, target.id].sort().join('-')
      if (connectedPairs.has(pairKey)) continue
      connectedPairs.add(pairKey)

      const path = findRoadPath(tiles, city, target, roadSet)
      if (path.length > 0) {
        roads.push({ id: \`road-\${city.id}-\${target.id}\`, from: { x: city.x, y: city.y }, to: { x: target.x, y: target.y }, path })
        for (const seg of path) roadSet.add(\`\${seg.x},\${seg.y}\`)
      }
    }
  }
  return roads
}

export function buildRoadSet(roads: Road[]): Set<string> {
  const set = new Set<string>()
  for (const road of roads) {
    for (const seg of road.path) set.add(\`\${seg.x},\${seg.y}\`)
  }
  return set
}

export function isOnRoad(roadSet: Set<string>, x: number, y: number): boolean {
  return roadSet.has(\`\${x},\${y}\`)
}

// ── A* pathfinding for road generation ────────────────────────────────────

const ROAD_TERRAIN_COST: Record<TerrainType, number> = {
  grass: 1, forest: 3, mountain: 6, water: Infinity,
}

interface AStarNode { x: number; y: number; g: number; f: number; parent: string | null }

function findRoadPath(tiles: Tile[][], from: Position, to: Position, existingRoads: Set<string>): RoadSegment[] {
  const w = tiles[0]?.length ?? MAP_WIDTH
  const h = tiles.length ?? MAP_HEIGHT
  const openSet = new Map<string, AStarNode>()
  const closedSet = new Map<string, AStarNode>()

  const startKey = \`\${from.x},\${from.y}\`
  const endKey = \`\${to.x},\${to.y}\`
  openSet.set(startKey, { x: from.x, y: from.y, g: 0, f: heuristic(from, to), parent: null })

  const dirs = [{ dx: 0, dy: -1 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }, { dx: 1, dy: 0 }]

  while (openSet.size > 0) {
    let bestKey = '', bestF = Infinity
    for (const [key, node] of openSet) {
      if (node.f < bestF) { bestF = node.f; bestKey = key }
    }

    const current = openSet.get(bestKey)!
    openSet.delete(bestKey)
    closedSet.set(bestKey, current)

    if (bestKey === endKey) return reconstructPath(closedSet, endKey, startKey)

    for (const { dx, dy } of dirs) {
      const nx = current.x + dx, ny = current.y + dy
      if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue
      const nKey = \`\${nx},\${ny}\`
      if (closedSet.has(nKey)) continue

      const terrain = tiles[ny][nx].terrain
      const baseCost = ROAD_TERRAIN_COST[terrain]
      if (baseCost === Infinity) continue

      const roadBonus = existingRoads.has(nKey) ? 0.5 : baseCost
      const tentativeG = current.g + roadBonus
      const existing = openSet.get(nKey)
      if (existing && existing.g <= tentativeG) continue

      openSet.set(nKey, { x: nx, y: ny, g: tentativeG, f: tentativeG + heuristic({ x: nx, y: ny }, to), parent: bestKey })
    }
  }
  return []
}

function heuristic(a: Position, b: Position): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
}

function reconstructPath(closedSet: Map<string, AStarNode>, endKey: string, startKey: string): RoadSegment[] {
  const path: RoadSegment[] = []
  let currentKey: string | null = endKey
  while (currentKey && currentKey !== startKey) {
    const node = closedSet.get(currentKey)
    if (!node) break
    path.push({ x: node.x, y: node.y })
    currentKey = node.parent
  }
  return path.reverse()
}
`);

// ═══════════════════════════════════════════════════════════════════════════
// fogOfWar.ts
// ═══════════════════════════════════════════════════════════════════════════
write('game/fogOfWar.ts', `import type { Unit, City, Faction } from './types'
import { MAP_WIDTH, MAP_HEIGHT } from './types'

export type VisibilityState = 'hidden' | 'explored' | 'visible'

const UNIT_VISION = 4
const HERO_VISION = 6
const CITY_VISION = 5

export interface FogState {
  data: Uint8Array
  width: number
  height: number
}

export function createFogState(width = MAP_WIDTH, height = MAP_HEIGHT): FogState {
  return { data: new Uint8Array(width * height), width, height }
}

export function getVisibility(fog: FogState, x: number, y: number): VisibilityState {
  if (x < 0 || x >= fog.width || y < 0 || y >= fog.height) return 'hidden'
  const v = fog.data[y * fog.width + x]
  if (v === 2) return 'visible'
  if (v === 1) return 'explored'
  return 'hidden'
}

export function updateFogOfWar(fog: FogState, units: Unit[], cities: City[], faction: Faction): FogState {
  const newData = new Uint8Array(fog.data.length)
  for (let i = 0; i < fog.data.length; i++) {
    if (fog.data[i] >= 1) newData[i] = 1
  }

  for (const unit of units.filter(u => u.faction === faction)) {
    const radius = unit.unitType === 'hero' ? HERO_VISION : UNIT_VISION
    revealCircle(newData, fog.width, fog.height, unit.x, unit.y, radius)
  }
  for (const city of cities.filter(c => c.owner === faction)) {
    revealCircle(newData, fog.width, fog.height, city.x, city.y, CITY_VISION)
  }
  return { ...fog, data: newData }
}

function revealCircle(data: Uint8Array, w: number, h: number, cx: number, cy: number, r: number): void {
  const r2 = r * r
  for (let y = Math.max(0, cy - r); y <= Math.min(h - 1, cy + r); y++) {
    for (let x = Math.max(0, cx - r); x <= Math.min(w - 1, cx + r); x++) {
      if ((x - cx) ** 2 + (y - cy) ** 2 <= r2) data[y * w + x] = 2
    }
  }
}

export function isVisible(fog: FogState, x: number, y: number): boolean {
  return getVisibility(fog, x, y) === 'visible'
}

export function isExplored(fog: FogState, x: number, y: number): boolean {
  const v = getVisibility(fog, x, y)
  return v === 'visible' || v === 'explored'
}

export function serializeFog(fog: FogState): string {
  const runs: number[] = []
  let current = fog.data[0], count = 1
  for (let i = 1; i < fog.data.length; i++) {
    if (fog.data[i] === current) { count++ }
    else { runs.push(current, count); current = fog.data[i]; count = 1 }
  }
  runs.push(current, count)
  return JSON.stringify({ w: fog.width, h: fog.height, rle: runs })
}

export function deserializeFog(json: string): FogState {
  const { w, h, rle } = JSON.parse(json)
  const data = new Uint8Array(w * h)
  let idx = 0
  for (let i = 0; i < rle.length; i += 2) {
    const value = rle[i], count = rle[i + 1]
    for (let j = 0; j < count; j++) data[idx++] = value
  }
  return { data, width: w, height: h }
}
`);

// ═══════════════════════════════════════════════════════════════════════════
// saveLoad.ts
// ═══════════════════════════════════════════════════════════════════════════
write('game/saveLoad.ts', `import type { Tile, Unit, City, Ruin, Faction } from './types'
import type { Road } from './roads'
import type { FogState } from './fogOfWar'
import { serializeFog, deserializeFog } from './fogOfWar'

const SAVE_VERSION = 1
const SAVE_KEY = 'warlords2026_save'
const AUTOSAVE_KEY = 'warlords2026_autosave'

export interface SaveData {
  version: number
  timestamp: number
  playerName: string
  playerFaction: Faction
  turnNumber: number
  tiles: Tile[][]
  units: Unit[]
  cities: City[]
  ruins: Ruin[]
  roads: Road[]
  gold: Record<Faction, number>
  fog: string
}

export function createSaveData(
  playerName: string, playerFaction: Faction, turnNumber: number,
  tiles: Tile[][], units: Unit[], cities: City[], ruins: Ruin[],
  roads: Road[], gold: Record<Faction, number>, fog: FogState
): SaveData {
  return {
    version: SAVE_VERSION, timestamp: Date.now(),
    playerName, playerFaction, turnNumber,
    tiles, units, cities, ruins, roads, gold,
    fog: serializeFog(fog),
  }
}

export function saveGame(data: SaveData, slot = SAVE_KEY): boolean {
  try { localStorage.setItem(slot, JSON.stringify(data)); return true }
  catch { console.error('Save failed'); return false }
}

export function loadGame(slot = SAVE_KEY): SaveData | null {
  try {
    const json = localStorage.getItem(slot)
    if (!json) return null
    const data = JSON.parse(json) as SaveData
    if (!data.version || data.version > SAVE_VERSION) return null
    if (!data.tiles || !data.units || !data.cities) return null
    return data
  } catch { return null }
}

export function autoSave(data: SaveData): boolean { return saveGame(data, AUTOSAVE_KEY) }
export function loadAutoSave(): SaveData | null { return loadGame(AUTOSAVE_KEY) }
export function hasSave(slot = SAVE_KEY): boolean { return localStorage.getItem(slot) !== null }
export function hasAutoSave(): boolean { return localStorage.getItem(AUTOSAVE_KEY) !== null }
export function deleteSave(slot = SAVE_KEY): void { localStorage.removeItem(slot) }
export function getFogFromSave(data: SaveData): FogState { return deserializeFog(data.fog) }
`);

// ═══════════════════════════════════════════════════════════════════════════
// tutorial.ts
// ═══════════════════════════════════════════════════════════════════════════
write('game/tutorial.ts', `import type { City, Ruin, Position } from './types'

export interface TutorialStep {
  id: string
  title: string
  description: string
  icon: string
  isComplete: (state: TutorialState) => boolean
}

export interface TutorialState {
  heroSelected: boolean
  cityCaptured: boolean
  productionSet: boolean
  ruinExplored: boolean
  turnEnded: boolean
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  { id: 'select_hero', title: 'Select Your Hero', description: 'Click on Sir Galahad (★) near your capital to select him.', icon: '👆', isComplete: s => s.heroSelected },
  { id: 'capture_city', title: 'Capture Millford', description: 'Move your hero or knight to the nearby neutral city.', icon: '🏰', isComplete: s => s.cityCaptured },
  { id: 'set_production', title: 'Set Production', description: 'Click a city you own and choose a unit to produce.', icon: '⚒️', isComplete: s => s.productionSet },
  { id: 'explore_ruin', title: 'Explore a Ruin', description: 'Send your hero to the glowing ruin for treasure!', icon: '🏚️', isComplete: s => s.ruinExplored },
  { id: 'end_turn', title: 'End Your Turn', description: 'Click "End Turn" to advance. Enemies will move!', icon: '⏭️', isComplete: s => s.turnEnded },
]

export const TUTORIAL_TOPICS = [
  { title: 'Heroes', icon: '⭐', text: 'Heroes explore ruins, gain XP, and carry artifacts. Protect them!' },
  { title: 'Cities', icon: '🏰', text: 'Capture cities for gold and unit production. Each has a unique bonus.' },
  { title: 'Production', icon: '⚒️', text: 'Click a city to produce militia, archers, or knights each turn.' },
  { title: 'End Turn', icon: '⏭️', text: 'Press End Turn when done. Enemies move simultaneously.' },
]

export function findNearestNeutralCity(cities: City[], pos: Position): City | null {
  let best: City | null = null, bestDist = Infinity
  for (const c of cities) {
    if (c.owner !== null) continue
    const d = Math.abs(c.x - pos.x) + Math.abs(c.y - pos.y)
    if (d < bestDist) { bestDist = d; best = c }
  }
  return best
}

export function findNearestRuin(ruins: Ruin[], pos: Position): Ruin | null {
  let best: Ruin | null = null, bestDist = Infinity
  for (const r of ruins) {
    if (r.explored) continue
    const d = Math.abs(r.x - pos.x) + Math.abs(r.y - pos.y)
    if (d < bestDist) { bestDist = d; best = r }
  }
  return best
}

export function findPlayerCapital(cities: City[]): City | null {
  return cities.find(c => c.owner === 'player' && c.isCapital) ?? null
}
`);

console.log('\\n=== Batch 1 complete: game logic layer ===');
