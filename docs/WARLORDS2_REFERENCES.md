# Warlords II — Reference Library

> Structured reference source for validating Warlords 2026 against original Warlords II (1993) and Warlords II Deluxe (1995). Designed for use by human developers and AI review agents.

---

## 1. Original Manuals

### Warlords II (1993) — SSG

The original manual describes a turn-based fantasy strategy game set on a tile-based map. Players control factions competing for dominance by conquering cities, building armies, and deploying heroes.

### Warlords II Deluxe (1995) — SSG

The Deluxe edition expanded the original with a scenario editor, more unit types, improved AI, and enhanced diplomacy. The core mechanics remained the same.

### Key Mechanics from Manuals

#### City Production
- Each city can produce one unit type at a time.
- Production is **continuous**: after a unit is built, the city immediately begins producing another of the same type unless manually changed.
- Each city has a fixed set of available unit types (up to 4), depending on the scenario and city.
- Different cities may produce different units. Capital cities typically offer the best units.
- Production can be forwarded to another owned city (the unit spawns at the destination).
- Newly captured cities retain their production capabilities.

#### Hero Levels
- Heroes gain experience (XP) through combat victories and ruin exploration.
- Heroes are **capped at level 5** (or scenario-defined cap).
- Each level grants +1 combat strength.
- Heroes can carry up to 2–3 items (artifacts) found in ruins.
- Dead heroes drop a "bag" of items that other heroes can pick up.
- New heroes appear periodically and must be **hired** (costing gold) — they cannot be produced in cities.

#### Ruins
- Only heroes may search ruins.
- Possible rewards:
  - **Gold**: Immediate gold bonus.
  - **Artifact**: Equippable item granting stat bonuses.
  - **Ally**: A free army unit joins your forces.
  - **Sage**: Reveals a portion of the map.
  - **Dragon/Guardian**: A powerful creature guards the ruin; the hero must defeat it or die.
  - **Nothing**: The ruin is empty.
- Each ruin can only be searched once.
- Temples function differently from ruins — heroes visit temples for blessings or quests.

#### Diplomacy
- Diplomatic states between factions: **Allied**, **Neutral**, **At War**.
- Attacking a neutral or allied faction triggers diplomatic penalties ("running dog" reputation).
- AI factions track your trustworthiness. Aggressive behavior causes other factions to ally against you.
- Having excessive gold or territory makes you a target.
- AI may propose or break alliances based on relative power.

#### Combat
- Combat is resolved as: `Attacker STR + d6` vs `Defender STR + d6 + City Defense Bonus`.
- Defender wins ties.
- Armies in a stack fight one-at-a-time. The attacker chooses attack order; the defender's strongest unit defends first.
- City defense bonuses range from +1 to +3 depending on city fortification level.
- Terrain does not directly affect combat — only movement costs.
- Veteran units (surviving multiple battles) can gain up to +4 bonus strength.

#### City Capture
- When an army conquers a city, the player chooses one of four options:
  - **Occupy**: Take the city intact. Full production capability preserved.
  - **Pillage**: Gain some gold, minor production damage.
  - **Sack**: Gain more gold, significant production damage.
  - **Raze**: Destroy the city entirely (removed from the map). Gain maximum gold.
- In the original game, razing was a valid strategic denial tool.
- Neutral cities are defended by garrison units (typically militia-strength).

#### Victory Conditions
- Standard victory: control **at least half** of all cities on the map.
- Some scenarios define alternate victory conditions.
- The game ends when one faction achieves the victory threshold or all opponents are eliminated.

---

## 2. Strategy Guides and Walkthroughs

### GameFAQs FAQ by GBarnett (1995)

A comprehensive original-era FAQ that provides critical details about game mechanics and strategy. Key insights:

#### Starting Position
- Each faction starts with **1 hero, 1 army, and 1 city**.
- The starting hero is level 1 with no items.
- Immediate priorities: begin city production and expand toward nearby neutral cities.

#### Early Expansion Strategy
- Rush neutral cities in the first 3–5 turns before opponents claim them.
- Neutral cities are defended by weak garrisons (strength 1–2).
- A hero alone can often capture the nearest neutral cities.
- Set all captured cities to produce militia or light infantry immediately — quantity matters early.

