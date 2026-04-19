# Create directories
# docs/VISUAL_STYLE.md
@"
# Visual Style

Goal:
A modern remake of Warlords II with the original rules.

Graphics:
- Modern fantasy strategy style
- Large detailed cities
- Smaller armies
- Distinct faction colors
- Dark fantasy atmosphere
- Slightly angled top-down camera
- Smooth animations

Inspiration:
- Songs of Conquest
- Age of Wonders 4
- Northgard

Factions:
- Humans: stone castles and blue banners
- Orcs: wood, spikes and fire
- Elves: white towers and forests
- Lord Bane: dark stone and purple light
"@ | Set-Content docs\VISUAL_STYLE.md

# docs/FACTIONS.md
@"
# Factions

## Humans
- Stronger knights
- Balanced economy

## Orcs
- Cheap militia
- Larger armies

## Elves
- Faster movement in forests
- Strong archers

## Lord Bane
- Strong city defenses
- Powerful elite units
"@ | Set-Content docs\FACTIONS.md

# docs/UNITS.md
@"
# Units

## Militia
- Attack: 2
- Defense: 2
- Move: 2

## Archer
- Attack: 3
- Defense: 1
- Move: 2

## Knight
- Attack: 4
- Defense: 3
- Move: 4

## Hero
- Attack: 5
- Defense: 4
- Move: 5
- Can explore ruins
"@ | Set-Content docs\UNITS.md

# docs/HEROES_AND_RUINS.md
@"
# Heroes and Ruins

Heroes can:
- Gain experience
- Carry artifacts
- Explore ruins
- Receive quests

Ruins can contain:
- Gold
- Artifact
- Dragon ally
- New unit
- Nothing
"@ | Set-Content docs\HEROES_AND_RUINS.md

Write-Host "AI and documentation files created successfully."