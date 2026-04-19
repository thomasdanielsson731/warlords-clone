# Skill: Add Unit

Add a new unit type to Warlords 2026.

---

## Description

Introduces a new unit type into the game. This includes defining its stats, making it producible in cities, rendering it in 3D, and integrating it into combat, movement, and production systems.

---

## Requirements

- New unit type must have: name, strength, movesPerTurn, productionTurns.
- Must be producible in at least one city.
- Must render as a distinct 3D model in the scene.
- Must participate in combat using standard Warlords rules (STR + d6).
- Must respect terrain movement costs.
- Must appear in the sidebar when selected.

---

## Rules

- Define the unit type in `src/game/types.ts` in the `UnitType` union and `UNIT_TEMPLATES` record.
- Never put game logic in scene or component files.
- Keep the unit visually distinct from existing types — different silhouette, weapon, or accessory.
- Follow faction color conventions from `FACTION_COLORS`.
- If the unit has special abilities (e.g., flying, ranged), add them as optional fields in the `Unit` interface.
- Keep `UNIT_TEMPLATES` as the single source of truth for base stats.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/game/types.ts` | Add to `UnitType` union, add entry in `UNIT_TEMPLATES` |
| `src/game/gamelogic.ts` | Add to `createInitialUnits()` if starting unit; update `createUnit()` if special bonuses apply |
| `src/game/store.ts` | No changes unless unit has special movement or combat rules |
| `src/scene/UnitModel.tsx` | Add a new `XxxBody` component with unique geometry |
| `src/components/GameBoard.tsx` | Add to production buttons if producible |
| `docs/UNITS.md` | Document the new unit's stats |

---

## Manual Test Steps

1. Start the game. Verify existing units still render and move correctly.
2. If the new unit is a starting unit, verify it appears on the map at game start.
3. Select a city and verify the new unit appears in the production list (if applicable).
4. Produce the unit. Verify it spawns after the correct number of turns.
5. Select the new unit. Verify the sidebar shows correct stats.
6. Move the unit. Verify movement range and terrain costs are correct.
7. Attack an enemy. Verify combat resolves using STR + d6.
8. Verify the 3D model is visually distinct and uses faction colors.
9. Run `npx tsc -b --noEmit` — zero errors.
10. Run `npx vite build` — build succeeds.