#### Neutral Cities
- Most of the map (70–80%) consists of neutral cities at game start.
- Neutral cities do not produce units — they sit idle until captured.
- Controlling neutral cities is the primary path to victory.
- Strategic cities near chokepoints (mountain passes, bridges) are high priority.

#### Hero Usage
- Heroes are the most versatile units: fast movement, ruin exploration, strong combat.
- Use heroes to explore ruins early — artifacts give permanent stat boosts.
- A hero with 2–3 artifacts becomes the strongest unit on the map.
- Heroes can solo-capture weak neutral cities in the early game.
- Protect your hero — losing a geared hero is devastating.
- Dead heroes drop their items; send another hero to recover them.

#### Faction Differences
- Factions differ primarily in:
  - Starting position on the map (geographic advantage/disadvantage).
  - Available unit types in their cities.
  - Some factions have access to stronger or faster units.
- There are no hard faction "bonuses" in the original — differences come from city production rosters and map position.
- In Warlords II Deluxe scenarios, custom factions could have unique unit sets.

#### Army Stacking
- Up to **8 units** can occupy the same tile as a "stack" (army group).
- Stacks move at the speed of the slowest unit.
- In combat, units fight one-at-a-time within the stack.
- Hero in a stack provides a leadership morale bonus to all units.

#### Gold and Economy
- Cities generate **gold income per turn** based on their size/level.
- Gold is used to: hire heroes, bribe/diplomacy, and (in Deluxe) purchase upgrades.
- No upkeep cost for armies — once produced, units are free to maintain.

---

## 3. Historical Reviews

### CRPG Addict / Retrospective Analysis

While primarily a CRPG blog, retrospective analyses of Warlords II consistently highlight:

- **Accessibility**: Simple rules that are easy to learn but strategically deep.
- **Map control**: The core gameplay loop is expansion → defense → elimination.
- **Hero progression**: Heroes as persistent RPG-like characters within a strategy game was innovative for 1993.
- **Replayability**: Random maps, scenario editor, and multiple factions.

### The "Warlords Feel" — What Players Remember

Based on reviews, forums, and retrospective articles, the essential Warlords II experience is:

1. **Land grab opening**: Frantic early expansion to claim neutral cities before opponents.
2. **Hero questing**: Sending heroes into dangerous ruins for game-changing artifacts.
3. **Continental warfare**: Armies clashing over chokepoints, mountain passes, and bridges.
4. **Diplomatic tension**: Balancing when to break alliances and when to maintain them.
5. **City economy**: Managing production queues across a growing empire.
6. **Fog of war**: Discovering the map gradually, uncertain of enemy positions.
7. **Stack combat**: Carefully composed army stacks fighting one-on-one within battles.
8. **Crescendo pacing**: Slow buildup → border skirmishes → full-scale continental war.

### Common Criticisms of Warlords II
- AI could be predictable in the original (improved in Deluxe).
- Late-game could become a grind when victory was inevitable but not yet achieved.
- Limited naval mechanics (units simply could not cross water without bridges/ports).

---

## 4. Screenshots and Video References

### World Map
- The strategic map uses a **top-down 2D tile grid** with terrain types: grass, forest, mountain, water, roads, bridges.
- Cities appear as small castle/fortress icons colored by faction.
- Neutral cities are grey.
- The map fills most of the screen with a sidebar for unit/city info.
- Roads connect cities and reduce movement cost.
- Water forms natural barriers — continents and islands separated by sea.

### City Screen
- Clicking a city shows: name, owner, defense level, garrison units, production queue.
- Production selection shows available unit types with their stats and build time.
- The city capture dialog shows four options: Occupy / Pillage / Sack / Raze.

### Combat Screen
- Combat shows attacker and defender side-by-side.
- Each round: one unit from each side fights. Dice rolls are displayed.
- The losing unit is destroyed. The surviving unit fights the next opponent.
- City defense bonus is shown when defending in a city.

