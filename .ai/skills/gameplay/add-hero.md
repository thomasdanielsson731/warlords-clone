# Skill: Add Hero

Add or modify hero mechanics.

---

## Description

Heroes are rare, powerful units in Warlords 2026. They gain XP, level up, carry artifacts, and can explore ruins. Heroes cannot be produced in cities — they must be hired (future) or provided at game start.

---

## Requirements

- Heroes have: name, experience, level, inventory, strength, movesPerTurn.
- Heroes gain XP from combat wins (30 XP) and ruin exploration.
- Level up at every 100 XP. Each level grants +1 STR.
- **Level cap: 5** (hero strength should stop increasing beyond level 5).
- Heroes can carry artifacts found in ruins.
- Only heroes can explore ruins.
- Heroes should feel rare, memorable, and powerful.

---

## Rules

- Hero type is defined in `UNIT_TEMPLATES` with `productionTurns: 0` (not producible).
- XP and leveling logic lives in `grantXp()` in `src/game/gamelogic.ts`.
- Level cap must be enforced: `Math.min(newLevel, 5)`.
- Hero-specific fields: `name`, `experience`, `level`, `inventory`.
- Dead heroes should drop their inventory (future — item bag on the tile).
- New heroes arrive via hiring mechanic (future — gold cost, periodic availability).
- The sidebar must show hero name, level, XP bar, inventory when selected.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/game/types.ts` | Modify `Unit` interface for new hero fields |
| `src/game/gamelogic.ts` | Modify `grantXp()`, `createInitialUnits()`, `exploreRuin()` |
| `src/game/store.ts` | Modify `moveUnit` for hero-specific behavior |
| `src/scene/UnitModel.tsx` | Modify `HeroBody` component for visual changes |
| `src/components/GameBoard.tsx` | Modify hero info display in sidebar |

---

## Canon Reference (Warlords II)

- Heroes cannot be produced in cities.
- Heroes are hired for gold when they become available (random events).
- Dead heroes drop a "bag" of items; another hero can pick them up.
- Heroes provide a leadership bonus to units in the same stack (future).
- Heroes visit temples for blessings and quests (future).

---

## Manual Test Steps

1. Start the game. Verify each faction has one hero.
2. Select a hero. Verify sidebar shows name, level, XP, strength, inventory.
3. Win a combat with the hero. Verify XP increases by 30.
4. Accumulate 100 XP. Verify level increases to 2 and STR increases by 1.
5. Verify hero cannot exceed level 5.
6. Move hero onto a ruin. Verify ruin exploration triggers.
7. Find an artifact. Verify it appears in hero inventory.
8. Verify hero renders with crown, cape, and staff in the 3D scene.
9. Run `npx tsc -b --noEmit` — zero errors.
10. Run `npx vite build` — build succeeds.
