# Skill: Add Camera

Add or modify camera controls.

---

## Description

The camera uses OrbitControls from drei with constrained rotation to maintain a readable semi-isometric view of the map. Smooth damping provides fluid movement.

---

## Requirements

- Target: center of map `[MAP_WIDTH/2, 0, MAP_HEIGHT/2]`.
- Polar angle: 0.5–1.1 radians (semi-isometric to overhead).
- Azimuth angle: ±π/4 (limited horizontal rotation to keep map readable).
- Zoom: 6–28 distance.
- Smooth damping factor: 0.08.
- Pan enabled with screen-space panning disabled (pans along ground plane).

---

## Rules

- Camera controller lives in `src/scene/CameraController.tsx`.
- Uses `<OrbitControls />` from `@react-three/drei`.
- Initial camera position is set on the Canvas `camera` prop in `GameScene.tsx`.
- Never allow the camera to go below the ground plane.
- Never allow infinite zoom out (maxDistance 28).
- Keep rotation limits tight enough that the map stays readable.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/scene/CameraController.tsx` | OrbitControls configuration |
| `src/scene/GameScene.tsx` | Canvas camera initial position and FOV |

---

## Future Improvements

- **Focus on selected unit**: Animate camera to center on the selected unit/city.
- **Combat zoom**: Zoom in during combat for dramatic effect.
- **Minimap click**: Click minimap to move camera to that position.
- **Edge scrolling**: Move camera when mouse nears screen edge.

---

## Manual Test Steps

1. Start game. Verify camera is at a readable angle.
2. Rotate camera. Verify it stays within ±45° horizontal.
3. Zoom in. Verify minimum distance is respected.
4. Zoom out. Verify maximum distance is respected.
5. Pan the camera. Verify smooth ground-plane panning.
6. Verify damping makes all camera movement feel smooth.
7. Run `npx vite build` — build succeeds.
