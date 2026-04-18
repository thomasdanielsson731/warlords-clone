import React from 'react';
import { useGameStore } from '../game/store';
import { Map } from './Map';
import '../styles/GameBoard.css';

export const GameBoard: React.FC = () => {
  const currentFaction = useGameStore(state => state.currentFaction);
  const turnNumber = useGameStore(state => state.turnNumber);
  const endTurn = useGameStore(state => state.endTurn);

  return (
    <div className="game-board">
      <div className="game-info">
        <h1>Warlords</h1>
        <div className="status">
          <p>Turn: <span className="turn-number">{turnNumber}</span></p>
          <p>Faction: <span className={`faction-label faction-${currentFaction}`}>{currentFaction.toUpperCase()}</span></p>
        </div>
        <button className="end-turn-button" onClick={endTurn}>
          End Turn
        </button>
      </div>
      <div className="map-container">
        <Map />
      </div>
    </div>
  );
};
