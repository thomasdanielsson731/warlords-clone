// Script to regenerate all game source files
const fs = require('fs');
const path = require('path');

const SRC = 'c:/dev/warlords/src';

function write(relPath, content) {
  const full = path.join(SRC, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('Wrote', relPath);
}

// ═══════════════════════════════════════════════════════════════════════════
// types.ts — already correct, skip
// ═══════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════
// gamelogic.ts
// ═══════════════════════════════════════════════════════════════════════════
write('game/gamelogic.ts', `import type { Tile, Unit, City, Faction, UnitType, Position, Ruin, CombatResult, RuinResult } from './types'
import {
  MAP_WIDTH, MAP_HEIGHT, TERRAIN_MOVE_COST, UNIT_TEMPLATES,
  XP_PER_COMBAT_WIN, XP_PER_LEVEL, HERO_MAX_LEVEL, DRAGON_STRENGTH,
  HERO_NAMES, ARTIFACT_NAMES, VICTORY_CITY_PERCENT,
} from './types'

// ── Seeded RNG ────────────────────────────────────────────────────────────
function seededRandom(seed: number): () => number {
  let s = seed
  return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646 }
}

// ── Position helpers ──────────────────────────────────────────────────────
export function isValidPosition(p: Position): boolean {
  return p.x >= 0 && p.x < MAP_WIDTH && p.y >= 0 && p.y < MAP_HEIGHT
}

// ── Movement cost (faction + road aware) ──────────────────────────────────
export function getMoveCost(terrain: string, faction: Faction, onRoad = false): number {
  if (onRoad && terrain !== 'water') return 1
  const base = TERRAIN_MOVE_COST[terrain as keyof typeof TERRAIN_MOVE_COST] ?? Infinity
  if (faction === 'elves' && terrain === 'forest') return 1
  return base
}

// ── Movement range (BFS) ─────────────────────────────────────────────────
export function getMovementRange(
  unit: Unit, tiles: Tile[][], allUnits: Unit[], ruins: Ruin[], roadSet?: Set<string>
): Position[] {
  const reachable: Position[] = []
  const visited = new Map<string, number>()
  const queue: { x: number; y: number; cost: number }[] = [{ x: unit.x, y: unit.y, cost: 0 }]
  visited.set(\`\${unit.x},\${unit.y}\`, 0)
  const dirs = [{ dx: 0, dy: -1 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }, { dx: 1, dy: 0 }]

  while (queue.length > 0) {
    const cur = queue.shift()!
    for (const { dx, dy } of dirs) {
      const nx = cur.x + dx, ny = cur.y + dy
      if (nx < 0 || nx >= MAP_WIDTH || ny < 0 || ny >= MAP_HEIGHT) continue
      const onRoad = roadSet?.has(\`\${nx},\${ny}\`) ?? false
      const cost = getMoveCost(tiles[ny][nx].terrain, unit.faction, onRoad)
      if (cost === Infinity) continue
      const total = cur.cost + cost
      if (total > unit.movesLeft) continue
      const key = \`\${nx},\${ny}\`
      const prev = visited.get(key)
      if (prev !== undefined && prev <= total) continue

      const occupant = allUnits.find(u => u.x === nx && u.y === ny && u.id !== unit.id)
      if (occupant && occupant.faction === unit.faction) continue
      const ruinHere = ruins.find(r => r.x === nx && r.y === ny && !r.explored)
      if (ruinHere && unit.unitType !== 'hero') continue

      visited.set(key, total)
      reachable.push({ x: nx, y: ny })
      if (!occupant) queue.push({ x: nx, y: ny, cost: total })
    }
  }
  return reachable
}

// ── Map generation (seeded, with tutorial-friendly path) ──────────────────
export function generateMap(seed = 42): Tile[][] {
  const rng = seededRandom(seed)
  const tiles: Tile[][] = []

  const noise = (x: number, y: number, scale: number) => {
    const sx = Math.sin(x * scale + seed) * 43758.5453
    const sy = Math.sin(y * scale + seed * 1.3) * 22578.1459
    return (Math.sin(sx + sy) + 1) / 2
  }

  for (let y = 0; y < MAP_HEIGHT; y++) {
    const row: Tile[] = []
    for (let x = 0; x < MAP_WIDTH; x++) {
      const n1 = noise(x, y, 0.15)
      const n2 = noise(x, y, 0.3) * 0.5
      const n3 = noise(x + 100, y + 100, 0.08) * 0.3
      const val = n1 + n2 + n3

      let terrain: import('./types').TerrainType = 'grass'
      if (val > 1.35) terrain = 'mountain'
      else if (val > 1.0) terrain = 'forest'
      else if (val < 0.35) terrain = 'water'

      const edgeDist = Math.min(x, y, MAP_WIDTH - 1 - x, MAP_HEIGHT - 1 - y)
      if (edgeDist <= 1) terrain = 'water'
      else if (edgeDist <= 2 && rng() > 0.5) terrain = 'water'

      row.push({ terrain, x, y })
    }
    tiles.push(row)
  }

  // Carve tutorial path: grass corridor from player start (SW) toward center
  const tutorialPath = [
    { x: 5, y: 34 }, { x: 6, y: 33 }, { x: 7, y: 32 }, { x: 8, y: 31 },
    { x: 9, y: 30 }, { x: 10, y: 29 }, { x: 11, y: 28 }, { x: 12, y: 27 },
    { x: 13, y: 26 }, { x: 14, y: 25 }, { x: 15, y: 24 }, { x: 16, y: 23 },
    { x: 17, y: 22 }, { x: 18, y: 21 }, { x: 19, y: 20 },
  ]
  for (const p of tutorialPath) {
    if (p.x >= 0 && p.x < MAP_WIDTH && p.y >= 0 && p.y < MAP_HEIGHT) {
      tiles[p.y][p.x].terrain = 'grass'
      for (const d of [{ dx: 1, dy: 0 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }, { dx: 0, dy: -1 }]) {
        const nx = p.x + d.dx, ny = p.y + d.dy
        if (nx >= 2 && nx < MAP_WIDTH - 2 && ny >= 2 && ny < MAP_HEIGHT - 2) {
          if (tiles[ny][nx].terrain === 'mountain' || tiles[ny][nx].terrain === 'water') {
            tiles[ny][nx].terrain = 'grass'
          }
        }
      }
    }
  }

  // Ensure city positions are passable
  const cityPositions = [
    [5,34],[35,5],[5,5],[35,34],
    [8,29],[12,25],[18,18],[22,18],
    [20,20],[25,15],[15,15],[30,10],[10,10],[28,28],[15,30],[30,25],
  ]
  for (const [cx, cy] of cityPositions) {
    if (cx >= 0 && cx < MAP_WIDTH && cy >= 0 && cy < MAP_HEIGHT) {
      tiles[cy][cx].terrain = 'grass'
      for (const d of [{ dx: 1, dy: 0 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }, { dx: 0, dy: -1 }]) {
        const nx = cx + d.dx, ny = cy + d.dy
        if (nx >= 0 && nx < MAP_WIDTH && ny >= 0 && ny < MAP_HEIGHT && tiles[ny][nx].terrain === 'water') {
          tiles[ny][nx].terrain = 'grass'
        }
      }
    }
  }

  return tiles
}

// ── City creation ─────────────────────────────────────────────────────────
const CITY_DEFS: { id: string; name: string; x: number; y: number; owner: Faction | null; isCapital?: boolean }[] = [
  { id: 'c1', name: 'Stormhold',     x: 5,  y: 34, owner: 'player', isCapital: true },
  { id: 'c2', name: "Grom's Keep",   x: 35, y: 5,  owner: 'orcs',   isCapital: true },
  { id: 'c3', name: 'Silverwood',    x: 5,  y: 5,  owner: 'elves',  isCapital: true },
  { id: 'c4', name: 'Shadowspire',   x: 35, y: 34, owner: 'bane',   isCapital: true },
  { id: 'c5', name: 'Millford',      x: 8,  y: 29, owner: null },
  { id: 'c6', name: 'Thornwall',     x: 12, y: 25, owner: null },
  { id: 'c7', name: 'Goldvein',      x: 20, y: 20, owner: null },
  { id: 'c8', name: 'Greenwatch',    x: 10, y: 10, owner: null },
  { id: 'c9', name: 'Ironhold',      x: 25, y: 15, owner: null },
  { id: 'c10', name: 'Briarhaven',   x: 15, y: 15, owner: null },
  { id: 'c11', name: "Trader's Rest", x: 18, y: 18, owner: null },
  { id: 'c12', name: 'Valorheim',    x: 22, y: 18, owner: null },
  { id: 'c13', name: 'Lakemere',     x: 15, y: 30, owner: null },
  { id: 'c14', name: 'Highwatch',    x: 30, y: 10, owner: null },
  { id: 'c15', name: 'Moonhallow',   x: 28, y: 28, owner: null },
  { id: 'c16', name: 'Dusthold',     x: 30, y: 25, owner: null },
]

export function createInitialCities(): City[] {
  return CITY_DEFS.map(d => ({
    ...d,
    defense: d.isCapital ? 3 : 2,
    producing: d.owner ? 'militia' as UnitType : null,
    turnsLeft: d.owner ? UNIT_TEMPLATES.militia.productionTurns : 0,
  }))
}

// ── Ruins ─────────────────────────────────────────────────────────────────
const RUIN_DEFS = [
  { id: 'r1', x: 10, y: 27 }, { id: 'r2', x: 30, y: 8 },
  { id: 'r3', x: 8,  y: 8 },  { id: 'r4', x: 32, y: 32 },
  { id: 'r5', x: 20, y: 10 }, { id: 'r6', x: 20, y: 30 },
  { id: 'r7', x: 14, y: 20 }, { id: 'r8', x: 26, y: 20 },
]

export function createInitialRuins(): Ruin[] {
  return RUIN_DEFS.map(d => ({ ...d, explored: false }))
}

// ── Unit creation ─────────────────────────────────────────────────────────
let unitCounter = 0
export function createUnit(faction: Faction, unitType: UnitType, pos: Position): Unit {
  const tpl = UNIT_TEMPLATES[unitType]
  return {
    id: \`u-\${faction}-\${unitType}-\${++unitCounter}-\${Date.now()}\`,
    faction, unitType,
    x: pos.x, y: pos.y,
    strength: tpl.strength,
    movesLeft: tpl.movesPerTurn,
    movesPerTurn: tpl.movesPerTurn,
    ...(unitType === 'hero' ? { name: HERO_NAMES[faction][0], experience: 0, level: 1, inventory: [] } : {}),
  }
}

export function createInitialUnits(): Unit[] {
  unitCounter = 0
  const units: Unit[] = []
  const factionStarts: Record<Faction, Position> = {
    player: { x: 5, y: 34 }, orcs: { x: 35, y: 5 },
    elves: { x: 5, y: 5 }, bane: { x: 35, y: 34 },
  }
  const factions: Faction[] = ['player', 'orcs', 'elves', 'bane']

  for (const f of factions) {
    const s = factionStarts[f]
    const hero = createUnit(f, 'hero', { x: s.x, y: s.y })
    hero.name = HERO_NAMES[f][0]
    units.push(hero)
    units.push(createUnit(f, 'knight', { x: s.x + 1, y: s.y }))
    units.push(createUnit(f, 'militia', { x: s.x, y: s.y + (f === 'player' || f === 'bane' ? -1 : 1) }))
  }
  return units
}

// ── Find spawn position near city ─────────────────────────────────────────
export function findSpawnPosition(city: City, units: Unit[], tiles: Tile[][]): Position | null {
  const dirs = [
    { dx: 0, dy: -1 }, { dx: 1, dy: 0 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 },
    { dx: 1, dy: -1 }, { dx: 1, dy: 1 }, { dx: -1, dy: 1 }, { dx: -1, dy: -1 },
  ]
  for (const { dx, dy } of dirs) {
    const nx = city.x + dx, ny = city.y + dy
    if (!isValidPosition({ x: nx, y: ny })) continue
    if (TERRAIN_MOVE_COST[tiles[ny][nx].terrain] === Infinity) continue
    if (units.some(u => u.x === nx && u.y === ny)) continue
    return { x: nx, y: ny }
  }
  return null
}

// ── Combat ────────────────────────────────────────────────────────────────
export function resolveCombat(attacker: Unit, defender: Unit, cities: City[]): CombatResult {
  const atkRoll = Math.floor(Math.random() * 6) + 1
  const defRoll = Math.floor(Math.random() * 6) + 1
  const cityOnTile = cities.find(c => c.x === defender.x && c.y === defender.y)
  const cityBonus = cityOnTile ? cityOnTile.defense : 0
  const atkTotal = attacker.strength + atkRoll
  const defTotal = defender.strength + defRoll + cityBonus
  const attackerWins = atkTotal > defTotal
  const xpGained = XP_PER_COMBAT_WIN

  return {
    attacker: { unitType: attacker.unitType, faction: attacker.faction, strength: attacker.strength, roll: atkRoll, total: atkTotal, name: attacker.name },
    defender: { unitType: defender.unitType, faction: defender.faction, strength: defender.strength, roll: defRoll, total: defTotal, cityBonus, name: defender.name },
    attackerWins,
    xpGained,
  }
}

// ── Ruin exploration ──────────────────────────────────────────────────────
export function exploreRuin(hero: Unit, allUnits: Unit[], tiles: Tile[][]): {
  result: RuinResult; updatedHero: Unit; spawnedUnit: Unit | null; heroKilled: boolean
} {
  const heroName = hero.name ?? 'Hero'
  let updatedHero = { ...hero }
  const roll = Math.random()
  let type: import('./types').RuinRewardType

  if (roll < 0.25) type = 'gold'
  else if (roll < 0.45) type = 'artifact'
  else if (roll < 0.65) type = 'ally'
  else if (roll < 0.80) type = 'dragon'
  else type = 'nothing'

  if (type === 'gold') {
    const amount = (Math.floor(Math.random() * 5) + 1) * 50
    updatedHero = grantXp(updatedHero, 20)
    return {
      result: { heroName, type: 'gold', description: \`Found \${amount} gold! +20 XP\`, goldAmount: amount },
      updatedHero, spawnedUnit: null, heroKilled: false,
    }
  }

  if (type === 'artifact') {
    const name = ARTIFACT_NAMES[Math.floor(Math.random() * ARTIFACT_NAMES.length)]
    updatedHero = { ...updatedHero, inventory: [...(updatedHero.inventory ?? []), name], strength: updatedHero.strength + 1 }
    updatedHero = grantXp(updatedHero, 25)
    return {
      result: { heroName, type: 'artifact', description: \`Found \${name}! +1 STR, +25 XP\`, artifactName: name },
      updatedHero, spawnedUnit: null, heroKilled: false,
    }
  }

  if (type === 'ally') {
    const allyTypes: UnitType[] = ['militia', 'archer', 'knight']
    const allyType = allyTypes[Math.floor(Math.random() * allyTypes.length)]
    const spawnPos = findAdjacentSpawn(hero, allUnits, tiles)
    const spawnedUnit = spawnPos ? createUnit(hero.faction, allyType, spawnPos) : null
    updatedHero = grantXp(updatedHero, 15)
    return {
      result: { heroName, type: 'ally', description: spawnPos ? \`A \${allyType} pledges loyalty! +15 XP\` : 'Warriors wished to join, but no room nearby.', allyType: spawnPos ? allyType : undefined },
      updatedHero, spawnedUnit, heroKilled: false,
    }
  }

  if (type === 'dragon') {
    const heroRoll = Math.floor(Math.random() * 6) + 1
    const dragonRoll = Math.floor(Math.random() * 6) + 1
    const heroTotal = hero.strength + heroRoll
    const dragonTotal = DRAGON_STRENGTH + dragonRoll
    const defeated = heroTotal > dragonTotal
    return {
      result: {
        heroName, type: 'dragon',
        description: defeated
          ? \`Defeated the dragon! (\${heroTotal} vs \${dragonTotal}) +50 XP\`
          : \`The dragon was too powerful! (\${heroTotal} vs \${dragonTotal}) \${heroName} has fallen!\`,
        dragonDefeated: defeated, dragonStrength: DRAGON_STRENGTH, heroRoll, dragonRoll,
      },
      updatedHero: defeated ? grantXp(updatedHero, 50) : hero,
      spawnedUnit: null, heroKilled: !defeated,
    }
  }

  return {
    result: { heroName, type: 'nothing', description: 'The ruin is empty. Nothing of value was found.' },
    updatedHero, spawnedUnit: null, heroKilled: false,
  }
}

function findAdjacentSpawn(unit: Unit, units: Unit[], tiles: Tile[][]): Position | null {
  const dirs = [
    { dx: 0, dy: -1 }, { dx: 1, dy: 0 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 },
    { dx: 1, dy: -1 }, { dx: 1, dy: 1 }, { dx: -1, dy: 1 }, { dx: -1, dy: -1 },
  ]
  for (const { dx, dy } of dirs) {
    const nx = unit.x + dx, ny = unit.y + dy
    if (!isValidPosition({ x: nx, y: ny })) continue
    if (TERRAIN_MOVE_COST[tiles[ny][nx].terrain] === Infinity) continue
    if (units.some(u => u.x === nx && u.y === ny)) continue
    return { x: nx, y: ny }
  }
  return null
}

// ── XP / Leveling ─────────────────────────────────────────────────────────
export function grantXp(hero: Unit, amount: number): Unit {
  const level = hero.level ?? 1
  if (level >= HERO_MAX_LEVEL) return hero
  const xp = (hero.experience ?? 0) + amount
  const newLevel = Math.min(Math.floor(xp / XP_PER_LEVEL) + 1, HERO_MAX_LEVEL)
  const gained = newLevel - level
  return { ...hero, experience: xp, level: newLevel, strength: hero.strength + gained }
}

// ── Victory check ─────────────────────────────────────────────────────────
export function checkVictory(cities: City[]): Faction | null {
  const threshold = Math.ceil(cities.length * VICTORY_CITY_PERCENT)
  const counts: Partial<Record<Faction, number>> = {}
  for (const c of cities) {
    if (c.owner) counts[c.owner] = (counts[c.owner] ?? 0) + 1
  }
  for (const [faction, count] of Object.entries(counts)) {
    if (count >= threshold) return faction as Faction
  }
  return null
}

// ── AI turn ───────────────────────────────────────────────────────────────
export function runAiTurn(
  faction: Faction, units: Unit[], cities: City[], tiles: Tile[][], ruins: Ruin[]
): { units: Unit[]; cities: City[]; combatOccurred: boolean } {
  let curUnits = [...units]
  let curCities = [...cities]
  let combatOccurred = false

  curCities = curCities.map(c => {
    if (c.owner !== faction || c.producing) return c
    return { ...c, producing: 'knight' as UnitType, turnsLeft: UNIT_TEMPLATES.knight.productionTurns }
  })

  const myUnits = curUnits.filter(u => u.faction === faction && u.movesLeft > 0)
  for (const unit of myUnits) {
    const target = findNearestTargetCity(unit, curCities, faction)
    if (!target) continue

    let moves = unit.movesLeft, cx = unit.x, cy = unit.y, alive = true

    while (moves > 0 && alive) {
      const dx = Math.sign(target.x - cx)
      const dy = Math.sign(target.y - cy)
      const candidates = [
        { nx: cx + dx, ny: cy + dy }, { nx: cx + dx, ny: cy }, { nx: cx, ny: cy + dy },
      ].filter(c => c.nx !== cx || c.ny !== cy)

      let moved = false
      for (const { nx, ny } of candidates) {
        if (!isValidPosition({ x: nx, y: ny })) continue
        const cost = getMoveCost(tiles[ny][nx].terrain, faction)
        if (cost > moves || cost === Infinity) continue

        const occupant = curUnits.find(u => u.x === nx && u.y === ny)
        if (occupant && occupant.faction === faction) continue

        if (occupant && occupant.faction !== faction) {
          const result = resolveCombat(unit, occupant, curCities)
          combatOccurred = true
          if (result.attackerWins) {
            curUnits = curUnits.filter(u => u.id !== occupant.id)
            cx = nx; cy = ny
            curCities = curCities.map(c =>
              c.x === nx && c.y === ny && c.owner !== faction
                ? { ...c, owner: faction, producing: null, turnsLeft: 0 } : c
            )
          } else {
            curUnits = curUnits.filter(u => u.id !== unit.id)
            alive = false
          }
          moves = 0; moved = true; break
        }

        const ruinHere = ruins.find(r => r.x === nx && r.y === ny && !r.explored)
        if (ruinHere && unit.unitType !== 'hero') continue

        cx = nx; cy = ny; moves -= cost
        curCities = curCities.map(c =>
          c.x === nx && c.y === ny && c.owner !== faction
            ? { ...c, owner: faction, producing: null, turnsLeft: 0 } : c
        )
        moved = true; break
      }
      if (!moved) break
    }

    if (alive) {
      curUnits = curUnits.map(u => u.id === unit.id ? { ...u, x: cx, y: cy, movesLeft: 0 } : u)
    }
  }

  return { units: curUnits, cities: curCities, combatOccurred }
}

function findNearestTargetCity(unit: Unit, cities: City[], faction: Faction): City | null {
  let best: City | null = null, bestDist = Infinity
  for (const c of cities) {
    if (c.owner === faction) continue
    const d = Math.abs(c.x - unit.x) + Math.abs(c.y - unit.y)
    if (d < bestDist) { bestDist = d; best = c }
  }
  return best
}
`);

console.log('gamelogic.ts done');
