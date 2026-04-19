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

export type UnitType = 'militia' | 'archer' | 'knight' | 'hero'

export interface UnitTemplate {
  type: UnitType
  strength: number
  movesPerTurn: number
  productionTurns: number
}

export const UNIT_TEMPLATES: Record<UnitType, UnitTemplate> = {
  militia: { type: 'militia', strength: 2, movesPerTurn: 3, productionTurns: 1 },
  archer: { type: 'archer', strength: 3, movesPerTurn: 3, productionTurns: 2 },
  knight: { type: 'knight', strength: 5, movesPerTurn: 4, productionTurns: 3 },
  hero: { type: 'hero', strength: 4, movesPerTurn: 5, productionTurns: 0 },
}

export interface Unit {
  id: string
  faction: Faction
  unitType: UnitType
  x: number
  y: number
  movesLeft: number
  movesPerTurn: number
  strength: number
  // Hero-specific fields
  name?: string
  experience?: number
  level?: number
  inventory?: string[]
}

export const TERRAIN_MOVE_COST: Record<TerrainType, number> = {
  grass: 1,
  forest: 2,
  mountain: 3,
  water: Infinity,
}

export interface City {
  id: string
  name: string
  x: number
  y: number
  owner: Faction | null
  defense: number
  producing: UnitType | null
  turnsLeft: number
}

export const FACTION_COLORS: Record<Faction, string> = {
  player: '#3366cc',
  orcs: '#cc3333',
  elves: '#33aa33',
  bane: '#9933cc',
}

export const NEUTRAL_COLOR = '#888888'

export const FACTION_BONUSES: Record<Faction, { label: string; description: string }> = {
  player: { label: 'Valor', description: 'Knights gain +1 STR' },
  orcs: { label: 'Horde', description: 'Militia produced instantly' },
  elves: { label: 'Forestwalk', description: 'Forest costs 1 move instead of 2' },
  bane: { label: 'Dark Fortress', description: 'Cities get +1 defense' },
}

export const MAP_WIDTH = 40
export const MAP_HEIGHT = 40

export const XP_PER_COMBAT_WIN = 30
export const XP_PER_LEVEL = 100
export const HERO_MAX_LEVEL = 5
export const VICTORY_CITY_PERCENT = 0.6

export interface Ruin {
  id: string
  x: number
  y: number
  explored: boolean
}

export type RuinRewardType = 'gold' | 'artifact' | 'ally' | 'dragon' | 'nothing'

export interface RuinResult {
  heroName: string
  type: RuinRewardType
  description: string
  goldAmount?: number
  artifactName?: string
  allyType?: UnitType
  dragonDefeated?: boolean
  dragonStrength?: number
  heroRoll?: number
  dragonRoll?: number
}

export interface CombatResult {
  attacker: { unitType: UnitType; faction: Faction; strength: number; roll: number; total: number; name?: string }
  defender: { unitType: UnitType; faction: Faction; strength: number; roll: number; total: number; cityBonus: number; name?: string }
  attackerWins: boolean
  xpGained?: number
}
