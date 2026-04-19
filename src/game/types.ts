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
  isCapital?: boolean
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

// ── City Bonus System ─────────────────────────────────────────────────────
export type CityBonusType = 'gold' | 'production_speed' | 'unit_strength' | 'defense' | 'special_unit'

export interface CityBonus {
  type: CityBonusType
  label: string
  description: string
  icon: string
  value: number
  /** For special_unit: the unit type that gets bonus or is unlocked */
  unitType?: UnitType
  /** Strategic importance: 1 (minor) to 3 (critical) — affects visual glow */
  importance: 1 | 2 | 3
}

export const CITY_BONUSES: Record<string, CityBonus> = {
  // Tutorial path neutrals — easy to understand bonuses
  c5: { type: 'gold', label: 'Grain Market', description: '+3 gold per turn', icon: '🌾', value: 3, importance: 1 },
  c6: { type: 'defense', label: 'Fortified Walls', description: '+2 city defense', icon: '🏰', value: 2, importance: 2 },
  // Mid-map contest cities
  c7: { type: 'gold', label: 'Gold Mine', description: '+5 gold per turn', icon: '💰', value: 5, importance: 3 },
  c8: { type: 'special_unit', label: 'Ranger Lodge', description: 'Archers gain +1 STR', icon: '🏹', value: 1, unitType: 'archer', importance: 2 },
  c9: { type: 'special_unit', label: 'Iron Forge', description: 'Knights gain +2 STR', icon: '⚔️', value: 2, unitType: 'knight', importance: 3 },
  c10: { type: 'production_speed', label: 'War Stables', description: 'Units produced 1 turn faster', icon: '🐎', value: 1, importance: 2 },
  c11: { type: 'gold', label: 'Trade Hub', description: '+4 gold per turn, +1 defense', icon: '⚖️', value: 4, importance: 3 },
  c12: { type: 'unit_strength', label: 'War Academy', description: 'All units gain +1 STR', icon: '📖', value: 1, importance: 3 },
  c13: { type: 'gold', label: 'Lake Trade', description: '+2 gold per turn', icon: '🐟', value: 2, importance: 1 },
  c14: { type: 'defense', label: 'Watchtower', description: '+1 city defense', icon: '🗼', value: 1, importance: 1 },
  c15: { type: 'special_unit', label: 'Mystic Market', description: 'Archers gain +1 STR', icon: '🔮', value: 1, unitType: 'archer', importance: 1 },
  c16: { type: 'production_speed', label: 'Supply Depot', description: 'Units produced 1 turn faster', icon: '📦', value: 1, importance: 2 },
}

// Hero portrait mapping
export const HERO_PORTRAITS: Record<Faction, string[]> = {
  player: ['human_hero_1.png', 'human_hero_2.png', 'human_hero_3.png'],
  orcs: ['orc_hero_1.png', 'orc_hero_2.png', 'orc_hero_3.png'],
  elves: ['elf_hero_1.png', 'elf_hero_2.png', 'elf_hero_3.png'],
  bane: ['bane_hero_1.png', 'bane_hero_2.png', 'bane_hero_3.png'],
}

// Faction display info
export const FACTION_DISPLAY: Record<Faction, { name: string; icon: string }> = {
  player: { name: 'Kingdom of Stormhold', icon: '🦁' },
  orcs: { name: 'Orcish Horde', icon: '🐗' },
  elves: { name: 'Elvish Dominion', icon: '🦌' },
  bane: { name: 'Cult of Bane', icon: '🐉' },
}
