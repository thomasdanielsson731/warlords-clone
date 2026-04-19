# Skill: Add Autosave

Implement automatic saving at regular intervals.

---

## Description

Autosave triggers automatically at the start of each turn, saving to a dedicated autosave slot. This prevents frustrating loss of progress if the browser tab is closed or crashes.

---

## Requirements

- Autosave triggers at the start of each player turn (in `endTurn`).
- Uses a dedicated localStorage slot separate from manual saves.
- Keeps the last 2 autosaves (rotating: autosave_0, autosave_1).
- Load autosave option in the main menu or sidebar.
- Visual indicator when autosave occurs (brief "Autosaved" toast).

---

## Rules

- Autosave uses the same serialization as manual save (from `src/game/save.ts`).
- LocalStorage keys: `warlords2026_autosave_0`, `warlords2026_autosave_1`.
- Autosave should NOT block the game loop — use `setTimeout` or `queueMicrotask` if needed.
- Rotating index stored in `warlords2026_autosave_index`.
- Autosave can be disabled in settings (if settings exist).
- Toast notification in `src/components/GameBoard.tsx` — fades after 1-2 seconds.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/game/save.ts` | Add autosave function |
| `src/game/store.ts` | Call autosave in `endTurn` |
| `src/components/GameBoard.tsx` | Autosave toast notification |
| `src/styles/GameBoard.css` | Toast styling |

---

## Manual Test Steps

1. Play and end a turn. Verify "Autosaved" toast appears briefly.
2. End another turn. Verify autosave rotates slots.
3. Close and reopen the page. Load autosave. Verify it restores.
4. Verify autosave doesn't cause visible lag during turn transition.
5. Run `npx vite build` — build succeeds.
