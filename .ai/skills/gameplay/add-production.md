# Skill: Add Production

Add or modify city production mechanics.

---

## Description

Cities produce units over time. The player selects a unit type and the city builds it over N turns. In original Warlords II, production is **continuous** — after a unit is built, the city automatically begins producing the same type again.

---

## Requirements

- Each city can produce one unit type at a time.
- Production takes N turns based on `UNIT_TEMPLATES[type].productionTurns`.
- Spawned units appear on an adjacent walkable tile.
- Production should be **continuous**: after spawning, restart production of the same type.
- Player can cancel or change production at any time.
- Orcs faction bonus: militia produced instantly (0 turns).

---

## Rules

- Production state is stored on each `City` object: `producing` and `turnsLeft`.
- Production is advanced in `endTurn()` in `src/game/store.ts`.
- Spawning logic uses `findSpawnPosition()` in `src/game/gamelogic.ts`.
- **Current bug**: Production resets to `null` after spawning. Canon behavior: restart production of the same type with full turnsLeft.
- Fix: After spawning, set `turnsLeft` back to the template value instead of clearing `producing` to null.
- Heroes cannot be produced (productionTurns: 0).
- Production forwarding (future): units spawn at a different owned city.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/game/types.ts` | Only if adding production forwarding or new fields |
| `src/game/store.ts` | Modify `endTurn()` production logic for continuous production |
| `src/game/store.ts` | Modify `setProduction()` for production changes |
| `src/game/gamelogic.ts` | Modify `findSpawnPosition()` if spawn logic changes |
| `src/components/GameBoard.tsx` | Modify production UI if adding new features |

---

## Continuous Production Fix

In `store.ts` `endTurn()`, replace:
```
return { ...c, producing: null, turnsLeft: 0 }
```
with:
```
return { ...c, turnsLeft: UNIT_TEMPLATES[c.producing].productionTurns }
```

This makes cities behave like Warlords II — continuously producing the selected unit.

---

## Manual Test Steps

1. Select a city. Set production to militia.
2. End enough turns for production to complete.
3. Verify a militia unit spawns adjacent to the city.
4. Verify the city continues producing militia (does NOT reset to idle).
5. Change production to knight. Verify turnsLeft updates to knight's production time.
6. Cancel production. Verify city shows no production.
7. Test with Orcs faction: militia should produce in 0 turns (instant).
8. Verify spawned units have correct stats and faction.
9. Run `npx tsc -b --noEmit` — zero errors.
10. Run `npx vite build` — build succeeds.
