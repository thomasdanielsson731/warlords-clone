import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Unit } from '../game/types'
import { FACTION_COLORS } from '../game/types'

interface UnitModelProps {
  unit: Unit
  selected: boolean
  onClick: () => void
}

// --- Unit body shapes by type ---
function MilitiaBody({ color, exhausted }: { color: string; exhausted: boolean }) {
  return (
    <group>
      {/* Body */}
      <mesh position={[0, 0.12, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.09, 0.24, 6]} />
        <meshStandardMaterial color={color} transparent={exhausted} opacity={exhausted ? 0.45 : 1} roughness={0.6} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.28, 0]} castShadow>
        <sphereGeometry args={[0.05, 6, 6]} />
        <meshStandardMaterial color="#ddc8a0" roughness={0.7} />
      </mesh>
      {/* Spear */}
      <mesh position={[0.08, 0.2, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 0.35, 4]} />
        <meshStandardMaterial color="#8a7a5a" />
      </mesh>
      <mesh position={[0.08, 0.38, 0]}>
        <coneGeometry args={[0.015, 0.04, 4]} />
        <meshStandardMaterial color="#aaa" metalness={0.5} />
      </mesh>
    </group>
  )
}

function ArcherBody({ color, exhausted }: { color: string; exhausted: boolean }) {
  return (
    <group>
      <mesh position={[0, 0.12, 0]} castShadow>
        <cylinderGeometry args={[0.065, 0.08, 0.24, 6]} />
        <meshStandardMaterial color={color} transparent={exhausted} opacity={exhausted ? 0.45 : 1} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.28, 0]} castShadow>
        <sphereGeometry args={[0.045, 6, 6]} />
        <meshStandardMaterial color="#ddc8a0" roughness={0.7} />
      </mesh>
      {/* Hood */}
      <mesh position={[0, 0.3, -0.02]}>
        <sphereGeometry args={[0.05, 6, 4, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={color} transparent={exhausted} opacity={exhausted ? 0.45 : 1} />
      </mesh>
      {/* Bow */}
      <mesh position={[-0.1, 0.18, 0]} rotation={[0, 0, 0.2]}>
        <torusGeometry args={[0.07, 0.005, 4, 8, Math.PI]} />
        <meshStandardMaterial color="#5c3d2e" roughness={0.9} />
      </mesh>
    </group>
  )
}

function KnightBody({ color, exhausted }: { color: string; exhausted: boolean }) {
  return (
    <group>
      {/* Armored body */}
      <mesh position={[0, 0.14, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.1, 0.28, 6]} />
        <meshStandardMaterial color={color} transparent={exhausted} opacity={exhausted ? 0.45 : 1} roughness={0.4} metalness={0.3} />
      </mesh>
      {/* Helmet */}
      <mesh position={[0, 0.32, 0]} castShadow>
        <sphereGeometry args={[0.055, 6, 6]} />
        <meshStandardMaterial color="#999" roughness={0.3} metalness={0.6} />
      </mesh>
      {/* Helm crest */}
      <mesh position={[0, 0.38, 0]}>
        <boxGeometry args={[0.005, 0.06, 0.06]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Shield */}
      <mesh position={[-0.1, 0.15, 0.02]} rotation={[0, 0.3, 0]}>
        <boxGeometry args={[0.005, 0.12, 0.08]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.3} />
      </mesh>
      {/* Sword */}
      <mesh position={[0.1, 0.2, 0]}>
        <boxGeometry args={[0.01, 0.2, 0.015]} />
        <meshStandardMaterial color="#ccc" metalness={0.7} roughness={0.2} />
      </mesh>
    </group>
  )
}

