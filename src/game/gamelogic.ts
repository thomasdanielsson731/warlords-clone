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
  const tiles: Tile[][] = []

  for (let y = 0; y < MAP_HEIGHT; y++) {
    const row: Tile[] = []
    for (let x = 0; x < MAP_WIDTH; x++) {
      const r = rand()
      let terrain: TerrainType = 'grass'
      if (r < 0.15) terrain = 'forest'
      else if (r < 0.22) terrain = 'mountain'
      else if (r < 0.28) terrain = 'water'
      row.push({ terrain, x, y })
    }
    tiles.push(row)
  }

  // Ensure starting positions are grass
  const starts = [
    [2, 2],
    [17, 17],
    [2, 17],
    [17, 2],
  ]
  for (const [sx, sy] of starts) {
    tiles[sy][sx].terrain = 'grass'
    // Clear adjacent tiles too
    for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
      const nx = sx + dx
      const ny = sy + dy
      if (nx >= 0 && nx < MAP_WIDTH && ny >= 0 && ny < MAP_HEIGHT) {
        if (tiles[ny][nx].terrain === 'water') {
          tiles[ny][nx].terrain = 'grass'
        }
      }
    }
  }

  // Ensure all city positions are grass
  const cityPositions = [
    [6,3],[13,4],[4,8],[15,9],[9,6],[10,13],
    [7,11],[12,10],[5,15],[14,16],[10,2],[9,17],
  ]
  for (const [cx, cy] of cityPositions) {
    tiles[cy][cx].terrain = 'grass'
  }

  // Ensure all ruin positions are walkable
  const ruinPositions = [
    [5, 5], [14, 6], [8, 9], [11, 14], [3, 13], [16, 12],
  ]
  for (const [rx, ry] of ruinPositions) {
    if (tiles[ry][rx].terrain === 'water') {
      tiles[ry][rx].terrain = 'grass'
    }
  }

  return tiles
}

export function createInitialUnits(): Unit[] {
  return [
    // Heroes — one per faction
    { id: 'h1', faction: 'player', unitType: 'hero', x: 2, y: 3, movesLeft: 5, movesPerTurn: 5, strength: 4, name: 'Sir Galahad', experience: 0, level: 1, inventory: [] },
    { id: 'h2', faction: 'orcs', unitType: 'hero', x: 17, y: 16, movesLeft: 5, movesPerTurn: 5, strength: 4, name: 'Warchief Grom', experience: 0, level: 1, inventory: [] },
    { id: 'h3', faction: 'elves', unitType: 'hero', x: 3, y: 17, movesLeft: 5, movesPerTurn: 5, strength: 4, name: 'Araniel', experience: 0, level: 1, inventory: [] },
    { id: 'h4', faction: 'bane', unitType: 'hero', x: 16, y: 2, movesLeft: 5, movesPerTurn: 5, strength: 4, name: 'Lord Malachar', experience: 0, level: 1, inventory: [] },
    // Regular units
    { id: 'u1', faction: 'player', unitType: 'knight', x: 2, y: 2, movesLeft: 4, movesPerTurn: 4, strength: 6 },
    { id: 'u2', faction: 'player', unitType: 'militia', x: 3, y: 2, movesLeft: 3, movesPerTurn: 3, strength: 2 },
    { id: 'u3', faction: 'orcs', unitType: 'knight', x: 17, y: 17, movesLeft: 4, movesPerTurn: 4, strength: 5 },
    { id: 'u4', faction: 'orcs', unitType: 'militia', x: 16, y: 17, movesLeft: 3, movesPerTurn: 3, strength: 2 },
    { id: 'u5', faction: 'elves', unitType: 'archer', x: 2, y: 17, movesLeft: 3, movesPerTurn: 3, strength: 3 },
    { id: 'u6', faction: 'bane', unitType: 'archer', x: 17, y: 2, movesLeft: 3, movesPerTurn: 3, strength: 3 },
  ]
}

export function createInitialCities(): City[] {
  return [
    // Faction starting cities (near starting units)
    { id: 'c1', name: 'Stormhold', x: 2, y: 2, owner: 'player', defense: 3, producing: null, turnsLeft: 0 },
    { id: 'c2', name: 'Gashnak', x: 17, y: 17, owner: 'orcs', defense: 3, producing: null, turnsLeft: 0 },
    { id: 'c3', name: 'Silvanthas', x: 2, y: 17, owner: 'elves', defense: 3, producing: null, turnsLeft: 0 },
    { id: 'c4', name: 'Shadowfane', x: 17, y: 2, owner: 'bane', defense: 3, producing: null, turnsLeft: 0 },
    // Neutral cities spread across the map
    { id: 'c5', name: 'Millford', x: 6, y: 3, owner: null, defense: 2, producing: null, turnsLeft: 0 },
    { id: 'c6', name: 'Thornwall', x: 13, y: 4, owner: null, defense: 2, producing: null, turnsLeft: 0 },
    { id: 'c7', name: 'Dawnhaven', x: 4, y: 8, owner: null, defense: 2, producing: null, turnsLeft: 0 },
    { id: 'c8', name: 'Ironkeep', x: 15, y: 9, owner: null, defense: 2, producing: null, turnsLeft: 0 },
    { id: 'c9', name: 'Blackmoor', x: 9, y: 6, owner: null, defense: 2, producing: null, turnsLeft: 0 },
    { id: 'c10', name: 'Greywatch', x: 10, y: 13, owner: null, defense: 2, producing: null, turnsLeft: 0 },
    { id: 'c11', name: 'Lakeshire', x: 7, y: 11, owner: null, defense: 1, producing: null, turnsLeft: 0 },
    { id: 'c12', name: 'Ashford', x: 12, y: 10, owner: null, defense: 1, producing: null, turnsLeft: 0 },
    { id: 'c13', name: 'Mistfall', x: 5, y: 15, owner: null, defense: 1, producing: null, turnsLeft: 0 },
    { id: 'c14', name: 'Dustvale', x: 14, y: 16, owner: null, defense: 1, producing: null, turnsLeft: 0 },
    { id: 'c15', name: 'Goldcrest', x: 10, y: 2, owner: null, defense: 2, producing: null, turnsLeft: 0 },
    { id: 'c16', name: 'Wolfgate', x: 9, y: 17, owner: null, defense: 2, producing: null, turnsLeft: 0 },
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
    { id: 'r1', x: 5, y: 5, explored: false },
    { id: 'r2', x: 14, y: 6, explored: false },
    { id: 'r3', x: 8, y: 9, explored: false },
    { id: 'r4', x: 11, y: 14, explored: false },
    { id: 'r5', x: 3, y: 13, explored: false },
    { id: 'r6', x: 16, y: 12, explored: false },
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
