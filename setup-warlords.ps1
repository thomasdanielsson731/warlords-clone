# Create folders
New-Item -ItemType Directory -Force -Path src\game | Out-Null
New-Item -ItemType Directory -Force -Path src\components | Out-Null

# src/game/types.ts
@"
export type Faction = 'player' | 'orcs' | 'elves' | 'bane'

export interface Unit {
  id: string
  faction: Faction
  x: number
  y: number
  moves: number
}
"@ | Set-Content src\game\types.ts

# src/game/store.ts
@"
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
"@ | Set-Content src\game\store.ts

# src/components/MapView.tsx
@"
import { useGameStore } from '../game/store'

const size = 20
const tileSize = 32

export default function MapView() {
  const { units, selectedUnitId, selectUnit } = useGameStore()

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${size}, ${tileSize}px)`,
        gap: 1,
      }}
    >
      {Array.from({ length: size * size }).map((_, i) => {
        const x = i % size
        const y = Math.floor(i / size)

        const unit = units.find((u) => u.x === x && u.y === y)
        const selected = unit?.id === selectedUnitId

        return (
          <div
            key={`${x}-${y}`}
            onClick={() => unit && selectUnit(unit.id)}
            style={{
              width: tileSize,
              height: tileSize,
              background: selected ? '#ffee88' : '#5fa35f',
              border: '1px solid #333',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: 12,
            }}
          >
            {unit ? unit.faction[0].toUpperCase() : ''}
          </div>
        )
      })}
    </div>
  )
}
"@ | Set-Content src\components\MapView.tsx

# src/App.tsx
@"
import MapView from './components/MapView'

function App() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Warlords</h1>
      <MapView />
    </div>
  )
}

export default App
"@ | Set-Content src\App.tsx

Write-Host "Warlords phase 1 files created successfully."
Write-Host "Now run: npm run dev"