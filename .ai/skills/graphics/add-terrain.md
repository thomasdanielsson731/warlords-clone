# Skill: Add Terrain

Add or modify terrain tile rendering.

---

## Description

Terrain tiles are the 3D ground layer of the map. Each tile type has a distinct appearance with procedural detail: grass has tufts and rocks, forests have layered trees, mountains have rocky peaks with snow caps, and water has animated surfaces.

---

## Requirements

- Four terrain types: grass, forest, mountain, water.
- Each tile is 0.98 × 0.98 units (small gap between tiles).
- Tile height varies: grass 0.075, mountain 0.15, water 0.03.
- Procedural detail placement using seeded random (deterministic).
- Movement range highlight: pulsing green glow.
- Hover highlight: golden border.

---

## Rules

- All terrain rendering in `src/scene/TerrainTile.tsx`.
- Use `seededRandom(x * N + y * M)` for deterministic detail placement.
- Each terrain type has a dedicated detail component: `GrassDetail`, `ForestDetail`, `MountainDetail`, `WaterTile`.
- Forest tiles include grass detail underneath trees.
- Water tiles have animated surface (useFrame).
- Detail meshes should cast shadows (trees, peaks) or receive shadows (ground).
- Color palettes are defined as constants at the top of the file.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/scene/TerrainTile.tsx` | All terrain rendering changes |
| `src/game/types.ts` | Only if adding new terrain types |
| `src/game/types.ts` | Update `TERRAIN_MOVE_COST` for new terrain |
| `src/game/gamelogic.ts` | Update `generateMap()` zone functions |

---

## Adding a New Terrain Type

1. Add to `TerrainType` union in `types.ts`.
2. Add movement cost to `TERRAIN_MOVE_COST` in `types.ts`.
3. Create a `NewTerrainDetail` component in `TerrainTile.tsx`.
4. Add rendering branch in the `TerrainTile` component.
5. Add to zone functions in `generateMap()`.
6. Choose appropriate tile height.

---

## Manual Test Steps

1. Verify grass tiles have color variation and occasional tufts/rocks.
2. Verify forest tiles have 2–4 layered trees with trunks and canopies.
3. Verify mountain tiles have rocky peaks, some with snow caps, plus boulders.
4. Verify water tiles animate (surface bobbing, opacity pulsing).
5. Verify movement highlights pulse green over terrain.
6. Verify hover highlights show golden border.
7. Verify colors feel painterly, not flat.
8. Run `npx vite build` — build succeeds.
