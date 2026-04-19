# Skill: Add Refactor

Refactor code for maintainability and clarity.

---

## Description

Split large files, extract reusable functions, and improve code organization. Keep the codebase clean as features are added.

---

## Requirements

- `gamelogic.ts` should be under 300 lines. Extract map generation, combat, XP logic into separate files if it grows larger.
- `store.ts` should delegate to pure functions from gamelogic — store actions should be thin orchestrators.
- Types should be in `types.ts` — no inline type definitions in components.
- Components should be single-responsibility: GameBoard for layout, GameScene for 3D, sidebar sections as sub-components.

---

## Rules

- Extract ONLY when a file exceeds ~300 lines or a function exceeds ~50 lines.
- Do NOT refactor for aesthetics — only for concrete maintainability problems.
- Keep all pure game logic in `src/game/` — never in components.
- Keep all React/Three.js rendering in `src/scene/` and `src/components/`.
- After refactoring, verify: `npx tsc -b --noEmit` and `npx vite build` both pass.
- Do not change behavior — refactoring must be purely structural.

---

## File Size Guidelines

| File | Max Lines | Split Strategy |
|------|-----------|---------------|
| `gamelogic.ts` | 300 | Extract: mapgen.ts, combat.ts, xp.ts |
| `store.ts` | 250 | Delegate to pure functions |
| `GameBoard.tsx` | 200 | Extract: Sidebar.tsx, CombatModal.tsx |
| `GameScene.tsx` | 150 | Extract per-feature scene components |

---

## Files to Modify

| File | Change |
|------|--------|
| `src/game/gamelogic.ts` | Split if > 300 lines |
| `src/game/store.ts` | Thin out actions if > 250 lines |
| `src/components/GameBoard.tsx` | Extract sub-components if > 200 lines |

---

## Manual Test Steps

1. After any refactor, run `npx tsc -b --noEmit` — zero errors.
2. Run `npx vite build` — build succeeds.
3. Play a full turn cycle. Verify no behavior changes.
4. Attack a unit. Verify combat works identically.
5. Verify production still works.
6. Check bundle size hasn't changed significantly.
