import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Unit } from '../game/types'
import { FACTION_COLORS } from '../game/types'

interface UnitModelProps { unit: Unit; selected: boolean; onClick: () => void }

// ── Militia: spearman with shield ───────────────────────────────────────────
function MilitiaBody({ color, exhausted }: { color: string; exhausted: boolean }) {
  const o = exhausted ? 0.45 : 1
  return (
    <group>
      {/* Torso */}
      <mesh position={[0, 0.12, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.09, 0.24, 6]} />
        <meshStandardMaterial color={color} transparent={exhausted} opacity={o} roughness={0.6} />
      </mesh>
      {/* Shoulders */}
      <mesh position={[0, 0.22, 0]} castShadow>
        <boxGeometry args={[0.2, 0.04, 0.1]} />
        <meshStandardMaterial color={color} transparent={exhausted} opacity={o} roughness={0.5} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.28, 0]} castShadow>
        <sphereGeometry args={[0.05, 6, 6]} />
        <meshStandardMaterial color="#ddc8a0" roughness={0.7} />
      </mesh>
      {/* Leather cap */}
      <mesh position={[0, 0.31, 0]}>
        <sphereGeometry args={[0.04, 6, 4, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#7a5533" roughness={0.85} />
      </mesh>
      {/* Spear */}
      <mesh position={[0.1, 0.2, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 0.4, 4]} />
        <meshStandardMaterial color="#8a7a5a" />
      </mesh>
      <mesh position={[0.1, 0.41, 0]}>
        <coneGeometry args={[0.018, 0.05, 4]} />
        <meshStandardMaterial color="#bbb" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Small round shield */}
      <mesh position={[-0.1, 0.14, 0.03]} rotation={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.055, 0.055, 0.012, 8]} />
        <meshStandardMaterial color={color} transparent={exhausted} opacity={o} roughness={0.5} metalness={0.2} />
      </mesh>
      {/* Shield boss */}
      <mesh position={[-0.1, 0.14, 0.04]}>
        <sphereGeometry args={[0.015, 5, 5]} />
        <meshStandardMaterial color="#aaa" metalness={0.5} />
      </mesh>
    </group>
  )
}

