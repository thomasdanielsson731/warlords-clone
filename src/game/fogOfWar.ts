import type { Unit, City, Faction } from './types'
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
