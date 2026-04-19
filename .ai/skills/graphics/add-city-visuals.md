# Skill: Add City Visuals

Add or modify faction-specific city architecture.

---

## Description

Each faction has a unique city architectural style. Cities are the most visually prominent objects on the map and should look impressive, detailed, and immediately recognizable by faction.

---

## Requirements

- Four faction styles + neutral:
  - **Humans (player)**: Stone castle, blue roofs, corner towers with battlements, gate with torches.
  - **Orcs**: Wooden palisades, spikes, fire pits, skull decorations.
  - **Elves**: Elegant white towers, green roofs, flanking trees, crystal accents.
  - **Bane**: Dark gothic stone, purple spires, glowing purple windows, energy orb.
  - **Neutral**: Simple grey fortress, no faction decorations.
- All cities use faction colors from `FACTION_COLORS`.
- Cities should have animated elements: smoke, torch flicker, banner waving.

---

## Rules

- All city rendering in `src/scene/CityModel.tsx`.
- Each faction has a dedicated component: `HumanCity`, `OrcCity`, `ElfCity`, `BaneCity`, `NeutralCity`.
- The router `FACTION_CITIES` maps faction to component.
- Animated elements use shared helpers: `SmokePlume`, `Torch`, `Banner`.
- Cities position at `[city.x, 0.075, city.y]` in world space.
- Production indicator: golden gear/torus when city is producing.
- Selection ring: pulsing golden ring (animated opacity).

---

## Files to Modify

| File | Change |
|------|--------|
| `src/scene/CityModel.tsx` | All city visual changes |
| `src/game/types.ts` | Only if adding city visual properties |

---

## Faction Architecture Guide

### Human City
- Main keep: large box with cone roof (blue #4466aa).
- 4 corner towers: cylinders with cone tops and battlements.
- Stone walls connecting towers.
- Gate with torches and glowing windows.
- Blue banners.

### Orc City
- Central wooden hut with pyramid roof.
- Circular palisade wall (16 wooden stakes).
- Spikes on palisades, skull decoration.
- Fire pits (Torch helper), dark smoke.
- Red banners.

### Elf City
- Tall central tower (white/cream).
- Side towers, green roofs.
- Flanking decorative trees.
- Arched walkway, glowing crystal on top.
- Green banners.

### Bane City
- Dark central tower (very dark purple-black).
- Gothic spire (4-sided cone).
- Corner spires.
- Purple glowing windows, energy orb.
- Purple light point.
- Purple banners.

---

## Manual Test Steps

1. Start game. Verify each faction's starting city has distinct architecture.
2. Verify neutral cities render as grey fortresses.
3. Capture a neutral city. Verify it changes to the capturing faction's architecture.
4. Verify smoke plumes animate.
5. Verify torches flicker (light intensity variation).
6. Verify banners wave (rotation animation).
7. Verify production indicator appears when city is producing.
8. Run `npx vite build` — build succeeds.
