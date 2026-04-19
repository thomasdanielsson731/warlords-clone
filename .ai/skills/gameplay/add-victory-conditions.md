# Skill: Add Victory Conditions

Add win/loss detection and game-over flow.

---

## Description

Warlords II victory is achieved by controlling the majority of cities (typically ≥50%). The game should check after each turn whether any faction has achieved victory or been eliminated.

---

## Requirements

- Victory condition: control ≥ 50% of all cities on the map.
- Elimination condition: a faction with zero cities and zero units is eliminated.
- Display a victory screen when a faction wins.
- Display an elimination notification when a faction is knocked out.
- Allow the player to continue playing after AI victory (optional).

---

## Rules

- Add a `checkVictory()` function in `src/game/gamelogic.ts`.
- Call it at the end of each turn cycle (when turn wraps back to first faction).
- Store game result in the Zustand store: `gameResult: { winner: Faction } | null`.
- Display a victory/defeat modal in `src/components/GameBoard.tsx`.
- Once the game is won, disable further turns (or offer "Continue Playing" button).

---

## Files to Modify

| File | Change |
|------|--------|
| `src/game/types.ts` | Add `GameResult` interface |
| `src/game/gamelogic.ts` | Add `checkVictory()` and `checkElimination()` functions |
| `src/game/store.ts` | Add `gameResult` state, call victory check in `endTurn()` |
| `src/components/GameBoard.tsx` | Add victory/defeat modal |
| `src/styles/GameBoard.css` | Style victory screen |

---

## Victory Check Logic

```typescript
function checkVictory(cities: City[]): Faction | null {
  const totalCities = cities.length
  const threshold = Math.ceil(totalCities / 2)
  for (const faction of FACTIONS) {
    const owned = cities.filter(c => c.owner === faction).length
    if (owned >= threshold) return faction
  }
  return null
}
```

---

## Manual Test Steps

1. Play the game and capture cities until one faction controls ≥ 50%.
2. Verify a victory modal appears showing the winning faction.
3. Verify the game stops or offers "Continue Playing".
4. Test elimination: remove all units and cities from a faction.
5. Verify the eliminated faction is skipped in turn order.
6. Run `npx tsc -b --noEmit` — zero errors.
7. Run `npx vite build` — build succeeds.
