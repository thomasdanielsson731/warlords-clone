import { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { TerrainType } from '../game/types'

// --- Seeded RNG for deterministic terrain detail placement ---
function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

// --- Color palettes inspired by Songs of Conquest painterly style ---
const GRASS_COLORS = ['#4a7a3a', '#5a8a45', '#3d6e30', '#6b9a55', '#4e8040']
const FOREST_GROUND = ['#3a5e2a', '#2e4f22', '#4a6b35']
const MOUNTAIN_COLORS = ['#6b5e50', '#7a6b5a', '#5e5045', '#8a7a6a']
const WATER_COLORS = ['#2a5a8a', '#1e4a7a', '#3366aa']

interface TerrainTileProps {
  terrain: TerrainType
  x: number
  y: number
  highlighted: boolean
  hovered: boolean
  onClick: () => void
  onPointerEnter: () => void
  onPointerLeave: () => void
}

// --- Grass detail: small patches of varying color + occasional flowers/rocks ---
function GrassDetail({ x, y }: { x: number; y: number }) {
  const details = useMemo(() => {
    const rng = seededRandom(x * 1000 + y * 37)
    const patches: { px: number; pz: number; color: string; scale: number }[] = []
    // Ground color patches for painterly feel
    for (let i = 0; i < 3; i++) {
      patches.push({
        px: (rng() - 0.5) * 0.7,
        pz: (rng() - 0.5) * 0.7,
        color: GRASS_COLORS[Math.floor(rng() * GRASS_COLORS.length)],
        scale: 0.15 + rng() * 0.2,
      })
    }
    // Small flowers or grass tufts
    const tufts: { px: number; pz: number; color: string; h: number }[] = []
    const numTufts = Math.floor(rng() * 4)
    for (let i = 0; i < numTufts; i++) {
      const flowerColors = ['#8ab840', '#7aaa35', '#bbc855', '#d4a050']
      tufts.push({
        px: (rng() - 0.5) * 0.8,
        pz: (rng() - 0.5) * 0.8,
        color: flowerColors[Math.floor(rng() * flowerColors.length)],
        h: 0.03 + rng() * 0.04,
      })
    }
    // Occasional small rock
    const hasRock = rng() < 0.15
    const rock = hasRock ? { px: (rng() - 0.5) * 0.5, pz: (rng() - 0.5) * 0.5, s: 0.04 + rng() * 0.04 } : null
    return { patches, tufts, rock }
  }, [x, y])

  return (
    <group>
      {details.patches.map((p, i) => (
        <mesh key={i} position={[p.px, 0.076, p.pz]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[p.scale, 6]} />
          <meshStandardMaterial color={p.color} />
        </mesh>
      ))}
      {details.tufts.map((t, i) => (
        <mesh key={`t${i}`} position={[t.px, 0.075 + t.h / 2, t.pz]}>
          <boxGeometry args={[0.03, t.h, 0.03]} />
          <meshStandardMaterial color={t.color} />
        </mesh>
      ))}
      {details.rock && (
        <mesh position={[details.rock.px, 0.075 + details.rock.s / 2, details.rock.pz]}>
          <dodecahedronGeometry args={[details.rock.s, 0]} />
          <meshStandardMaterial color="#8a8070" roughness={0.9} />
        </mesh>
      )}
    </group>
  )
}

// --- Forest: multiple trees with variation ---
function ForestDetail({ x, y }: { x: number; y: number }) {
  const trees = useMemo(() => {
    const rng = seededRandom(x * 777 + y * 131)
    const numTrees = 2 + Math.floor(rng() * 3) // 2-4 trees
    const result: { px: number; pz: number; h: number; r: number; color: string; trunkH: number }[] = []
    const treeColors = ['#1a5c1a', '#226622', '#1a4e1a', '#2d7a2d', '#185018']
    for (let i = 0; i < numTrees; i++) {
      result.push({
        px: (rng() - 0.5) * 0.65,
        pz: (rng() - 0.5) * 0.65,
        h: 0.25 + rng() * 0.2,
        r: 0.12 + rng() * 0.1,
        color: treeColors[Math.floor(rng() * treeColors.length)],
        trunkH: 0.15 + rng() * 0.1,
      })
    }
    return result
  }, [x, y])

  return (
    <group>
      {trees.map((t, i) => (
        <group key={i} position={[t.px, 0.075, t.pz]}>
          {/* Trunk */}
          <mesh position={[0, t.trunkH / 2, 0]} castShadow>
            <cylinderGeometry args={[0.025, 0.035, t.trunkH, 5]} />
            <meshStandardMaterial color="#5c3d2e" roughness={0.9} />
          </mesh>
          {/* Canopy - layered cones for depth */}
          <mesh position={[0, t.trunkH + t.h * 0.3, 0]} castShadow>
            <coneGeometry args={[t.r, t.h * 0.6, 6]} />
            <meshStandardMaterial color={t.color} roughness={0.8} />
          </mesh>
          <mesh position={[0, t.trunkH + t.h * 0.55, 0]} castShadow>
            <coneGeometry args={[t.r * 0.7, t.h * 0.45, 6]} />
            <meshStandardMaterial color={t.color} roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// --- Mountain: rocky peaks with snow caps ---
function MountainDetail({ x, y }: { x: number; y: number }) {
  const peaks = useMemo(() => {
    const rng = seededRandom(x * 999 + y * 53)
    const numPeaks = 1 + Math.floor(rng() * 2)
    const result: { px: number; pz: number; h: number; r: number; color: string; hasSnow: boolean }[] = []
    for (let i = 0; i < numPeaks; i++) {
      result.push({
        px: (rng() - 0.5) * 0.4,
        pz: (rng() - 0.5) * 0.4,
        h: 0.35 + rng() * 0.3,
        r: 0.2 + rng() * 0.15,
        color: MOUNTAIN_COLORS[Math.floor(rng() * MOUNTAIN_COLORS.length)],
        hasSnow: rng() > 0.4,
      })
    }
    // Add boulders
    const boulders: { px: number; pz: number; s: number }[] = []
    const numBoulders = 1 + Math.floor(rng() * 3)
    for (let i = 0; i < numBoulders; i++) {
      boulders.push({
        px: (rng() - 0.5) * 0.7,
        pz: (rng() - 0.5) * 0.7,
        s: 0.04 + rng() * 0.06,
      })
    }
    return { peaks: result, boulders }
  }, [x, y])

  return (
    <group>
      {peaks.peaks.map((p, i) => (
        <group key={i} position={[p.px, 0, p.pz]}>
          {/* Rocky base */}
          <mesh position={[0, 0.15 + p.h * 0.3, 0]} castShadow>
            <coneGeometry args={[p.r, p.h * 0.6, 5]} />
            <meshStandardMaterial color={p.color} roughness={0.95} />
          </mesh>
          {/* Peak */}
          <mesh position={[0, 0.15 + p.h * 0.6, 0]} castShadow>
            <coneGeometry args={[p.r * 0.5, p.h * 0.4, 5]} />
            <meshStandardMaterial color={p.hasSnow ? '#e8e0d5' : p.color} roughness={0.7} />
          </mesh>
        </group>
      ))}
      {peaks.boulders.map((b, i) => (
        <mesh key={`b${i}`} position={[b.px, 0.075 + b.s, b.pz]} castShadow>
          <dodecahedronGeometry args={[b.s, 0]} />
          <meshStandardMaterial color="#7a6e60" roughness={0.95} />
        </mesh>
      ))}
    </group>
  )
}

// --- Water: animated surface ---
function WaterTile({ x, y }: { x: number; y: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const matRef = useRef<THREE.MeshStandardMaterial>(null)

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.position.y = 0.02 + Math.sin(clock.elapsedTime * 0.8 + x * 1.5 + y * 2.1) * 0.008
    }
    if (matRef.current) {
      matRef.current.opacity = 0.7 + Math.sin(clock.elapsedTime * 1.2 + x + y) * 0.05
    }
  })

  const color = useMemo(() => {
    const rng = seededRandom(x * 333 + y * 77)
    return WATER_COLORS[Math.floor(rng() * WATER_COLORS.length)]
  }, [x, y])

  return (
    <group>
      {/* Deep water base */}
      <mesh position={[0, 0.01, 0]} receiveShadow>
        <boxGeometry args={[0.98, 0.02, 0.98]} />
        <meshStandardMaterial color="#1a3a5a" />
      </mesh>
      {/* Animated surface */}
      <mesh ref={meshRef} position={[0, 0.025, 0]} receiveShadow>
        <boxGeometry args={[0.96, 0.015, 0.96]} />
        <meshStandardMaterial
          ref={matRef}
          color={color}
          transparent
          opacity={0.75}
          roughness={0.1}
          metalness={0.3}
        />
      </mesh>
    </group>
  )
}

export default function TerrainTile({
  terrain,
  x,
  y,
  highlighted,
  hovered,
  onClick,
  onPointerEnter,
  onPointerLeave,
}: TerrainTileProps) {
  const [localHover, setLocalHover] = useState(false)
  const isHovered = hovered || localHover

  const baseColor = useMemo(() => {
    const rng = seededRandom(x * 500 + y * 23)
    if (terrain === 'grass') return GRASS_COLORS[Math.floor(rng() * GRASS_COLORS.length)]
    if (terrain === 'forest') return FOREST_GROUND[Math.floor(rng() * FOREST_GROUND.length)]
    if (terrain === 'mountain') return '#5a4e40'
    return '#1a3a5a'
  }, [terrain, x, y])

  const tileHeight = terrain === 'mountain' ? 0.15 : terrain === 'water' ? 0.03 : 0.075

  // Glow ring ref for animation
  const glowRef = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (glowRef.current && highlighted) {
      glowRef.current.material = glowRef.current.material as THREE.MeshBasicMaterial
      const mat = glowRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = 0.2 + Math.sin(clock.elapsedTime * 2.5) * 0.1
    }
  })

  return (
    <group position={[x, 0, y]}>
      {/* Base terrain slab */}
      <mesh
        position={[0, tileHeight / 2, 0]}
        onClick={(e) => { e.stopPropagation(); onClick() }}
        onPointerEnter={(e) => { e.stopPropagation(); setLocalHover(true); onPointerEnter() }}
        onPointerLeave={() => { setLocalHover(false); onPointerLeave() }}
        receiveShadow
        castShadow={terrain === 'mountain'}
      >
        <boxGeometry args={[0.98, tileHeight, 0.98]} />
        <meshStandardMaterial
          color={baseColor}
          roughness={0.85}
          metalness={0.0}
        />
      </mesh>

      {/* Terrain-specific detail */}
      {terrain === 'grass' && <GrassDetail x={x} y={y} />}
      {terrain === 'forest' && (
        <>
          <GrassDetail x={x} y={y} />
          <ForestDetail x={x} y={y} />
        </>
      )}
      {terrain === 'mountain' && <MountainDetail x={x} y={y} />}
      {terrain === 'water' && <WaterTile x={x} y={y} />}

      {/* Movement range highlight — pulsing green glow */}
      {highlighted && (
        <mesh
          ref={glowRef}
          position={[0, tileHeight + 0.005, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[0.96, 0.96]} />
          <meshBasicMaterial color="#44ff88" transparent opacity={0.25} depthWrite={false} />
        </mesh>
      )}

      {/* Hover highlight — subtle golden border */}
      {isHovered && !highlighted && (
        <mesh
          position={[0, tileHeight + 0.005, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[0.42, 0.48, 4]} />
          <meshBasicMaterial color="#c8a84e" transparent opacity={0.4} depthWrite={false} />
        </mesh>
      )}
    </group>
  )
}
