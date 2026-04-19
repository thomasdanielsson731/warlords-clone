import type { Position, Unit, Tile, TerrainType } from './types'
import { TERRAIN_MOVE_COST, MAP_WIDTH, MAP_HEIGHT } from './types'

export function isValidPosition(pos: Position): boolean {
  return pos.x >= 0 && pos.x < MAP_WIDTH && pos.y >= 0 && pos.y < MAP_HEIGHT
}

export function getMoveCost(terrain: TerrainType): number {
  return TERRAIN_MOVE_COST[terrain]
}

export function getMovementRange(
  unit: Unit,
  tiles: Tile[][],
  units: Unit[]
): Position[] {
  const reachable: Position[] = []
  const visited = new Map<string, number>()
  const queue: { x: number; y: number; remaining: number }[] = [
    { x: unit.x, y: unit.y, remaining: unit.movesLeft },
  ]
  visited.set(`${unit.x},${unit.y}`, unit.movesLeft)

  const directions = [
    { dx: 0, dy: -1 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 0 },
    { dx: 1, dy: 0 },
  ]

  while (queue.length > 0) {
    const current = queue.shift()!
    for (const { dx, dy } of directions) {
      const nx = current.x + dx
      const ny = current.y + dy
      if (!isValidPosition({ x: nx, y: ny })) continue

      const cost = getMoveCost(tiles[ny][nx].terrain)
      const remaining = current.remaining - cost
      if (remaining < 0) continue

      const key = `${nx},${ny}`
      const prev = visited.get(key)
      if (prev !== undefined && prev >= remaining) continue

      const occupied = units.find(
        (u) => u.x === nx && u.y === ny && u.id !== unit.id
      )
      if (occupied) continue

      visited.set(key, remaining)
      reachable.push({ x: nx, y: ny })
      queue.push({ x: nx, y: ny, remaining })
    }
  }

  // Deduplicate
  const seen = new Set<string>()
  return reachable.filter((p) => {
    const key = `${p.x},${p.y}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function generateMap(): Tile[][] {
  const seededRandom = (seed: number) => {
    let s = seed
    return () => {
      s = (s * 16807 + 0) % 2147483647
      return s / 2147483647
    }
  }

  const rand = seededRandom(42)
  const tiles: Tile[][] = []

  for (let y = 0; y < MAP_HEIGHT; y++) {
    const row: Tile[] = []
    for (let x = 0; x < MAP_WIDTH; x++) {
      const r = rand()
      let terrain: TerrainType = 'grass'
      if (r < 0.15) terrain = 'forest'
      else if (r < 0.22) terrain = 'mountain'
      else if (r < 0.28) terrain = 'water'
      row.push({ terrain, x, y })
    }
    tiles.push(row)
  }

  // Ensure starting positions are grass
  const starts = [
    [2, 2],
    [17, 17],
    [2, 17],
    [17, 2],
  ]
  for (const [sx, sy] of starts) {
    tiles[sy][sx].terrain = 'grass'
    // Clear adjacent tiles too
    for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
      const nx = sx + dx
      const ny = sy + dy
      if (nx >= 0 && nx < MAP_WIDTH && ny >= 0 && ny < MAP_HEIGHT) {
        if (tiles[ny][nx].terrain === 'water') {
          tiles[ny][nx].terrain = 'grass'
        }
      }
    }
  }

  return tiles
}

export function createInitialUnits(): Unit[] {
  return [
    { id: 'u1', faction: 'player', x: 2, y: 2, movesLeft: 4, movesPerTurn: 4, strength: 5 },
    { id: 'u2', faction: 'player', x: 3, y: 2, movesLeft: 4, movesPerTurn: 4, strength: 3 },
    { id: 'u3', faction: 'orcs', x: 17, y: 17, movesLeft: 4, movesPerTurn: 4, strength: 5 },
    { id: 'u4', faction: 'orcs', x: 16, y: 17, movesLeft: 4, movesPerTurn: 4, strength: 3 },
    { id: 'u5', faction: 'elves', x: 2, y: 17, movesLeft: 4, movesPerTurn: 4, strength: 4 },
    { id: 'u6', faction: 'bane', x: 17, y: 2, movesLeft: 4, movesPerTurn: 4, strength: 4 },
  ]
}
