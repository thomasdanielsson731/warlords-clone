# Skill: Add Ruin

Add or modify ruin mechanics.

---

## Description

Ruins are explorable locations on the map that only heroes can enter. Each ruin can be searched once, yielding one of several reward types. Ruins create excitement and reward hero exploration.

---

## Requirements

- Ruins have: id, x, y, explored (boolean).
- Only heroes can move onto unexplored ruins.
- Once explored, the ruin is marked explored and becomes passable by all units.
- Reward types: gold, artifact, ally, dragon, nothing.
- Dragon encounters are combat: hero STR + d6 vs dragon STR (8) + d6.
- Ruin results must be shown in a modal.

---

## Rules

- Ruin positions are defined in `createInitialRuins()` in `src/game/gamelogic.ts`.
- Ruin tiles must be on walkable land — clear to grass in `generateMap()`.
- Reward logic lives in `exploreRuin()` in `src/game/gamelogic.ts`.
- Movement blocking: non-hero units cannot enter unexplored ruin tiles.
- Heroes stop movement when entering a ruin (movesLeft set to 0).
- Ruin result state is managed in `src/game/store.ts` (`ruinResult`).
- The ruin modal is rendered in `src/components/GameBoard.tsx`.

---

## Reward Details

| Type | Effect |
|------|--------|
| Gold | 50, 100, or 150 gold added to faction treasury |
| Artifact | Item added to hero inventory; grants STR, moves, or XP bonus |
| Ally | Random unit (militia/archer/knight) spawns adjacent to hero |
| Dragon | Hero fights dragon (STR 8). Win = +50 XP. Lose = hero dies |
| Nothing | Empty ruin, no reward |

### Missing from Canon (Future)
- **Sage**: Reveals a portion of the map (requires fog of war).
- **Temple**: Hero visits for blessings or quests (separate mechanic).

---

## Files to Modify

| File | Change |
|------|--------|
| `src/game/types.ts` | Modify `RuinRewardType` or `RuinResult` for new rewards |
| `src/game/gamelogic.ts` | Modify `exploreRuin()`, `createInitialRuins()` |
| `src/game/store.ts` | Modify `moveUnit` ruin exploration logic |
| `src/scene/GameScene.tsx` | Modify `RuinModel` for visual changes |
| `src/components/GameBoard.tsx` | Modify ruin result modal |

---

## Manual Test Steps

1. Start the game. Verify all 6 ruins render on the map with golden glow.
2. Move a non-hero unit toward a ruin. Verify the ruin tile is NOT in movement range.
3. Move a hero onto a ruin. Verify the ruin modal appears with a reward.
4. Verify the ruin glow disappears after exploration (explored = true).
5. Verify non-hero units can now pass through the explored ruin tile.
6. Test gold reward: verify faction gold increases.
7. Test artifact reward: verify item appears in hero inventory.
8. Test ally reward: verify a unit spawns adjacent to the hero.
9. Test dragon: verify combat resolution and hero death if losing.
10. Run `npx tsc -b --noEmit` — zero errors.
