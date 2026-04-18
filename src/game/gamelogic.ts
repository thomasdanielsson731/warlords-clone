// Game logic

import { Position, Unit } from './types';

export const getMovementRange = (unit: Unit): Position[] => {
  const range = unit.movementRange;
  const tiles: Position[] = [];

  for (let x = unit.position.x - range; x <= unit.position.x + range; x++) {
    for (let y = unit.position.y - range; y <= unit.position.y + range; y++) {
      // Exclude the unit's current position
      if (x === unit.position.x && y === unit.position.y) continue;

      // Check Manhattan distance for more natural movement
      const distance = Math.abs(x - unit.position.x) + Math.abs(y - unit.position.y);
      if (distance <= range) {
        tiles.push({ x, y });
      }
    }
  }

  return tiles;
};

export const isValidPosition = (pos: Position, mapWidth: number, mapHeight: number): boolean => {
  return pos.x >= 0 && pos.x < mapWidth && pos.y >= 0 && pos.y < mapHeight;
};

export const canMoveToTile = (
  tile: Position,
  validMovementTiles: Position[]
): boolean => {
  return validMovementTiles.some(t => t.x === tile.x && t.y === tile.y);
};

export const getNextFaction = (current: 'red' | 'blue' | 'green' | 'yellow'): 'red' | 'blue' | 'green' | 'yellow' => {
  const factions: ('red' | 'blue' | 'green' | 'yellow')[] = ['red', 'blue', 'green', 'yellow'];
  const currentIndex = factions.indexOf(current);
  return factions[(currentIndex + 1) % factions.length];
};
