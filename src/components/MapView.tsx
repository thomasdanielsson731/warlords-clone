import { useGameStore } from '../game/store'
import type { Unit } from '../game/types'

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

        const unit = units.find((u: Unit) => u.x === x && u.y === y)
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