# Skill: Add Save/Load

Implement game save and load functionality.

---

## Description

Allow the player to save the current game state and reload it later. Uses localStorage initially, with potential for file export/import later.

---

## Requirements

- Save entire game state to localStorage as JSON.
- Load game state from localStorage and restore it.
- Save slot system: at least 3 save slots.
- Confirm overwrite when saving to an occupied slot.
- Saved data includes: map, units, cities, ruins, factions, turn, currentFaction.
- Version field for forward compatibility.

---

## Rules

- Save/load logic in `src/game/save.ts` (new file).
- `saveGame(slot: number)` serializes the Zustand store state to `localStorage`.
- `loadGame(slot: number)` deserializes and calls a store action to restore state.
- Add `restoreState(state)` action to the Zustand store.
- LocalStorage key: `warlords2026_save_${slot}`.
- Add version number to save data. If version mismatch, warn but try to load.
- Save UI: buttons in sidebar or a save/load modal.
- NEVER store sensitive data (if multiplayer is added later, no auth tokens in saves).

---

## Files to Modify

| File | Change |
|------|--------|
| `src/game/save.ts` | New file: save/load functions |
| `src/game/store.ts` | Add `restoreState` action |
| `src/components/GameBoard.tsx` | Save/Load buttons or modal |

---

## Manual Test Steps

1. Play a few turns. Save to slot 1.
2. Play more turns. Verify the game state has changed.
3. Load slot 1. Verify game state restores to the saved point.
4. Save to slot 2. Verify both slots exist independently.
5. Refresh the page. Load slot 1. Verify save persists.
6. Save over slot 1. Verify overwrite confirmation.
7. Run `npx vite build` — build succeeds.
