import type { Unit, City, Faction, Position } from './types'
import { MAP_WIDTH, MAP_HEIGHT } from './types'

/** Visibility states for each tile */
export type VisibilityState = 'hidden' | 'explored' | 'visible'

/** Vision radius for units and cities */
const UNIT_VISION = 4
const HERO_VISION = 6
const CITY_VISION = 5

/**
 * FogOfWar manages visibility state for the entire map.
 * Uses Uint8Array for memory efficiency on large maps.
 * 0 = hidden, 1 = explored (dimly visible), 2 = visible (full)
 */
export interface FogState {
  /** Flat array: index = y * MAP_WIDTH + x */
  data: Uint8Array
  width: number
  height: number
}

export function createFogState(width: number = MAP_WIDTH, height: number = MAP_HEIGHT): FogState {
  return {
    data: new Uint8Array(width * height),
    width,
    height,
  }
}

/** Get visibility at a position */
export function getVisibility(fog: FogState, x: number, y: number): VisibilityState {
  if (x < 0 || x >= fog.width || y < 0 || y >= fog.height) return 'hidden'
  const v = fog.data[y * fog.width + x]
  if (v === 2) return 'visible'
  if (v === 1) return 'explored'
  return 'hidden'
}

/**
 * Recompute visibility for a faction.
 * Marks previously visible tiles as 'explored', then reveals tiles near units/cities.
 * Only called when units move or turn changes — NOT every frame.
 */
export function updateFogOfWar(
  fog: FogState,
  units: Unit[],
  cities: City[],
  faction: Faction
): FogState {
  const newData = new Uint8Array(fog.data.length)

  // Preserve explored tiles (downgrade visible→explored, keep explored)
  for (let i = 0; i < fog.data.length; i++) {
    if (fog.data[i] >= 1) newData[i] = 1
  }

  // Reveal around player units
  const myUnits = units.filter((u) => u.faction === faction)
  for (const unit of myUnits) {
    const radius = unit.unitType === 'hero' ? HERO_VISION : UNIT_VISION
    revealCircle(newData, fog.width, fog.height, unit.x, unit.y, radius)
  }

  // Reveal around player cities
  const myCities = cities.filter((c) => c.owner === faction)
  for (const city of myCities) {
    revealCircle(newData, fog.width, fog.height, city.x, city.y, CITY_VISION)
  }

  return { ...fog, data: newData }
}

/** Reveal tiles in a circle around a point */
function revealCircle(
  data: Uint8Array,
  width: number,
  height: number,
  cx: number,
  cy: number,
  radius: number
): void {
  const r2 = radius * radius
  const minX = Math.max(0, cx - radius)
  const maxX = Math.min(width - 1, cx + radius)
  const minY = Math.max(0, cy - radius)
  const maxY = Math.min(height - 1, cy + radius)

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const dx = x - cx
      const dy = y - cy
      if (dx * dx + dy * dy <= r2) {
        data[y * width + x] = 2
      }
    }
  }
}

/**
 * Check if a position is visible (for filtering enemy units/cities in the scene).
 */
export function isVisible(fog: FogState, x: number, y: number): boolean {
  return getVisibility(fog, x, y) === 'visible'
}

/**
 * Check if a position has been explored (visible or previously seen).
 */
export function isExplored(fog: FogState, x: number, y: number): boolean {
  const v = getVisibility(fog, x, y)
  return v === 'visible' || v === 'explored'
}

/**
 * Serialize fog data for save/load.
 * Uses run-length encoding for compression on large maps.
 */
export function serializeFog(fog: FogState): string {
  const runs: number[] = []
  let current = fog.data[0]
  let count = 1

  for (let i = 1; i < fog.data.length; i++) {
    if (fog.data[i] === current) {
      count++
    } else {
      runs.push(current, count)
      current = fog.data[i]
      count = 1
    }
  }
  runs.push(current, count)

  return JSON.stringify({ w: fog.width, h: fog.height, rle: runs })
}

/**
 * Deserialize fog data from save.
 */
export function deserializeFog(json: string): FogState {
  const { w, h, rle } = JSON.parse(json)
  const data = new Uint8Array(w * h)
  let idx = 0

  for (let i = 0; i < rle.length; i += 2) {
    const value = rle[i]
    const count = rle[i + 1]
    for (let j = 0; j < count; j++) {
      data[idx++] = value
    }
  }

  return { data, width: w, height: h }
}
