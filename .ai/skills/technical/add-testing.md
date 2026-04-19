# Skill: Add Testing

Add tests for game logic.

---

## Description

Add unit tests for pure game logic functions using Vitest. Focus on combat resolution, XP, production, and map generation — the core rules that must never break.

---

## Requirements

- Use Vitest (compatible with Vite project).
- Test files in `src/game/__tests__/` directory.
- Test pure functions from `gamelogic.ts`: resolveCombat, grantXp, generateMap, etc.
- Tests should be deterministic — mock `Math.random()` for combat rolls.
- Aim for 100% coverage on combat resolution and XP logic.

---

## Rules

- Only test pure functions — no React component tests initially.
- Use `vi.spyOn(Math, 'random')` to control dice rolls in combat tests.
- Test edge cases: zero strength, hero vs hero, city defense bonus, faction bonuses.
- Test invariants: no negative strength, XP never decreases, map always 20x20.
- Keep tests fast — no async, no network, no DOM.
- Run with `npx vitest run`.

---

## Test Plan

| Test File | Functions Tested |
|-----------|-----------------|
| `combat.test.ts` | `resolveCombat()` — all outcomes |
| `xp.test.ts` | `grantXp()` — leveling, cap |
| `mapgen.test.ts` | `generateMap()` — dimensions, terrain distribution |
| `production.test.ts` | Production timing, faction bonuses |
| `units.test.ts` | `createInitialUnits()` — correct factions, positions |

---

## Files to Modify

| File | Change |
|------|--------|
| `src/game/__tests__/combat.test.ts` | New file: combat tests |
| `src/game/__tests__/xp.test.ts` | New file: XP tests |
| `src/game/__tests__/mapgen.test.ts` | New file: map generation tests |
| `package.json` | Add vitest dev dependency and test script |

---

## Manual Test Steps

1. Run `npx vitest run`. Verify all tests pass.
2. Verify combat tests cover: attacker wins, defender wins, city bonus, hero bonus.
3. Verify XP tests cover: normal grant, level up, (future) level cap.
4. Verify map tests cover: correct dimensions, land mass exists, ocean border.
5. Check coverage report: `npx vitest run --coverage`.
