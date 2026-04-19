# Skill: Add Particles

Add particle effects to the scene.

---

## Description

Particles add visual flair: magic sparkles, fire embers, dust motes, combat impact effects. Use instanced meshes or drei helpers for performance.

---

## Requirements

- Particles should enhance, not distract.
- Keep particle counts low (< 50 per emitter) for performance.
- Use instanced meshes or sprite-based particles.
- Particles should fade in/out with opacity animation.

---

## Rules

- Particle components live in `src/scene/` alongside the entity they enhance.
- Use `useFrame` for particle animation — never external timers.
- Prefer `<instancedMesh>` for many identical particles.
- Alternatively use drei's `<Sparkles>` or `<Float>` for simple effects.
- Never allocate new objects inside useFrame — pre-allocate with useRef.
- Keep particle systems self-contained as reusable components.

---

## Candidate Effects

| Effect | Location | Particles |
|--------|----------|-----------|
| Hero staff sparkle | UnitModel (hero) | 8–12 tiny blue sparkles |
| Ruin magic particles | GameScene (ruin) | 6–10 golden motes rising |
| Torch embers | CityModel (torch) | 4–6 orange sparks rising |
| Combat impact | Future combat scene | 10–15 white flash particles |
| Level-up burst | UnitModel (hero) | 15–20 golden particles outward |
| City capture glow | CityModel | Ring of particles expanding |

---

## Files to Modify

| File | Change |
|------|--------|
| `src/scene/UnitModel.tsx` | Hero sparkle particles |
| `src/scene/CityModel.tsx` | Torch embers |
| `src/scene/GameScene.tsx` | Ruin magic particles |

---

## Manual Test Steps

1. Add particles to one entity. Verify they render.
2. Verify particles animate (rise, fade, drift).
3. Verify performance stays at 60fps with all particles active.
4. Verify particles don't obscure important game elements.
5. Run `npx vite build` — build succeeds.
