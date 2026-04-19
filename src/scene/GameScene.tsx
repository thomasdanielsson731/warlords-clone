import { useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../game/store'
import { MAP_WIDTH, MAP_HEIGHT } from '../game/types'
import TerrainTile from './TerrainTile'
import CityModel from './CityModel'
import UnitModel from './UnitModel'
import CameraController from './CameraController'

// --- Animated magical ruin ---
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

  return (
    <group position={[x, 0.075, y]}>
      {/* Broken stone pillars */}
      <mesh position={[-0.12, 0.15, -0.08]} castShadow>
        <cylinderGeometry args={[0.04, 0.05, 0.3, 5]} />
        <meshStandardMaterial color={explored ? '#555550' : '#8a7744'} roughness={0.9} />
      </mesh>
      <mesh position={[0.1, 0.1, 0.1]} castShadow>
        <cylinderGeometry args={[0.035, 0.045, 0.2, 5]} />
        <meshStandardMaterial color={explored ? '#555550' : '#8a7744'} roughness={0.9} />
      </mesh>
      {/* Broken arch */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <boxGeometry args={[0.25, 0.04, 0.05]} />
        <meshStandardMaterial color={explored ? '#4a4a45' : '#7a6a44'} roughness={0.9} />
      </mesh>
      {/* Rubble */}
      <mesh position={[0.05, 0.04, -0.12]}>
        <dodecahedronGeometry args={[0.03, 0]} />
        <meshStandardMaterial color="#6a5a4a" roughness={0.95} />
      </mesh>
      <mesh position={[-0.08, 0.03, 0.08]}>
        <dodecahedronGeometry args={[0.025, 0]} />
        <meshStandardMaterial color="#6a5a4a" roughness={0.95} />
      </mesh>

      {/* Magical glow for unexplored */}
      {!explored && (
        <>
          <mesh ref={orbRef} position={[0, 0.55, 0]}>
            <octahedronGeometry args={[0.05]} />
            <meshStandardMaterial
              color="#ffdd44"
              emissive="#ffaa22"
              emissiveIntensity={0.8}
              transparent
              opacity={0.8}
            />
          </mesh>
          <pointLight
            ref={lightRef}
            position={[0, 0.5, 0]}
            color="#ffaa22"
            intensity={0.5}
            distance={2}
            decay={2}
          />
          {/* Ground glow circle */}
          <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.12, 0.2, 16]} />
            <meshBasicMaterial color="#ffaa22" transparent opacity={0.15} depthWrite={false} />
          </mesh>
        </>
      )}
    </group>
  )
}

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
      {/* === Lighting === */}
      {/* Warm ambient for dark fantasy feel */}
      <ambientLight intensity={0.35} color="#c8b8a0" />

      {/* Main sun — warm golden directional */}
      <directionalLight
        position={[20, 28, 20]}
        intensity={0.9}
        color="#ffe8c0"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={80}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-bias={-0.001}
      />

      {/* Cool fill light from opposite side */}
      <directionalLight position={[-10, 16, -10]} intensity={0.2} color="#8090b0" />

      {/* Hemisphere light for ground bounce */}
      <hemisphereLight args={['#b0c0d0', '#3a4a2a', 0.25]} />

      {/* === Atmosphere === */}
      <fog attach="fog" args={['#2a2535', 25, 70]} />

      {/* Sky color */}
      <color attach="background" args={['#1a1525']} />

      {/* Ground plane */}
      <mesh
        position={[MAP_WIDTH / 2 - 0.5, -0.02, MAP_HEIGHT / 2 - 0.5]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[MAP_WIDTH + 6, MAP_HEIGHT + 6]} />
        <meshStandardMaterial color="#1a1a15" roughness={1} />
      </mesh>

      {/* === Terrain === */}
      {tiles.map((row, y) =>
        row.map((tile, x) => (
          <TerrainTile
            key={`${x}-${y}`}
            terrain={tile.terrain}
            x={x}
            y={y}
            highlighted={highlightSet.has(`${x},${y}`)}
            hovered={hoveredTile?.x === x && hoveredTile?.y === y}
            onClick={() => clickTile(x, y)}
            onPointerEnter={() => setHoveredTile({ x, y })}
            onPointerLeave={() => setHoveredTile(null)}
          />
        ))
      )}

      {/* === Ruins === */}
      {ruins.map((ruin) => (
        <RuinModel key={ruin.id} x={ruin.x} y={ruin.y} explored={ruin.explored} />
      ))}

      {/* === Cities === */}
      {cities.map((city) => (
        <CityModel
          key={city.id}
          city={city}
          selected={false}
          onClick={() => clickTile(city.x, city.y)}
        />
      ))}

      {/* === Units === */}
      {units.map((unit) => (
        <UnitModel
          key={unit.id}
          unit={unit}
          selected={unit.id === selectedUnitId}
          onClick={() => {
            if (unit.faction === currentFaction) {
              selectUnit(unit.id)
            } else {
              clickTile(unit.x, unit.y)
            }
          }}
        />
      ))}

      <CameraController />
    </>
  )
}

export default function GameScene() {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas
        shadows
        camera={{
          position: [8, 18, 44],
          fov: 40,
          near: 0.1,
          far: 150,
        }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
      >
        <SceneContent />
      </Canvas>
    </div>
  )
}
