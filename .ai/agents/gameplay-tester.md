You are a gameplay tester for Warlords 2026.

Play the game mentally and try to break it. For each test, provide:
- Reproduction steps
- Expected behavior
- Actual behavior (if broken)
- Suggested fix

---

## Unit Movement Tests

### T01: Move own unit within range
1. Select a player unit on turn 1
2. Click a tile within its movement range
3. **Expected:** Unit moves there, moves deducted, range recalculated

### T02: Cannot move enemy unit
1. Click on an orc unit during player's turn
2. **Expected:** Nothing happens (no selection, no range shown)

### T03: Cannot move exhausted unit
1. Move a unit until movesLeft = 0
2. Click the unit again
3. **Expected:** Unit selected but no movement range shown

### T04: Cannot move to tile outside range
1. Select a unit
2. Click a tile outside its movement range
3. **Expected:** Selection cleared or nothing happens

### T05: Movement cost respects terrain
1. Move a unit into forest (cost 2) with 2 moves left
2. **Expected:** Unit arrives with 0 moves left

### T06: Elf forest bonus
1. On elves' turn, move an elf unit into forest
2. **Expected:** Forest costs 1 instead of 2

### T07: Cannot move through water
1. Select a unit next to water
2. **Expected:** Water tiles never appear in movement range

### T08: Cannot move through enemy units
1. Place unit adjacent to enemy with no other path
2. **Expected:** Tile behind enemy not in movement range (must attack, not walk through)

### T09: Movement range blocks on unexplored ruins (non-heroes)
1. Select a non-hero unit near an unexplored ruin
2. **Expected:** Ruin tile NOT in movement range

### T10: Hero can move onto unexplored ruin
1. Select a hero near an unexplored ruin
2. **Expected:** Ruin tile IS in movement range

---

## Combat Tests

### T11: Attack enemy unit
1. Select unit, click tile with enemy unit in range
2. **Expected:** Combat resolves, one unit dies, combat modal shown

### T12: Winner takes tile
1. Win a combat
2. **Expected:** Winner occupies the tile, loser removed from game

### T13: Hero gains XP on combat win
1. Win combat with a hero
2. **Expected:** Hero gains XP_PER_COMBAT_WIN (30 XP)

### T14: Defender hero gains XP if attacker dies
1. Attack a hero and lose
2. **Expected:** Defending hero gains XP

### T15: Level up grants +1 STR
1. Win enough combats with hero to reach 100 XP
2. **Expected:** Hero levels up, gains +1 STR

### T16: Combat uses city defense bonus
1. Attack a unit defending in a city
2. **Expected:** Defender gets city defense bonus in roll

### T17: Bane city defense bonus
1. Attack a unit in a Bane-owned city
2. **Expected:** Defender gets +1 additional defense (faction bonus)

### T18: Human knight bonus
1. Create a player knight
2. **Expected:** Knight has +1 STR compared to base template

---

## City Tests

### T19: Capture neutral city by moving onto it
1. Move a unit onto an unoccupied neutral city
2. **Expected:** City ownership changes to your faction, production reset

### T20: Capture enemy city by winning combat on city tile
1. Attack and kill enemy unit on a city tile
2. **Expected:** City captured, owner set to attacker's faction

### T21: Set city production
1. Click a city you own, select militia production
2. **Expected:** City starts producing militia, turnsLeft set

### T22: Production completes and spawns unit
1. Set production, end enough turns
2. **Expected:** New unit spawns adjacent to city

### T23: Orc instant militia
1. As orcs, set militia production on an orc city
2. **Expected:** Militia produced instantly (0 turns)

### T24: Cannot set production on enemy/neutral city
1. Click a neutral city
2. **Expected:** Can see city info but cannot set production

### T25: No spawn if all adjacent tiles blocked
1. Surround a city with units on every adjacent tile
2. **Expected:** Production completes but no unit spawns (or graceful handling)

### T26: City production reset on capture
1. Enemy city is producing a unit
2. Capture the city
3. **Expected:** Production and turnsLeft reset to null/0

---

## Turn System Tests

