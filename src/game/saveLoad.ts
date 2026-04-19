import type { Tile, Unit, City, Ruin, Faction } from './types'
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
