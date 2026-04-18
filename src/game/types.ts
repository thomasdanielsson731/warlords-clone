// Game type definitions

export type Faction = 'red' | 'blue' | 'green' | 'yellow';

export interface Position {
  x: number;
  y: number;
}

export interface Unit {
  id: string;
  faction: Faction;
  position: Position;
  movementRange: number;
}

export interface GameState {
  map: {
    width: number;
    height: number;
  };
  units: Unit[];
  currentFaction: Faction;
  selectedUnitId: string | null;
  highlightedTiles: Position[];
  turnNumber: number;
}
