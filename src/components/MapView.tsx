import { useGameStore } from '../game/store'
import type { TerrainType } from '../game/types'
import { FACTION_COLORS, MAP_WIDTH, MAP_HEIGHT } from '../game/types'
import '../styles/Map.css'

const TILE_SIZE = 32

const TERRAIN_STYLES: Record<TerrainType, { bg: string; label: string }> = {
  grass: { bg: '#4a8f4a', label: '' },
  forest: { bg: '#2d6b2d', label: '♣' },
  mountain: { bg: '#8a7a6a', label: '▲' },
  water: { bg: '#3366aa', label: '~' },
}

export default function MapView() {
  const tiles = useGameStore((s) => s.tiles)
  const units = useGameStore((s) => s.units)
  const selectedUnitId = useGameStore((s) => s.selectedUnitId)
  const movementRange = useGameStore((s) => s.movementRange)
  const clickTile = useGameStore((s) => s.clickTile)

  return (
    <div
      className="map"
      style={{
        gridTemplateColumns: `repeat(${MAP_WIDTH}, ${TILE_SIZE}px)`,
      }}
    >
      {Array.from({ length: MAP_HEIGHT * MAP_WIDTH }).map((_, i) => {
        const x = i % MAP_WIDTH
        const y = Math.floor(i / MAP_WIDTH)
        const tile = tiles[y][x]
        const terrainStyle = TERRAIN_STYLES[tile.terrain]

        const unit = units.find((u) => u.x === x && u.y === y)
        const isSelected = unit?.id === selectedUnitId
        const isInRange = movementRange.some((p) => p.x === x && p.y === y)

        let className = 'tile'
        if (isSelected) className += ' selected'
        else if (isInRange) className += ' highlighted'

        return (
          <div
            key={`${x}-${y}`}
            className={className}
            style={{
              width: TILE_SIZE,
              height: TILE_SIZE,
              backgroundColor: isInRange
                ? '#5ab85a'
                : isSelected
                  ? '#6ad06a'
                  : terrainStyle.bg,
            }}
            onClick={() => clickTile(x, y)}
          >
            {unit ? (
              <div
                className="unit"
                style={{
                  backgroundColor: FACTION_COLORS[unit.faction],
                  borderColor: isSelected ? '#fff' : FACTION_COLORS[unit.faction],
                  opacity: unit.movesLeft > 0 ? 1 : 0.5,
                }}
              >
                {unit.strength}
              </div>
            ) : (
              <span className="terrain-icon">{terrainStyle.label}</span>
            )}
          </div>
        )
      })}
    </div>
  )
}