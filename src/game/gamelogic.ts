import type { Position, Unit, Tile, TerrainType, City, Faction, UnitType, CombatResult, Ruin, RuinResult, RuinRewardType } from './types'
import { TERRAIN_MOVE_COST, UNIT_TEMPLATES, MAP_WIDTH, MAP_HEIGHT, XP_PER_COMBAT_WIN, XP_PER_LEVEL } from './types'

export function isValidPosition(pos: Position): boolean {
  return pos.x >= 0 && pos.x < MAP_WIDTH && pos.y >= 0 && pos.y < MAP_HEIGHT
}

export function getMoveCost(terrain: TerrainType, faction?: Faction): number {
  const base = TERRAIN_MOVE_COST[terrain]
  // Elves: forest costs 1 instead of 2
  if (faction === 'elves' && terrain === 'forest') return 1
  return base
}

export function getMovementRange(
  unit: Unit,
  tiles: Tile[][],
  units: Unit[],
  ruins: Ruin[] = []
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

      const cost = getMoveCost(tiles[ny][nx].terrain, unit.faction)
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

  // Continental shape inspired by Warlords II — two main landmasses
  // connected by a narrow isthmus, surrounded by ocean
  const LAND: number[][] = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,0],
    [0,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
    [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0],
    [0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,1,1,1,0,0,1,1,1,0,0,0,0,0,0],
    [0,0,0,0,1,1,1,1,0,0,0,0,1,1,1,1,0,0,0,0],
    [0,0,0,1,1,1,1,1,0,0,0,1,1,1,1,1,1,0,0,0],
    [0,0,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,0],
    [0,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,0],
    [0,0,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,0,0],
    [0,0,0,1,1,1,0,0,0,0,0,0,0,0,1,1,1,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ]

  // Mountain zones
  const isMountainZone = (x: number, y: number): boolean =>
    (y >= 4 && y <= 5 && x >= 6 && x <= 8) ||
    (y >= 3 && y <= 4 && x >= 14 && x <= 16) ||
    (y >= 7 && y <= 8 && x >= 8 && x <= 10) ||
    (y >= 13 && y <= 14 && x >= 9 && x <= 11)

  // Forest zones
  const isForestZone = (x: number, y: number): boolean =>
    (y >= 2 && y <= 4 && x >= 2 && x <= 5) ||
    (y >= 1 && y <= 3 && x >= 12 && x <= 14) ||
    (y >= 5 && y <= 7 && x >= 4 && x <= 7) ||
    (y >= 14 && y <= 17 && x >= 2 && x <= 5) ||
    (y >= 14 && y <= 17 && x >= 14 && x <= 17) ||
    (y >= 12 && y <= 14 && x >= 5 && x <= 8)

  const tiles: Tile[][] = []

  for (let y = 0; y < MAP_HEIGHT; y++) {
    const row: Tile[] = []
    for (let x = 0; x < MAP_WIDTH; x++) {
      if (LAND[y][x] === 0) {
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
        terrain = r < 0.05 ? 'mountain' : r < 0.15 ? 'forest' : 'grass'
      }
      row.push({ terrain, x, y })
    }
    tiles.push(row)
  }

  // Ensure cities, ruins, and starting positions are walkable grass
  const clearPositions = [
    // Faction cities + surroundings
    [3,2],[2,1],[3,1],[4,1],[2,2],[4,2],[2,3],[3,3],[4,3],
    [16,2],[15,1],[16,1],[17,1],[15,2],[17,2],[15,3],[16,3],[17,3],
    [3,15],[2,14],[3,14],[4,14],[2,15],[4,15],[2,16],[3,16],[4,16],
    [16,15],[15,14],[16,14],[17,14],[15,15],[17,15],[15,16],[16,16],[17,16],
    // Neutral cities
    [5,1],[14,1],[7,3],[12,3],[4,5],[14,4],[9,7],[6,10],[13,10],[6,13],[14,13],[9,14],
    // Ruins
    [5,3],[14,5],[8,8],[5,11],[13,11],[10,14],
  ]
  for (const [cx, cy] of clearPositions) {
    if (cx >= 0 && cx < MAP_WIDTH && cy >= 0 && cy < MAP_HEIGHT && LAND[cy][cx] === 1) {
      tiles[cy][cx].terrain = 'grass'
    }
  }

  return tiles
}

