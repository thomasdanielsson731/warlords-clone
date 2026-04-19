# Skill: Add Fog of War

Add fog of war visibility system.

---

## Description

Fog of war hides unexplored and non-visible areas of the map. In Warlords II, fog is symmetric — AI factions also only see what they have explored. Players reveal the map by moving units through it.

---

## Requirements

- Three tile states: **Unexplored** (black), **Explored** (dimmed), **Visible** (full).
- Visible = within sight range of any owned unit or city.
- Explored = previously visible, shown dimmed but terrain visible. Units/enemies NOT shown.
- Unexplored = never seen, rendered as black/fog.
- Sight range: units see 2 tiles, cities see 3 tiles, heroes see 3 tiles.
- Enemy units and cities are only visible in the "Visible" zone.

---

## Rules

- Add visibility state per faction: `Record<Faction, Set<string>>` for explored tiles.
- Compute visible tiles each turn from all owned units + cities.
- Store explored tiles persistently (once seen, always explored).
- 3D rendering: apply dark overlay or hide geometry for non-visible tiles.
- Enemy units on non-visible tiles should not render.
- Enemy cities on explored-but-not-visible tiles show last known state.
- Sage ruin reward (future) reveals a region of the map.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/game/types.ts` | Add visibility types and sight range constants |
| `src/game/gamelogic.ts` | Add `computeVisibility()` function |
| `src/game/store.ts` | Add `explored` and `visible` state, update on movement and turn end |
| `src/scene/GameScene.tsx` | Filter rendered entities by visibility |
| `src/scene/TerrainTile.tsx` | Add dimmed/dark appearance for non-visible tiles |

---

## Visibility Computation

```
For each owned unit and city:
  For each tile within sight range (BFS or manhattan distance):
    Mark tile as Visible
    Mark tile as Explored (persistent)
```

---

## Manual Test Steps

1. Start game. Verify only tiles near starting units/cities are visible.
2. Verify unexplored tiles appear dark/black.
3. Move a unit. Verify new tiles become visible and previously visible tiles become explored (dimmed).
4. Verify enemy units only appear on visible tiles.
5. Verify explored tiles show terrain but not enemy units.
6. End turn. Verify visibility updates based on current unit positions.
7. Run `npx tsc -b --noEmit` — zero errors.
8. Run `npx vite build` — build succeeds.