// ── Archer: hooded ranger with bow ──────────────────────────────────────────
function ArcherBody({ color, exhausted }: { color: string; exhausted: boolean }) {
  const o = exhausted ? 0.45 : 1
  return (
    <group>
      {/* Slim torso */}
      <mesh position={[0, 0.12, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.075, 0.24, 6]} />
        <meshStandardMaterial color={color} transparent={exhausted} opacity={o} roughness={0.6} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.28, 0]} castShadow>
        <sphereGeometry args={[0.045, 6, 6]} />
        <meshStandardMaterial color="#ddc8a0" roughness={0.7} />
      </mesh>
      {/* Hood */}
      <mesh position={[0, 0.3, -0.02]}>
        <coneGeometry args={[0.055, 0.06, 6]} />
        <meshStandardMaterial color={color} transparent={exhausted} opacity={o} />
      </mesh>
      {/* Cloak draping back */}
      <mesh position={[0, 0.14, -0.06]} rotation={[0.1, 0, 0]}>
        <boxGeometry args={[0.12, 0.18, 0.008]} />
        <meshStandardMaterial color={color} transparent opacity={o * 0.7} side={THREE.DoubleSide} />
      </mesh>
      {/* Bow */}
      <mesh position={[-0.1, 0.18, 0]} rotation={[0, 0, 0.2]}>
        <torusGeometry args={[0.07, 0.006, 4, 8, Math.PI]} />
        <meshStandardMaterial color="#5c3d2e" roughness={0.9} />
      </mesh>
      {/* Bowstring */}
      <mesh position={[-0.1, 0.18, 0]} rotation={[0, 0, 0.2]}>
        <cylinderGeometry args={[0.001, 0.001, 0.14, 3]} />
        <meshStandardMaterial color="#aaa" />
      </mesh>
      {/* Quiver on back */}
      <mesh position={[0.04, 0.2, -0.06]} rotation={[0.15, 0, -0.1]}>
        <cylinderGeometry args={[0.025, 0.02, 0.12, 5]} />
        <meshStandardMaterial color="#6a4a30" roughness={0.9} />
      </mesh>
      {/* Arrow tips poking out */}
      {[-0.008, 0.008].map((dx, i) => (
        <mesh key={i} position={[0.04 + dx, 0.27, -0.06]}>
          <coneGeometry args={[0.005, 0.02, 3]} />
          <meshStandardMaterial color="#aaa" metalness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

// ── Knight: heavy armor, sword, kite shield ─────────────────────────────────
function KnightBody({ color, exhausted }: { color: string; exhausted: boolean }) {
  const o = exhausted ? 0.45 : 1
  return (
    <group>
      {/* Armored torso */}
      <mesh position={[0, 0.14, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.1, 0.28, 6]} />
        <meshStandardMaterial color={color} transparent={exhausted} opacity={o} roughness={0.4} metalness={0.3} />
      </mesh>
      {/* Pauldrons */}
      {[[-0.1, 0.26, 0], [0.1, 0.26, 0]].map(([px, py, pz], i) => (
        <mesh key={i} position={[px, py, pz]}>
          <sphereGeometry args={[0.035, 5, 5, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#999" metalness={0.5} roughness={0.3} />
        </mesh>
      ))}
      {/* Helmet */}
      <mesh position={[0, 0.32, 0]} castShadow>
        <sphereGeometry args={[0.055, 6, 6]} />
        <meshStandardMaterial color="#999" roughness={0.3} metalness={0.6} />
      </mesh>
      {/* Helm crest */}
      <mesh position={[0, 0.38, 0]}>
        <boxGeometry args={[0.005, 0.06, 0.06]} />
        <meshStandardMaterial color={color} transparent={exhausted} opacity={o} />
      </mesh>
      {/* Visor slit */}
      <mesh position={[0, 0.31, 0.054]}>
        <boxGeometry args={[0.04, 0.008, 0.002]} />
        <meshBasicMaterial color="#111" />
      </mesh>
      {/* Kite shield */}
      <group position={[-0.12, 0.15, 0.03]} rotation={[0, 0.3, 0]}>
        <mesh>
          <boxGeometry args={[0.006, 0.14, 0.08]} />
          <meshStandardMaterial color={color} transparent={exhausted} opacity={o} roughness={0.4} metalness={0.3} />
        </mesh>
        {/* Shield emblem */}
        <mesh position={[-0.004, 0.01, 0]}>
          <boxGeometry args={[0.001, 0.04, 0.02]} />
          <meshStandardMaterial color="#ddd" metalness={0.4} />
        </mesh>
      </group>
      {/* Sword */}
      <group position={[0.11, 0.18, 0]}>
        <mesh><boxGeometry args={[0.012, 0.22, 0.015]} /><meshStandardMaterial color="#ccc" metalness={0.7} roughness={0.2} /></mesh>
        {/* Crossguard */}
        <mesh position={[0, -0.08, 0]}>
          <boxGeometry args={[0.04, 0.01, 0.01]} />
          <meshStandardMaterial color="#aa8833" metalness={0.5} />
        </mesh>
        {/* Pommel */}
        <mesh position={[0, -0.12, 0]}>
          <sphereGeometry args={[0.008, 4, 4]} />
          <meshStandardMaterial color="#aa8833" metalness={0.5} />
        </mesh>
      </group>
    </group>
  )
}

// ── Hero: crowned warrior-mage with staff + cape ────────────────────────────
function HeroBody({ color, exhausted }: { color: string; exhausted: boolean }) {
  const o = exhausted ? 0.45 : 1
  const orbRef = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (orbRef.current) {
      orbRef.current.rotation.y = clock.elapsedTime * 1.2
      const mat = orbRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.4 + Math.sin(clock.elapsedTime * 3) * 0.2
    }
  })

  return (
    <group>
      {/* Heroic armored body */}
      <mesh position={[0, 0.16, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.12, 0.32, 8]} />
        <meshStandardMaterial color={color} transparent={exhausted} opacity={o} roughness={0.4} metalness={0.2} />
      </mesh>
      {/* Chest plate detail */}
      <mesh position={[0, 0.18, 0.07]}>
        <boxGeometry args={[0.1, 0.08, 0.01]} />
        <meshStandardMaterial color="#ddd" metalness={0.5} roughness={0.3} transparent={exhausted} opacity={o} />
      </mesh>
      {/* Cape */}
      <mesh position={[0, 0.15, -0.1]} rotation={[0.2, 0, 0]} castShadow>
        <boxGeometry args={[0.18, 0.28, 0.01]} />
        <meshStandardMaterial color={color} transparent opacity={o * 0.8} roughness={0.7} side={THREE.DoubleSide} />
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
      {/* Crown points */}
      {[0, 1, 2, 3, 4, 5].map((j) => {
        const a = (j / 6) * Math.PI * 2
        return (
          <mesh key={j} position={[Math.cos(a) * 0.04, 0.45, Math.sin(a) * 0.04]}>
            <coneGeometry args={[0.006, 0.02, 3]} />
            <meshStandardMaterial color="#ffd700" emissive="#ffa500" emissiveIntensity={0.2} metalness={0.7} />
          </mesh>
        )
      })}
      {/* Magical staff */}
      <mesh position={[0.14, 0.22, 0]}>
        <cylinderGeometry args={[0.008, 0.012, 0.45, 4]} />
        <meshStandardMaterial color="#5c3d2e" />
      </mesh>
      {/* Staff orb — animated */}
      <mesh ref={orbRef} position={[0.14, 0.47, 0]}>
        <octahedronGeometry args={[0.03]} />
        <meshStandardMaterial color="#66aaff" emissive="#4488ff" emissiveIntensity={0.5} transparent opacity={0.8} />
      </mesh>
      <pointLight position={[0.14, 0.47, 0]} color="#4488ff" intensity={0.3} distance={1} decay={2} />
    </group>
  )
}

const UNIT_BODIES: Record<string, React.FC<{ color: string; exhausted: boolean }>> = {
  militia: MilitiaBody, archer: ArcherBody, knight: KnightBody, hero: HeroBody,
}

export default function UnitModel({ unit, selected, onClick }: UnitModelProps) {
  const groupRef = useRef<THREE.Group>(null)
  const ringRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const color = FACTION_COLORS[unit.faction]
  const exhausted = unit.movesLeft === 0

  useFrame(({ clock }) => {
    if (groupRef.current) {
      const bob = selected
        ? Math.sin(clock.elapsedTime * 3) * 0.03
        : Math.sin(clock.elapsedTime * 1.5 + unit.x * 2 + unit.y * 3) * 0.008
      groupRef.current.position.y = 0.075 + bob
    }
    if (ringRef.current && selected) {
      const mat = ringRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = 0.4 + Math.sin(clock.elapsedTime * 4) * 0.2
      ringRef.current.rotation.z = clock.elapsedTime * 0.5
    }
  })

  const BodyComponent = UNIT_BODIES[unit.unitType] || MilitiaBody

  // Strength indicator: small pips
  const strengthPips = Math.min(unit.strength, 5)

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

        {/* Strength indicator pips */}
        {Array.from({ length: strengthPips }, (_, i) => (
          <mesh key={`sp${i}`} position={[(i - (strengthPips - 1) / 2) * 0.03, 0.5, 0]}>
            <sphereGeometry args={[0.008, 4, 4]} />
            <meshStandardMaterial color="#ffd700" emissive="#ffaa00" emissiveIntensity={0.3} />
          </mesh>
        ))}
      </group>

      {selected && (
        <mesh ref={ringRef} position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.16, 0.2, 24]} />
          <meshBasicMaterial color="#ffd700" transparent opacity={0.5} depthWrite={false} />
        </mesh>
      )}

      {hovered && !selected && (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.14, 0.17, 24]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.25} depthWrite={false} />
        </mesh>
      )}
    </group>
  )
}
