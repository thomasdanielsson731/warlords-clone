# Skill: Add Side Panel

Add or modify the sidebar UI panel.

---

## Description

The side panel is the main HTML overlay showing game status, selected unit/city info, production controls, and the end turn button. It should feel like a premium dark fantasy strategy game UI.

---

## Requirements

- Show: turn number, current faction (colored label), gold.
- Show faction bonus description.
- When a unit is selected: type, strength, moves, position. Hero: name, level, XP, inventory.
- When a city is selected: name, owner, defense, production status, production buttons.
- Unit list for current faction.
- End Turn button.
- Dark fantasy theme: charcoal/brown base (#1a1714), gold accents (#c8a84e).

---

## Rules

- Side panel lives in `src/components/GameBoard.tsx`.
- Styles in `src/styles/GameBoard.css`.
- Reads all state from `useGameStore()` — never modifies game state directly.
- Calls store actions: `endTurn()`, `setProduction()`.
- Keep the panel width fixed (~260px) and scrollable if content overflows.
- Use semantic CSS classes, not inline styles.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/GameBoard.tsx` | Panel content and layout |
| `src/styles/GameBoard.css` | Dark fantasy styling |

---

## Style Guide

- Background: `#1a1714` with slight transparency.
- Text: `#e0d6c2` (warm parchment).
- Accent: `#c8a84e` (gold) for labels, borders, buttons.
- Buttons: dark background with gold border, hover glow.
- Faction label: colored pill with faction color background.
- Hero entries: gold star prefix, slightly highlighted.
- Scrollbar: thin, dark, unobtrusive.

---

## Manual Test Steps

1. Start game. Verify sidebar shows turn, faction, gold.
2. Select a unit. Verify unit info appears.
3. Select a hero. Verify hero name, level, XP, inventory.
4. Click a city. Verify city info and production buttons.
5. Set production. Verify production status shows with cancel button.
6. Click End Turn. Verify turn advances.
7. Verify panel doesn't overflow or clip on small screens.
8. Verify dark fantasy aesthetic — not a plain white panel.
