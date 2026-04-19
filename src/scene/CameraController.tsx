import { OrbitControls } from '@react-three/drei'

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
