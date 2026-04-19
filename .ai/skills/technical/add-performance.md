# Skill: Add Performance Optimization

Optimize rendering and game logic performance.

---

## Description

Ensure the game runs at 60fps even on modest hardware by optimizing Three.js rendering, reducing unnecessary React re-renders, and using efficient data structures.

---

## Requirements

- Three.js: use instanced meshes for terrain tiles.
- React: memoize components that don't need to re-render every frame.
- Zustand: use selectors to avoid unnecessary re-renders.
- Limit draw calls by batching similar geometry.
- Profile and fix any frame drops during camera movement or turn transitions.

---

## Rules

- Use `React.memo()` on scene components that receive stable props.
- Use Zustand shallow selectors: `useGameStore(state => state.map, shallow)`.
- Use `THREE.InstancedMesh` for terrain tiles (all grass tiles = one draw call).
- Avoid creating new objects in render loops — reuse vectors, quaternions.
- Do NOT prematurely optimize — profile first with React DevTools and Three.js stats.
- Add `<Stats />` from drei for development FPS monitoring.

---

## Optimization Checklist

| Area | Technique |
|------|-----------|
| Terrain rendering | InstancedMesh for tiles of same type |
| Unit rendering | InstancedMesh or merged geometry |
| React re-renders | `React.memo`, Zustand selectors |
| Camera movement | Throttle store updates during pan/zoom |
| Turn transition | Batch state updates in a single Zustand action |
| Memory | Dispose old geometries/materials on unmount |

---

## Files to Modify

| File | Change |
|------|--------|
| `src/scene/TerrainTile.tsx` | InstancedMesh terrain rendering |
| `src/scene/GameScene.tsx` | Memoization, draw call reduction |
| `src/game/store.ts` | Shallow selectors |
| `src/components/GameBoard.tsx` | Memoize sidebar sections |

---

## Manual Test Steps

1. Add `<Stats />` from drei. Verify 60fps during normal play.
2. Pan camera rapidly. Verify no frame drops.
3. End turn with many units. Verify no visible lag.
4. Open React DevTools Profiler. Verify no unnecessary re-renders.
5. Check draw call count in Three.js — should be under 100 for 20x20 map.
6. Run `npx vite build` — verify bundle size hasn't increased significantly.
