import { create } from 'zustand'
import type { Unit } from './types'

interface GameStore {
  units: Unit[]
  selectedUnitId: string | null
  selectUnit: (id: string) => void
}

export const useGameStore = create<GameStore>((set) => ({
  units: [
    { id: '1', faction: 'player', x: 5, y: 5, moves: 3 },
    { id: '2', faction: 'orcs', x: 15, y: 15, moves: 3 },
  ],
  selectedUnitId: null,
  selectUnit: (id: string) => set({ selectedUnitId: id }),
}))