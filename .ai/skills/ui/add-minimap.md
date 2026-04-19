# Skill: Add Minimap

Add a minimap overlay to the game view.

---

## Description

A small minimap in the corner of the screen showing the full map with colored dots for factions, cities, and the camera viewport rectangle. Helps the player navigate larger maps and track faction territory.

---

## Requirements

- Show the full 20x20 map as a small (150-200px) canvas or div grid.
- Terrain shown as colored pixels (green=grass, dark green=forest, gray=mountain, blue=water).
- Cities shown as colored dots matching owner faction.
- Unit stacks shown as small colored dots.
- Current camera viewport shown as a white rectangle outline.
- Click on minimap to move camera to that location.
- Position: bottom-right corner of the screen, semi-transparent.

---

## Rules

- Minimap is a new component: `src/components/Minimap.tsx`.
- Render as a 2D canvas for performance (not HTML divs for each tile).
- Read map data from `useGameStore()`.
- Clicking the minimap dispatches a camera move action.
- Update on every turn or unit move.
- Minimap should not interfere with 3D scene pointer events.
- Keep minimap simple — no zoom or resize.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/Minimap.tsx` | New file: minimap component |
| `src/components/GameBoard.tsx` | Include Minimap component |
| `src/styles/GameBoard.css` | Minimap positioning |

---

## Future Enhancements

- **Fog of war overlay**: Gray out unexplored areas.
- **Animated units**: Pulse or blink for moving units.
- **Territory shading**: Color regions by controlling faction.
- **Toggle visibility**: Hotkey to show/hide minimap.

---

## Manual Test Steps

1. Start the game. Verify minimap appears in bottom-right corner.
2. Verify terrain colors match the map (grass green, water blue, etc.).
3. Verify faction cities appear as colored dots.
4. Move a unit. Verify minimap updates.
5. Click on the minimap. Verify camera moves to that location.
6. Verify minimap doesn't block clicking on the 3D scene.
7. Run `npx vite build` — build succeeds.
