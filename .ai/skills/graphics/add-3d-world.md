# Skill: Add 3D World

Set up or modify the React Three Fiber 3D scene.

---

## Description

Warlords 2026 renders its game world in 3D using React Three Fiber (R3F) and drei. The scene uses a semi-isometric camera angle, atmospheric lighting, and fog to create a dark fantasy aesthetic inspired by Songs of Conquest.

---

## Requirements

- React Three Fiber Canvas with shadows enabled.
- ACES Filmic tone mapping for cinematic look.
- Camera: angled top-down, FOV 40, orbit controls with constraints.
- Scene must render: terrain tiles, cities, units, ruins.
- Must read all game state from Zustand store — no game logic in scene files.
- Performance: 60fps target on modern hardware with 20x20 map.

---

## Rules

- All 3D rendering lives in `src/scene/` directory.
- Scene components read state from `useGameStore()` — never write to it directly.
- Click handlers call store actions (`clickTile`, `selectUnit`).
- Hover state uses `setHoveredTile()` from store.
- Never import Three.js or R3F in `src/game/` files.
- Keep each scene component under 300 lines.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/scene/GameScene.tsx` | Main scene: Canvas, lighting, fog, renders all entities |
| `src/scene/TerrainTile.tsx` | Individual terrain tile with detail meshes |
| `src/scene/CityModel.tsx` | City architecture per faction |
| `src/scene/UnitModel.tsx` | Unit 3D models per type |
| `src/scene/CameraController.tsx` | OrbitControls with constraints |

---

## Scene Architecture

```
GameScene
├── Canvas (shadows, tone mapping)
│   └── SceneContent
│       ├── Lights (ambient, directional, hemisphere)
│       ├── Fog + Background
│       ├── Ground plane
│       ├── TerrainTile × 400 (20×20 grid)
│       ├── RuinModel × N
│       ├── CityModel × N
│       ├── UnitModel × N
│       └── CameraController
```

---

## Manual Test Steps

1. Start the game. Verify the 3D scene renders.
2. Verify camera is at a semi-isometric angle.
3. Verify orbit controls work: rotate, zoom, pan.
4. Verify all terrain tiles render with correct colors and detail.
5. Verify cities, units, and ruins render at correct positions.
6. Verify clicking tiles triggers game actions.
7. Verify hover highlights appear.
8. Verify shadows are cast by units and cities.
9. Check performance: should be smooth 60fps.
10. Run `npx vite build` — build succeeds.
