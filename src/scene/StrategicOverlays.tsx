import { useMemo } from 'react'
import { useGameStore } from '../game/store'
import { getMovementRange } from '../game/gamelogic'
import type { Position } from '../game/types'
import { CITY_BONUSES } from '../game/types'

/** Flat colored quad overlay for a tile */
function TileOverlay({ x, y, color, opacity }: { x: number; y: number; color: string; opacity: number }) {
  return (
    <mesh position={[x, 0.06, y]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[0.95, 0.95]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} />
    </mesh>
  )
}

/** Movement range overlay — blue */
function MovementOverlay() {
  const movementRange = useGameStore((s) => s.movementRange)
  if (movementRange.length === 0) return null
  return (
    <>
      {movementRange.map((p) => (
        <TileOverlay key={`m${p.x},${p.y}`} x={p.x} y={p.y} color="#3388ff" opacity={0.18} />
      ))}
    </>
  )
}

/** Enemy threat range overlay — red tiles where enemies can reach */
function ThreatOverlay() {
  const units = useGameStore((s) => s.units)
  const tiles = useGameStore((s) => s.tiles)
  const ruins = useGameStore((s) => s.ruins)
  const roadSet = useGameStore((s) => s.roadSet)
  const selectedUnitId = useGameStore((s) => s.selectedUnitId)

  // Only compute when a unit is selected (performance)
  const threatSet = useMemo(() => {
    if (!selectedUnitId) return new Set<string>()
    const enemies = units.filter((u) => u.faction !== 'player' && u.movesLeft > 0)
    const set = new Set<string>()
    // Only show threats from nearby enemies (within 12 tiles) for performance
    const selected = units.find((u) => u.id === selectedUnitId)
    for (const enemy of enemies) {
      if (selected && (Math.abs(enemy.x - selected.x) + Math.abs(enemy.y - selected.y)) > 12) continue
      const range = getMovementRange(enemy, tiles, units, ruins, roadSet)
      for (const p of range) set.add(`${p.x},${p.y}`)
    }
    return set
  }, [selectedUnitId, units, tiles, ruins, roadSet])

  if (threatSet.size === 0) return null

  const positions: Position[] = []
  threatSet.forEach((key) => {
    const [x, y] = key.split(',').map(Number)
    positions.push({ x, y })
  })

  return (
    <>
      {positions.map((p) => (
        <TileOverlay key={`t${p.x},${p.y}`} x={p.x} y={p.y} color="#ff3333" opacity={0.12} />
      ))}
    </>
  )
}

/** Capturable cities — gold glow ring on neutral/enemy cities */
function CapturableCityOverlay() {
  const cities = useGameStore((s) => s.cities)

  const capturable = cities.filter((c) => c.owner !== 'player')

  return (
    <>
      {capturable.map((c) => {
        const bonus = CITY_BONUSES[c.id]
        const importance = bonus?.importance ?? 1
        const opacity = importance === 3 ? 0.35 : importance === 2 ? 0.25 : 0.15
        const color = c.owner === null ? '#ffd700' : '#ff6633'
        return (
          <mesh key={`cc${c.id}`} position={[c.x, 0.03, c.y]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.4, 0.52, 24]} />
            <meshBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} />
          </mesh>
        )
      })}
    </>
  )
}

/** Unexplored ruins — purple glow */
function RuinOverlay() {
  const ruins = useGameStore((s) => s.ruins)
  const unexplored = ruins.filter((r) => !r.explored)

  return (
    <>
      {unexplored.map((r) => (
        <mesh key={`ro${r.id}`} position={[r.x, 0.03, r.y]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.3, 0.42, 24]} />
          <meshBasicMaterial color="#aa55ff" transparent opacity={0.2} depthWrite={false} />
        </mesh>
      ))}
    </>
  )
}

export default function StrategicOverlays() {
  return (
    <>
      <MovementOverlay />
      <ThreatOverlay />
      <CapturableCityOverlay />
      <RuinOverlay />
    </>
  )
}