### Hero and Ruin Screens
- Hero info shows: name, level, XP bar, strength, movement, inventory (equipped items).
- Ruin exploration shows a narrative text describing what was found.
- Dragon encounters show a combat sequence (hero STR + d6 vs dragon STR + d6).

### Gameplay Videos
- Search YouTube for "Warlords II gameplay" or "Warlords II Deluxe longplay" for full sessions showing the original game in action.
- Key things to observe: turn structure, movement UI, combat resolution, city management, fog of war behavior, diplomacy screens.

---

## 5. Canon Rules Summary

The most important original Warlords II rules, condensed:

| Rule | Detail |
|------|--------|
| Starting state | 1 city + 1 hero per faction; most cities neutral |
| City production | Continuous — automatically repeats after each unit built |
| Production variety | Each city offers up to 4 unit types (varies by city) |
| Heroes | Cannot be produced; must be hired. Level cap: 5. Carry items. |
| Ruins | Only heroes can search. Rewards: gold, artifact, ally, sage, dragon, nothing |
| Army stacking | Up to 8 units per tile |
| Combat | STR + d6 vs STR + d6 + city defense. Units fight 1v1 within stacks |
| City capture | Choose: Occupy / Pillage / Sack / Raze |
| City income | Cities generate gold per turn |
| Fog of war | Symmetric — AI and human see only explored/visible areas |
| Diplomacy | Allied / Neutral / At War states. Reputation tracking. |
| Victory | Control majority of cities (typically ≥50%) |
| Veterans | Regular units gain up to +4 STR from surviving battles |
| Hero items | Dropped on death; recoverable by other heroes |
| Map reveal | Sage ruin reward reveals part of the map |
| Production forwarding | Units can be sent to another city upon completion |

---

## 6. QA Usage Instructions

When reviewing new features or changes to Warlords 2026, compare them against the references in this file and the companion document [`WARLORDS2_CANON.md`](WARLORDS2_CANON.md). For each mechanic, identify whether the implementation is:

- **Faithful** — Matches original Warlords II behavior.
- **Slightly different** — Core concept is the same but details differ (e.g., different numbers, simplified version).
- **Significantly different** — The mechanic exists but works in a fundamentally different way.
- **Not compatible** — The implementation contradicts original Warlords II behavior.
- **Missing** — The mechanic from the original has not been implemented yet.

For every difference found, document:

1. **What the original behavior was** — cite the relevant section of this reference file.
2. **What the current implementation does** — cite the specific source file and line.
3. **Impact assessment** — how much does this difference affect the "Warlords feel"?
4. **Recommendation** — concrete steps to make the implementation more faithful.

### Priority Framework for Fixes

| Priority | Description | Examples |
|----------|-------------|---------|
| **P0 — Breaks Core Feel** | Missing mechanic that fundamentally changes gameplay | No fog of war, no AI, no diplomacy |
| **P1 — Major Gap** | Mechanic exists but works wrong in an impactful way | Production resets instead of repeating, no army stacking |
| **P2 — Minor Gap** | Small deviations from canon | Different XP thresholds, simplified ruin rewards |
| **P3 — Polish** | Cosmetic or trivial differences | Missing animations, UI layout differences |

### Cross-Reference Checklist

Use this checklist when reviewing any new feature:

- [ ] Does city production continuously repeat? (Section 1: City Production)
- [ ] Are heroes hired, not produced? (Section 1: Hero Levels)
- [ ] Is hero level capped at 5? (Section 1: Hero Levels)
- [ ] Do ruins offer all reward types including sage/map-reveal? (Section 1: Ruins)
- [ ] Does city capture offer 4 options? (Section 1: City Capture)
- [ ] Is army stacking supported (up to 8)? (Section 2: Army Stacking)
- [ ] Do cities generate gold income? (Section 2: Gold and Economy)
- [ ] Is fog of war active? (Section 5: Canon Rules)
- [ ] Is diplomacy functional? (Section 1: Diplomacy)
- [ ] Is victory condition checked? (Section 1: Victory Conditions)
- [ ] Do veteran units gain bonus strength? (Section 5: Canon Rules)
- [ ] Do dead heroes drop items? (Section 1: Hero Levels)
