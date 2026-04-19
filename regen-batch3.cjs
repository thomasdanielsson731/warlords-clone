// Regeneration script — batch 3: components + CSS + App
const fs = require('fs');
const path = require('path');
const SRC = 'c:/dev/warlords/src';

function write(relPath, content) {
  const full = path.join(SRC, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('Wrote', relPath, '—', content.split('\n').length, 'lines');
}

// ═══════════════════════════════════════════════════════════════════════════
// GameBoard.tsx
// ═══════════════════════════════════════════════════════════════════════════
write('components/GameBoard.tsx', `import { useGameStore } from '../game/store'
import { FACTION_COLORS, NEUTRAL_COLOR, UNIT_TEMPLATES, FACTION_BONUSES, CITY_BONUSES } from '../game/types'
import type { UnitType } from '../game/types'
import GameScene from '../scene/GameScene'
import KingdomOverview from './KingdomOverview'
import TutorialPanel from './TutorialPanel'
import '../styles/GameBoard.css'

export default function GameBoard() {
  const currentFaction = useGameStore((s) => s.currentFaction)
  const turnNumber = useGameStore((s) => s.turnNumber)
  const selectedUnitId = useGameStore((s) => s.selectedUnitId)
  const selectedCityId = useGameStore((s) => s.selectedCityId)
  const units = useGameStore((s) => s.units)
  const cities = useGameStore((s) => s.cities)
  const endTurn = useGameStore((s) => s.endTurn)
  const setProduction = useGameStore((s) => s.setProduction)
  const combatResult = useGameStore((s) => s.combatResult)
  const dismissCombat = useGameStore((s) => s.dismissCombat)
  const ruinResult = useGameStore((s) => s.ruinResult)
  const dismissRuinResult = useGameStore((s) => s.dismissRuinResult)
  const gold = useGameStore((s) => s.gold)
  const victor = useGameStore((s) => s.victor)

  const selectedUnit = units.find((u) => u.id === selectedUnitId)
  const selectedCity = cities.find((c) => c.id === selectedCityId)
  const factionUnits = units.filter((u) => u.faction === currentFaction)
  const factionCities = cities.filter((c) => c.owner === currentFaction)

  return (
    <div className="game-board">
      <div className="game-info">
        <h1>Warlords 2026</h1>
        <div className="status">
          <p>Turn: <span className="turn-number">{turnNumber}</span></p>
          <p>
            Faction:{' '}
            <span className="faction-label" style={{ backgroundColor: FACTION_COLORS[currentFaction] }}>
              {currentFaction.toUpperCase()}
            </span>
          </p>
          <p>
            Gold: <span className="gold-amount">\u{1F4B0} {gold[currentFaction]}</span>
            <span className="gold-income"> (+{factionCities.length + factionCities.reduce((sum, c) => {
              const b = CITY_BONUSES[c.id]
              return sum + (b?.type === 'gold' ? b.value : 0)
            }, 0)}/turn)</span>
          </p>
          <div className="faction-bonus">
            <span className="bonus-label">{FACTION_BONUSES[currentFaction].label}</span>
            <span className="bonus-desc">{FACTION_BONUSES[currentFaction].description}</span>
          </div>
        </div>

        {selectedUnit && (
          <div className="unit-info">
            <h3>{selectedUnit.unitType === 'hero' ? \`\u2605 \${selectedUnit.name}\` : 'Selected Unit'}</h3>
            {selectedUnit.unitType === 'hero' && (
              <>
                <p>Level: {selectedUnit.level}</p>
                <p>XP: {selectedUnit.experience}/{(selectedUnit.level ?? 1) * 100}</p>
              </>
            )}
            <p>Strength: {selectedUnit.strength}</p>
            <p>Moves: {selectedUnit.movesLeft}/{selectedUnit.movesPerTurn}</p>
            <p>Position: ({selectedUnit.x}, {selectedUnit.y})</p>
            {selectedUnit.unitType === 'hero' && selectedUnit.inventory && selectedUnit.inventory.length > 0 && (
              <div className="hero-inventory">
                <p className="inventory-label">Inventory:</p>
                {selectedUnit.inventory.map((item, i) => (
                  <span key={i} className="inventory-item">{item}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedCity && (
          <div className="city-info">
            <h3>
              <span
                className="city-owner-dot"
                style={{
                  backgroundColor: selectedCity.owner
                    ? FACTION_COLORS[selectedCity.owner]
                    : NEUTRAL_COLOR,
                }}
              />
              {selectedCity.name}
              {selectedCity.isCapital && <span className="capital-badge">\u2605 Capital</span>}
            </h3>
            <p>Owner: {selectedCity.owner ?? 'Neutral'}</p>
            <p>Defense: {selectedCity.defense}</p>
            <p>Position: ({selectedCity.x}, {selectedCity.y})</p>
            {CITY_BONUSES[selectedCity.id] && (
              <div className="city-bonus-info">
                <span className="city-bonus-icon">{CITY_BONUSES[selectedCity.id].icon}</span>
                <div className="city-bonus-text">
                  <strong>{CITY_BONUSES[selectedCity.id].label}</strong>
                  <p>{CITY_BONUSES[selectedCity.id].description}</p>
                </div>
              </div>
            )}
            {selectedCity.producing && (
              <p className="production-status">
                Producing: {selectedCity.producing} ({selectedCity.turnsLeft} turn
                {selectedCity.turnsLeft !== 1 ? 's' : ''})
                <button className="cancel-production" onClick={() => setProduction(selectedCity.id, null)}>\u2715</button>
              </p>
            )}
            {!selectedCity.producing && selectedCity.owner === currentFaction && (
              <div className="production-buttons">
                <p className="production-label">Produce:</p>
                {(['militia', 'archer', 'knight'] as UnitType[]).map((type) => {
                  const t = UNIT_TEMPLATES[type]
                  let turns = t.productionTurns
                  let str = t.strength
                  if (currentFaction === 'orcs' && type === 'militia') turns = 0
                  if (currentFaction === 'player' && type === 'knight') str += 1
                  return (
                    <button key={type} className="produce-btn" onClick={() => setProduction(selectedCity.id, type)}>
                      {type} <span className="produce-stats">STR {str} \u00B7 {turns}T</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}

        <div className="faction-units">
          <h3>Cities ({factionCities.length})</h3>
          <h3 style={{ marginTop: 8 }}>Units ({factionUnits.length})</h3>
          {factionUnits.map((u) => (
            <div
              key={u.id}
              className={\`unit-entry\${u.id === selectedUnitId ? ' active' : ''}\${u.unitType === 'hero' ? ' hero-entry' : ''}\`}
            >
              {u.unitType === 'hero' ? \`\u2605 \${u.name} L\${u.level}\` : \`\${u.unitType}\`} \u2014 STR {u.strength} \u2014 Moves: {u.movesLeft}
            </div>
          ))}
        </div>

        <button className="end-turn-button" onClick={endTurn}>End Turn</button>
      </div>

      <div className="map-container">
        <GameScene />
        <KingdomOverview />
        <TutorialPanel />
      </div>

      {combatResult && (
        <div className="combat-overlay" onClick={dismissCombat}>
          <div className="combat-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Combat!</h2>
            <div className="combat-sides">
              <div className={\`combat-side\${combatResult.attackerWins ? ' winner' : ' loser'}\`}>
                <span className="combat-label">Attacker</span>
                <span className="combat-faction" style={{ color: FACTION_COLORS[combatResult.attacker.faction] }}>
                  {combatResult.attacker.faction}
                </span>
                <span className="combat-unit">
                  {combatResult.attacker.name ?? combatResult.attacker.unitType}
                </span>
                <span className="combat-calc">
                  STR {combatResult.attacker.strength} + \u{1F3B2} {combatResult.attacker.roll} = <strong>{combatResult.attacker.total}</strong>
                </span>
              </div>
              <div className="combat-vs">VS</div>
              <div className={\`combat-side\${!combatResult.attackerWins ? ' winner' : ' loser'}\`}>
                <span className="combat-label">Defender</span>
                <span className="combat-faction" style={{ color: FACTION_COLORS[combatResult.defender.faction] }}>
                  {combatResult.defender.faction}
                </span>
                <span className="combat-unit">
                  {combatResult.defender.name ?? combatResult.defender.unitType}
                </span>
                <span className="combat-calc">
                  STR {combatResult.defender.strength} + \u{1F3B2} {combatResult.defender.roll}
                  {combatResult.defender.cityBonus > 0 && \` + \u{1F3F0} \${combatResult.defender.cityBonus}\`}
                  {' '}= <strong>{combatResult.defender.total}</strong>
                </span>
              </div>
            </div>
            <p className="combat-outcome">
              {combatResult.attackerWins ? 'Attacker wins!' : 'Defender wins!'}
              {combatResult.xpGained != null && (
                <span className="xp-gained"> (+{combatResult.xpGained} XP)</span>
              )}
            </p>
            <button className="combat-dismiss" onClick={dismissCombat}>OK</button>
          </div>
        </div>
      )}

      {ruinResult && (
        <div className="combat-overlay" onClick={dismissRuinResult}>
          <div className="combat-modal ruin-modal" onClick={(e) => e.stopPropagation()}>
            <h2>\u{1F3DA}\uFE0F Ruin Explored!</h2>
            <p className="ruin-hero">{ruinResult.heroName}</p>
            <p className={\`ruin-reward ruin-\${ruinResult.type}\`}>
              {ruinResult.type === 'gold' && '\u{1F4B0} '}
              {ruinResult.type === 'artifact' && '\u2694\uFE0F '}
              {ruinResult.type === 'ally' && '\u{1F91D} '}
              {ruinResult.type === 'dragon' && '\u{1F409} '}
              {ruinResult.type === 'nothing' && '\u{1F4A8} '}
              {ruinResult.description}
            </p>
            <button className="combat-dismiss" onClick={dismissRuinResult}>OK</button>
          </div>
        </div>
      )}

      {victor && (
        <div className="combat-overlay">
          <div className="combat-modal victory-modal">
            <h2>\u{1F3C6} Victory!</h2>
            <p className="victory-faction" style={{ color: FACTION_COLORS[victor] }}>
              {victor.toUpperCase()} conquers the realm!
            </p>
            <p className="victory-turn">Achieved on turn {turnNumber}</p>
            <button className="combat-dismiss" onClick={() => window.location.reload()}>New Game</button>
          </div>
        </div>
      )}
    </div>
  )
}
`);

// ═══════════════════════════════════════════════════════════════════════════
// KingdomOverview.tsx
// ═══════════════════════════════════════════════════════════════════════════
write('components/KingdomOverview.tsx', `import { useState } from 'react'
import { useGameStore } from '../game/store'
import { FACTION_COLORS, FACTION_BONUSES, VICTORY_CITY_PERCENT } from '../game/types'
import type { Faction } from '../game/types'
import '../styles/KingdomOverview.css'

const FACTION_DISPLAY: Record<Faction, { name: string; icon: string; banner: string }> = {
  player: { name: 'Kingdom of Stormhold', icon: '\u{1F981}', banner: '\u2694\uFE0F' },
  orcs: { name: 'Orcish Horde', icon: '\u{1F417}', banner: '\u{1FA93}' },
  elves: { name: 'Elvish Dominion', icon: '\u{1F98C}', banner: '\u{1F3F9}' },
  bane: { name: 'Cult of Bane', icon: '\u{1F409}', banner: '\u{1F480}' },
}

const ALL_FACTIONS: Faction[] = ['player', 'orcs', 'elves', 'bane']

interface FactionStats {
  faction: Faction
  cityCount: number
  unitCount: number
  totalStrength: number
  heroCount: number
  gold: number
  power: number
}

export default function KingdomOverview() {
  const [open, setOpen] = useState(false)
  const units = useGameStore((s) => s.units)
  const cities = useGameStore((s) => s.cities)
  const gold = useGameStore((s) => s.gold)
  const turnNumber = useGameStore((s) => s.turnNumber)

  const totalCities = cities.length
  const citiesToWin = Math.ceil(totalCities * VICTORY_CITY_PERCENT)

  const stats: FactionStats[] = ALL_FACTIONS.map((faction) => {
    const fUnits = units.filter((u) => u.faction === faction)
    const fCities = cities.filter((c) => c.owner === faction)
    const totalStrength = fUnits.reduce((sum, u) => sum + u.strength, 0)
    const heroCount = fUnits.filter((u) => u.unitType === 'hero').length
    return {
      faction, cityCount: fCities.length, unitCount: fUnits.length,
      totalStrength, heroCount, gold: gold[faction],
      power: totalStrength + fCities.length * 5 + heroCount * 8,
    }
  }).sort((a, b) => b.power - a.power)

  if (!open) {
    return (
      <button className="ko-toggle" onClick={() => setOpen(true)} title="Kingdom Overview">
        \u{1F451}
      </button>
    )
  }

  return (
    <div className="ko-overlay" onClick={() => setOpen(false)}>
      <div className="ko-panel" onClick={(e) => e.stopPropagation()}>
        <div className="ko-header">
          <span className="ko-crown">\u{1F451}</span>
          <h2>Kingdom Overview</h2>
          <span className="ko-turn">Turn {turnNumber}</span>
          <button className="ko-close" onClick={() => setOpen(false)}>\u2715</button>
        </div>

        <div className="ko-objective">
          Capture <strong>{citiesToWin}</strong> of {totalCities} cities to claim victory
        </div>

        <div className="ko-grid">
          {stats.map((s, rank) => {
            const display = FACTION_DISPLAY[s.faction]
            const color = FACTION_COLORS[s.faction]
            const isPlayer = s.faction === 'player'
            const progress = totalCities > 0 ? s.cityCount / totalCities : 0

            return (
              <div
                key={s.faction}
                className={\`ko-card\${isPlayer ? ' ko-card-player' : ''}\`}
                style={{ '--faction-color': color } as React.CSSProperties}
              >
                <div className="ko-card-rank">#{rank + 1}</div>

                <div className="ko-card-banner" style={{ background: \`linear-gradient(135deg, \${color}22 0%, \${color}08 100%)\` }}>
                  <span className="ko-card-icon">{display.icon}</span>
                  <div className="ko-card-title">
                    <span className="ko-card-name">{display.name}</span>
                    <span className="ko-card-bonus" style={{ color }}>
                      {display.banner} {FACTION_BONUSES[s.faction].label}
                    </span>
                  </div>
                  {isPlayer && <span className="ko-card-you">YOU</span>}
                </div>

                <div className="ko-card-stats">
                  <div className="ko-stat">
                    <span className="ko-stat-icon">\u{1F3F0}</span>
                    <span className="ko-stat-label">Cities</span>
                    <span className="ko-stat-value">{s.cityCount}</span>
                  </div>
                  <div className="ko-stat">
                    <span className="ko-stat-icon">\u2694\uFE0F</span>
                    <span className="ko-stat-label">Units</span>
                    <span className="ko-stat-value">{s.unitCount}</span>
                  </div>
                  <div className="ko-stat">
                    <span className="ko-stat-icon">\u{1F4AA}</span>
                    <span className="ko-stat-label">Strength</span>
                    <span className="ko-stat-value">{s.totalStrength}</span>
                  </div>
                  <div className="ko-stat">
                    <span className="ko-stat-icon">\u{1F4B0}</span>
                    <span className="ko-stat-label">Gold</span>
                    <span className="ko-stat-value">{s.gold}</span>
                  </div>
                  <div className="ko-stat">
                    <span className="ko-stat-icon">\u2605</span>
                    <span className="ko-stat-label">Heroes</span>
                    <span className="ko-stat-value">{s.heroCount}</span>
                  </div>
                </div>

                <div className="ko-card-progress">
                  <div className="ko-progress-bar">
                    <div className="ko-progress-fill" style={{ width: \`\${progress * 100}%\`, backgroundColor: color }} />
                  </div>
                  <span className="ko-progress-text">{s.cityCount}/{citiesToWin} to win</span>
                </div>
              </div>
            )
          })}
        </div>

        <div className="ko-footer">
          <span className="ko-footer-text">Neutral cities: {cities.filter((c) => c.owner === null).length}</span>
        </div>
      </div>
    </div>
  )
}
`);

// ═══════════════════════════════════════════════════════════════════════════
// TutorialPanel.tsx
// ═══════════════════════════════════════════════════════════════════════════
write('components/TutorialPanel.tsx', `import { useGameStore } from '../game/store'
import { TUTORIAL_STEPS, TUTORIAL_TOPICS } from '../game/tutorial'
import '../styles/TutorialPanel.css'

export default function TutorialPanel() {
  const tutorialStep = useGameStore((s) => s.tutorialStep)
  const tutorialDismissed = useGameStore((s) => s.tutorialDismissed)
  const dismissTutorial = useGameStore((s) => s.dismissTutorial)
  const turnNumber = useGameStore((s) => s.turnNumber)

  if (tutorialDismissed || turnNumber > 5) return null

  const currentStep = TUTORIAL_STEPS[tutorialStep] ?? null
  const allDone = tutorialStep >= TUTORIAL_STEPS.length

  return (
    <div className="tutorial-panel">
      <div className="tutorial-header">
        <span className="tutorial-title">\u{1F4DC} First Steps</span>
        <button className="tutorial-dismiss" onClick={dismissTutorial} title="Dismiss tutorial">\u2715</button>
      </div>

      {currentStep && !allDone && (
        <div className="tutorial-objective">
          <span className="tutorial-obj-icon">{currentStep.icon}</span>
          <div className="tutorial-obj-text">
            <strong>{currentStep.title}</strong>
            <p>{currentStep.description}</p>
          </div>
        </div>
      )}

      {allDone && (
        <div className="tutorial-complete">
          <span className="tutorial-obj-icon">\u{1F389}</span>
          <div className="tutorial-obj-text">
            <strong>Tutorial Complete!</strong>
            <p>You know the basics. Now conquer the realm!</p>
          </div>
        </div>
      )}

      <div className="tutorial-progress">
        {TUTORIAL_STEPS.map((step, i) => (
          <div
            key={step.id}
            className={\`tutorial-dot\${i < tutorialStep ? ' done' : i === tutorialStep ? ' active' : ''}\`}
            title={step.title}
          />
        ))}
      </div>

      <div className="tutorial-topics">
        {TUTORIAL_TOPICS.map((topic) => (
          <div key={topic.title} className="tutorial-topic">
            <span className="topic-icon">{topic.icon}</span>
            <div className="topic-text">
              <strong>{topic.title}</strong>
              <p>{topic.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
`);

// ═══════════════════════════════════════════════════════════════════════════
// MapView.tsx
// ═══════════════════════════════════════════════════════════════════════════
write('components/MapView.tsx', `import { useGameStore } from '../game/store'
import type { TerrainType } from '../game/types'
import { FACTION_COLORS, NEUTRAL_COLOR, MAP_WIDTH, MAP_HEIGHT } from '../game/types'
import '../styles/Map.css'

const TILE_SIZE = 32

const TERRAIN_STYLES: Record<TerrainType, { bg: string; label: string }> = {
  grass: { bg: '#4a8f4a', label: '' },
  forest: { bg: '#2d6b2d', label: '\u2663' },
  mountain: { bg: '#8a7a6a', label: '\u25B2' },
  water: { bg: '#3366aa', label: '~' },
}

export default function MapView() {
  const tiles = useGameStore((s) => s.tiles)
  const units = useGameStore((s) => s.units)
  const cities = useGameStore((s) => s.cities)
  const ruins = useGameStore((s) => s.ruins)
  const selectedUnitId = useGameStore((s) => s.selectedUnitId)
  const selectedCityId = useGameStore((s) => s.selectedCityId)
  const movementRange = useGameStore((s) => s.movementRange)
  const clickTile = useGameStore((s) => s.clickTile)

  return (
    <div className="map" style={{ gridTemplateColumns: \`repeat(\${MAP_WIDTH}, \${TILE_SIZE}px)\` }}>
      {Array.from({ length: MAP_HEIGHT * MAP_WIDTH }).map((_, i) => {
        const x = i % MAP_WIDTH
        const y = Math.floor(i / MAP_WIDTH)
        const tile = tiles[y][x]
        const terrainStyle = TERRAIN_STYLES[tile.terrain]

        const unit = units.find((u) => u.x === x && u.y === y)
        const city = cities.find((c) => c.x === x && c.y === y)
        const ruin = ruins.find((r) => r.x === x && r.y === y)
        const isSelected = unit?.id === selectedUnitId
        const isCitySelected = city?.id === selectedCityId
        const isInRange = movementRange.some((p) => p.x === x && p.y === y)

        let className = 'tile'
        if (isSelected || isCitySelected) className += ' selected'
        else if (isInRange) className += ' highlighted'

        const cityColor = city
          ? city.owner ? FACTION_COLORS[city.owner] : NEUTRAL_COLOR
          : null

        return (
          <div
            key={\`\${x}-\${y}\`}
            className={className}
            style={{
              width: TILE_SIZE, height: TILE_SIZE,
              backgroundColor: isInRange ? '#5ab85a'
                : isSelected || isCitySelected ? '#6ad06a'
                : terrainStyle.bg,
            }}
            onClick={() => clickTile(x, y)}
          >
            {city && (
              <div className="city" style={{ borderColor: cityColor!, backgroundColor: cityColor! + '33' }}>
                \u{1F3F0}
              </div>
            )}
            {!city && ruin && (
              <div className={\`ruin\${ruin.explored ? ' explored' : ''}\`}>\u{1F3DA}\uFE0F</div>
            )}
            {unit && (
              <div
                className={\`unit\${city || ruin ? ' unit-on-city' : ''}\${unit.unitType === 'hero' ? ' hero' : ''}\`}
                style={{
                  backgroundColor: FACTION_COLORS[unit.faction],
                  borderColor: isSelected ? '#fff' : FACTION_COLORS[unit.faction],
                  opacity: unit.movesLeft > 0 ? 1 : 0.5,
                }}
              >
                {unit.unitType === 'hero' ? '\u2605' : unit.strength}
              </div>
            )}
            {!unit && !city && !ruin && (
              <span className="terrain-icon">{terrainStyle.label}</span>
            )}
          </div>
        )
      })}
    </div>
  )
}
`);

// ═══════════════════════════════════════════════════════════════════════════
// Map.tsx (deprecated shim)
// ═══════════════════════════════════════════════════════════════════════════
write('components/Map.tsx', `// Deprecated — use MapView.tsx instead
export { default } from './MapView'
`);

// ═══════════════════════════════════════════════════════════════════════════
// App.tsx
// ═══════════════════════════════════════════════════════════════════════════
write('App.tsx', `import GameBoard from './components/GameBoard'
import './App.css'

export default function App() {
  return <GameBoard />
}
`);

// ═══════════════════════════════════════════════════════════════════════════
// App.css (minimal)
// ═══════════════════════════════════════════════════════════════════════════
write('App.css', `/* App-level styles - minimal, game handles its own layout */
`);

// ═══════════════════════════════════════════════════════════════════════════
// GameBoard.css
// ═══════════════════════════════════════════════════════════════════════════
write('styles/GameBoard.css', `/* ===== Premium Dark Fantasy Theme ===== */

.game-board {
  display: flex;
  gap: 0;
  padding: 0;
  height: 100vh;
  background-color: #0e0c0a;
  color: #d4c9b8;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

.game-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 18px 16px;
  background: linear-gradient(180deg, #1a1714 0%, #13110e 100%);
  border-right: 2px solid #3a3020;
  width: 240px;
  flex-shrink: 0;
  overflow-y: auto;
  box-shadow: inset -8px 0 16px rgba(0, 0, 0, 0.4);
}

.game-info h1 {
  margin: 0;
  font-size: 22px;
  color: #c8a84e;
  text-shadow: 0 0 8px rgba(200, 168, 78, 0.3), 1px 1px 2px rgba(0, 0, 0, 0.8);
  letter-spacing: 2px;
  text-transform: uppercase;
  text-align: center;
  padding-bottom: 10px;
  border-bottom: 1px solid #3a3020;
}

.status {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.status p {
  margin: 0;
  font-size: 13px;
  color: #a09888;
}

.turn-number {
  font-weight: bold;
  color: #c8a84e;
  font-size: 16px;
}

.faction-label {
  font-weight: bold;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 3px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.gold-amount {
  color: #c8a84e;
  font-weight: bold;
}

.gold-income {
  font-size: 11px;
  color: #908878;
  margin-left: 4px;
}

.faction-bonus {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 6px 8px;
  background: rgba(200, 168, 78, 0.06);
  border: 1px solid rgba(200, 168, 78, 0.2);
  border-radius: 4px;
}

.bonus-label {
  font-weight: bold;
  font-size: 10px;
  color: #c8a84e;
  text-transform: uppercase;
  letter-spacing: 1.5px;
}

.bonus-desc {
  font-size: 11px;
  color: #908878;
}

.unit-info {
  background: rgba(200, 168, 78, 0.04);
  border-radius: 4px;
  padding: 10px;
  border: 1px solid #3a3020;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.unit-info h3 {
  margin: 0 0 6px;
  font-size: 13px;
  color: #c8a84e;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.unit-info .hero-inventory {
  margin-top: 6px;
  border-top: 1px solid #3a3020;
  padding-top: 6px;
}

.inventory-label {
  font-size: 10px;
  color: #807868;
  margin: 0 0 4px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.inventory-item {
  display: block;
  font-size: 11px;
  color: #c8a84e;
  padding: 2px 0;
}

.hero-entry {
  color: #c8a84e;
  border-color: rgba(200, 168, 78, 0.25) !important;
  background: rgba(200, 168, 78, 0.04) !important;
}

.unit-info p {
  margin: 2px 0;
  font-size: 12px;
  color: #b0a898;
}

.city-info {
  background: rgba(200, 168, 78, 0.04);
  border-radius: 4px;
  padding: 10px;
  border: 1px solid #3a3020;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.city-info h3 {
  margin: 0 0 6px;
  font-size: 13px;
  color: #c8a84e;
  display: flex;
  align-items: center;
  gap: 6px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.city-info p {
  margin: 2px 0;
  font-size: 12px;
  color: #b0a898;
}

.production-status {
  color: #7ab8d4;
  display: flex;
  align-items: center;
  gap: 6px;
}

.cancel-production {
  background: none;
  border: 1px solid #8b4040;
  color: #c06060;
  cursor: pointer;
  font-size: 11px;
  padding: 1px 5px;
  border-radius: 3px;
  line-height: 1;
  transition: all 0.2s;
}

.cancel-production:hover {
  background: #8b4040;
  color: #e0d0c0;
}

.production-buttons {
  margin-top: 6px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.production-label {
  margin: 0 0 2px;
  font-size: 10px;
  color: #807868;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.produce-btn {
  padding: 6px 8px;
  font-size: 11px;
  font-weight: bold;
  text-transform: capitalize;
  color: #d4c9b8;
  background: linear-gradient(135deg, #2a2420 0%, #1e1a16 100%);
  border: 1px solid #3a3020;
  border-radius: 3px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.15s;
}

.produce-btn:hover {
  background: linear-gradient(135deg, #3a3020 0%, #2a2420 100%);
  border-color: #c8a84e;
  color: #c8a84e;
  box-shadow: 0 0 6px rgba(200, 168, 78, 0.15);
}

.produce-stats {
  font-weight: normal;
  font-size: 10px;
  color: #807868;
}

.city-owner-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 4px currentColor;
}

.capital-badge {
  font-size: 10px;
  color: #ffd700;
  margin-left: 6px;
  font-weight: normal;
}

.city-bonus-info {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  padding: 6px 8px;
  margin-top: 6px;
  background: rgba(200, 168, 78, 0.08);
  border: 1px solid rgba(200, 168, 78, 0.2);
  border-radius: 4px;
}

.city-bonus-icon {
  font-size: 18px;
  flex-shrink: 0;
  line-height: 1;
}

.city-bonus-text strong {
  display: block;
  font-size: 11px;
  color: #c8a84e;
}

.city-bonus-text p {
  margin: 0;
  font-size: 10px;
  color: #908878;
}

.faction-units {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.faction-units h3 {
  margin: 0 0 6px;
  font-size: 11px;
  color: #807868;
  text-transform: uppercase;
  letter-spacing: 1.5px;
}

.unit-entry {
  padding: 4px 8px;
  margin-bottom: 2px;
  border-radius: 3px;
  font-size: 11px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid transparent;
  color: #a09888;
  transition: all 0.15s;
}

.unit-entry:hover {
  background: rgba(200, 168, 78, 0.06);
}

.unit-entry.active {
  background: rgba(200, 168, 78, 0.1);
  border-color: #c8a84e;
  color: #c8a84e;
}

.end-turn-button {
  padding: 10px 16px;
  font-size: 13px;
  font-weight: bold;
  color: #1a1714;
  background: linear-gradient(135deg, #c8a84e, #a08838);
  border: 1px solid #c8a84e;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.15);
}

.end-turn-button:hover {
  background: linear-gradient(135deg, #dab858, #c8a84e);
  box-shadow: 0 2px 12px rgba(200, 168, 78, 0.3);
}

.end-turn-button:active {
  transform: scale(0.98);
}

.map-container {
  flex: 1;
  display: flex;
  align-items: stretch;
  justify-content: stretch;
  overflow: hidden;
  min-height: 0;
}

/* ===== Combat Modal ===== */
.combat-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(2px);
}

.combat-modal {
  background: linear-gradient(180deg, #1e1a16 0%, #13110e 100%);
  border: 1px solid #c8a84e;
  border-radius: 8px;
  padding: 24px 28px;
  text-align: center;
  min-width: 360px;
  box-shadow: 0 0 20px rgba(200, 168, 78, 0.15), 0 8px 32px rgba(0, 0, 0, 0.6);
}

.combat-modal h2 {
  margin: 0 0 16px;
  font-size: 18px;
  color: #c8a84e;
  text-transform: uppercase;
  letter-spacing: 3px;
}

.combat-sides {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.combat-side {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid transparent;
}

.combat-side.winner {
  border-color: #5a9a5a;
  background: rgba(90, 154, 90, 0.08);
}

.combat-side.loser {
  border-color: #8b4040;
  background: rgba(139, 64, 64, 0.08);
  opacity: 0.6;
}

.combat-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: #807868;
}

.combat-faction {
  font-weight: bold;
  font-size: 13px;
  text-transform: capitalize;
}

.combat-unit {
  font-size: 12px;
  text-transform: capitalize;
  color: #a09888;
}

.combat-calc {
  font-size: 12px;
  color: #b0a898;
  margin-top: 4px;
}

.combat-vs {
  font-size: 14px;
  font-weight: bold;
  color: #c8a84e;
  letter-spacing: 2px;
}

.combat-outcome {
  font-size: 14px;
  font-weight: bold;
  color: #5a9a5a;
  margin: 8px 0 16px;
}

.combat-dismiss {
  padding: 8px 28px;
  font-size: 12px;
  font-weight: bold;
  color: #1a1714;
  background: linear-gradient(135deg, #c8a84e, #a08838);
  border: 1px solid #c8a84e;
  border-radius: 4px;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  transition: all 0.15s;
}

.combat-dismiss:hover {
  background: linear-gradient(135deg, #dab858, #c8a84e);
  box-shadow: 0 2px 8px rgba(200, 168, 78, 0.3);
}

.xp-gained {
  color: #c8a84e;
  font-size: 13px;
}

.ruin-modal h2 { color: #c8a84e; }

.ruin-hero {
  font-size: 14px;
  font-weight: bold;
  color: #c8a84e;
  margin: 8px 0;
}

.ruin-reward {
  font-size: 14px;
  color: #5a9a5a;
  margin: 12px 0 16px;
}

/* ===== Victory Modal ===== */
.victory-modal h2 {
  font-size: 28px;
  letter-spacing: 4px;
}

.victory-faction {
  font-size: 22px;
  font-weight: bold;
  margin: 12px 0 4px;
  text-transform: capitalize;
  letter-spacing: 2px;
  text-shadow: 0 0 12px currentColor;
}

.victory-turn {
  font-size: 13px;
  color: #807868;
  margin: 0 0 20px;
}
`);

// ═══════════════════════════════════════════════════════════════════════════
// KingdomOverview.css
// ═══════════════════════════════════════════════════════════════════════════
write('styles/KingdomOverview.css', `/* ===== Kingdom Overview Dashboard ===== */

.ko-toggle {
  position: absolute;
  top: 12px;
  right: 16px;
  z-index: 50;
  width: 42px;
  height: 42px;
  border: 2px solid #3a3020;
  border-radius: 50%;
  background: linear-gradient(135deg, #1e1a15 0%, #2a2418 100%);
  color: #c8a84e;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(200, 168, 78, 0.15);
  transition: transform 0.2s, box-shadow 0.2s;
}

.ko-toggle:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 20px rgba(200, 168, 78, 0.25), inset 0 1px 0 rgba(200, 168, 78, 0.2);
  border-color: #c8a84e;
}

.ko-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(5, 4, 3, 0.85);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ko-fadeIn 0.2s ease-out;
}

@keyframes ko-fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.ko-panel {
  width: min(720px, 92vw);
  max-height: 90vh;
  overflow-y: auto;
  background: linear-gradient(180deg, #1a1714 0%, #0f0d0b 100%);
  border: 2px solid #3a3020;
  border-radius: 12px;
  box-shadow: 0 0 60px rgba(0, 0, 0, 0.8), 0 0 1px 1px rgba(200, 168, 78, 0.1), inset 0 1px 0 rgba(200, 168, 78, 0.08);
  animation: ko-slideUp 0.25s ease-out;
}

@keyframes ko-slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.ko-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
  border-bottom: 1px solid #2a2418;
  background: linear-gradient(90deg, rgba(200, 168, 78, 0.06) 0%, transparent 100%);
}

.ko-crown {
  font-size: 26px;
  filter: drop-shadow(0 0 6px rgba(200, 168, 78, 0.4));
}

.ko-header h2 {
  margin: 0;
  font-size: 20px;
  color: #c8a84e;
  letter-spacing: 2px;
  text-transform: uppercase;
  text-shadow: 0 0 8px rgba(200, 168, 78, 0.3);
  flex: 1;
}

.ko-turn {
  font-size: 12px;
  color: #807868;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.ko-close {
  width: 28px;
  height: 28px;
  border: 1px solid #3a3020;
  border-radius: 4px;
  background: transparent;
  color: #807868;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s, border-color 0.15s;
}

.ko-close:hover {
  color: #c8a84e;
  border-color: #c8a84e;
}

.ko-objective {
  text-align: center;
  padding: 10px 20px;
  font-size: 13px;
  color: #a09888;
  border-bottom: 1px solid #1e1a15;
}

.ko-objective strong { color: #c8a84e; }

.ko-grid {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px 16px;
}

.ko-card {
  display: flex;
  flex-direction: column;
  background: #141210;
  border: 1px solid #1e1a15;
  border-radius: 8px;
  overflow: hidden;
  transition: border-color 0.2s;
  position: relative;
}

.ko-card:hover { border-color: #3a3020; }

.ko-card-player {
  border-color: var(--faction-color, #3366cc);
  box-shadow: 0 0 12px color-mix(in srgb, var(--faction-color, #3366cc) 20%, transparent), inset 0 0 20px color-mix(in srgb, var(--faction-color, #3366cc) 5%, transparent);
}

.ko-card-rank {
  position: absolute;
  top: 8px;
  right: 10px;
  font-size: 11px;
  font-weight: bold;
  color: #605848;
  letter-spacing: 1px;
}

.ko-card-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  position: relative;
}

.ko-card-icon {
  font-size: 28px;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #0e0c0a;
  border: 2px solid var(--faction-color, #3a3020);
  box-shadow: 0 0 10px color-mix(in srgb, var(--faction-color, #3a3020) 25%, transparent);
  flex-shrink: 0;
}

.ko-card-title {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.ko-card-name {
  font-size: 15px;
  font-weight: bold;
  color: #d4c9b8;
  letter-spacing: 0.5px;
}

.ko-card-bonus {
  font-size: 11px;
  letter-spacing: 0.5px;
  opacity: 0.8;
}

.ko-card-you {
  font-size: 10px;
  font-weight: bold;
  letter-spacing: 2px;
  color: #0e0c0a;
  background: var(--faction-color, #3366cc);
  padding: 2px 8px;
  border-radius: 3px;
  position: absolute;
  top: 10px;
  right: 40px;
}

.ko-card-stats {
  display: flex;
  gap: 0;
  padding: 0 4px;
  border-top: 1px solid #1a1815;
}

.ko-stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 4px;
  gap: 2px;
}

.ko-stat-icon { font-size: 14px; line-height: 1; }
.ko-stat-label { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #605848; }
.ko-stat-value { font-size: 16px; font-weight: bold; color: #d4c9b8; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5); }

.ko-card-progress {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 14px 10px;
}

.ko-progress-bar {
  flex: 1;
  height: 4px;
  background: #1a1815;
  border-radius: 2px;
  overflow: hidden;
}

.ko-progress-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.5s ease-out;
  box-shadow: 0 0 6px currentColor;
}

.ko-progress-text {
  font-size: 10px;
  color: #605848;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.ko-footer {
  padding: 10px 20px;
  border-top: 1px solid #1e1a15;
  text-align: center;
}

.ko-footer-text {
  font-size: 11px;
  color: #605848;
  letter-spacing: 1px;
  text-transform: uppercase;
}
`);

// ═══════════════════════════════════════════════════════════════════════════
// Map.css
// ═══════════════════════════════════════════════════════════════════════════
write('styles/Map.css', `.map {
  display: grid;
  gap: 1px;
  background-color: #222;
  padding: 2px;
  border-radius: 4px;
  border: 2px solid #444;
}

.tile {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border: 1px solid rgba(0, 0, 0, 0.2);
  transition: filter 0.15s ease;
}

.tile:hover { filter: brightness(1.2); }

.tile.highlighted { animation: pulse 1.2s ease-in-out infinite; }

.tile.selected {
  box-shadow: inset 0 0 12px rgba(255, 255, 255, 0.5);
  border-color: #fff;
}

@keyframes pulse {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.3); }
}

.unit {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
  font-size: 11px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.5);
}

.terrain-icon {
  font-size: 14px;
  opacity: 0.6;
  color: rgba(255, 255, 255, 0.5);
  user-select: none;
}

.city {
  position: absolute;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  border: 2px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  z-index: 1;
}

.unit-on-city {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 16px;
  height: 16px;
  font-size: 9px;
  z-index: 2;
}

.unit.hero {
  border: 2px solid gold;
  box-shadow: 0 0 6px rgba(255, 215, 0, 0.6);
}

.ruin {
  position: absolute;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  border: 2px solid #8b7355;
  background-color: rgba(139, 115, 85, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  z-index: 1;
}

.ruin.explored {
  opacity: 0.35;
  border-color: #555;
}
`);

// ═══════════════════════════════════════════════════════════════════════════
// TutorialPanel.css
// ═══════════════════════════════════════════════════════════════════════════
write('styles/TutorialPanel.css', `/* ===== Tutorial Panel ===== */
.tutorial-panel {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 260px;
  background: linear-gradient(180deg, rgba(26, 23, 20, 0.95) 0%, rgba(19, 17, 14, 0.95) 100%);
  border: 1px solid #3a3020;
  border-radius: 8px;
  padding: 14px;
  z-index: 50;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6), 0 0 12px rgba(200, 168, 78, 0.08);
  backdrop-filter: blur(4px);
  pointer-events: auto;
}

.tutorial-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #3a3020;
}

.tutorial-title {
  font-size: 14px;
  font-weight: bold;
  color: #c8a84e;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.tutorial-dismiss {
  background: none;
  border: 1px solid #5a4030;
  color: #807060;
  cursor: pointer;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 3px;
  line-height: 1;
  transition: all 0.2s;
}

.tutorial-dismiss:hover {
  border-color: #c06060;
  color: #c06060;
}

.tutorial-objective,
.tutorial-complete {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 10px;
  background: rgba(200, 168, 78, 0.08);
  border: 1px solid rgba(200, 168, 78, 0.25);
  border-radius: 6px;
  margin-bottom: 10px;
  animation: tutorialPulse 2s ease-in-out infinite;
}

@keyframes tutorialPulse {
  0%, 100% { border-color: rgba(200, 168, 78, 0.25); }
  50% { border-color: rgba(200, 168, 78, 0.5); }
}

.tutorial-obj-icon {
  font-size: 22px;
  flex-shrink: 0;
  line-height: 1;
}

.tutorial-obj-text strong {
  display: block;
  font-size: 12px;
  color: #c8a84e;
  margin-bottom: 2px;
}

.tutorial-obj-text p {
  margin: 0;
  font-size: 11px;
  color: #a09888;
  line-height: 1.4;
}

.tutorial-complete {
  background: rgba(68, 170, 68, 0.08);
  border-color: rgba(68, 170, 68, 0.3);
  animation: none;
}

.tutorial-progress {
  display: flex;
  gap: 6px;
  justify-content: center;
  margin-bottom: 10px;
}

.tutorial-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #3a3020;
  border: 1px solid #5a4830;
  transition: all 0.3s;
}

.tutorial-dot.done {
  background: #c8a84e;
  border-color: #c8a84e;
  box-shadow: 0 0 4px rgba(200, 168, 78, 0.4);
}

.tutorial-dot.active {
  background: #5a8a3a;
  border-color: #5a8a3a;
  box-shadow: 0 0 6px rgba(90, 138, 58, 0.5);
  animation: dotPulse 1.5s ease-in-out infinite;
}

@keyframes dotPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.3); }
}

.tutorial-topics {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tutorial-topic {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  padding: 5px 6px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.02);
}

.topic-icon {
  font-size: 14px;
  flex-shrink: 0;
  line-height: 1.2;
}

.topic-text strong {
  display: block;
  font-size: 10px;
  color: #b0a090;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.topic-text p {
  margin: 0;
  font-size: 10px;
  color: #807868;
  line-height: 1.3;
}
`);

console.log('\\n=== Batch 3 complete: components + CSS ===');
