# Warlords 2026 — Roadmap

## Phase 1 ✅
- Map rendering (20x20 seeded terrain)
- Units (4 types: militia, infantry, cavalry, knight)
- Unit movement (BFS pathfinding with terrain costs)
- Turn system (4 factions rotating)

## Phase 2 ✅
- Combat (d6 roll with STR comparison)
- Cities (16 cities: 4 faction + 12 neutral)
- City capture (move onto or win combat)
- City production (queue unit type, pay turns)

## Phase 3 ✅
- Heroes (XP, levels, +1 STR per level)
- Ruins (6 ruins, 5 reward types: gold/artifact/ally/dragon/nothing)
- Artifacts (hero inventory)
- Faction bonuses (Humans: knight +1 STR, Orcs: instant militia, Elves: forest cost 1, Bane: +1 city defense)

## Phase 4: 3D Rendering ✅
- React Three Fiber integration
- Terrain tiles as 3D boxes with trees/peaks/water
- Units as colored cylinders with hero crown
- Cities as towers with battlements and faction flags
- Angled camera with orbit controls
- Fog, lighting, movement highlights

## Phase 5: AI (Next)
- Simple AI for non-player factions
- AI unit movement toward nearest targets
- AI city production decisions
- AI combat engagement logic

## Phase 6: Polish
- Better terrain textures/models
- Unit movement animation (lerp)
- Combat camera zoom
- Sound effects
- Win/loss condition detection
- Minimap