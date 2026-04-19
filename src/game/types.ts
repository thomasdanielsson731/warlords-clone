export type Faction = 'player' | 'orcs' | 'elves' | 'bane'

export type TerrainType = 'grass' | 'forest' | 'mountain' | 'water'

export interface Position {
  x: number
  y: number
}

export interface Tile {
  terrain: TerrainType
  x: number
  y: number
}

export interface Unit {
  id: string
  faction: Faction
  x: number
  y: number
  movesLeft: number
  movesPerTurn: number
  strength: number
}

export const TERRAIN_MOVE_COST: Record<TerrainType, number> = {
  grass: 1,
  forest: 2,
  mountain: 3,
  water: Infinity,
}

export const FACTION_COLORS: Record<Faction, string> = {
  player: '#3366cc',
  orcs: '#cc3333',
  elves: '#33aa33',
  bane: '#9933cc',
}

export const MAP_WIDTH = 20
export const MAP_HEIGHT = 20
