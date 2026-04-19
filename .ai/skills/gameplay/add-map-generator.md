# Skill: Add Map Generator

Add or modify the procedural map generator.

---

## Description

The map generator creates the tile grid for Warlords 2026. It uses a seeded random function for deterministic generation and a hand-crafted land mask to create a continental shape inspired by Warlords II.

---

## Requirements

- Map size: 20x20 tiles (defined by `MAP_WIDTH` and `MAP_HEIGHT`).
- Continental land mask: ocean borders, landmasses with irregular coastlines.
- Terrain types: grass, forest, mountain, water.
- Zone-based terrain: mountain ridges, forest clusters, open grassland.
- All city, ruin, and starting positions must be on walkable grass.
- Seeded random for reproducibility (current seed: 42).

---

## Rules

- Map generation lives in `generateMap()` in `src/game/gamelogic.ts`.
- The `LAND` array defines the continent shape (1 = land, 0 = water).
- Zone functions (`isMountainZone`, `isForestZone`) control terrain distribution.
- The `clearPositions` array ensures all cities, ruins, and starting areas are grass.
- Never place cities, units, or ruins on water tiles.
- When adding new positions, always add them to `clearPositions`.
- Map must have natural chokepoints (narrow passages between continents) for strategic gameplay.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/game/types.ts` | Only if adding new terrain types or map constants |
| `src/game/gamelogic.ts` | Modify `generateMap()`, zone functions, LAND mask |
| `src/game/gamelogic.ts` | Update `createInitialCities()` / `createInitialRuins()` / `createInitialUnits()` positions |

---

## Map Design Guidelines

- **Ocean border**: Row 0, row 19, column 0, column 19 should be water.
- **Chokepoints**: Narrow land bridges between continents create strategic value.
- **Mountain ridges**: Block direct paths, force armies around.
- **Forest zones**: Thematic (elves) and strategic (movement cost).
- **Open grassland**: Near cities for troop movement.
- **Water channels**: Separate landmasses for continental warfare feel.

---

## Adding New Terrain Types (Future)

1. Add to `TerrainType` union in `types.ts`.
2. Add movement cost to `TERRAIN_MOVE_COST`.
3. Add rendering in `TerrainTile.tsx`.
4. Update zone functions in `generateMap()`.
5. Candidates: swamp, road, bridge, desert, hills.

---

## Manual Test Steps

1. Start the game. Verify the map renders with a continental shape.
2. Verify ocean surrounds the landmasses.
3. Verify mountains cluster in designated zones.
4. Verify forests cluster in designated zones.
5. Verify all cities are on grass tiles.
6. Verify all ruins are on walkable tiles.
7. Verify all starting units are on walkable tiles.
8. Verify chokepoints exist between continents.
9. Run `npx tsc -b --noEmit` — zero errors.
10. Run `npx vite build` — build succeeds.