function HeroBody({ color, exhausted }: { color: string; exhausted: boolean }) {
  return (
    <group>
      {/* Heroic body - larger */}
      <mesh position={[0, 0.16, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.12, 0.32, 8]} />
        <meshStandardMaterial color={color} transparent={exhausted} opacity={exhausted ? 0.45 : 1} roughness={0.4} metalness={0.2} />
      </mesh>
      {/* Cape */}
      <mesh position={[0, 0.15, -0.08]} rotation={[0.15, 0, 0]} castShadow>
        <boxGeometry args={[0.16, 0.25, 0.01]} />
        <meshStandardMaterial color={color} transparent={exhausted} opacity={exhausted ? 0.35 : 0.8} roughness={0.7} side={THREE.DoubleSide} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.36, 0]} castShadow>
        <sphereGeometry args={[0.055, 8, 8]} />
        <meshStandardMaterial color="#ddc8a0" roughness={0.7} />
      </mesh>
      {/* Crown */}
      <mesh position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.05, 0.04, 0.04, 6]} />
        <meshStandardMaterial color="#ffd700" emissive="#ffa500" emissiveIntensity={0.3} metalness={0.7} roughness={0.2} />
      </mesh>
      {/* Magical staff */}
      <mesh position={[0.12, 0.22, 0]}>
        <cylinderGeometry args={[0.008, 0.01, 0.4, 4]} />
        <meshStandardMaterial color="#5c3d2e" />
      </mesh>
      {/* Staff orb */}
      <mesh position={[0.12, 0.44, 0]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color="#66aaff" emissive="#4488ff" emissiveIntensity={0.5} transparent opacity={0.8} />
      </mesh>
      <pointLight position={[0.12, 0.44, 0]} color="#4488ff" intensity={0.3} distance={1} decay={2} />
    </group>
  )
}

const UNIT_BODIES: Record<string, React.FC<{ color: string; exhausted: boolean }>> = {
  militia: MilitiaBody,
  archer: ArcherBody,
  knight: KnightBody,
  hero: HeroBody,
}

export default function UnitModel({ unit, selected, onClick }: UnitModelProps) {
  const groupRef = useRef<THREE.Group>(null)
  const ringRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const color = FACTION_COLORS[unit.faction]
  const exhausted = unit.movesLeft === 0

  // Idle bobbing animation
  useFrame(({ clock }) => {
    if (groupRef.current) {
      const bob = selected
        ? Math.sin(clock.elapsedTime * 3) * 0.03
        : Math.sin(clock.elapsedTime * 1.5 + unit.x * 2 + unit.y * 3) * 0.008
      groupRef.current.position.y = 0.075 + bob
    }
    // Selection ring pulse
    if (ringRef.current && selected) {
      const mat = ringRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = 0.4 + Math.sin(clock.elapsedTime * 4) * 0.2
      ringRef.current.rotation.z = clock.elapsedTime * 0.5
    }
  })

  const BodyComponent = UNIT_BODIES[unit.unitType] || MilitiaBody

  return (
    <group
      position={[unit.x, 0, unit.y]}
      onClick={(e) => { e.stopPropagation(); onClick() }}
      onPointerEnter={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer' }}
      onPointerLeave={() => { setHovered(false); document.body.style.cursor = 'default' }}
    >
      <group ref={groupRef}>
        <BodyComponent color={color} exhausted={exhausted} />

        {/* Faction banner on back */}
        <mesh position={[-0.06, 0.35, -0.06]}>
          <cylinderGeometry args={[0.004, 0.004, 0.18, 4]} />
          <meshStandardMaterial color="#666" />
        </mesh>
        <mesh position={[-0.06, 0.43, -0.04]}>
          <boxGeometry args={[0.005, 0.06, 0.04]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.1} />
        </mesh>
      </group>

      {/* Selection ring - glowing, animated */}
      {selected && (
        <mesh ref={ringRef} position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.16, 0.2, 24]} />
          <meshBasicMaterial color="#ffd700" transparent opacity={0.5} depthWrite={false} />
        </mesh>
      )}

      {/* Hover highlight ring */}
      {hovered && !selected && (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.14, 0.17, 24]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.25} depthWrite={false} />
        </mesh>
      )}
    </group>
  )
}
