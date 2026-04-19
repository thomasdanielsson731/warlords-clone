# Skill: Add Hero Panel

Add or modify the hero information panel.

---

## Description

When a hero is selected, the sidebar shows extended hero information: name, level, XP progress, strength, movement, and inventory of artifacts. Heroes should feel special and memorable in the UI.

---

## Requirements

- Show hero name with gold star prefix.
- Show level and XP bar (current XP / next level threshold).
- Show strength and movement.
- Show position.
- Show inventory: list of artifacts with names.
- Hero entry in unit list should be visually distinct (gold highlight).

---

## Rules

- Hero panel is part of the unit info section in `src/components/GameBoard.tsx`.
- Triggered when `selectedUnit.unitType === 'hero'`.
- XP display: `experience / (level * XP_PER_LEVEL)`.
- Inventory items are strings from `hero.inventory[]`.
- Use `.hero-entry` and `.hero-inventory` CSS classes.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/GameBoard.tsx` | Hero info section within unit panel |
| `src/styles/GameBoard.css` | Hero-specific styling |

---

## Future Enhancements

- **Artifact details**: Tooltip showing artifact stats on hover.
- **Hero portrait**: Small faction-themed portrait image.
- **Quest display**: Show active quest if quest system exists.
- **Hire hero button**: When hero hiring is implemented.
- **Item drop/transfer**: Manage inventory between heroes.

---

## Manual Test Steps

1. Select a hero unit. Verify hero panel shows in sidebar.
2. Verify gold star and hero name display.
3. Verify level and XP values are correct.
4. Win a combat with the hero. Verify XP updates.
5. Find an artifact in a ruin. Verify it appears in inventory.
6. Verify hero is visually distinct in the unit list.
7. Run `npx vite build` — build succeeds.
