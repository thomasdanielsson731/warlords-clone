// ── Warlords 2026 — Core Type Definitions ────────────────────────────────

// ── Factions ──────────────────────────────────────────────────────────────
export type Faction = 'player' | 'orcs' | 'elves' | 'bane'

export const FACTION_COLORS: Record<Faction, string> = {
  player: '#3388dd',
  orcs: '#cc3333',
  elves: '#22aa44',
  bane: '#9933cc',
}

export const NEUTRAL_COLOR = '#888888'

export const FACTION_DISPLAY: Record<Faction, { name: string; icon: string; adjective: string }> = {
  player: { name: 'Kingdom of Stormhold', icon: '🦁', adjective: 'Human' },
  orcs: { name: 'Orcish Horde', icon: '🐗', adjective: 'Orcish' },
  elves: { name: 'Elvish Dominion', icon: '🦌', adjective: 'Elvish' },
  bane: { name: 'Cult of Bane', icon: '🐉', adjective: 'Dark' },
}

export const FACTION_BONUSES: Record<Faction, { label: string; description: string }> = {
  player: { label: 'Valor', description: 'Knights gain +1 STR' },
  orcs: { label: 'Horde', description: 'Militia produced instantly' },
  elves: { label: 'Forestwalk', description: 'Forest costs 1 move' },
  bane: { label: 'Dark Fortress', description: 'Cities get +1 defense' },
}

// ── Map ───────────────────────────────────────────────────────────────────
export const MAP_WIDTH = 40
export const MAP_HEIGHT = 40

export type TerrainType = 'grass' | 'forest' | 'mountain' | 'water'

export interface Position { x: number; y: number }

export interface Tile { terrain: TerrainType; x: number; y: number }

export const TERRAIN_MOVE_COST: Record<TerrainType, number> = {
  grass: 1,
  forest: 2,
  mountain: 3,
  water: Infinity,
}

// ── Units ─────────────────────────────────────────────────────────────────
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
  name?: string
  experience?: number
  level?: number
  inventory?: string[]
}

// ── Heroes ────────────────────────────────────────────────────────────────
export const XP_PER_COMBAT_WIN = 30
export const XP_PER_LEVEL = 100
export const HERO_MAX_LEVEL = 5
export const DRAGON_STRENGTH = 8

export const HERO_NAMES: Record<Faction, string[]> = {
  player: ['Sir Galahad', 'Lady Elaine', 'Lord Tristan'],
  orcs: ['Grukk the Red', 'Nazgash', 'Bloodfang'],
  elves: ['Aelindra', 'Thalion', 'Galawen'],
  bane: ['Lich King Mordath', 'Shadeveil', 'Voidcaller'],
}

export const ARTIFACT_NAMES = [
  'Sword of Light', 'Crown of Courage', 'Shield of Ages',
  'Ring of Shadows', 'Staff of Power', 'Amulet of Speed',
  'Helm of Vision', 'Gauntlets of Might', 'Boots of Haste',
  'Cloak of Stealth', 'War Horn of Valor', 'Dragon Scale Armor',
]

// ── Cities ────────────────────────────────────────────────────────────────
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

export const VICTORY_CITY_PERCENT = 0.6

// ── City Bonuses ──────────────────────────────────────────────────────────
export type CityBonusType = 'gold' | 'production_speed' | 'unit_strength' | 'defense' | 'special_unit'

export interface CityBonus {
  type: CityBonusType
  label: string
  description: string
  icon: string
  value: number
  unitType?: UnitType
  importance: 1 | 2 | 3
}

export const CITY_BONUSES: Record<string, CityBonus> = {
  c5: { type: 'gold', label: 'Grain Market', description: '+3 gold/turn', icon: '🌾', value: 3, importance: 1 },
  c6: { type: 'defense', label: 'Fortified Walls', description: '+2 city defense', icon: '🏰', value: 2, importance: 2 },
  c7: { type: 'gold', label: 'Gold Mine', description: '+5 gold/turn', icon: '💰', value: 5, importance: 3 },
  c8: { type: 'special_unit', label: 'Ranger Lodge', description: 'Archers +1 STR', icon: '🏹', value: 1, unitType: 'archer', importance: 2 },
  c9: { type: 'special_unit', label: 'Iron Forge', description: 'Knights +2 STR', icon: '⚔️', value: 2, unitType: 'knight', importance: 3 },
  c10: { type: 'production_speed', label: 'War Stables', description: 'Units 1 turn faster', icon: '🐎', value: 1, importance: 2 },
  c11: { type: 'gold', label: 'Trade Hub', description: '+4 gold/turn', icon: '⚖️', value: 4, importance: 3 },
  c12: { type: 'unit_strength', label: 'War Academy', description: 'All units +1 STR', icon: '📖', value: 1, importance: 3 },
  c13: { type: 'gold', label: 'Lake Trade', description: '+2 gold/turn', icon: '🐟', value: 2, importance: 1 },
  c14: { type: 'defense', label: 'Watchtower', description: '+1 city defense', icon: '🗼', value: 1, importance: 1 },
  c15: { type: 'special_unit', label: 'Mystic Market', description: 'Archers +1 STR', icon: '🔮', value: 1, unitType: 'archer', importance: 1 },
  c16: { type: 'production_speed', label: 'Supply Depot', description: 'Units 1 turn faster', icon: '📦', value: 1, importance: 2 },
}

// ── Ruins ─────────────────────────────────────────────────────────────────
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

// ── Combat ────────────────────────────────────────────────────────────────
export interface CombatResult {
  attacker: { unitType: UnitType; faction: Faction; strength: number; roll: number; total: number; name?: string }
  defender: { unitType: UnitType; faction: Faction; strength: number; roll: number; total: number; cityBonus: number; name?: string }
  attackerWins: boolean
  xpGained?: number
}

// ── Portraits ─────────────────────────────────────────────────────────────
export const HERO_PORTRAITS: Record<Faction, string[]> = {
  player: ['human_hero_1.png', 'human_hero_2.png', 'human_hero_3.png'],
  orcs: ['orc_hero_1.png', 'orc_hero_2.png', 'orc_hero_3.png'],
  elves: ['elf_hero_1.png', 'elf_hero_2.png', 'elf_hero_3.png'],
  bane: ['bane_hero_1.png', 'bane_hero_2.png', 'bane_hero_3.png'],
}
