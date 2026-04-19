# Skill: Add Tooltip

Add hover tooltips to game elements.

---

## Description

Tooltips provide contextual information when hovering over units, cities, terrain, and UI elements. They help the player understand the game without clicking.

---

## Requirements

- Terrain tooltip: terrain type, movement cost.
- Unit tooltip: type, faction, strength, moves remaining.
- City tooltip: name, owner, defense, current production.
- UI button tooltip: describe what the button does.
- Tooltips appear after a short delay (~300ms) and follow the cursor.
- Tooltips disappear immediately on mouse leave.

---

## Rules

- Create a reusable `Tooltip` component in `src/components/Tooltip.tsx`.
- Tooltip content is determined by what's under the cursor.
- Use the `hoveredTile` state from the store to determine 3D hover target.
- For HTML tooltips on UI buttons, use a simple CSS tooltip or the Tooltip component.
- Tooltips must not block clicks or interfere with game interaction.
- Keep tooltip styling consistent with the dark fantasy theme.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/Tooltip.tsx` | New file: reusable tooltip component |
| `src/components/GameBoard.tsx` | Integrate tooltip for 3D hover info |
| `src/styles/GameBoard.css` | Tooltip styling |

---

## Manual Test Steps

1. Hover over a grass tile. Verify tooltip shows "Grass — Move cost: 1".
2. Hover over a forest tile. Verify "Forest — Move cost: 2".
3. Hover over a unit. Verify unit type, faction, strength.
4. Hover over a city. Verify city name and owner.
5. Verify tooltip appears after ~300ms delay.
6. Verify tooltip disappears on mouse leave.
7. Verify tooltip doesn't block clicking.
8. Run `npx vite build` — build succeeds.
