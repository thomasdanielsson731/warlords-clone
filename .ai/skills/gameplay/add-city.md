# Skill: Add City

Add a new city to the map or modify city mechanics.

---

## Description

Cities are the economic and strategic foundation of Warlords 2026. This skill covers adding new cities to the map, modifying city ownership, and adjusting city properties like defense and available production.

---

## Requirements

- Every city must have: id, name, x, y, owner (faction or null), defense, producing, turnsLeft.
- City position must be on a land tile (not water).
- Adjacent tiles should be walkable (clear water around the city position).
- Neutral cities have `owner: null`.
- Cities must render with faction-appropriate architecture (or neutral grey).

---

## Rules

- Define cities in `createInitialCities()` in `src/game/gamelogic.ts`.
- Clear the city tile and adjacent tiles to grass in `generateMap()` clearPositions array.
- City defense values: 1 (minor), 2 (standard), 3 (capital/fortress).
- Capturing a city sets owner to the capturing faction and resets production.
- In original Warlords II, capture offers: Occupy / Pillage / Sack / Raze. Current implementation auto-occupies.
- Cities continuously produce the selected unit (see `add-production.md` for details).
- Never place two cities on the same tile or on adjacent tiles.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/game/types.ts` | Only if adding new city properties |
| `src/game/gamelogic.ts` | Add city to `createInitialCities()`, add position to `generateMap()` clearPositions |
| `src/game/store.ts` | No changes unless modifying capture or production logic |
| `src/scene/CityModel.tsx` | Only if adding a new faction or city variant |
| `src/components/GameBoard.tsx` | No changes unless adding new city UI |

---

## Manual Test Steps

1. Start the game. Verify the new city renders at the correct position.
2. Verify the city tile is grass (not water/mountain).
3. Click the city. Verify the sidebar shows name, owner, defense.
4. If neutral, verify it shows "Neutral" and grey color.
5. Move a unit onto the city. Verify capture changes ownership.
6. After capture, verify production options appear in sidebar.
7. Verify the city model changes to the capturing faction's architecture.
8. Run `npx tsc -b --noEmit` — zero errors.
9. Run `npx vite build` — build succeeds.
