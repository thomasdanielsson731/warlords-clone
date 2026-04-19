import { useGameStore } from '../game/store'
import { FACTION_COLORS, NEUTRAL_COLOR, UNIT_TEMPLATES, FACTION_BONUSES } from '../game/types'
import type { UnitType } from '../game/types'
import GameScene from '../scene/GameScene'
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
          <p>
            Turn: <span className="turn-number">{turnNumber}</span>
          </p>
          <p>
            Faction:{' '}
            <span
              className="faction-label"
              style={{ backgroundColor: FACTION_COLORS[currentFaction] }}
            >
              {currentFaction.toUpperCase()}
            </span>
          </p>
          <p>
            Gold: <span className="gold-amount">💰 {gold[currentFaction]}</span>
          </p>
          <div className="faction-bonus">
            <span className="bonus-label">{FACTION_BONUSES[currentFaction].label}</span>
            <span className="bonus-desc">{FACTION_BONUSES[currentFaction].description}</span>
          </div>
        </div>

        {selectedUnit && (
          <div className="unit-info">
            <h3>{selectedUnit.unitType === 'hero' ? `★ ${selectedUnit.name}` : 'Selected Unit'}</h3>
            {selectedUnit.unitType === 'hero' && (
              <>
                <p>Level: {selectedUnit.level}</p>
                <p>XP: {selectedUnit.experience}/{(selectedUnit.level ?? 1) * 100}</p>
              </>
            )}
            <p>Strength: {selectedUnit.strength}</p>
            <p>
              Moves: {selectedUnit.movesLeft}/{selectedUnit.movesPerTurn}
            </p>
            <p>
              Position: ({selectedUnit.x}, {selectedUnit.y})
            </p>
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
            </h3>
            <p>Owner: {selectedCity.owner ?? 'Neutral'}</p>
            <p>Defense: {selectedCity.defense}</p>
            <p>
              Position: ({selectedCity.x}, {selectedCity.y})
            </p>
            {selectedCity.producing && (
              <p className="production-status">
                Producing: {selectedCity.producing} ({selectedCity.turnsLeft} turn
                {selectedCity.turnsLeft !== 1 ? 's' : ''})
                <button
                  className="cancel-production"
                  onClick={() => setProduction(selectedCity.id, null)}
                >
                  ✕
                </button>
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
                    <button
                      key={type}
                      className="produce-btn"
                      onClick={() => setProduction(selectedCity.id, type)}
                    >
                      {type} <span className="produce-stats">STR {str} · {turns}T</span>
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
              className={`unit-entry${u.id === selectedUnitId ? ' active' : ''}${u.unitType === 'hero' ? ' hero-entry' : ''}`}
            >
              {u.unitType === 'hero' ? `★ ${u.name} L${u.level}` : `${u.unitType}`} — STR {u.strength} — Moves: {u.movesLeft}
            </div>
          ))}
        </div>

        <button className="end-turn-button" onClick={endTurn}>
          End Turn
        </button>
      </div>
      <div className="map-container">
        <GameScene />
      </div>

      {combatResult && (
        <div className="combat-overlay" onClick={dismissCombat}>
          <div className="combat-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Combat!</h2>
            <div className="combat-sides">
              <div className={`combat-side${combatResult.attackerWins ? ' winner' : ' loser'}`}>
                <span className="combat-label">Attacker</span>
                <span
                  className="combat-faction"
                  style={{ color: FACTION_COLORS[combatResult.attacker.faction] }}
                >
                  {combatResult.attacker.faction}
                </span>
                <span className="combat-unit">
                  {combatResult.attacker.name ?? combatResult.attacker.unitType}
                </span>
                <span className="combat-calc">
                  STR {combatResult.attacker.strength} + 🎲 {combatResult.attacker.roll} = <strong>{combatResult.attacker.total}</strong>
                </span>
              </div>
              <div className="combat-vs">VS</div>
              <div className={`combat-side${!combatResult.attackerWins ? ' winner' : ' loser'}`}>
                <span className="combat-label">Defender</span>
                <span
                  className="combat-faction"
                  style={{ color: FACTION_COLORS[combatResult.defender.faction] }}
                >
                  {combatResult.defender.faction}
                </span>
                <span className="combat-unit">
                  {combatResult.defender.name ?? combatResult.defender.unitType}
                </span>
                <span className="combat-calc">
                  STR {combatResult.defender.strength} + 🎲 {combatResult.defender.roll}
                  {combatResult.defender.cityBonus > 0 && ` + 🏰 ${combatResult.defender.cityBonus}`}
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
            <button className="combat-dismiss" onClick={dismissCombat}>
              OK
            </button>
          </div>
        </div>
      )}

      {ruinResult && (
        <div className="combat-overlay" onClick={dismissRuinResult}>
          <div className="combat-modal ruin-modal" onClick={(e) => e.stopPropagation()}>
            <h2>🏚️ Ruin Explored!</h2>
            <p className="ruin-hero">{ruinResult.heroName}</p>
            <p className={`ruin-reward ruin-${ruinResult.type}`}>
              {ruinResult.type === 'gold' && '💰 '}
              {ruinResult.type === 'artifact' && '⚔️ '}
              {ruinResult.type === 'ally' && '🤝 '}
              {ruinResult.type === 'dragon' && '🐉 '}
              {ruinResult.type === 'nothing' && '💨 '}
              {ruinResult.description}
            </p>
            <button className="combat-dismiss" onClick={dismissRuinResult}>
              OK
            </button>
          </div>
        </div>
      )}

      {victor && (
        <div className="combat-overlay">
          <div className="combat-modal victory-modal">
            <h2>🏆 Victory!</h2>
            <p className="victory-faction" style={{ color: FACTION_COLORS[victor] }}>
              {victor.toUpperCase()} conquers the realm!
            </p>
            <p className="victory-turn">Achieved on turn {turnNumber}</p>
            <button className="combat-dismiss" onClick={() => window.location.reload()}>
              New Game
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
