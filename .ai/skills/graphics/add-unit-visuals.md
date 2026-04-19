# Skill: Add Unit Visuals

Add or modify 3D unit model rendering.

---

## Description

Each unit type has a unique 3D body shape with faction coloring, weapons, and accessories. Units should be immediately readable at a glance — the silhouette and weapon tell you the type, the color tells you the faction.

---

## Requirements

- Four unit types with distinct silhouettes:
  - **Militia**: Simple body + spear.
  - **Archer**: Slim body + hood + bow.
  - **Knight**: Armored body + helmet + shield + sword.
  - **Hero**: Large body + cape + crown + glowing staff.
- Units use faction colors from `FACTION_COLORS`.
- Exhausted units (movesLeft = 0) render semi-transparent.
- Selected units have a pulsing golden ring and enhanced bobbing.
- Hover shows a white ring and changes cursor to pointer.
- All units have a small faction banner on their back.

---

## Rules

- All unit rendering in `src/scene/UnitModel.tsx`.
- Each type has a body component: `MilitiaBody`, `ArcherBody`, `KnightBody`, `HeroBody`.
- The `UNIT_BODIES` record maps type string to component.
- Units position at `[unit.x, 0, unit.y]` with a bobbing `groupRef` offsetting Y.
- Idle bobbing: `sin(time * 1.5) * 0.008`. Selected: `sin(time * 3) * 0.03`.
- Selection ring: `ringGeometry` with animated opacity.
- Click handler calls `onClick` prop (which calls `selectUnit` or `clickTile`).
- Pointer events set cursor style on `document.body`.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/scene/UnitModel.tsx` | All unit visual changes |
| `src/game/types.ts` | Only if adding new unit types |

---

## Adding a New Unit Visual

1. Create a new `XxxBody` component with unique geometry.
2. Must accept `{ color: string; exhausted: boolean }` props.
3. Add to `UNIT_BODIES` record.
4. Use cylinders for bodies, spheres for heads, cones for helmets/hoods.
5. Add a distinctive weapon or accessory for silhouette recognition.
6. Apply faction `color` to the main body mesh.
7. Apply transparency when `exhausted` is true.

---

## Manual Test Steps

1. Start game. Verify militia renders with spear.
2. Verify archer renders with hood and bow.
3. Verify knight renders with helmet, shield, and sword.
4. Verify hero renders with cape, crown, and glowing staff.
5. Verify faction colors are correct on all units.
6. Move a unit until exhausted. Verify semi-transparent appearance.
7. Select a unit. Verify golden ring and enhanced bobbing.
8. Hover over a unit. Verify white ring and pointer cursor.
9. Run `npx vite build` — build succeeds.
