export type Faction = 'player' | 'orcs' | 'elves' | 'bane'

export interface Unit {
  id: string
  faction: Faction
  x: number
  y: number
  moves: number
}
