// Regeneration script — batch 2: scene layer (TerrainTile, CityModel, UnitModel, GameScene, CameraController, ObjectiveMarkers, StrategicOverlays)
const fs = require('fs');
const path = require('path');
const SRC = 'c:/dev/warlords/src';

function write(relPath, content) {
  const full = path.join(SRC, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('Wrote', relPath, '—', content.split('\n').length, 'lines');
}

// ═══════════════════════════════════════════════════════════════════════════
// palette.ts
// ═══════════════════════════════════════════════════════════════════════════
write('assets/terrain/palette.ts', `// Songs of Conquest-inspired terrain color palettes
// Warm, painterly, high-contrast for readability

export const PALETTE = {
  grass: {
    base: ['#5a8a3a', '#4e7a35', '#68944a', '#3d6e2a', '#72a050'],
    accent: ['#8ab840', '#7aaa35', '#96c255', '#a8c868'],
    dirt: ['#8a7a55', '#7a6a48', '#9a8a60'],
    flowers: ['#d4a050', '#c87830', '#ddb855', '#e8c070', '#bb5533'],
  },
  forest: {
    ground: ['#3a5e2a', '#2e4f22', '#4a6b35', '#345828'],
    canopy: ['#1a5c1a', '#226622', '#1a4e1a', '#2d7a2d', '#185018'],
    autumn: ['#c87830', '#d4943a', '#bb5533', '#e8a840', '#aa4422'],
    trunk: ['#5c3d2e', '#4a3020', '#6b4a35', '#3a2518'],
  },
  mountain: {
    rock: ['#6b5e50', '#7a6b5a', '#5e5045', '#8a7a6a', '#544838'],
    cliff: ['#4a4038', '#5a5040', '#3a3530'],
    snow: ['#e8e0d5', '#f0ebe0', '#d8d0c5'],
    dirt: ['#6a5a48', '#7a6a55'],
  },
  water: {
    deep: ['#1a4a6a', '#153d5a', '#1e5575'],
    surface: ['#2a6a8a', '#2580a0', '#3388aa'],
    shore: ['#3a8aaa', '#45a0bb', '#55b0cc'],
    foam: ['#88ccdd', '#99ddee', '#aaeeff'],
  },
} as const

// Terrain height values for 3D depth
export const TERRAIN_HEIGHT = {
  water: 0.02,
  grass: 0.08,
  forest: 0.08,
  mountain: 0.18,
} as const

// Detail density per terrain type
export const DETAIL_DENSITY = {
  grass: { patches: 5, tufts: 6, rocks: 0.2, flowers: 0.4 },
  forest: { trees: 4, bushes: 3, groundcover: 4 },
  mountain: { peaks: 2, boulders: 4, scree: 3 },
} as const
`);

// ═══════════════════════════════════════════════════════════════════════════
// TerrainTile.tsx
// ═══════════════════════════════════════════════════════════════════════════
write('scene/TerrainTile.tsx', `import { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { TerrainType } from '../game/types'

// ── Seeded RNG ──────────────────────────────────────────────────────────────
function sr(seed: number) {
  let s = seed
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646 }
}

// ── Color palettes ──────────────────────────────────────────────────────────
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
        <mesh key={\`t\${i}\`} position={[t.px, 0.08 + t.h / 2, t.pz]}>
          <coneGeometry args={[0.015, t.h, 4]} />
          <meshStandardMaterial color={t.color} />
        </mesh>
      ))}
      {d.flowers.map((f, i) => (
        <mesh key={\`f\${i}\`} position={[f.px, 0.09, f.pz]}>
          <sphereGeometry args={[f.s, 5, 5]} />
          <meshStandardMaterial color={f.color} emissive={f.color} emissiveIntensity={0.15} />
        </mesh>
      ))}
      {d.rocks.map((rk, i) => (
        <mesh key={\`r\${i}\`} position={[rk.px, 0.08 + rk.s * 0.7, rk.pz]}>
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
        idx, px: (r() - 0.5) * 0.7, pz: (r() - 0.5) * 0.7,
        h: isBush ? 0.1 + r() * 0.08 : 0.25 + r() * 0.25,
        cr: isBush ? 0.08 + r() * 0.06 : 0.1 + r() * 0.1,
        th: isBush ? 0.04 : 0.12 + r() * 0.12,
        color: canopy, trunkColor: TRUNK[Math.floor(r() * TRUNK.length)],
        isBush, isAutumn, leafLayers: isBush ? 1 : 2 + Math.floor(r() * 2),
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
        <mesh key={\`s\${i}\`} position={[s.px, 0.1 + s.h / 2, s.pz]} rotation={[0, s.rotY, 0]} castShadow>
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
        <mesh key={\`b\${i}\`} position={[b.px, 0.09 + b.s, b.pz]} castShadow>
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
`);

// ═══════════════════════════════════════════════════════════════════════════
// CityModel.tsx
// ═══════════════════════════════════════════════════════════════════════════
write('scene/CityModel.tsx', `import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { City, Faction } from '../game/types'
import { FACTION_COLORS, NEUTRAL_COLOR } from '../game/types'

interface CityModelProps { city: City; selected: boolean; onClick: () => void }

// ── Animated helpers ────────────────────────────────────────────────────────
function SmokePlume({ position, color = '#888888' }: { position: [number, number, number]; color?: string }) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(clock.elapsedTime * 0.5) * 0.05 + 0.1
      ;(ref.current.material as THREE.MeshBasicMaterial).opacity = 0.15 + Math.sin(clock.elapsedTime * 0.7) * 0.08
    }
  })
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.06, 6, 6]} />
      <meshBasicMaterial color={color} transparent opacity={0.2} depthWrite={false} />
    </mesh>
  )
}

function Torch({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.PointLight>(null)
  useFrame(({ clock }) => { if (ref.current) ref.current.intensity = 0.4 + Math.sin(clock.elapsedTime * 8 + position[0] * 5) * 0.15 })
  return (
    <group position={position}>
      <mesh><cylinderGeometry args={[0.008, 0.008, 0.08, 4]} /><meshStandardMaterial color="#5c3d2e" /></mesh>
      <mesh position={[0, 0.06, 0]}><sphereGeometry args={[0.02, 4, 4]} /><meshBasicMaterial color="#ff8833" /></mesh>
      <pointLight ref={ref} position={[0, 0.06, 0]} color="#ff6622" intensity={0.5} distance={1.5} decay={2} />
    </group>
  )
}

function Banner({ position, color, height = 0.12 }: { position: [number, number, number]; color: string; height?: number }) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => { if (ref.current) ref.current.rotation.y = Math.sin(clock.elapsedTime * 2 + position[0] * 3) * 0.15 })
  return (
    <group position={position}>
      <mesh><cylinderGeometry args={[0.008, 0.008, height + 0.15, 4]} /><meshStandardMaterial color="#777" /></mesh>
      <mesh ref={ref} position={[0.05, (height + 0.15) / 2 - 0.02, 0]}>
        <boxGeometry args={[0.08, 0.06, 0.005]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.15} />
      </mesh>
    </group>
  )
}

// ── Human City: castle complex ──────────────────────────────────────────────
function HumanCity({ color }: { color: string }) {
  return (
    <group>
      {/* Main keep */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[0.4, 0.6, 0.4]} />
        <meshStandardMaterial color="#a09080" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.65, 0]} castShadow>
        <coneGeometry args={[0.25, 0.2, 4]} />
        <meshStandardMaterial color="#4466aa" roughness={0.7} />
      </mesh>

      {/* Corner towers with battlements */}
      {[[-0.25, -0.25], [0.25, -0.25], [-0.25, 0.25], [0.25, 0.25]].map(([tx, tz], i) => (
        <group key={i} position={[tx, 0, tz]}>
          <mesh position={[0, 0.25, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.09, 0.5, 6]} />
            <meshStandardMaterial color="#908070" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.52, 0]} castShadow>
            <coneGeometry args={[0.1, 0.1, 6]} />
            <meshStandardMaterial color="#4466aa" roughness={0.7} />
          </mesh>
          {[0, 1, 2, 3, 4, 5].map((j) => {
            const a = (j / 6) * Math.PI * 2
            return (
              <mesh key={j} position={[Math.cos(a) * 0.07, 0.49, Math.sin(a) * 0.07]}>
                <boxGeometry args={[0.025, 0.04, 0.025]} />
                <meshStandardMaterial color="#7a6a5a" />
              </mesh>
            )
          })}
        </group>
      ))}

      {/* Curtain walls */}
      {[
        [0, 0.15, -0.25, 0.5, 0.3, 0.05],
        [0, 0.15, 0.25, 0.5, 0.3, 0.05],
        [-0.25, 0.15, 0, 0.05, 0.3, 0.5],
        [0.25, 0.15, 0, 0.05, 0.3, 0.5],
      ].map(([wx, wy, wz, ww, wh, wd], i) => (
        <mesh key={\`w\${i}\`} position={[wx, wy, wz]} castShadow>
          <boxGeometry args={[ww, wh, wd]} />
          <meshStandardMaterial color="#8a7a6a" roughness={0.9} />
        </mesh>
      ))}

      {/* Gate + arch */}
      <mesh position={[0, 0.08, 0.27]}>
        <boxGeometry args={[0.1, 0.16, 0.02]} />
        <meshStandardMaterial color="#4a3a2a" />
      </mesh>
      <mesh position={[0, 0.18, 0.27]}>
        <boxGeometry args={[0.12, 0.03, 0.025]} />
        <meshStandardMaterial color="#6a5a4a" />
      </mesh>

      {/* Courtyard buildings */}
      {[[-0.1, 0.08, 0.12], [0.12, 0.07, -0.12]].map(([hx, hh, hz], i) => (
        <group key={\`h\${i}\`} position={[hx, 0, hz]}>
          <mesh position={[0, hh / 2 + 0.02, 0]} castShadow>
            <boxGeometry args={[0.1, hh, 0.08]} />
            <meshStandardMaterial color="#b0a090" roughness={0.9} />
          </mesh>
          <mesh position={[0, hh + 0.04, 0]} castShadow>
            <coneGeometry args={[0.065, 0.06, 4]} />
            <meshStandardMaterial color="#8a5533" roughness={0.85} />
          </mesh>
        </group>
      ))}

      {/* Well */}
      <mesh position={[-0.08, 0.04, 0.05]}>
        <cylinderGeometry args={[0.025, 0.03, 0.04, 6]} />
        <meshStandardMaterial color="#777" roughness={0.9} />
      </mesh>

      {/* Market stall */}
      <group position={[0.06, 0, 0.08]}>
        <mesh position={[0, 0.035, 0]}>
          <boxGeometry args={[0.07, 0.01, 0.05]} />
          <meshStandardMaterial color="#8a6644" />
        </mesh>
        {[[-0.025, 0], [0.025, 0]].map(([sx, sz], i) => (
          <mesh key={i} position={[sx, 0.02, sz]}>
            <cylinderGeometry args={[0.003, 0.003, 0.04, 3]} />
            <meshStandardMaterial color="#5a4030" />
          </mesh>
        ))}
      </group>

      <Banner position={[-0.25, 0.5, -0.25]} color={color} />
      <Banner position={[0.25, 0.5, 0.25]} color={color} />
      <SmokePlume position={[0, 0.7, 0.05]} />
      <Torch position={[-0.08, 0.2, 0.26]} />
      <Torch position={[0.08, 0.2, 0.26]} />

      {/* Glowing windows */}
      {[[-0.08, 0.35, 0.201], [0.08, 0.35, 0.201], [0, 0.25, 0.201], [-0.08, 0.45, 0.201]].map(([gx, gy, gz], i) => (
        <mesh key={\`gw\${i}\`} position={[gx, gy, gz]}>
          <planeGeometry args={[0.04, 0.04]} />
          <meshBasicMaterial color="#ffcc55" transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  )
}

// ── Orc City: war camp with huts, totems, palisade ──────────────────────────
function OrcCity({ color }: { color: string }) {
  return (
    <group>
      {/* Main war hall */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <boxGeometry args={[0.35, 0.4, 0.35]} />
        <meshStandardMaterial color="#6b4a2a" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.45, 0]} castShadow>
        <coneGeometry args={[0.28, 0.2, 4]} />
        <meshStandardMaterial color="#5a3a1a" roughness={0.9} />
      </mesh>

      {/* Secondary huts */}
      {[[-0.25, 0.1, 0.2], [0.28, 0.08, -0.15]].map(([hx, hh, hz], i) => (
        <group key={\`hut\${i}\`} position={[hx, 0, hz]}>
          <mesh position={[0, hh / 2, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.1, hh, 5]} />
            <meshStandardMaterial color="#5c3a20" roughness={0.95} />
          </mesh>
          <mesh position={[0, hh + 0.04, 0]} castShadow>
            <coneGeometry args={[0.12, 0.1, 5]} />
            <meshStandardMaterial color="#443020" roughness={0.9} />
          </mesh>
        </group>
      ))}

      {/* Palisade wall */}
      {Array.from({ length: 16 }).map((_, i) => {
        const angle = (i / 16) * Math.PI * 2
        const radius = 0.42
        return (
          <mesh key={i} position={[Math.cos(angle) * radius, 0.15, Math.sin(angle) * radius]} castShadow>
            <cylinderGeometry args={[0.015, 0.02, 0.3 + Math.sin(i * 2.5) * 0.05, 4]} />
            <meshStandardMaterial color="#5c3d2e" roughness={0.95} />
          </mesh>
        )
      })}

      {/* Spikes on palisades */}
      {[0, 3, 7, 11, 14].map((i) => {
        const angle = (i / 16) * Math.PI * 2
        return (
          <mesh key={\`s\${i}\`} position={[Math.cos(angle) * 0.42, 0.35, Math.sin(angle) * 0.42]}>
            <coneGeometry args={[0.015, 0.06, 4]} />
            <meshStandardMaterial color="#3a2a1a" />
          </mesh>
        )
      })}

      {/* War totem */}
      <group position={[0.15, 0, 0.25]}>
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.02, 0.025, 0.3, 4]} />
          <meshStandardMaterial color="#4a3020" roughness={0.95} />
        </mesh>
        <mesh position={[0, 0.32, 0]}>
          <boxGeometry args={[0.06, 0.05, 0.04]} />
          <meshStandardMaterial color="#5a3828" />
        </mesh>
        {[[-0.015, 0], [0.015, 0]].map(([ex, ez], i) => (
          <mesh key={i} position={[ex, 0.33, 0.021 + ez]}>
            <sphereGeometry args={[0.006, 4, 4]} />
            <meshBasicMaterial color="#ff3300" />
          </mesh>
        ))}
      </group>

      {/* Skulls on sticks */}
      {[[0, 0.35, 0.18], [-0.18, 0.28, -0.16]].map(([sx, sy, sz], i) => (
        <group key={\`sk\${i}\`} position={[sx, 0, sz]}>
          <mesh position={[0, sy * 0.6, 0]}>
            <cylinderGeometry args={[0.005, 0.005, sy * 0.8, 3]} />
            <meshStandardMaterial color="#4a3a20" />
          </mesh>
          <mesh position={[0, sy, 0]}>
            <sphereGeometry args={[0.025, 5, 5]} />
            <meshStandardMaterial color="#d4c8a0" />
          </mesh>
        </group>
      ))}

      <Torch position={[0.15, 0.05, 0.34]} />
      <Torch position={[-0.2, 0.05, -0.3]} />
      <Banner position={[0.2, 0.35, 0]} color={color} />
      <SmokePlume position={[0.15, 0.35, 0.34]} color="#554433" />
      <SmokePlume position={[0, 0.5, 0]} color="#443322" />
    </group>
  )
}

// ── Elf City: crystal spires, arched bridges, glowing trees ─────────────────
function ElfCity({ color }: { color: string }) {
  return (
    <group>
      {/* Central spire */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.13, 0.8, 8]} />
        <meshStandardMaterial color="#e0ddd5" roughness={0.5} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.85, 0]} castShadow>
        <coneGeometry args={[0.13, 0.25, 8]} />
        <meshStandardMaterial color="#88bb88" roughness={0.6} />
      </mesh>

      {/* Side towers */}
      {[[-0.22, -0.15], [0.22, 0.15], [-0.12, 0.22]].map(([tx, tz], i) => (
        <group key={i} position={[tx, 0, tz]}>
          <mesh position={[0, 0.22, 0]} castShadow>
            <cylinderGeometry args={[0.055, 0.065, 0.44, 8]} />
            <meshStandardMaterial color="#d8d5cc" roughness={0.5} metalness={0.1} />
          </mesh>
          <mesh position={[0, 0.46, 0]} castShadow>
            <coneGeometry args={[0.075, 0.14, 8]} />
            <meshStandardMaterial color="#77aa77" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.33, 0]}>
            <torusGeometry args={[0.065, 0.006, 4, 8]} />
            <meshStandardMaterial color="#c0bbb0" />
          </mesh>
        </group>
      ))}

      {/* Arched bridge */}
      <mesh position={[0, 0.17, 0.1]} castShadow>
        <boxGeometry args={[0.35, 0.025, 0.06]} />
        <meshStandardMaterial color="#d0ccbb" roughness={0.5} />
      </mesh>

      {/* Glowing trees */}
      {[[-0.35, 0, 0], [0.35, 0, 0], [0.15, 0, -0.3]].map(([tx, , tz], i) => (
        <group key={\`t\${i}\`} position={[tx, 0, tz]}>
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.012, 0.018, 0.2, 4]} />
            <meshStandardMaterial color="#c0b090" />
          </mesh>
          <mesh position={[0, 0.24, 0]}>
            <sphereGeometry args={[0.07, 6, 6]} />
            <meshStandardMaterial color="#55bb55" emissive="#33aa33" emissiveIntensity={0.15} roughness={0.7} />
          </mesh>
        </group>
      ))}

      {/* Garden hedge */}
      <mesh position={[0, 0.04, -0.25]} castShadow>
        <boxGeometry args={[0.5, 0.06, 0.04]} />
        <meshStandardMaterial color="#3a7a3a" roughness={0.8} />
      </mesh>

      {/* Crystal top */}
      <mesh position={[0, 0.98, 0]}>
        <octahedronGeometry args={[0.04]} />
        <meshStandardMaterial color="#aaffaa" emissive="#55ff55" emissiveIntensity={0.6} transparent opacity={0.8} />
      </mesh>
      <pointLight position={[0, 0.98, 0]} color="#55ff55" intensity={0.3} distance={1.5} decay={2} />

      <Banner position={[0, 0.85, 0.05]} color={color} height={0.15} />
    </group>
  )
}

// ── Bane City: dark gothic fortress ─────────────────────────────────────────
function BaneCity({ color }: { color: string }) {
  return (
    <group>
      {/* Dark central tower */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <boxGeometry args={[0.3, 0.7, 0.3]} />
        <meshStandardMaterial color="#2a2030" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.75, 0]} castShadow>
        <coneGeometry args={[0.15, 0.35, 4]} />
        <meshStandardMaterial color="#1a1520" roughness={0.9} />
      </mesh>

      {/* Corner spires */}
      {[[-0.22, -0.22], [0.22, -0.22], [-0.22, 0.22], [0.22, 0.22]].map(([tx, tz], i) => (
        <group key={i} position={[tx, 0, tz]}>
          <mesh position={[0, 0.2, 0]} castShadow>
            <boxGeometry args={[0.12, 0.4, 0.12]} />
            <meshStandardMaterial color="#252030" roughness={0.95} />
          </mesh>
          <mesh position={[0, 0.45, 0]} castShadow>
            <coneGeometry args={[0.08, 0.18, 4]} />
            <meshStandardMaterial color="#1a1520" />
          </mesh>
        </group>
      ))}

      {/* Dark walls */}
      {[
        [0, 0.12, -0.22, 0.44, 0.24, 0.04],
        [0, 0.12, 0.22, 0.44, 0.24, 0.04],
        [-0.22, 0.12, 0, 0.04, 0.24, 0.44],
        [0.22, 0.12, 0, 0.04, 0.24, 0.44],
      ].map(([wx, wy, wz, ww, wh, wd], i) => (
        <mesh key={\`dw\${i}\`} position={[wx, wy, wz]} castShadow>
          <boxGeometry args={[ww, wh, wd]} />
          <meshStandardMaterial color="#201828" roughness={0.95} />
        </mesh>
      ))}

      {/* Crypt entrance */}
      <group position={[0, 0.04, 0.24]}>
        <mesh>
          <boxGeometry args={[0.1, 0.12, 0.02]} />
          <meshStandardMaterial color="#0a0810" />
        </mesh>
        <mesh position={[0, 0.07, 0]}>
          <boxGeometry args={[0.12, 0.02, 0.025]} />
          <meshStandardMaterial color="#2a1830" />
        </mesh>
      </group>

      {/* Purple glowing windows */}
      {[[-0.08, 0.4, 0.151], [0.08, 0.4, 0.151], [0, 0.55, 0.151], [-0.06, 0.3, 0.151], [0.06, 0.3, 0.151]].map(([gx, gy, gz], i) => (
        <mesh key={\`gw\${i}\`} position={[gx, gy, gz]}>
          <planeGeometry args={[0.035, 0.055]} />
          <meshBasicMaterial color="#9933ff" transparent opacity={0.7} />
        </mesh>
      ))}

      {/* Purple energy orb */}
      <mesh position={[0, 0.95, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#9933ff" emissive="#7722cc" emissiveIntensity={0.8} transparent opacity={0.8} />
      </mesh>
      <pointLight position={[0, 0.95, 0]} color="#9933ff" intensity={0.5} distance={2} decay={2} />

      {/* Energy conduits */}
      {[[-0.22, 0.45, -0.22], [0.22, 0.45, 0.22]].map(([cx, cy, cz], i) => (
        <mesh key={\`ec\${i}\`} position={[(cx) / 2, (cy + 0.95) / 2, (cz) / 2]}>
          <cylinderGeometry args={[0.004, 0.004, 0.6, 3]} />
          <meshBasicMaterial color="#7722cc" transparent opacity={0.4} />
        </mesh>
      ))}

      {/* Ground corruption */}
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.48, 8]} />
        <meshBasicMaterial color="#330044" transparent opacity={0.2} depthWrite={false} />
      </mesh>

      <Banner position={[0.22, 0.45, 0.22]} color={color} />
      <SmokePlume position={[0.1, 0.7, 0]} color="#332244" />
    </group>
  )
}

// ── Neutral city ────────────────────────────────────────────────────────────
function NeutralCity() {
  return (
    <group>
      <mesh position={[0, 0.2, 0]} castShadow>
        <boxGeometry args={[0.35, 0.4, 0.35]} />
        <meshStandardMaterial color="#777770" roughness={0.9} />
      </mesh>
      {[[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]].map(([tx, tz], i) => (
        <mesh key={i} position={[tx, 0.15, tz]} castShadow>
          <cylinderGeometry args={[0.04, 0.05, 0.3, 5]} />
          <meshStandardMaterial color="#666660" roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, 0.42, 0]} castShadow>
        <coneGeometry args={[0.2, 0.12, 4]} />
        <meshStandardMaterial color="#5a5a55" />
      </mesh>
      <mesh position={[0, 0.07, 0.18]}>
        <boxGeometry args={[0.08, 0.14, 0.02]} />
        <meshStandardMaterial color="#444" />
      </mesh>
    </group>
  )
}

// ── Faction router + selection ──────────────────────────────────────────────
const FACTION_CITIES: Record<Faction, React.FC<{ color: string }>> = {
  player: HumanCity, orcs: OrcCity, elves: ElfCity, bane: BaneCity,
}

export default function CityModel({ city, selected, onClick }: CityModelProps) {
  const color = city.owner ? FACTION_COLORS[city.owner] : NEUTRAL_COLOR
  const CityComponent = city.owner ? FACTION_CITIES[city.owner] : null

  const ringRef = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (ringRef.current && selected) {
      (ringRef.current.material as THREE.MeshBasicMaterial).opacity = 0.4 + Math.sin(clock.elapsedTime * 3) * 0.2
    }
  })

  return (
    <group position={[city.x, 0.075, city.y]} onClick={(e) => { e.stopPropagation(); onClick() }}>
      {CityComponent ? <CityComponent color={color} /> : <NeutralCity />}

      {selected && (
        <mesh ref={ringRef} position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.42, 0.48, 32]} />
          <meshBasicMaterial color="#ffd700" transparent opacity={0.5} depthWrite={false} />
        </mesh>
      )}

      {city.producing && (
        <group position={[0.3, 0.6, 0.3]}>
          <mesh>
            <torusGeometry args={[0.04, 0.012, 6, 8]} />
            <meshStandardMaterial color="#ffd700" emissive="#ffaa00" emissiveIntensity={0.3} />
          </mesh>
        </group>
      )}
    </group>
  )
}
`);

// ═══════════════════════════════════════════════════════════════════════════
// UnitModel.tsx
// ═══════════════════════════════════════════════════════════════════════════
write('scene/UnitModel.tsx', `import { useRef, useState } from 'react'
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
      <mesh position={[0, 0.12, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.09, 0.24, 6]} />
        <meshStandardMaterial color={color} transparent={exhausted} opacity={o} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.22, 0]} castShadow>
        <boxGeometry args={[0.2, 0.04, 0.1]} />
        <meshStandardMaterial color={color} transparent={exhausted} opacity={o} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.28, 0]} castShadow>
        <sphereGeometry args={[0.05, 6, 6]} />
        <meshStandardMaterial color="#ddc8a0" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.31, 0]}>
        <sphereGeometry args={[0.04, 6, 4, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#7a5533" roughness={0.85} />
      </mesh>
      <mesh position={[0.1, 0.2, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 0.4, 4]} />
        <meshStandardMaterial color="#8a7a5a" />
      </mesh>
      <mesh position={[0.1, 0.41, 0]}>
        <coneGeometry args={[0.018, 0.05, 4]} />
        <meshStandardMaterial color="#bbb" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[-0.1, 0.14, 0.03]} rotation={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.055, 0.055, 0.012, 8]} />
        <meshStandardMaterial color={color} transparent={exhausted} opacity={o} roughness={0.5} metalness={0.2} />
      </mesh>
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
      <mesh position={[0, 0.12, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.075, 0.24, 6]} />
        <meshStandardMaterial color={color} transparent={exhausted} opacity={o} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.28, 0]} castShadow>
        <sphereGeometry args={[0.045, 6, 6]} />
        <meshStandardMaterial color="#ddc8a0" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.3, -0.02]}>
        <coneGeometry args={[0.055, 0.06, 6]} />
        <meshStandardMaterial color={color} transparent={exhausted} opacity={o} />
      </mesh>
      <mesh position={[0, 0.14, -0.06]} rotation={[0.1, 0, 0]}>
        <boxGeometry args={[0.12, 0.18, 0.008]} />
        <meshStandardMaterial color={color} transparent opacity={o * 0.7} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-0.1, 0.18, 0]} rotation={[0, 0, 0.2]}>
        <torusGeometry args={[0.07, 0.006, 4, 8, Math.PI]} />
        <meshStandardMaterial color="#5c3d2e" roughness={0.9} />
      </mesh>
      <mesh position={[-0.1, 0.18, 0]} rotation={[0, 0, 0.2]}>
        <cylinderGeometry args={[0.001, 0.001, 0.14, 3]} />
        <meshStandardMaterial color="#aaa" />
      </mesh>
      <mesh position={[0.04, 0.2, -0.06]} rotation={[0.15, 0, -0.1]}>
        <cylinderGeometry args={[0.025, 0.02, 0.12, 5]} />
        <meshStandardMaterial color="#6a4a30" roughness={0.9} />
      </mesh>
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
      <mesh position={[0, 0.14, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.1, 0.28, 6]} />
        <meshStandardMaterial color={color} transparent={exhausted} opacity={o} roughness={0.4} metalness={0.3} />
      </mesh>
      {[[-0.1, 0.26, 0], [0.1, 0.26, 0]].map(([px, py, pz], i) => (
        <mesh key={i} position={[px, py, pz]}>
          <sphereGeometry args={[0.035, 5, 5, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#999" metalness={0.5} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[0, 0.32, 0]} castShadow>
        <sphereGeometry args={[0.055, 6, 6]} />
        <meshStandardMaterial color="#999" roughness={0.3} metalness={0.6} />
      </mesh>
      <mesh position={[0, 0.38, 0]}>
        <boxGeometry args={[0.005, 0.06, 0.06]} />
        <meshStandardMaterial color={color} transparent={exhausted} opacity={o} />
      </mesh>
      <mesh position={[0, 0.31, 0.054]}>
        <boxGeometry args={[0.04, 0.008, 0.002]} />
        <meshBasicMaterial color="#111" />
      </mesh>
      <group position={[-0.12, 0.15, 0.03]} rotation={[0, 0.3, 0]}>
        <mesh>
          <boxGeometry args={[0.006, 0.14, 0.08]} />
          <meshStandardMaterial color={color} transparent={exhausted} opacity={o} roughness={0.4} metalness={0.3} />
        </mesh>
        <mesh position={[-0.004, 0.01, 0]}>
          <boxGeometry args={[0.001, 0.04, 0.02]} />
          <meshStandardMaterial color="#ddd" metalness={0.4} />
        </mesh>
      </group>
      <group position={[0.11, 0.18, 0]}>
        <mesh><boxGeometry args={[0.012, 0.22, 0.015]} /><meshStandardMaterial color="#ccc" metalness={0.7} roughness={0.2} /></mesh>
        <mesh position={[0, -0.08, 0]}>
          <boxGeometry args={[0.04, 0.01, 0.01]} />
          <meshStandardMaterial color="#aa8833" metalness={0.5} />
        </mesh>
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
      <mesh position={[0, 0.16, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.12, 0.32, 8]} />
        <meshStandardMaterial color={color} transparent={exhausted} opacity={o} roughness={0.4} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.18, 0.07]}>
        <boxGeometry args={[0.1, 0.08, 0.01]} />
        <meshStandardMaterial color="#ddd" metalness={0.5} roughness={0.3} transparent={exhausted} opacity={o} />
      </mesh>
      <mesh position={[0, 0.15, -0.1]} rotation={[0.2, 0, 0]} castShadow>
        <boxGeometry args={[0.18, 0.28, 0.01]} />
        <meshStandardMaterial color={color} transparent opacity={o * 0.8} roughness={0.7} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.36, 0]} castShadow>
        <sphereGeometry args={[0.055, 8, 8]} />
        <meshStandardMaterial color="#ddc8a0" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.05, 0.04, 0.04, 6]} />
        <meshStandardMaterial color="#ffd700" emissive="#ffa500" emissiveIntensity={0.3} metalness={0.7} roughness={0.2} />
      </mesh>
      {[0, 1, 2, 3, 4, 5].map((j) => {
        const a = (j / 6) * Math.PI * 2
        return (
          <mesh key={j} position={[Math.cos(a) * 0.04, 0.45, Math.sin(a) * 0.04]}>
            <coneGeometry args={[0.006, 0.02, 3]} />
            <meshStandardMaterial color="#ffd700" emissive="#ffa500" emissiveIntensity={0.2} metalness={0.7} />
          </mesh>
        )
      })}
      <mesh position={[0.14, 0.22, 0]}>
        <cylinderGeometry args={[0.008, 0.012, 0.45, 4]} />
        <meshStandardMaterial color="#5c3d2e" />
      </mesh>
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

        {/* Strength pips */}
        {Array.from({ length: strengthPips }, (_, i) => (
          <mesh key={\`sp\${i}\`} position={[(i - (strengthPips - 1) / 2) * 0.03, 0.5, 0]}>
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
`);

// ═══════════════════════════════════════════════════════════════════════════
// CameraController.tsx
// ═══════════════════════════════════════════════════════════════════════════
write('scene/CameraController.tsx', `import { OrbitControls } from '@react-three/drei'

const PLAYER_START_X = 5
const PLAYER_START_Y = 34

export default function CameraController() {
  return (
    <OrbitControls
      target={[PLAYER_START_X, 0, PLAYER_START_Y]}
      minPolarAngle={0.5}
      maxPolarAngle={1.1}
      minDistance={8}
      maxDistance={55}
      enableDamping
      dampingFactor={0.08}
      enablePan
      panSpeed={1.4}
      screenSpacePanning={false}
      zoomSpeed={0.8}
      rotateSpeed={0.4}
      minAzimuthAngle={-Math.PI / 4}
      maxAzimuthAngle={Math.PI / 4}
    />
  )
}
`);

// ═══════════════════════════════════════════════════════════════════════════
// ObjectiveMarkers.tsx
// ═══════════════════════════════════════════════════════════════════════════
write('scene/ObjectiveMarkers.tsx', `import { useRef } from 'react'
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
`);

// ═══════════════════════════════════════════════════════════════════════════
// StrategicOverlays.tsx
// ═══════════════════════════════════════════════════════════════════════════
write('scene/StrategicOverlays.tsx', `import { useMemo } from 'react'
import { useGameStore } from '../game/store'
import { getMovementRange } from '../game/gamelogic'
import type { Position } from '../game/types'
import { CITY_BONUSES } from '../game/types'

function TileOverlay({ x, y, color, opacity }: { x: number; y: number; color: string; opacity: number }) {
  return (
    <mesh position={[x, 0.06, y]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[0.95, 0.95]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} />
    </mesh>
  )
}

function MovementOverlay() {
  const movementRange = useGameStore((s) => s.movementRange)
  if (movementRange.length === 0) return null
  return (
    <>
      {movementRange.map((p) => (
        <TileOverlay key={\`m\${p.x},\${p.y}\`} x={p.x} y={p.y} color="#3388ff" opacity={0.18} />
      ))}
    </>
  )
}

function ThreatOverlay() {
  const units = useGameStore((s) => s.units)
  const tiles = useGameStore((s) => s.tiles)
  const ruins = useGameStore((s) => s.ruins)
  const roadSet = useGameStore((s) => s.roadSet)
  const selectedUnitId = useGameStore((s) => s.selectedUnitId)

  const threatSet = useMemo(() => {
    if (!selectedUnitId) return new Set<string>()
    const enemies = units.filter((u) => u.faction !== 'player' && u.movesLeft > 0)
    const set = new Set<string>()
    const selected = units.find((u) => u.id === selectedUnitId)
    for (const enemy of enemies) {
      if (selected && (Math.abs(enemy.x - selected.x) + Math.abs(enemy.y - selected.y)) > 12) continue
      const range = getMovementRange(enemy, tiles, units, ruins, roadSet)
      for (const p of range) set.add(\`\${p.x},\${p.y}\`)
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
        <TileOverlay key={\`t\${p.x},\${p.y}\`} x={p.x} y={p.y} color="#ff3333" opacity={0.12} />
      ))}
    </>
  )
}

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
          <mesh key={\`cc\${c.id}\`} position={[c.x, 0.03, c.y]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.4, 0.52, 24]} />
            <meshBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} />
          </mesh>
        )
      })}
    </>
  )
}

function RuinOverlay() {
  const ruins = useGameStore((s) => s.ruins)
  const unexplored = ruins.filter((r) => !r.explored)

  return (
    <>
      {unexplored.map((r) => (
        <mesh key={\`ro\${r.id}\`} position={[r.x, 0.03, r.y]} rotation={[-Math.PI / 2, 0, 0]}>
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
`);

// ═══════════════════════════════════════════════════════════════════════════
// GameScene.tsx
// ═══════════════════════════════════════════════════════════════════════════
write('scene/GameScene.tsx', `import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../game/store'
import { MAP_WIDTH, MAP_HEIGHT } from '../game/types'
import TerrainTile from './TerrainTile'
import CityModel from './CityModel'
import UnitModel from './UnitModel'
import CameraController from './CameraController'
import ObjectiveMarkers from './ObjectiveMarkers'
import StrategicOverlays from './StrategicOverlays'

// ── Animated magical ruin ───────────────────────────────────────────────────
function RuinModel({ x, y, explored }: { x: number; y: number; explored: boolean }) {
  const orbRef = useRef<THREE.Mesh>(null)
  const lightRef = useRef<THREE.PointLight>(null)

  useFrame(({ clock }) => {
    if (orbRef.current && !explored) {
      orbRef.current.position.y = 0.55 + Math.sin(clock.elapsedTime * 1.5) * 0.04
      orbRef.current.rotation.y = clock.elapsedTime * 0.8
    }
    if (lightRef.current && !explored) {
      lightRef.current.intensity = 0.4 + Math.sin(clock.elapsedTime * 2) * 0.2
    }
  })

  const stoneColor = explored ? '#555550' : '#8a7744'
  const darkStone = explored ? '#4a4a45' : '#7a6a44'

  return (
    <group position={[x, 0.075, y]}>
      {/* Broken stone pillars */}
      <mesh position={[-0.12, 0.15, -0.08]} castShadow>
        <cylinderGeometry args={[0.04, 0.05, 0.3, 5]} />
        <meshStandardMaterial color={stoneColor} roughness={0.9} />
      </mesh>
      <mesh position={[0.1, 0.1, 0.1]} castShadow>
        <cylinderGeometry args={[0.035, 0.045, 0.2, 5]} />
        <meshStandardMaterial color={stoneColor} roughness={0.9} />
      </mesh>
      <mesh position={[0.15, 0.06, -0.1]} castShadow>
        <cylinderGeometry args={[0.03, 0.04, 0.12, 5]} />
        <meshStandardMaterial color={stoneColor} roughness={0.9} />
      </mesh>
      {/* Broken arch */}
      <mesh position={[0, 0.22, 0]} castShadow>
        <boxGeometry args={[0.28, 0.04, 0.05]} />
        <meshStandardMaterial color={darkStone} roughness={0.9} />
      </mesh>
      {/* Fallen pillar */}
      <mesh position={[-0.05, 0.04, 0.12]} rotation={[0, 0.5, Math.PI / 2]}>
        <cylinderGeometry args={[0.025, 0.03, 0.12, 5]} />
        <meshStandardMaterial color={darkStone} roughness={0.9} />
      </mesh>
      {/* Rubble */}
      {[[0.05, 0.04, -0.12, 0.03], [-0.08, 0.03, 0.08, 0.025], [0.12, 0.025, 0.05, 0.02], [-0.15, 0.02, -0.05, 0.018]].map(([rx, ry, rz, rs], i) => (
        <mesh key={i} position={[rx, ry, rz]}>
          <dodecahedronGeometry args={[rs, 0]} />
          <meshStandardMaterial color="#6a5a4a" roughness={0.95} />
        </mesh>
      ))}
      {/* Overgrown moss */}
      {!explored && (
        <>
          <mesh position={[-0.08, 0.01, -0.04]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.06, 5]} />
            <meshStandardMaterial color="#4a6a30" transparent opacity={0.6} />
          </mesh>
          <mesh position={[0.06, 0.01, 0.06]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.04, 5]} />
            <meshStandardMaterial color="#3a5a25" transparent opacity={0.5} />
          </mesh>
        </>
      )}

      {/* Magical glow for unexplored */}
      {!explored && (
        <>
          <mesh ref={orbRef} position={[0, 0.55, 0]}>
            <octahedronGeometry args={[0.05]} />
            <meshStandardMaterial color="#ffdd44" emissive="#ffaa22" emissiveIntensity={0.8} transparent opacity={0.8} />
          </mesh>
          <pointLight ref={lightRef} position={[0, 0.5, 0]} color="#ffaa22" intensity={0.5} distance={2} decay={2} />
          <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.12, 0.22, 16]} />
            <meshBasicMaterial color="#ffaa22" transparent opacity={0.12} depthWrite={false} />
          </mesh>
          <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.12, 12]} />
            <meshBasicMaterial color="#ffdd44" transparent opacity={0.06} depthWrite={false} />
          </mesh>
        </>
      )}
    </group>
  )
}

// ── Scene content ───────────────────────────────────────────────────────────
function SceneContent() {
  const tiles = useGameStore((s) => s.tiles)
  const units = useGameStore((s) => s.units)
  const cities = useGameStore((s) => s.cities)
  const ruins = useGameStore((s) => s.ruins)
  const selectedUnitId = useGameStore((s) => s.selectedUnitId)
  const movementRange = useGameStore((s) => s.movementRange)
  const currentFaction = useGameStore((s) => s.currentFaction)
  const hoveredTile = useGameStore((s) => s.hoveredTile)
  const clickTile = useGameStore((s) => s.clickTile)
  const selectUnit = useGameStore((s) => s.selectUnit)
  const setHoveredTile = useGameStore((s) => s.setHoveredTile)

  const highlightSet = new Set(movementRange.map((p) => \`\${p.x},\${p.y}\`))

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.3} color="#c8b8a0" />
      <directionalLight
        position={[25, 32, 22]} intensity={1.0} color="#ffe0b0"
        castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048}
        shadow-camera-near={0.5} shadow-camera-far={90}
        shadow-camera-left={-35} shadow-camera-right={35}
        shadow-camera-top={35} shadow-camera-bottom={-35}
        shadow-bias={-0.001}
      />
      <directionalLight position={[-15, 20, -15]} intensity={0.15} color="#ffccaa" />
      <directionalLight position={[-8, 22, -10]} intensity={0.2} color="#7080b0" />
      <hemisphereLight args={['#c0b0a0', '#2a3a1a', 0.3]} />

      {/* Atmosphere */}
      <fog attach="fog" args={['#2a2535', 20, 65]} />
      <color attach="background" args={['#1a1525']} />

      {/* Ground plane */}
      <mesh position={[MAP_WIDTH / 2 - 0.5, -0.02, MAP_HEIGHT / 2 - 0.5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[MAP_WIDTH + 8, MAP_HEIGHT + 8]} />
        <meshStandardMaterial color="#151510" roughness={1} />
      </mesh>

      {/* Terrain */}
      {tiles.map((row, y) =>
        row.map((tile, x) => (
          <TerrainTile
            key={\`\${x}-\${y}\`}
            terrain={tile.terrain} x={x} y={y}
            highlighted={highlightSet.has(\`\${x},\${y}\`)}
            hovered={hoveredTile?.x === x && hoveredTile?.y === y}
            onClick={() => clickTile(x, y)}
            onPointerEnter={() => setHoveredTile({ x, y })}
            onPointerLeave={() => setHoveredTile(null)}
          />
        ))
      )}

      {/* Ruins */}
      {ruins.map((ruin) => (
        <RuinModel key={ruin.id} x={ruin.x} y={ruin.y} explored={ruin.explored} />
      ))}

      {/* Cities */}
      {cities.map((city) => (
        <CityModel key={city.id} city={city} selected={false} onClick={() => clickTile(city.x, city.y)} />
      ))}

      {/* Units */}
      {units.map((unit) => (
        <UnitModel
          key={unit.id} unit={unit}
          selected={unit.id === selectedUnitId}
          onClick={() => {
            if (unit.faction === currentFaction) selectUnit(unit.id)
            else clickTile(unit.x, unit.y)
          }}
        />
      ))}

      <StrategicOverlays />
      <ObjectiveMarkers />
      <CameraController />
    </>
  )
}

export default function GameScene() {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas
        shadows
        camera={{ position: [8, 18, 44], fov: 40, near: 0.1, far: 150 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
          powerPreference: 'high-performance',
        }}
      >
        <SceneContent />
      </Canvas>
    </div>
  )
}
`);

console.log('\\n=== Batch 2 complete: all scene files ===');
