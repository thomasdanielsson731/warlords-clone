# Skill: Add Animation

Add or modify animations for units, cities, and effects.

---

## Description

Animations bring the world to life. Units bob idly, selection rings pulse, banners wave, torches flicker, and water surfaces ripple. All animations use `useFrame` from React Three Fiber.

---

## Requirements

- Idle bobbing on all units (subtle sine wave on Y position).
- Enhanced bobbing and ring pulse on selected units.
- Banner waving on cities (rotation oscillation).
- Torch flickering (point light intensity oscillation).
- Smoke plume drift (Y position + opacity oscillation).
- Water surface animation (Y position + opacity).
- Ruin orb floating and rotating when unexplored.
- Movement highlight pulsing (opacity sine wave).

---

## Rules

- All animations use `useFrame(({ clock }) => ...)` — never `setTimeout` or `setInterval`.
- Use `useRef` for mesh/light references. Never re-create materials per frame.
- Animation speed should be subtle — avoid hyperactive movement.
- Frequency guidelines: idle bob 1.5 Hz, selection 3–4 Hz, banner 2 Hz, torch 8 Hz.
- Offset animations by position `(x * N + y * M)` to avoid synchronization.
- Performance: avoid allocating objects inside useFrame.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/scene/UnitModel.tsx` | Unit bobbing, selection ring pulse |
| `src/scene/CityModel.tsx` | Banner waving, torch flicker, smoke drift |
| `src/scene/TerrainTile.tsx` | Water animation, highlight pulse |
| `src/scene/GameScene.tsx` | Ruin orb floating/rotating |

---

## Future Animations

- **Unit movement lerp**: Smooth position interpolation when moving between tiles.
- **Combat shake**: Camera or unit shake during combat.
- **City capture flash**: Brief glow when a city changes ownership.
- **Hero level-up effect**: Particle burst on level up.
- **Death animation**: Unit fades out or falls over when destroyed.

---

## Manual Test Steps

1. Start game. Verify all units gently bob.
2. Select a unit. Verify enhanced bobbing and pulsing golden ring.
3. Verify city banners wave with slight rotation.
4. Verify torch lights flicker (brightness variation).
5. Verify smoke plumes drift upward with varying opacity.
6. Verify water tiles animate (surface bobbing).
7. Verify ruin orbs float and rotate when unexplored.
8. Verify movement highlights pulse green.
9. Run `npx vite build` — build succeeds.
