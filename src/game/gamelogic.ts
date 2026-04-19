import type { Position, Unit, Tile, TerrainType, City, Faction, UnitType, CombatResult, Ruin, RuinResult, RuinRewardType } from './types'
import { TERRAIN_MOVE_COST, UNIT_TEMPLATES, MAP_WIDTH, MAP_HEIGHT, XP_PER_COMBAT_WIN, XP_PER_LEVEL, HERO_MAX_LEVEL, VICTORY_CITY_PERCENT } from './types'

export function isValidPosition(pos: Position): boolean {
  return pos.x >= 0 && pos.x < MAP_WIDTH && pos.y >= 0 && pos.y < MAP_HEIGHT
}

export function getMoveCost(terrain: TerrainType, faction?: Faction, onRoad?: boolean): number {
  // Roads always cost 1 move (regardless of terrain)
  if (onRoad) return 1
  const base = TERRAIN_MOVE_COST[terrain]
  // Elves: forest costs 1 instead of 2
  if (faction === 'elves' && terrain === 'forest') return 1
  return base
}

export function getMovementRange(
  unit: Unit,
  tiles: Tile[][],
  units: Unit[],
  ruins: Ruin[] = [],
  roadSet?: Set<string>
): Position[] {
  const reachable: Position[] = []
  const visited = new Map<string, number>()
  const queue: { x: number; y: number; remaining: number }[] = [
    { x: unit.x, y: unit.y, remaining: unit.movesLeft },
  ]
  visited.set(`${unit.x},${unit.y}`, unit.movesLeft)

  const directions = [
    { dx: 0, dy: -1 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 0 },
    { dx: 1, dy: 0 },
  ]

  while (queue.length > 0) {
    const current = queue.shift()!
    for (const { dx, dy } of directions) {
      const nx = current.x + dx
      const ny = current.y + dy
      if (!isValidPosition({ x: nx, y: ny })) continue

      const onRoad = roadSet?.has(`${nx},${ny}`) ?? false
      const cost = getMoveCost(tiles[ny][nx].terrain, unit.faction, onRoad)
      const remaining = current.remaining - cost
      if (remaining < 0) continue

      const key = `${nx},${ny}`
      const prev = visited.get(key)
      if (prev !== undefined && prev >= remaining) continue

      const occupied = units.find(
        (u) => u.x === nx && u.y === ny && u.id !== unit.id
      )
      if (occupied && occupied.faction === unit.faction) continue

      // Only heroes may enter unexplored ruins
      const ruinOnTile = ruins.find((r) => r.x === nx && r.y === ny && !r.explored)
      if (ruinOnTile && unit.unitType !== 'hero') continue
      
      visited.set(key, remaining)
      reachable.push({ x: nx, y: ny })
      // Don't path through enemy units — can attack but not pass
      if (occupied) continue
      // Don't path through unexplored ruins (hero stops there)
      if (ruinOnTile) continue
      queue.push({ x: nx, y: ny, remaining })
    }
  }

  // Deduplicate
  const seen = new Set<string>()
  return reachable.filter((p) => {
    const key = `${p.x},${p.y}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function generateMap(): Tile[][] {
  const seededRandom = (seed: number) => {
    let s = seed
    return () => {
      s = (s * 16807 + 0) % 2147483647
      return s / 2147483647
    }
  }

  const rand = seededRandom(42)

  // Deterministic hash for irregular coastline
  const coastHash = (x: number, y: number) =>
    ((x * 7919 + y * 104729 + x * y * 13) % 997) / 997

  const isLandTile = (x: number, y: number): boolean => {
    const edgeDist = Math.min(x, y, MAP_WIDTH - 1 - x, MAP_HEIGHT - 1 - y)
    if (edgeDist <= 1) return false
    if (edgeDist >= 5) return true
    const h = coastHash(x, y)
    if (edgeDist === 2) return h > 0.6
    if (edgeDist === 3) return h > 0.3
    return h > 0.1
  }

  // Mountain zones — strategic barriers, NOT on tutorial path
  const isMountainZone = (x: number, y: number): boolean =>
    (x >= 18 && x <= 22 && y >= 17 && y <= 21) ||  // Central range
    (x >= 9 && x <= 13 && y >= 11 && y <= 15) ||   // West range
    (x >= 28 && x <= 33 && y >= 12 && y <= 16) ||  // NE range
    (x >= 27 && x <= 31 && y >= 26 && y <= 30)     // SE range

  // Forest zones — movement penalties, visual variety
  const isForestZone = (x: number, y: number): boolean =>
    (x >= 3 && x <= 8 && y >= 25 && y <= 30) ||    // SW (near player)
    (x >= 3 && x <= 8 && y >= 10 && y <= 16) ||    // W
    (x >= 30 && x <= 36 && y >= 18 && y <= 23) ||  // E
    (x >= 24 && x <= 29 && y >= 33 && y <= 37) ||  // SE
    (x >= 22 && x <= 27 && y >= 4 && y <= 9) ||    // N
    (x >= 13 && x <= 17 && y >= 13 && y <= 17)     // Center-W

  const tiles: Tile[][] = []

  for (let y = 0; y < MAP_HEIGHT; y++) {
    const row: Tile[] = []
    for (let x = 0; x < MAP_WIDTH; x++) {
      if (!isLandTile(x, y)) {
        row.push({ terrain: 'water', x, y })
        continue
      }
      const r = rand()
      let terrain: TerrainType = 'grass'
      if (isMountainZone(x, y)) {
        terrain = r < 0.55 ? 'mountain' : r < 0.75 ? 'forest' : 'grass'
      } else if (isForestZone(x, y)) {
        terrain = r < 0.50 ? 'forest' : r < 0.58 ? 'mountain' : 'grass'
      } else {
        terrain = r < 0.04 ? 'mountain' : r < 0.12 ? 'forest' : 'grass'
      }
      row.push({ terrain, x, y })
    }
    tiles.push(row)
  }

  // Tutorial path: guaranteed grass from Player (SW) → Millford → Ruin → Thornwall → center
  const tutorialPath: number[][] = [
    // Player area
    [4,34],[5,34],[6,34],[5,33],[6,33],[4,33],[5,35],[6,35],[7,34],
    // Path to Millford (9,31)
    [7,33],[7,32],[8,32],[8,31],[9,31],[10,31],[9,30],
    // Path to Ruin (13,27)
    [10,30],[10,29],[11,29],[11,28],[12,28],[12,27],[13,27],[14,27],
    // Path to Thornwall (17,24)
    [14,26],[15,26],[15,25],[16,25],[16,24],[17,24],[17,23],[18,24],
    // Continue toward center Ashford (20,20)
    [18,23],[19,22],[19,21],[20,21],[20,20],[20,19],
  ]

  // All positions that must be walkable grass
  const clearPositions: number[][] = [
    ...tutorialPath,
    // Player city area (SW)
    ...[3,4,5,6,7].flatMap(x => [33,34,35,36].map(y => [x,y])),
    // Bane city area (NW)
    ...[3,4,5,6,7].flatMap(x => [4,5,6,7].map(y => [x,y])),
    // Orcs city area (NE)
    ...[32,33,34,35,36].flatMap(x => [4,5,6,7].map(y => [x,y])),
    // Elves city area (SE)
    ...[32,33,34,35,36].flatMap(x => [33,34,35,36].map(y => [x,y])),
    // Neutral city surroundings (1-tile radius)
    ...[8,9,10].flatMap(x => [30,31,32].map(y => [x,y])),   // Millford
    ...[16,17,18].flatMap(x => [23,24,25].map(y => [x,y])), // Thornwall
    ...[8,9,10].flatMap(x => [7,8,9].map(y => [x,y])),     // Goldcrest
    ...[23,24,25].flatMap(x => [7,8,9].map(y => [x,y])),   // Dawnhaven
    ...[30,31,32].flatMap(x => [9,10,11].map(y => [x,y])), // Ironkeep
    ...[24,25,26].flatMap(x => [15,16,17].map(y => [x,y])),// Blackmoor
    ...[19,20,21].flatMap(x => [19,20,21].map(y => [x,y])),// Ashford
    ...[13,14,15].flatMap(x => [15,16,17].map(y => [x,y])),// Lakeshire
    ...[30,31,32].flatMap(x => [30,31,32].map(y => [x,y])),// Wolfgate
    ...[23,24,25].flatMap(x => [30,31,32].map(y => [x,y])),// Mistfall
    ...[15,16,17].flatMap(x => [9,10,11].map(y => [x,y])), // Greywatch
    ...[19,20,21].flatMap(x => [30,31,32].map(y => [x,y])),// Dustvale
    // Ruin positions
    [13,27],[8,18],[28,7],[32,18],[18,33],[20,13],[27,27],[12,8],
  ]

  for (const [cx, cy] of clearPositions) {
    if (cx >= 0 && cx < MAP_WIDTH && cy >= 0 && cy < MAP_HEIGHT) {
      if (tiles[cy]?.[cx] && tiles[cy][cx].terrain !== 'water') {
        tiles[cy][cx].terrain = 'grass'
      }
    }
  }

  return tiles
}

export function createInitialUnits(): Unit[] {
  return [
    // Heroes — one per faction (near their capitals)
    { id: 'h1', faction: 'player', unitType: 'hero', x: 6, y: 33, movesLeft: 5, movesPerTurn: 5, strength: 4, name: 'Sir Galahad', experience: 0, level: 1, inventory: [] },
    { id: 'h2', faction: 'orcs', unitType: 'hero', x: 33, y: 6, movesLeft: 5, movesPerTurn: 5, strength: 4, name: 'Warchief Grom', experience: 0, level: 1, inventory: [] },
    { id: 'h3', faction: 'elves', unitType: 'hero', x: 33, y: 33, movesLeft: 5, movesPerTurn: 5, strength: 4, name: 'Araniel', experience: 0, level: 1, inventory: [] },
    { id: 'h4', faction: 'bane', unitType: 'hero', x: 6, y: 6, movesLeft: 5, movesPerTurn: 5, strength: 4, name: 'Lord Malachar', experience: 0, level: 1, inventory: [] },
    // Starting garrison
    { id: 'u1', faction: 'player', unitType: 'knight', x: 5, y: 33, movesLeft: 4, movesPerTurn: 4, strength: 6 },
    { id: 'u2', faction: 'player', unitType: 'militia', x: 4, y: 34, movesLeft: 3, movesPerTurn: 3, strength: 2 },
    { id: 'u3', faction: 'orcs', unitType: 'knight', x: 34, y: 6, movesLeft: 4, movesPerTurn: 4, strength: 5 },
    { id: 'u4', faction: 'orcs', unitType: 'militia', x: 35, y: 5, movesLeft: 3, movesPerTurn: 3, strength: 2 },
    { id: 'u5', faction: 'elves', unitType: 'archer', x: 35, y: 34, movesLeft: 3, movesPerTurn: 3, strength: 3 },
    { id: 'u6', faction: 'bane', unitType: 'archer', x: 4, y: 5, movesLeft: 3, movesPerTurn: 3, strength: 3 },
  ]
}

export function createInitialCities(): City[] {
  return [
    // Faction capitals (corners)
    { id: 'c1', name: 'Stormhold', x: 5, y: 34, owner: 'player', defense: 3, producing: null, turnsLeft: 0, isCapital: true },
    { id: 'c2', name: 'Gashnak', x: 34, y: 5, owner: 'orcs', defense: 3, producing: null, turnsLeft: 0, isCapital: true },
    { id: 'c3', name: 'Silvanthas', x: 34, y: 34, owner: 'elves', defense: 3, producing: null, turnsLeft: 0, isCapital: true },
    { id: 'c4', name: 'Shadowfane', x: 5, y: 5, owner: 'bane', defense: 3, producing: null, turnsLeft: 0, isCapital: true },
    // Tutorial path neutrals (near player)
    { id: 'c5', name: 'Millford', x: 9, y: 31, owner: null, defense: 1, producing: null, turnsLeft: 0 },
    { id: 'c6', name: 'Thornwall', x: 17, y: 24, owner: null, defense: 2, producing: null, turnsLeft: 0 },
    // Neutrals near other factions
    { id: 'c7', name: 'Goldcrest', x: 9, y: 8, owner: null, defense: 2, producing: null, turnsLeft: 0 },
    { id: 'c8', name: 'Dawnhaven', x: 24, y: 8, owner: null, defense: 2, producing: null, turnsLeft: 0 },
    { id: 'c9', name: 'Ironkeep', x: 31, y: 10, owner: null, defense: 2, producing: null, turnsLeft: 0 },
    { id: 'c10', name: 'Wolfgate', x: 31, y: 31, owner: null, defense: 2, producing: null, turnsLeft: 0 },
    // Center and mid-map neutrals
    { id: 'c11', name: 'Ashford', x: 20, y: 20, owner: null, defense: 2, producing: null, turnsLeft: 0 },
    { id: 'c12', name: 'Blackmoor', x: 25, y: 16, owner: null, defense: 2, producing: null, turnsLeft: 0 },
    { id: 'c13', name: 'Lakeshire', x: 14, y: 16, owner: null, defense: 1, producing: null, turnsLeft: 0 },
    { id: 'c14', name: 'Greywatch', x: 16, y: 10, owner: null, defense: 1, producing: null, turnsLeft: 0 },
    { id: 'c15', name: 'Mistfall', x: 24, y: 31, owner: null, defense: 1, producing: null, turnsLeft: 0 },
    { id: 'c16', name: 'Dustvale', x: 20, y: 31, owner: null, defense: 2, producing: null, turnsLeft: 0 },
  ]
}

export function findSpawnPosition(
  city: City,
  units: Unit[],
  tiles: Tile[][]
): Position | null {
  const directions = [
    { dx: 0, dy: -1 }, { dx: 1, dy: 0 },
    { dx: 0, dy: 1 }, { dx: -1, dy: 0 },
    { dx: 1, dy: -1 }, { dx: 1, dy: 1 },
    { dx: -1, dy: 1 }, { dx: -1, dy: -1 },
  ]
  for (const { dx, dy } of directions) {
    const nx = city.x + dx
    const ny = city.y + dy
    if (!isValidPosition({ x: nx, y: ny })) continue
    if (TERRAIN_MOVE_COST[tiles[ny][nx].terrain] === Infinity) continue
    if (units.some((u) => u.x === nx && u.y === ny)) continue
    return { x: nx, y: ny }
  }
  return null
}

let nextUnitId = 100

export function createUnit(
  faction: Faction,
  unitType: UnitType,
  pos: Position
): Unit {
  const template = UNIT_TEMPLATES[unitType]
  const id = `u${nextUnitId++}`
  // Humans: knights gain +1 STR
  const bonusStr = (faction === 'player' && unitType === 'knight') ? 1 : 0
  return {
    id,
    faction,
    unitType,
    x: pos.x,
    y: pos.y,
    movesLeft: 0,
    movesPerTurn: template.movesPerTurn,
    strength: template.strength + bonusStr,
  }
}

export function resolveCombat(
  attacker: Unit,
  defender: Unit,
  cities: City[]
): CombatResult {
  const attackRoll = Math.floor(Math.random() * 6) + 1
  const defendRoll = Math.floor(Math.random() * 6) + 1
  const city = cities.find(
    (c) => c.x === defender.x && c.y === defender.y
  )
  // Bane: +1 city defense bonus
  const baneBonus = (city && defender.faction === 'bane') ? 1 : 0
  const cityBonus = (city?.defense ?? 0) + baneBonus

  const attackTotal = attacker.strength + attackRoll
  const defendTotal = defender.strength + defendRoll + cityBonus

  const attackerWins = attackTotal > defendTotal
  const winnerIsHero = attackerWins
    ? attacker.unitType === 'hero'
    : defender.unitType === 'hero'

  return {
    attacker: {
      unitType: attacker.unitType,
      faction: attacker.faction,
      strength: attacker.strength,
      roll: attackRoll,
      total: attackTotal,
      name: attacker.name,
    },
    defender: {
      unitType: defender.unitType,
      faction: defender.faction,
      strength: defender.strength,
      roll: defendRoll,
      total: defendTotal,
      cityBonus,
      name: defender.name,
    },
    attackerWins,
    xpGained: winnerIsHero ? XP_PER_COMBAT_WIN : undefined,
  }
}

export function createInitialRuins(): Ruin[] {
  return [
    { id: 'r1', x: 13, y: 27, explored: false },  // Tutorial path — near player
    { id: 'r2', x: 8, y: 18, explored: false },   // West
    { id: 'r3', x: 28, y: 7, explored: false },   // NE near orcs
    { id: 'r4', x: 32, y: 18, explored: false },  // East
    { id: 'r5', x: 18, y: 33, explored: false },  // South near player
    { id: 'r6', x: 20, y: 13, explored: false },  // Center-north
    { id: 'r7', x: 27, y: 27, explored: false },  // SE area
    { id: 'r8', x: 12, y: 8, explored: false },   // NW near bane
  ]
}

const RUIN_REWARD_TYPES: RuinRewardType[] = ['gold', 'artifact', 'ally', 'dragon', 'nothing']

const ARTIFACTS = [
  { name: 'Sword of Might', effect: 'strength' as const, value: 2 },
  { name: 'Shield of Valor', effect: 'strength' as const, value: 1 },
  { name: 'Boots of Speed', effect: 'moves' as const, value: 1 },
  { name: 'Ring of Power', effect: 'xp' as const, value: 80 },
  { name: 'War Banner', effect: 'strength' as const, value: 1 },
]

const DRAGON_STRENGTH = 8

export function exploreRuin(
  hero: Unit,
  units: Unit[],
  tiles: Tile[][]
): { result: RuinResult; updatedHero: Unit; spawnedUnit: Unit | null; heroKilled: boolean } {
  const type = RUIN_REWARD_TYPES[Math.floor(Math.random() * RUIN_REWARD_TYPES.length)]
  let updatedHero = { ...hero }
  let spawnedUnit: Unit | null = null
  let heroKilled = false

  const heroName = hero.name ?? 'Hero'

  if (type === 'gold') {
    const goldAmount = (Math.floor(Math.random() * 3) + 1) * 50 // 50, 100, or 150
    return {
      result: {
        heroName,
        type: 'gold',
        description: `Found a treasure chest containing ${goldAmount} gold!`,
        goldAmount,
      },
      updatedHero,
      spawnedUnit: null,
      heroKilled: false,
    }
  }

  if (type === 'artifact') {
    const artifact = ARTIFACTS[Math.floor(Math.random() * ARTIFACTS.length)]
    updatedHero = { ...updatedHero, inventory: [...(updatedHero.inventory ?? []), artifact.name] }
    if (artifact.effect === 'strength') {
      updatedHero = { ...updatedHero, strength: updatedHero.strength + artifact.value }
    } else if (artifact.effect === 'moves') {
      updatedHero = { ...updatedHero, movesPerTurn: updatedHero.movesPerTurn + artifact.value }
    } else if (artifact.effect === 'xp') {
      updatedHero = grantXp(updatedHero, artifact.value)
    }
    const effectDesc = artifact.effect === 'strength'
      ? `+${artifact.value} STR`
      : artifact.effect === 'moves'
        ? `+${artifact.value} Move`
        : `+${artifact.value} XP`
    return {
      result: {
        heroName,
        type: 'artifact',
        description: `Found ${artifact.name}! (${effectDesc})`,
        artifactName: artifact.name,
      },
      updatedHero,
      spawnedUnit: null,
      heroKilled: false,
    }
  }

  if (type === 'ally') {
    const allyTypes: UnitType[] = ['militia', 'archer', 'knight']
    const allyType = allyTypes[Math.floor(Math.random() * allyTypes.length)]
    const spawnPos = findAdjacentSpawn(hero, units, tiles)
    if (spawnPos) {
      spawnedUnit = createUnit(hero.faction, allyType, spawnPos)
    }
    return {
      result: {
        heroName,
        type: 'ally',
        description: spawnPos
          ? `A ${allyType} pledges loyalty and joins your army!`
          : `Warriors wished to join, but there was no room nearby.`,
        allyType: spawnPos ? allyType : undefined,
      },
      updatedHero,
      spawnedUnit,
      heroKilled: false,
    }
  }

  if (type === 'dragon') {
    const heroRoll = Math.floor(Math.random() * 6) + 1
    const dragonRoll = Math.floor(Math.random() * 6) + 1
    const heroTotal = hero.strength + heroRoll
    const dragonTotal = DRAGON_STRENGTH + dragonRoll
    const defeated = heroTotal > dragonTotal

    if (defeated) {
      updatedHero = grantXp(updatedHero, 50)
    } else {
      heroKilled = true
    }

    return {
      result: {
        heroName,
        type: 'dragon',
        description: defeated
          ? `Defeated the dragon guardian! (${heroTotal} vs ${dragonTotal}) +50 XP`
          : `The dragon was too powerful! (${heroTotal} vs ${dragonTotal}) ${heroName} has fallen!`,
        dragonDefeated: defeated,
        dragonStrength: DRAGON_STRENGTH,
        heroRoll,
        dragonRoll,
      },
      updatedHero: defeated ? updatedHero : hero,
      spawnedUnit: null,
      heroKilled,
    }
  }

  // nothing
  return {
    result: {
      heroName,
      type: 'nothing',
      description: 'The ruin is empty. Nothing of value was found.',
    },
    updatedHero,
    spawnedUnit: null,
    heroKilled: false,
  }
}

function findAdjacentSpawn(unit: Unit, units: Unit[], tiles: Tile[][]): Position | null {
  const directions = [
    { dx: 0, dy: -1 }, { dx: 1, dy: 0 },
    { dx: 0, dy: 1 }, { dx: -1, dy: 0 },
    { dx: 1, dy: -1 }, { dx: 1, dy: 1 },
    { dx: -1, dy: 1 }, { dx: -1, dy: -1 },
  ]
  for (const { dx, dy } of directions) {
    const nx = unit.x + dx
    const ny = unit.y + dy
    if (!isValidPosition({ x: nx, y: ny })) continue
    if (TERRAIN_MOVE_COST[tiles[ny][nx].terrain] === Infinity) continue
    if (units.some((u) => u.x === nx && u.y === ny)) continue
    return { x: nx, y: ny }
  }
  return null
}

export function grantXp(hero: Unit, amount: number): Unit {
  const level = hero.level ?? 1
  // Hero level cap per canon rules
  if (level >= HERO_MAX_LEVEL) return hero

  const xp = (hero.experience ?? 0) + amount
  const rawLevel = Math.floor(xp / XP_PER_LEVEL) + 1
  const newLevel = Math.min(rawLevel, HERO_MAX_LEVEL)
  const levelsGained = newLevel - level

  return {
    ...hero,
    experience: xp,
    level: newLevel,
    strength: hero.strength + levelsGained,
  }
}

// --- Victory check ---
export function checkVictory(cities: City[]): Faction | null {
  const totalCities = cities.length
  const threshold = Math.ceil(totalCities * VICTORY_CITY_PERCENT)
  const counts: Partial<Record<Faction, number>> = {}

  for (const city of cities) {
    if (city.owner) {
      counts[city.owner] = (counts[city.owner] ?? 0) + 1
    }
  }

  for (const [faction, count] of Object.entries(counts)) {
    if (count >= threshold) return faction as Faction
  }
  return null
}

// --- Simple AI: move units toward nearest enemy city, attack if adjacent ---
export function runAiTurn(
  faction: Faction,
  units: Unit[],
  cities: City[],
  tiles: Tile[][],
  ruins: Ruin[]
): { units: Unit[]; cities: City[]; combatOccurred: boolean } {
  let currentUnits = [...units]
  let currentCities = [...cities]
  let combatOccurred = false

  // Set production for idle owned cities
  currentCities = currentCities.map((c) => {
    if (c.owner !== faction || c.producing) return c
    return { ...c, producing: 'knight' as UnitType, turnsLeft: UNIT_TEMPLATES.knight.productionTurns }
  })

  const myUnits = currentUnits.filter((u) => u.faction === faction && u.movesLeft > 0)

  for (const unit of myUnits) {
    const targetCity = findNearestTargetCity(unit, currentCities, faction)
    if (!targetCity) continue

    let movesRemaining = unit.movesLeft
    let currentX = unit.x
    let currentY = unit.y
    let unitAlive = true

    while (movesRemaining > 0 && unitAlive) {
      const dx = Math.sign(targetCity.x - currentX)
      const dy = Math.sign(targetCity.y - currentY)

      const candidates = [
        { nx: currentX + dx, ny: currentY + dy },
        { nx: currentX + dx, ny: currentY },
        { nx: currentX, ny: currentY + dy },
      ].filter((c) => c.nx !== currentX || c.ny !== currentY)

      let moved = false
      for (const { nx, ny } of candidates) {
        if (!isValidPosition({ x: nx, y: ny })) continue
        const cost = getMoveCost(tiles[ny][nx].terrain, faction)
        if (cost > movesRemaining || cost === Infinity) continue

        const occupant = currentUnits.find((u) => u.x === nx && u.y === ny)
        if (occupant && occupant.faction === faction) continue

        if (occupant && occupant.faction !== faction) {
          const result = resolveCombat(unit, occupant, currentCities)
          combatOccurred = true
          if (result.attackerWins) {
            currentUnits = currentUnits.filter((u) => u.id !== occupant.id)
            currentX = nx
            currentY = ny
            currentCities = currentCities.map((c) =>
              c.x === nx && c.y === ny && c.owner !== faction
                ? { ...c, owner: faction, producing: null, turnsLeft: 0 }
                : c
            )
          } else {
            currentUnits = currentUnits.filter((u) => u.id !== unit.id)
            unitAlive = false
          }
          movesRemaining = 0
          moved = true
          break
        }

        const ruinHere = ruins.find((r) => r.x === nx && r.y === ny && !r.explored)
        if (ruinHere && unit.unitType !== 'hero') continue

        currentX = nx
        currentY = ny
        movesRemaining -= cost

        currentCities = currentCities.map((c) =>
          c.x === nx && c.y === ny && c.owner !== faction
            ? { ...c, owner: faction, producing: null, turnsLeft: 0 }
            : c
        )
        moved = true
        break
      }

      if (!moved) break
    }

    if (unitAlive) {
      currentUnits = currentUnits.map((u) =>
        u.id === unit.id ? { ...u, x: currentX, y: currentY, movesLeft: 0 } : u
      )
    }
  }

  return { units: currentUnits, cities: currentCities, combatOccurred }
}

function findNearestTargetCity(
  unit: Unit,
  cities: City[],
  faction: Faction
): City | null {
  let best: City | null = null
  let bestDist = Infinity

  for (const city of cities) {
    if (city.owner === faction) continue
    const dist = Math.abs(city.x - unit.x) + Math.abs(city.y - unit.y)
    if (dist < bestDist) {
      bestDist = dist
      best = city
    }
  }
  return best
}
