import type { Tile, City, Ruin, Position, TerrainType } from './types'
import { MAP_WIDTH, MAP_HEIGHT, TERRAIN_MOVE_COST } from './types'

export interface RoadSegment {
  x: number
  y: number
}

export interface Road {
  id: string
  from: Position
  to: Position
  path: RoadSegment[]
}

/** Movement cost on a road tile — always 1 regardless of terrain */
export const ROAD_MOVE_COST = 1

/** Max distance (Manhattan) to consider two points as "nearby" for road generation */
const MAX_ROAD_DISTANCE = 30

/**
 * Generate roads between nearby cities and important ruins.
 * Uses A* pathfinding that avoids water and prefers flat terrain.
 */
export function generateRoads(
  tiles: Tile[][],
  cities: City[],
  ruins: Ruin[]
): Road[] {
  const roads: Road[] = []
  const connectedPairs = new Set<string>()
  const roadSet = new Set<string>()

  // Gather all connection targets
  const cityPositions = cities.map((c) => ({ x: c.x, y: c.y, id: c.id }))
  const ruinPositions = ruins.slice(0, 4).map((r) => ({ x: r.x, y: r.y, id: r.id }))
  const allTargets = [...cityPositions, ...ruinPositions]

  // 1. Connect each city to its nearest 2-3 neighbors
  for (const city of cityPositions) {
    const sorted = allTargets
      .filter((t) => t.id !== city.id)
      .map((t) => ({
        target: t,
        dist: Math.abs(t.x - city.x) + Math.abs(t.y - city.y),
      }))
      .filter((t) => t.dist <= MAX_ROAD_DISTANCE)
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 3)

    for (const { target } of sorted) {
      const pairKey = [city.id, target.id].sort().join('-')
      if (connectedPairs.has(pairKey)) continue
      connectedPairs.add(pairKey)

      const path = findRoadPath(tiles, city, target, roadSet)
      if (path.length > 0) {
        roads.push({
          id: `road-${city.id}-${target.id}`,
          from: { x: city.x, y: city.y },
          to: { x: target.x, y: target.y },
          path,
        })
        for (const seg of path) {
          roadSet.add(`${seg.x},${seg.y}`)
        }
      }
    }
  }

  return roads
}

/** Build a Set of all road tile coordinates for fast lookup */
export function buildRoadSet(roads: Road[]): Set<string> {
  const set = new Set<string>()
  for (const road of roads) {
    for (const seg of road.path) {
      set.add(`${seg.x},${seg.y}`)
    }
  }
  return set
}

/** Check if a position is on a road */
export function isOnRoad(roadSet: Set<string>, x: number, y: number): boolean {
  return roadSet.has(`${x},${y}`)
}

// ── A* pathfinding for road generation ──────────────────────────────────────

const ROAD_TERRAIN_COST: Record<TerrainType, number> = {
  grass: 1,
  forest: 3,
  mountain: 6,
  water: Infinity,
}

interface AStarNode {
  x: number; y: number; g: number; f: number; parent: string | null
}

function findRoadPath(
  tiles: Tile[][],
  from: Position,
  to: Position,
  existingRoads: Set<string>
): RoadSegment[] {
  const w = tiles[0]?.length ?? MAP_WIDTH
  const h = tiles.length ?? MAP_HEIGHT

  const openSet = new Map<string, AStarNode>()
  const closedSet = new Map<string, AStarNode>()

  const startKey = `${from.x},${from.y}`
  const endKey = `${to.x},${to.y}`

  openSet.set(startKey, {
    x: from.x, y: from.y, g: 0,
    f: heuristic(from, to),
    parent: null,
  })

  const directions = [
    { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
    { dx: -1, dy: 0 }, { dx: 1, dy: 0 },
  ]

  while (openSet.size > 0) {
    let bestKey = ''
    let bestF = Infinity
    for (const [key, node] of openSet) {
      if (node.f < bestF) { bestF = node.f; bestKey = key }
    }

    const current = openSet.get(bestKey)!
    openSet.delete(bestKey)
    closedSet.set(bestKey, current)

    if (bestKey === endKey) {
      return reconstructPath(closedSet, endKey, startKey)
    }

    for (const { dx, dy } of directions) {
      const nx = current.x + dx
      const ny = current.y + dy
      if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue

      const nKey = `${nx},${ny}`
      if (closedSet.has(nKey)) continue

      const terrain = tiles[ny][nx].terrain
      const baseCost = ROAD_TERRAIN_COST[terrain]
      if (baseCost === Infinity) continue

      const roadBonus = existingRoads.has(nKey) ? 0.5 : baseCost
      const tentativeG = current.g + roadBonus

      const existing = openSet.get(nKey)
      if (existing && existing.g <= tentativeG) continue

      openSet.set(nKey, {
        x: nx, y: ny, g: tentativeG,
        f: tentativeG + heuristic({ x: nx, y: ny }, to),
        parent: bestKey,
      })
    }
  }

  return []
}

function heuristic(a: Position, b: Position): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
}

function reconstructPath(
  closedSet: Map<string, AStarNode>,
  endKey: string,
  startKey: string
): RoadSegment[] {
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
