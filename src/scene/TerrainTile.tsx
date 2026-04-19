import { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { TerrainType } from '../game/types'

// ── Seeded RNG ──────────────────────────────────────────────────────────────
function sr(seed: number) {
  let s = seed
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646 }
}

// ── Songs of Conquest palette – warm, painterly, high-contrast ──────────────
const GRASS = ['#5a8a3a', '#4e7a35', '#68944a', '#3d6e2a', '#72a050', '#80a858']
const GRASS_DARK = ['#3a5828', '#446830', '#4a7035']
const DIRT = ['#8a7a55', '#7a6a48', '#9a8a60', '#a09068']
const FLOWER = ['#d4a050', '#c87830', '#ddb855', '#bb5533', '#cc4444', '#dddd55']
const ROCK_SM = ['#7a7060', '#8a8070', '#6a6050']

const FOREST_GROUND = ['#3a5e2a', '#2e4f22', '#4a6b35', '#345828']
const CANOPY_GREEN = ['#1a5c1a', '#226622', '#1a4e1a', '#2d7a2d']
const CANOPY_AUTUMN = ['#c87830', '#d4943a', '#bb5533', '#e8a840', '#aa4422', '#dd6633']
const TRUNK = ['#5c3d2e', '#4a3020', '#6b4a35']

const MTN_ROCK = ['#6b5e50', '#7a6b5a', '#5e5045', '#8a7a6a', '#544838']
const MTN_SNOW = ['#e8e0d5', '#f0ebe0', '#d8d0c5']

const WATER_DEEP = '#1a4a6a'
const WATER_SURF = ['#2a6a8a', '#2580a0', '#3388aa']

interface Props {
  terrain: TerrainType; x: number; y: number
  highlighted: boolean; hovered: boolean
  onClick: () => void; onPointerEnter: () => void; onPointerLeave: () => void
}

// ── Grass with painterly patches, tufts, flowers, rocks ─────────────────────
function GrassDetail({ x, y }: { x: number; y: number }) {
  const d = useMemo(() => {
    const r = sr(x * 1000 + y * 37)
    const patches = Array.from({ length: 5 }, () => ({
      px: (r() - 0.5) * 0.8, pz: (r() - 0.5) * 0.8,
      color: (r() < 0.3 ? DIRT : r() < 0.5 ? GRASS_DARK : GRASS)[Math.floor(r() * 3)],
      s: 0.1 + r() * 0.18,
    }))
    const tufts = Array.from({ length: 4 + Math.floor(r() * 4) }, () => ({
      px: (r() - 0.5) * 0.85, pz: (r() - 0.5) * 0.85,
      h: 0.02 + r() * 0.05, color: GRASS[Math.floor(r() * GRASS.length)],
    }))
    const flowers = r() < 0.45 ? Array.from({ length: 1 + Math.floor(r() * 3) }, () => ({
      px: (r() - 0.5) * 0.7, pz: (r() - 0.5) * 0.7,
      color: FLOWER[Math.floor(r() * FLOWER.length)], s: 0.012 + r() * 0.012,
    })) : []
    const rocks = r() < 0.2 ? [{
      px: (r() - 0.5) * 0.5, pz: (r() - 0.5) * 0.5,
      s: 0.03 + r() * 0.04, c: ROCK_SM[Math.floor(r() * 3)],
    }] : []
    return { patches, tufts, flowers, rocks }
  }, [x, y])

  return (
    <group>
      {d.patches.map((p, i) => (
        <mesh key={i} position={[p.px, 0.081, p.pz]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[p.s, 6]} />
          <meshStandardMaterial color={p.color} />
        </mesh>
      ))}
      {d.tufts.map((t, i) => (
        <mesh key={`t${i}`} position={[t.px, 0.08 + t.h / 2, t.pz]}>
          <coneGeometry args={[0.015, t.h, 4]} />
          <meshStandardMaterial color={t.color} />
        </mesh>
      ))}
      {d.flowers.map((f, i) => (
        <mesh key={`f${i}`} position={[f.px, 0.09, f.pz]}>
          <sphereGeometry args={[f.s, 5, 5]} />
          <meshStandardMaterial color={f.color} emissive={f.color} emissiveIntensity={0.15} />
        </mesh>
      ))}
      {d.rocks.map((rk, i) => (
        <mesh key={`r${i}`} position={[rk.px, 0.08 + rk.s * 0.7, rk.pz]}>
          <dodecahedronGeometry args={[rk.s, 0]} />
          <meshStandardMaterial color={rk.c} roughness={0.95} />
        </mesh>
      ))}
    </group>
  )
}

