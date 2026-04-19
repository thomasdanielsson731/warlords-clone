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
  fog: string // RLE-encoded fog state
}

export function createSaveData(
  playerName: string,
  playerFaction: Faction,
  turnNumber: number,
  tiles: Tile[][],
  units: Unit[],
  cities: City[],
  ruins: Ruin[],
  roads: Road[],
  gold: Record<Faction, number>,
  fog: FogState
): SaveData {
  return {
    version: SAVE_VERSION,
    timestamp: Date.now(),
    playerName,
    playerFaction,
    turnNumber,
    tiles,
    units,
    cities,
    ruins,
    roads,
    gold,
    fog: serializeFog(fog),
  }
}

/**
 * Save game to localStorage.
 * Returns true on success, false on failure (e.g., quota exceeded).
 */
export function saveGame(data: SaveData, slot: string = SAVE_KEY): boolean {
  try {
    const json = JSON.stringify(data)
    localStorage.setItem(slot, json)
    return true
  } catch {
    console.error('Save failed — storage may be full')
    return false
  }
}

/**
 * Load game from localStorage.
 * Returns null if no save exists or data is corrupted.
 */
export function loadGame(slot: string = SAVE_KEY): SaveData | null {
  try {
    const json = localStorage.getItem(slot)
    if (!json) return null

    const data = JSON.parse(json) as SaveData
    if (!data.version || data.version > SAVE_VERSION) {
      console.warn('Incompatible save version')
      return null
    }
    if (!data.tiles || !data.units || !data.cities) {
      console.warn('Corrupted save data')
      return null
    }
    return data
  } catch {
    console.error('Failed to parse save data')
    return null
  }
}

/**
 * Autosave at end of turn.
 */
export function autoSave(data: SaveData): boolean {
  return saveGame(data, AUTOSAVE_KEY)
}

/**
 * Load autosave.
 */
export function loadAutoSave(): SaveData | null {
  return loadGame(AUTOSAVE_KEY)
}

/**
 * Check if a save exists.
 */
export function hasSave(slot: string = SAVE_KEY): boolean {
  return localStorage.getItem(slot) !== null
}

/**
 * Check if an autosave exists.
 */
export function hasAutoSave(): boolean {
  return localStorage.getItem(AUTOSAVE_KEY) !== null
}

/**
 * Delete a save.
 */
export function deleteSave(slot: string = SAVE_KEY): void {
  localStorage.removeItem(slot)
}

/**
 * Get fog state from save data.
 */
export function getFogFromSave(data: SaveData): FogState {
  return deserializeFog(data.fog)
}
