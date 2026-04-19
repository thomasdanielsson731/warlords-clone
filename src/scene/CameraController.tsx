import { OrbitControls } from '@react-three/drei'

// Player starts in SW corner — camera starts focused there
const PLAYER_START_X = 5
const PLAYER_START_Y = 34

export default function CameraController() {
  return (
    <OrbitControls
      target={[PLAYER_START_X, 0, PLAYER_START_Y]}
      // Lock to isometric-style angle range (~30-55°)
      minPolarAngle={0.5}
      maxPolarAngle={1.1}
      // Zoom range — wider for 40x40 map
      minDistance={8}
      maxDistance={55}
      // Smooth damping
      enableDamping
      dampingFactor={0.08}
      // Pan settings — drag to pan
      enablePan
      panSpeed={1.4}
      screenSpacePanning={false}
      // Smooth mouse-wheel zoom
      zoomSpeed={0.8}
      // Rotation
      rotateSpeed={0.4}
      // Limit azimuth rotation to keep map readable
      minAzimuthAngle={-Math.PI / 4}
      maxAzimuthAngle={Math.PI / 4}
    />
  )
}
