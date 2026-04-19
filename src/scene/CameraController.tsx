import { OrbitControls } from '@react-three/drei'
import { MAP_WIDTH, MAP_HEIGHT } from '../game/types'

export default function CameraController() {
  const centerX = MAP_WIDTH / 2
  const centerZ = MAP_HEIGHT / 2

  return (
    <OrbitControls
      target={[centerX, 0, centerZ]}
      // Lock to isometric-style angle range (~30-55°)
      minPolarAngle={0.5}
      maxPolarAngle={1.1}
      // Zoom range
      minDistance={6}
      maxDistance={28}
      // Smooth damping
      enableDamping
      dampingFactor={0.08}
      // Pan settings
      enablePan
      panSpeed={1.2}
      screenSpacePanning={false}
      // Zoom
      zoomSpeed={0.6}
      // Rotation
      rotateSpeed={0.4}
      // Limit azimuth rotation to keep map readable
      minAzimuthAngle={-Math.PI / 4}
      maxAzimuthAngle={Math.PI / 4}
    />
  )
}
