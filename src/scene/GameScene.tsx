import { useRef } from 'react'
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

  const highlightSet = new Set(movementRange.map((p) => `${p.x},${p.y}`))

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
            key={`${x}-${y}`}
            terrain={tile.terrain} x={x} y={y}
            highlighted={highlightSet.has(`${x},${y}`)}
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