export function createInitialUnits(): Unit[] {
  return [
    // Heroes — one per faction
    { id: 'h1', faction: 'player', unitType: 'hero', x: 4, y: 3, movesLeft: 5, movesPerTurn: 5, strength: 4, name: 'Sir Galahad', experience: 0, level: 1, inventory: [] },
    { id: 'h2', faction: 'orcs', unitType: 'hero', x: 15, y: 16, movesLeft: 5, movesPerTurn: 5, strength: 4, name: 'Warchief Grom', experience: 0, level: 1, inventory: [] },
    { id: 'h3', faction: 'elves', unitType: 'hero', x: 4, y: 16, movesLeft: 5, movesPerTurn: 5, strength: 4, name: 'Araniel', experience: 0, level: 1, inventory: [] },
    { id: 'h4', faction: 'bane', unitType: 'hero', x: 15, y: 3, movesLeft: 5, movesPerTurn: 5, strength: 4, name: 'Lord Malachar', experience: 0, level: 1, inventory: [] },
    // Regular units
    { id: 'u1', faction: 'player', unitType: 'knight', x: 3, y: 2, movesLeft: 4, movesPerTurn: 4, strength: 6 },
    { id: 'u2', faction: 'player', unitType: 'militia', x: 2, y: 2, movesLeft: 3, movesPerTurn: 3, strength: 2 },
    { id: 'u3', faction: 'orcs', unitType: 'knight', x: 16, y: 15, movesLeft: 4, movesPerTurn: 4, strength: 5 },
    { id: 'u4', faction: 'orcs', unitType: 'militia', x: 17, y: 16, movesLeft: 3, movesPerTurn: 3, strength: 2 },
    { id: 'u5', faction: 'elves', unitType: 'archer', x: 2, y: 15, movesLeft: 3, movesPerTurn: 3, strength: 3 },
    { id: 'u6', faction: 'bane', unitType: 'archer', x: 17, y: 2, movesLeft: 3, movesPerTurn: 3, strength: 3 },
  ]
}

export function createInitialCities(): City[] {
  return [
    // Faction starting cities
    { id: 'c1', name: 'Stormhold', x: 3, y: 2, owner: 'player', defense: 3, producing: null, turnsLeft: 0 },
    { id: 'c2', name: 'Gashnak', x: 16, y: 15, owner: 'orcs', defense: 3, producing: null, turnsLeft: 0 },
    { id: 'c3', name: 'Silvanthas', x: 3, y: 15, owner: 'elves', defense: 3, producing: null, turnsLeft: 0 },
    { id: 'c4', name: 'Shadowfane', x: 16, y: 2, owner: 'bane', defense: 3, producing: null, turnsLeft: 0 },
    // Neutral cities spread across the continents
    { id: 'c5', name: 'Millford', x: 5, y: 1, owner: null, defense: 2, producing: null, turnsLeft: 0 },
    { id: 'c6', name: 'Goldcrest', x: 14, y: 1, owner: null, defense: 2, producing: null, turnsLeft: 0 },
    { id: 'c7', name: 'Thornwall', x: 7, y: 3, owner: null, defense: 2, producing: null, turnsLeft: 0 },
    { id: 'c8', name: 'Dawnhaven', x: 12, y: 3, owner: null, defense: 2, producing: null, turnsLeft: 0 },
    { id: 'c9', name: 'Blackmoor', x: 4, y: 5, owner: null, defense: 2, producing: null, turnsLeft: 0 },
    { id: 'c10', name: 'Ironkeep', x: 14, y: 4, owner: null, defense: 2, producing: null, turnsLeft: 0 },
    { id: 'c11', name: 'Ashford', x: 9, y: 7, owner: null, defense: 2, producing: null, turnsLeft: 0 },
    { id: 'c12', name: 'Lakeshire', x: 6, y: 10, owner: null, defense: 1, producing: null, turnsLeft: 0 },
    { id: 'c13', name: 'Greywatch', x: 13, y: 10, owner: null, defense: 1, producing: null, turnsLeft: 0 },
    { id: 'c14', name: 'Wolfgate', x: 6, y: 13, owner: null, defense: 1, producing: null, turnsLeft: 0 },
    { id: 'c15', name: 'Mistfall', x: 14, y: 13, owner: null, defense: 1, producing: null, turnsLeft: 0 },
    { id: 'c16', name: 'Dustvale', x: 9, y: 14, owner: null, defense: 2, producing: null, turnsLeft: 0 },
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
    { id: 'r1', x: 5, y: 3, explored: false },
    { id: 'r2', x: 14, y: 5, explored: false },
    { id: 'r3', x: 8, y: 8, explored: false },
    { id: 'r4', x: 5, y: 11, explored: false },
    { id: 'r5', x: 13, y: 11, explored: false },
    { id: 'r6', x: 10, y: 14, explored: false },
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
  const xp = (hero.experience ?? 0) + amount
  const level = hero.level ?? 1
  const newLevel = Math.floor(xp / XP_PER_LEVEL) + 1
  const levelsGained = newLevel - level

  return {
    ...hero,
    experience: xp,
    level: newLevel,
    strength: hero.strength + levelsGained,
  }
}
