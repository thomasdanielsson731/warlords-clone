import { create } from 'zustand'
import { Unit } from './types'

interface GameState {
  currentFaction: string
  selectedUnitId: string | null
  units: Unit[]
  selectUnit: (id: string | null) => void
}

export const useGameStore = create<GameState>((set) => ({
  currentFaction: 'player',
  selectedUnitId: null,
  units: [
    { id: 'u1', faction: 'player', x: 2, y: 2, moves: 3 },
    { id: 'u2', faction: 'orcs', x: 10, y: 10, moves: 3 },
    { id: 'u3', faction: 'elves', x: 15, y: 4, moves: 3 },
    { id: 'u4', faction: 'bane', x: 5, y: 15, moves: 3 },
  ],
  selectUnit: (id) => set({ selectedUnitId: id }),
}))
