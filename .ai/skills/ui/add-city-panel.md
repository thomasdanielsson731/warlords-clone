# Skill: Add City Panel

Add or modify the city information panel.

---

## Description

When a city is selected, the sidebar shows detailed city information: name, owner, defense, garrison, production status, and production options. For owned cities, the player can set or change production.

---

## Requirements

- Show city name with owner color dot.
- Show owner faction (or "Neutral").
- Show defense value.
- Show position.
- If producing: show unit type, turns remaining, cancel button.
- If idle and owned: show production buttons (militia, archer, knight).
- Production buttons show unit stats (STR) and build time.
- Apply faction bonuses to displayed stats (Orcs: instant militia, Humans: knight +1 STR).

---

## Rules

- City panel is part of `src/components/GameBoard.tsx` (conditional on `selectedCityId`).
- Production is set via `setProduction(cityId, unitType)` store action.
- Cancel production via `setProduction(cityId, null)`.
- Only show production buttons for cities owned by the current faction.
- Neutral or enemy cities show info but no production controls.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/GameBoard.tsx` | City panel section |
| `src/styles/GameBoard.css` | City panel styling |

---

## Future Enhancements

- **City capture dialog**: Occupy / Pillage / Sack / Raze options.
- **Production forwarding**: Select destination city for produced units.
- **City income display**: Gold per turn from this city.
- **Garrison display**: List units currently in the city.
- **Per-city unit roster**: Different cities offer different unit types.

---

## Manual Test Steps

1. Click an owned city. Verify city info panel appears in sidebar.
2. Verify name, owner color, defense, position are shown.
3. Verify production buttons appear for owned idle city.
4. Click a production button. Verify production starts with correct turns.
5. Verify production status shows with cancel button.
6. Cancel production. Verify city returns to idle.
7. Click a neutral city. Verify info shows but no production buttons.
8. Run `npx vite build` — build succeeds.
