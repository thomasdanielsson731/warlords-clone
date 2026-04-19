# Skill: Add Lighting

Add or modify scene lighting and atmosphere.

---

## Description

Lighting creates the dark fantasy atmosphere of Warlords 2026. The scene uses a warm golden sun, cool fill light, hemisphere bounce, ambient light, and purple-dark fog to achieve a cinematic look inspired by Songs of Conquest.

---

## Requirements

- Warm ambient light (#c8b8a0, intensity 0.35).
- Golden directional sun (#ffe8c0, intensity 0.9) casting shadows.
- Cool fill light from opposite side (#8090b0, intensity 0.2).
- Hemisphere light for ground bounce (#b0c0d0 sky, #3a4a2a ground, intensity 0.25).
- Purple-dark fog (#2a2535, near 18, far 42).
- Dark background color (#1a1525).
- Shadow maps: 2048×2048 on the main directional light.

---

## Rules

- All scene lighting is defined in `SceneContent` in `src/scene/GameScene.tsx`.
- Fog is attached to the scene via `<fog attach="fog" />`.
- Background color via `<color attach="background" />`.
- Tone mapping is set on the Canvas `gl` prop: `THREE.ACESFilmicToneMapping`, exposure 1.1.
- Point lights on individual objects (torches, magic orbs) are defined in their component files.
- Never exceed 4 shadow-casting lights for performance.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/scene/GameScene.tsx` | Scene-level lights, fog, background, tone mapping |
| `src/scene/CityModel.tsx` | Point lights on torches, magic orbs |
| `src/scene/UnitModel.tsx` | Point light on hero staff |
| `src/scene/GameScene.tsx` | Point light on ruin magic orb |

---

## Lighting Mood Guide

| Time of Day | Sun Color | Ambient | Fog | Feel |
|-------------|-----------|---------|-----|------|
| Golden hour (current) | #ffe8c0 | #c8b8a0 | #2a2535 | Warm, epic |
| Night battle | #4466aa | #1a2a3a | #0a0a15 | Tense, dark |
| Dawn | #ffccaa | #aa9080 | #2a2030 | Hopeful |

---

## Manual Test Steps

1. Start game. Verify warm golden lighting on terrain.
2. Verify shadows cast by trees, mountains, cities, units.
3. Verify fog fades distant objects to purple-dark.
4. Verify background is dark purple (not black, not grey).
5. Verify torch lights flicker on cities.
6. Verify hero staff has blue glow.
7. Verify ruin has golden glow.
8. Overall: does it look cinematic and not flat?
9. Run `npx vite build` — build succeeds.
