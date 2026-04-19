# Skill: Add Pathfinding

Implement A* pathfinding for unit movement.

---

## Description

Replace simple distance-based movement with proper A* pathfinding that respects terrain movement costs, impassable tiles, and unit stacking rules. Show the movement path visually.

---

## Requirements

- A* pathfinding algorithm considering terrain movement costs.
- Impassable tiles: water, mountains (for non-flying units).
- Movement costs from TERRAIN_COSTS in types.ts (grass=1, forest=2, hill=2, etc.).
- Path visualization: highlight reachable tiles when a unit is selected.
- Show the planned path when hovering a reachable tile.
- Cannot move through enemy units (but can attack adjacent).

---

## Rules

- Pathfinding logic in `src/game/pathfinding.ts` (new file).
- Export `findPath(from, to, map, units): Position[]` returning the tile sequence.
- Export `getReachableTiles(from, movesLeft, map, units): Position[]` for highlighting.
- Use Manhattan distance as heuristic (grid-based map).
- Integrate into `moveUnit` store action — validate move path exists and costs <= remaining moves.
- Path highlighting rendered in the 3D scene as glowing tiles.
- Do NOT use a third-party pathfinding library — the grid is small enough for simple A*.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/game/pathfinding.ts` | New file: A* implementation |
| `src/game/store.ts` | Use pathfinding in moveUnit validation |
| `src/scene/GameScene.tsx` | Render path/reachable tile highlights |

---

## Manual Test Steps

1. Select a unit. Verify reachable tiles are highlighted.
2. Hover a reachable tile. Verify path is shown.
3. Click a reachable tile. Verify unit moves along the path.
4. Verify unit cannot move through water or mountains.
5. Verify forest costs 2 moves.
6. Verify unit cannot move further than remaining moves allow.
7. Verify pathfinding works correctly around obstacles.
8. Run `npx vite build` — build succeeds.
