import { create } from 'zustand'
import type { Unit, Tile, Position, Faction } from './types'
import { TERRAIN_MOVE_COST } from './types'
import { generateMap, createInitialUnits, getMovementRange } from './gamelogic'

const FACTIONS: Faction[] = ['player', 'orcs', 'elves', 'bane']

interface GameStore {
  tiles: Tile[][]
  units: Unit[]
  selectedUnitId: string | null
  movementRange: Position[]
  currentFaction: Faction
  turnNumber: number

  selectUnit: (id: string | null) => void
  moveUnit: (x: number, y: number) => void
  endTurn: () => void
  clickTile: (x: number, y: number) => void
}

export const useGameStore = create<GameStore>((set, get) => ({
  tiles: generateMap(),
  units: createInitialUnits(),
  selectedUnitId: null,
  movementRange: [],
  currentFaction: 'player',
  turnNumber: 1,

  selectUnit: (id) => {
    if (id === null) {
      set({ selectedUnitId: null, movementRange: [] })
      return
    }
    const { units, tiles, currentFaction } = get()
    const unit = units.find((u) => u.id === id)
    if (!unit || unit.faction !== currentFaction) return
    if (unit.movesLeft <= 0) {
      set({ selectedUnitId: id, movementRange: [] })
      return
    }
    const range = getMovementRange(unit, tiles, units)
    set({ selectedUnitId: id, movementRange: range })
  },

  moveUnit: (x, y) => {
    const { selectedUnitId, movementRange, units, tiles } = get()
    if (!selectedUnitId) return
    const inRange = movementRange.some((p) => p.x === x && p.y === y)
    if (!inRange) return

    const unit = units.find((u) => u.id === selectedUnitId)
    if (!unit) return

    // Calculate actual move cost via BFS path
    const cost = bfsMoveCost(unit, { x, y }, tiles, units)

    const updated = units.map((u) =>
      u.id === selectedUnitId
        ? { ...u, x, y, movesLeft: Math.max(0, u.movesLeft - cost) }
        : u
    )

    // Recompute movement range for the moved unit
    const movedUnit = updated.find((u) => u.id === selectedUnitId)!
    const newRange =
      movedUnit.movesLeft > 0
        ? getMovementRange(movedUnit, tiles, updated)
        : []

    set({ units: updated, movementRange: newRange })
  },

  endTurn: () => {
    const { currentFaction, turnNumber, units } = get()
    const idx = FACTIONS.indexOf(currentFaction)
    const nextFaction = FACTIONS[(idx + 1) % FACTIONS.length]
    const newTurn = nextFaction === FACTIONS[0] ? turnNumber + 1 : turnNumber

    // Restore moves for the next faction's units
    const updated = units.map((u) =>
      u.faction === nextFaction ? { ...u, movesLeft: u.movesPerTurn } : u
    )

    set({
      currentFaction: nextFaction,
      turnNumber: newTurn,
      units: updated,
      selectedUnitId: null,
      movementRange: [],
    })
  },

  clickTile: (x, y) => {
    const { units, selectedUnitId, currentFaction, movementRange } = get()
    const unitOnTile = units.find((u) => u.x === x && u.y === y)

    if (unitOnTile && unitOnTile.faction === currentFaction) {
      get().selectUnit(unitOnTile.id)
    } else if (
      selectedUnitId &&
      movementRange.some((p) => p.x === x && p.y === y)
    ) {
      get().moveUnit(x, y)
    } else {
      set({ selectedUnitId: null, movementRange: [] })
    }
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

      const moveCost = TERRAIN_MOVE_COST[tiles[ny][nx].terrain]
      if (moveCost === Infinity) continue

      const totalCost = current.cost + moveCost
      const key = `${nx},${ny}`

      if (totalCost > unit.movesLeft) continue
      const prev = visited.get(key)
      if (prev !== undefined && prev <= totalCost) continue

      const occupied = units.find(
        (u) => u.x === nx && u.y === ny && u.id !== unit.id
      )
      if (occupied) continue

      visited.set(key, totalCost)
      queue.push({ x: nx, y: ny, cost: totalCost })
    }
  }

  return unit.movesLeft // fallback
}