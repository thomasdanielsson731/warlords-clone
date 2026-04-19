# Skill: Add Combat

Add or modify combat mechanics.

---

## Description

Combat in Warlords 2026 follows classic Warlords II rules: Attacker STR + d6 vs Defender STR + d6 + City Defense Bonus. This skill covers adding new combat features, modifying resolution, or adding combat feedback.

---

## Requirements

- Combat formula: `attackerSTR + roll(1-6)` vs `defenderSTR + roll(1-6) + cityDefenseBonus`.
- Defender wins ties.
- Losing unit is destroyed (removed from the game).
- Hero winners gain XP (XP_PER_COMBAT_WIN = 30).
- City defense bonus: 1–3 depending on city. Bane faction gets +1 additional.
- Combat result must be shown in a modal with both sides' rolls and totals.

---

## Rules

- All combat logic lives in `resolveCombat()` in `src/game/gamelogic.ts`.
- Combat state (result modal) is managed in `src/game/store.ts`.
- Combat rendering (modal) is in `src/components/GameBoard.tsx`.
- Never resolve combat silently — always show the combat modal.
- When implementing army stacking (future): units fight 1v1 sequentially within the stack.
- Veteran bonus (future): surviving units gain +1 STR per N victories, capped at +4.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/game/types.ts` | Modify `CombatResult` interface if adding fields |
| `src/game/gamelogic.ts` | Modify `resolveCombat()` for new mechanics |
| `src/game/store.ts` | Modify `moveUnit` action if combat flow changes |
| `src/components/GameBoard.tsx` | Modify combat modal for new display elements |
| `src/styles/GameBoard.css` | Style changes for combat modal |

---

## Combat Edge Cases

- **Attacker on water**: Should never happen (water is impassable).
- **Hero vs Hero**: Both apply full STR + d6. Winner gets XP. Loser dies and drops items (future).
- **City garrison**: Defender gets city defense bonus. Attacker does not.
- **Attacker wins on city tile**: Attacker captures the city.
- **Tie**: Defender wins.

---

## Manual Test Steps

1. Move a unit onto an enemy unit. Verify the combat modal appears.
2. Verify attacker and defender stats, rolls, and totals are shown.
3. Verify city defense bonus appears when defending in a city.
4. Verify the losing unit is removed from the map.
5. If a hero wins, verify XP is granted.
6. Verify the winner occupies the tile after combat.
7. Verify the combat modal can be dismissed with OK button or clicking overlay.
8. Run `npx tsc -b --noEmit` — zero errors.
9. Run `npx vite build` — build succeeds.
