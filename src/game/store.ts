// Game state management with Zustand

import { create } from 'zustand';
import { GameState, Unit, Faction, Position } from './types';
import { getMovementRange, canMoveToTile, getNextFaction } from './gamelogic';

interface GameStore extends GameState {
  selectUnit: (unitId: string | null) => void;
  moveUnit: (unitId: string, targetPosition: Position) => void;
  endTurn: () => void;
  highlightMovement: (tiles: Position[]) => void;
}

const createInitialUnits = (): Unit[] => {
  return [
    {
      id: 'red-1',
      faction: 'red',
      position: { x: 2, y: 2 },
      movementRange: 3,
    },
    {
      id: 'blue-1',
      faction: 'blue',
      position: { x: 17, y: 2 },
      movementRange: 3,
    },
    {
      id: 'green-1',
      faction: 'green',
      position: { x: 2, y: 17 },
      movementRange: 3,
    },
    {
      id: 'yellow-1',
      faction: 'yellow',
      position: { x: 17, y: 17 },
      movementRange: 3,
    },
  ];
};

export const useGameStore = create<GameStore>((set, get) => ({
  map: {
    width: 20,
    height: 20,
  },
  units: createInitialUnits(),
  currentFaction: 'red',
  selectedUnitId: null,
  highlightedTiles: [],
  turnNumber: 1,

  selectUnit: (unitId: string | null) => {
    set((state) => {
      if (unitId === null) {
        return {
          selectedUnitId: null,
          highlightedTiles: [],
        };
      }

      const unit = state.units.find(u => u.id === unitId);
      if (!unit || unit.faction !== state.currentFaction) {
        return state;
      }

      const highlightedTiles = getMovementRange(unit);
      return {
        selectedUnitId: unitId,
        highlightedTiles,
      };
    });
  },

  moveUnit: (unitId: string, targetPosition: Position) => {
    set((state) => {
      const unit = state.units.find(u => u.id === unitId);
      if (!unit) return state;

      const validMoves = getMovementRange(unit);
      if (!canMoveToTile(targetPosition, validMoves)) {
        return state;
      }

      const updatedUnits = state.units.map(u =>
        u.id === unitId ? { ...u, position: targetPosition } : u
      );

      return {
        units: updatedUnits,
        selectedUnitId: null,
        highlightedTiles: [],
      };
    });
  },

  endTurn: () => {
    set((state) => {
      const nextFaction = getNextFaction(state.currentFaction);
      const isNewRound = nextFaction === 'red';

      return {
        currentFaction: nextFaction,
        selectedUnitId: null,
        highlightedTiles: [],
        turnNumber: isNewRound ? state.turnNumber + 1 : state.turnNumber,
      };
    });
  },

  highlightMovement: (tiles: Position[]) => {
    set({ highlightedTiles: tiles });
  },
}));