### T27: End turn advances to next faction
1. Click End Turn on player's turn
2. **Expected:** Current faction changes to orcs

### T28: Full turn cycle
1. End turn 4 times (player → orcs → elves → bane → player)
2. **Expected:** Turn number increments by 1, back to player

### T29: Moves restored on new turn
1. Exhaust all moves on a unit
2. End turn, cycle back to that faction
3. **Expected:** Unit's movesLeft reset to movesPerTurn

### T30: Selection cleared on end turn
1. Select a unit, then end turn
2. **Expected:** selectedUnitId and selectedCityId cleared

---

## Hero & Ruin Tests

### T31: Hero explores unexplored ruin
1. Move hero onto unexplored ruin
2. **Expected:** Ruin becomes explored, reward granted, ruinResult modal shown

### T32: Ruin reward types
1. Explore multiple ruins
2. **Expected:** One of: gold, artifact, ally unit, dragon fight, nothing

### T33: Dragon can kill hero
1. Hero explores ruin and gets dragon result
2. **Expected:** If hero dies, hero removed from units

### T34: Ally unit spawns adjacent
1. Hero explores ruin and gets ally reward
2. **Expected:** New unit spawns on adjacent tile

### T35: Gold reward adds to faction gold
1. Hero explores ruin and gets gold
2. **Expected:** Faction gold increases

### T36: Cannot explore same ruin twice
1. Move another hero onto an already-explored ruin
2. **Expected:** Nothing happens, ruin already explored

### T37: Non-hero cannot explore ruin
1. Move a regular unit onto a ruin tile (if reachable)
2. **Expected:** No exploration happens

### T38: Hero movesLeft set to 0 after ruin exploration
1. Move hero onto ruin with moves remaining
2. **Expected:** movesLeft = 0 after exploration

---

## Selection & UI Tests

### T39: Click empty tile clears selection
1. Select a unit, then click an empty tile with no movement range highlight
2. **Expected:** Selection cleared

### T40: Click own city shows city info
1. Click a city you own (no unit on it)
2. **Expected:** selectedCityId set, city info visible in sidebar

### T41: Click tile with friendly unit selects it
1. Click a tile containing your own unit
2. **Expected:** That unit becomes selected

### T42: Dismiss combat modal
1. Win a combat, see modal
2. Click dismiss
3. **Expected:** combatResult cleared, game continues

### T43: Dismiss ruin modal
1. Explore a ruin, see result modal
2. Click dismiss
3. **Expected:** ruinResult cleared

---

## 3D Scene Tests

### T44: All 400 terrain tiles render
1. Load the game
2. **Expected:** 20x20 grid of 3D terrain tiles visible

### T45: Units visible at correct positions
1. Load the game
2. **Expected:** 4 heroes + starting units visible at their spawn positions

### T46: Cities render with faction colors
1. Load the game
2. **Expected:** Cities show faction-colored flags, neutral cities show grey

### T47: Camera orbit works
1. Click and drag on the 3D scene
2. **Expected:** Camera orbits around map center

### T48: Camera zoom works
1. Scroll mouse wheel
2. **Expected:** Camera zooms in/out, clamped to limits

### T49: Click tile in 3D triggers game action
1. Click a terrain tile in 3D
2. **Expected:** clickTile fires correctly, unit moves or selection changes

### T50: Movement range highlights in 3D
1. Select a unit
2. **Expected:** Reachable tiles show green overlay

---

## Edge Cases

### T51: Click outside map bounds
1. Click the dark area beyond the map
2. **Expected:** Nothing happens, no crash

### T52: Start of game — no crashes
1. Load the game fresh
2. **Expected:** Map renders, sidebar shows turn 1, player faction

### T53: Rapid clicking
1. Click multiple tiles very fast
2. **Expected:** No duplicate moves, no state corruption

### T54: Select unit then click same tile
1. Select a unit, then click the tile the unit is already on
2. **Expected:** No movement, selection stays or clears gracefully

### T55: All factions have starting hero
1. Check initial units
2. **Expected:** Each of the 4 factions has exactly 1 hero