// ── Forest with autumn variety + wind sway ──────────────────────────────────
function ForestDetail({ x, y }: { x: number; y: number }) {
  const trees = useMemo(() => {
    const r = sr(x * 777 + y * 131)
    const n = 3 + Math.floor(r() * 3)
    return Array.from({ length: n }, (_, idx) => {
      const isAutumn = r() < 0.35
      const isBush = r() < 0.25
      const canopy = isAutumn
        ? CANOPY_AUTUMN[Math.floor(r() * CANOPY_AUTUMN.length)]
        : CANOPY_GREEN[Math.floor(r() * CANOPY_GREEN.length)]
      return {
        idx,
        px: (r() - 0.5) * 0.7, pz: (r() - 0.5) * 0.7,
        h: isBush ? 0.1 + r() * 0.08 : 0.25 + r() * 0.25,
        cr: isBush ? 0.08 + r() * 0.06 : 0.1 + r() * 0.1,
        th: isBush ? 0.04 : 0.12 + r() * 0.12,
        color: canopy,
        trunkColor: TRUNK[Math.floor(r() * TRUNK.length)],
        isBush, isAutumn,
        leafLayers: isBush ? 1 : 2 + Math.floor(r() * 2),
        rotY: r() * Math.PI * 2,
      }
    })
  }, [x, y])

  const groupRef = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (!groupRef.current) return
    groupRef.current.children.forEach((child, i) => {
      if (child instanceof THREE.Group) {
        child.rotation.x = Math.sin(clock.elapsedTime * 0.8 + x + i * 1.7) * 0.015
        child.rotation.z = Math.cos(clock.elapsedTime * 0.6 + y + i * 2.3) * 0.01
      }
    })
  })

  return (
    <group ref={groupRef}>
      {trees.map((t) => (
        <group key={t.idx} position={[t.px, 0.08, t.pz]} rotation={[0, t.rotY, 0]}>
          {!t.isBush && (
            <mesh position={[0, t.th / 2, 0]} castShadow>
              <cylinderGeometry args={[0.018, 0.03, t.th, 5]} />
              <meshStandardMaterial color={t.trunkColor} roughness={0.9} />
            </mesh>
          )}
          {Array.from({ length: t.leafLayers }, (_, li) => {
            const layerY = t.th + t.h * (0.25 + li * 0.25)
            const layerR = t.cr * (1 - li * 0.2)
            return t.isBush ? (
              <mesh key={li} position={[0, layerY * 0.5, 0]} castShadow>
                <sphereGeometry args={[layerR, 6, 5]} />
                <meshStandardMaterial color={t.color} roughness={0.8} />
              </mesh>
            ) : (
              <mesh key={li} position={[0, layerY, 0]} castShadow>
                <coneGeometry args={[layerR, t.h * 0.5 / t.leafLayers + 0.08, 6]} />
                <meshStandardMaterial color={t.color} roughness={0.8} />
              </mesh>
            )
          })}
          {t.isAutumn && (
            <mesh position={[0.05, 0.005, 0.05]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.04, 5]} />
              <meshStandardMaterial color={t.color} transparent opacity={0.5} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  )
}

// ── Mountain with layered rock strata ───────────────────────────────────────
function MountainDetail({ x, y }: { x: number; y: number }) {
  const d = useMemo(() => {
    const r = sr(x * 999 + y * 53)
    const peaks = Array.from({ length: 1 + Math.floor(r() * 2) }, () => ({
      px: (r() - 0.5) * 0.35, pz: (r() - 0.5) * 0.35,
      h: 0.4 + r() * 0.35, rad: 0.18 + r() * 0.14,
      color: MTN_ROCK[Math.floor(r() * MTN_ROCK.length)],
      hasSnow: r() > 0.35,
    }))
    const strata = Array.from({ length: 2 + Math.floor(r() * 3) }, () => ({
      px: (r() - 0.5) * 0.5, pz: (r() - 0.5) * 0.5,
      h: 0.08 + r() * 0.12, w: 0.12 + r() * 0.15,
      color: MTN_ROCK[Math.floor(r() * MTN_ROCK.length)], rotY: r() * Math.PI,
    }))
    const boulders = Array.from({ length: 2 + Math.floor(r() * 4) }, () => ({
      px: (r() - 0.5) * 0.7, pz: (r() - 0.5) * 0.7,
      s: 0.03 + r() * 0.05, color: MTN_ROCK[Math.floor(r() * MTN_ROCK.length)],
    }))
    return { peaks, strata, boulders }
  }, [x, y])

  return (
    <group>
      {d.strata.map((s, i) => (
        <mesh key={`s${i}`} position={[s.px, 0.1 + s.h / 2, s.pz]} rotation={[0, s.rotY, 0]} castShadow>
          <boxGeometry args={[s.w, s.h, s.w * 0.6]} />
          <meshStandardMaterial color={s.color} roughness={0.95} />
        </mesh>
      ))}
      {d.peaks.map((p, i) => (
        <group key={i} position={[p.px, 0, p.pz]}>
          <mesh position={[0, 0.12 + p.h * 0.25, 0]} castShadow>
            <coneGeometry args={[p.rad, p.h * 0.55, 5]} />
            <meshStandardMaterial color={p.color} roughness={0.95} />
          </mesh>
          <mesh position={[0, 0.12 + p.h * 0.55, 0]} castShadow>
            <coneGeometry args={[p.rad * 0.5, p.h * 0.45, 5]} />
            <meshStandardMaterial color={p.hasSnow ? MTN_SNOW[i % 3] : p.color} roughness={0.6} />
          </mesh>
        </group>
      ))}
      {d.boulders.map((b, i) => (
        <mesh key={`b${i}`} position={[b.px, 0.09 + b.s, b.pz]} castShadow>
          <dodecahedronGeometry args={[b.s, 0]} />
          <meshStandardMaterial color={b.color} roughness={0.95} />
        </mesh>
      ))}
    </group>
  )
}

// ── Water with animated surface + shimmer ───────────────────────────────────
function WaterTile({ x, y }: { x: number; y: number }) {
  const surfRef = useRef<THREE.Mesh>(null)
  const matRef = useRef<THREE.MeshStandardMaterial>(null)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (surfRef.current) surfRef.current.position.y = 0.025 + Math.sin(t * 0.7 + x * 1.5 + y * 2.1) * 0.006
    if (matRef.current) matRef.current.opacity = 0.72 + Math.sin(t * 1.2 + x + y) * 0.06
  })

  const color = useMemo(() => WATER_SURF[Math.floor(sr(x * 333 + y * 77)() * 3)], [x, y])

  return (
    <group>
      <mesh position={[0, 0.008, 0]} receiveShadow>
        <boxGeometry args={[0.98, 0.016, 0.98]} />
        <meshStandardMaterial color={WATER_DEEP} roughness={0.3} />
      </mesh>
      <mesh ref={surfRef} position={[0, 0.025, 0]} receiveShadow>
        <boxGeometry args={[0.96, 0.012, 0.96]} />
        <meshStandardMaterial ref={matRef} color={color} transparent opacity={0.75} roughness={0.05} metalness={0.4} />
      </mesh>
    </group>
  )
}

// ── Main TerrainTile ────────────────────────────────────────────────────────
export default function TerrainTile({ terrain, x, y, highlighted, hovered, onClick, onPointerEnter, onPointerLeave }: Props) {
  const [localHover, setLocalHover] = useState(false)
  const isHovered = hovered || localHover

  const baseColor = useMemo(() => {
    const r = sr(x * 500 + y * 23)
    if (terrain === 'grass') return GRASS[Math.floor(r() * GRASS.length)]
    if (terrain === 'forest') return FOREST_GROUND[Math.floor(r() * FOREST_GROUND.length)]
    if (terrain === 'mountain') return '#5a4e40'
    return WATER_DEEP
  }, [terrain, x, y])

  const tileH = terrain === 'mountain' ? 0.18 : terrain === 'water' ? 0.02 : 0.08

  const glowRef = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (glowRef.current && highlighted) {
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.22 + Math.sin(clock.elapsedTime * 2.5) * 0.1
    }
  })

  return (
    <group position={[x, 0, y]}>
      <mesh
        position={[0, tileH / 2, 0]}
        onClick={(e) => { e.stopPropagation(); onClick() }}
        onPointerEnter={(e) => { e.stopPropagation(); setLocalHover(true); onPointerEnter() }}
        onPointerLeave={() => { setLocalHover(false); onPointerLeave() }}
        receiveShadow castShadow={terrain === 'mountain'}
      >
        <boxGeometry args={[0.98, tileH, 0.98]} />
        <meshStandardMaterial color={baseColor} roughness={0.85} />
      </mesh>

      {terrain === 'grass' && <GrassDetail x={x} y={y} />}
      {terrain === 'forest' && (<><GrassDetail x={x} y={y} /><ForestDetail x={x} y={y} /></>)}
      {terrain === 'mountain' && <MountainDetail x={x} y={y} />}
      {terrain === 'water' && <WaterTile x={x} y={y} />}

      {highlighted && (
        <mesh ref={glowRef} position={[0, tileH + 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.96, 0.96]} />
          <meshBasicMaterial color="#44ff88" transparent opacity={0.25} depthWrite={false} />
        </mesh>
      )}
      {isHovered && !highlighted && (
        <mesh position={[0, tileH + 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.42, 0.48, 4]} />
          <meshBasicMaterial color="#c8a84e" transparent opacity={0.4} depthWrite={false} />
        </mesh>
      )}
    </group>
  )
}
