import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../game/store'
import { findNearestNeutralCity, findNearestRuin, findPlayerCapital } from '../game/tutorial'

function ArrowMarker({ x, y, color }: { x: number; y: number; color: string }) {
  const groupRef = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (groupRef.current) groupRef.current.position.y = 1.2 + Math.sin(clock.elapsedTime * 2.5) * 0.15
  })

  return (
    <group position={[x, 0, y]}>
      <group ref={groupRef}>
        <mesh position={[0, 0, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.12, 0.3, 6]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.2, 6]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
        </mesh>
      </group>
      <GroundPulse x={0} y={0} color={color} />
    </group>
  )
}

function GroundPulse({ x, y, color }: { x: number; y: number; color: string }) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (ref.current) {
      const t = (clock.elapsedTime * 1.2) % 1
      ref.current.scale.setScalar(0.8 + t * 0.6)
      ;(ref.current.material as THREE.MeshBasicMaterial).opacity = 0.4 * (1 - t)
    }
  })

  return (
    <mesh ref={ref} position={[x, 0.02, y]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.35, 0.45, 24]} />
      <meshBasicMaterial color={color} transparent opacity={0.4} depthWrite={false} />
    </mesh>
  )
}

export default function ObjectiveMarkers() {
  const cities = useGameStore((s) => s.cities)
  const ruins = useGameStore((s) => s.ruins)
  const units = useGameStore((s) => s.units)
  const turnNumber = useGameStore((s) => s.turnNumber)
  const tutorialDismissed = useGameStore((s) => s.tutorialDismissed)

  if (turnNumber > 5 && tutorialDismissed) return null

  const playerHero = units.find((u) => u.faction === 'player' && u.unitType === 'hero')
  const heroPos = playerHero ?? { x: 5, y: 34 }

  const nearestCity = findNearestNeutralCity(cities, heroPos)
  const nearestRuin = findNearestRuin(ruins, heroPos)
  const capital = findPlayerCapital(cities)

  return (
    <group>
      {nearestCity && <ArrowMarker x={nearestCity.x} y={nearestCity.y} color="#ffd700" />}
      {nearestRuin && <ArrowMarker x={nearestRuin.x} y={nearestRuin.y} color="#aa55ff" />}
      {capital && turnNumber <= 2 && <GroundPulse x={capital.x} y={capital.y} color="#3366cc" />}
    </group>
  )
}
