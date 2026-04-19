# Skill: Add Combat Modal

Add or modify the combat result modal.

---

## Description

The combat modal displays the outcome of a battle: both sides' units, strength, dice rolls, totals, city defense bonus, and the winner. It should feel dramatic and satisfying.

---

## Requirements

- Show attacker and defender side-by-side.
- Show: unit type/name, faction (colored), strength, dice roll, total.
- Show city defense bonus when defending in a city.
- Highlight winner side, dim loser side.
- Show XP gained if a hero won.
- Dismissable with OK button or clicking the overlay background.
- Dark fantasy modal styling.

---

## Rules

- Combat modal renders in `src/components/GameBoard.tsx` when `combatResult` is not null.
- Clicking OK or overlay calls `dismissCombat()`.
- Use CSS classes `.combat-overlay`, `.combat-modal`, `.combat-side`, `.winner`, `.loser`.
- Modal should appear centered with a dark semi-transparent backdrop.
- Combat data comes from `CombatResult` interface in `types.ts`.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/GameBoard.tsx` | Combat modal JSX |
| `src/styles/GameBoard.css` | Combat modal styling |
| `src/game/types.ts` | Only if adding fields to CombatResult |

---

## Future Enhancements

- **Combat animation**: Camera zoom to battle location.
- **Sequential stack combat**: Show each 1v1 fight in sequence.
- **Sound effects**: Sword clash, victory fanfare.
- **Damage numbers**: Floating numbers showing rolls.

---

## Manual Test Steps

1. Attack an enemy unit. Verify combat modal appears.
2. Verify attacker side shows unit type, faction color, STR, roll, total.
3. Verify defender side shows same info plus city bonus (if in city).
4. Verify winner side is highlighted, loser is dimmed.
5. Verify XP gained shows when hero wins.
6. Click OK. Verify modal dismisses and game state is correct.
7. Click overlay background. Verify modal also dismisses.
8. Run `npx vite build` — build succeeds.
