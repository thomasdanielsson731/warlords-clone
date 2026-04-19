import { useGameStore } from '../game/store'
import { FACTION_COLORS } from '../game/types'
import MapView from './MapView'
import '../styles/GameBoard.css'

export default function GameBoard() {
  const currentFaction = useGameStore((s) => s.currentFaction)
  const turnNumber = useGameStore((s) => s.turnNumber)
  const selectedUnitId = useGameStore((s) => s.selectedUnitId)
  const units = useGameStore((s) => s.units)
  const endTurn = useGameStore((s) => s.endTurn)

  const selectedUnit = units.find((u) => u.id === selectedUnitId)
  const factionUnits = units.filter((u) => u.faction === currentFaction)

  return (
    <div className="game-board">
      <div className="game-info">
        <h1>Warlords</h1>
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
        </div>

        {selectedUnit && (
          <div className="unit-info">
            <h3>Selected Unit</h3>
            <p>Strength: {selectedUnit.strength}</p>
            <p>
              Moves: {selectedUnit.movesLeft}/{selectedUnit.movesPerTurn}
            </p>
            <p>
              Position: ({selectedUnit.x}, {selectedUnit.y})
            </p>
          </div>
        )}

        <div className="faction-units">
          <h3>Your Units ({factionUnits.length})</h3>
          {factionUnits.map((u) => (
            <div
              key={u.id}
              className={`unit-entry${u.id === selectedUnitId ? ' active' : ''}`}
            >
              STR {u.strength} — Moves: {u.movesLeft}
            </div>
          ))}
        </div>

        <button className="end-turn-button" onClick={endTurn}>
          End Turn
        </button>
      </div>
      <div className="map-container">
        <MapView />
      </div>
    </div>
  )
}
