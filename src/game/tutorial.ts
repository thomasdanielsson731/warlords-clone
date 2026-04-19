import type { Unit, City, Ruin, Position } from './types'

export interface TutorialStep {
  id: string
  title: string
  description: string
  icon: string
  /** Condition check: returns true when step is complete */
  isComplete: (state: TutorialState) => boolean
}

export interface TutorialState {
  heroSelected: boolean
  cityCaptured: boolean
  productionSet: boolean
  ruinExplored: boolean
  turnEnded: boolean
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'select_hero',
    title: 'Select Your Hero',
    description: 'Click on Sir Galahad (★) near your capital to select him.',
    icon: '👆',
    isComplete: (s) => s.heroSelected,
  },
  {
    id: 'capture_city',
    title: 'Capture Millford',
    description: 'Move your hero or knight to the nearby neutral city.',
    icon: '🏰',
    isComplete: (s) => s.cityCaptured,
  },
  {
    id: 'set_production',
    title: 'Set Production',
    description: 'Click a city you own and choose a unit to produce.',
    icon: '⚒️',
    isComplete: (s) => s.productionSet,
  },
  {
    id: 'explore_ruin',
    title: 'Explore a Ruin',
    description: 'Send your hero to the glowing ruin for treasure!',
    icon: '🏚️',
    isComplete: (s) => s.ruinExplored,
  },
  {
    id: 'end_turn',
    title: 'End Your Turn',
    description: 'Click "End Turn" to advance. Enemies will move!',
    icon: '⏭️',
    isComplete: (s) => s.turnEnded,
  },
]

export const TUTORIAL_TOPICS = [
  { title: 'Heroes', icon: '⭐', text: 'Heroes explore ruins, gain XP, and carry artifacts. Protect them!' },
  { title: 'Cities', icon: '🏰', text: 'Capture cities for gold and unit production. Each has a unique bonus.' },
  { title: 'Production', icon: '⚒️', text: 'Click a city to produce militia, archers, or knights each turn.' },
  { title: 'End Turn', icon: '⏭️', text: 'Press End Turn when done. Enemies move simultaneously.' },
]

/** Find the nearest neutral city to a position */
export function findNearestNeutralCity(cities: City[], pos: Position): City | null {
  let best: City | null = null
  let bestDist = Infinity
  for (const c of cities) {
    if (c.owner !== null) continue
    const d = Math.abs(c.x - pos.x) + Math.abs(c.y - pos.y)
    if (d < bestDist) { bestDist = d; best = c }
  }
  return best
}

/** Find the nearest unexplored ruin to a position */
export function findNearestRuin(ruins: Ruin[], pos: Position): Ruin | null {
  let best: Ruin | null = null
  let bestDist = Infinity
  for (const r of ruins) {
    if (r.explored) continue
    const d = Math.abs(r.x - pos.x) + Math.abs(r.y - pos.y)
    if (d < bestDist) { bestDist = d; best = r }
  }
  return best
}

/** Find the player's capital */
export function findPlayerCapital(cities: City[]): City | null {
  return cities.find((c) => c.owner === 'player' && c.isCapital) ?? null
}
