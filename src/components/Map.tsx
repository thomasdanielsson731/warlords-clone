import React from 'react';
import { useGameStore } from '../game/store';
import '../styles/Map.css';

interface TileProps {
  x: number;
  y: number;
  isHighlighted: boolean;
  hasUnit: boolean;
  unitFaction?: string;
  isSelected: boolean;
  onTileClick: (x: number, y: number) => void;
}

const Tile: React.FC<TileProps> = ({
  x,
  y,
  isHighlighted,
  hasUnit,
  unitFaction,
  isSelected,
  onTileClick,
}) => {
  const handleClick = () => onTileClick(x, y);

  return (
    <div
      className={`tile ${isHighlighted ? 'highlighted' : ''} ${isSelected ? 'selected' : ''}`}
      onClick={handleClick}
    >
      {hasUnit && (
        <div className={`unit unit-${unitFaction}`}>
          {unitFaction?.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
};

export const Map: React.FC = () => {
  const mapWidth = useGameStore(state => state.map.width);
  const mapHeight = useGameStore(state => state.map.height);
  const units = useGameStore(state => state.units);
  const highlightedTiles = useGameStore(state => state.highlightedTiles);
  const selectedUnitId = useGameStore(state => state.selectedUnitId);
  const currentFaction = useGameStore(state => state.currentFaction);
  const selectUnit = useGameStore(state => state.selectUnit);
  const moveUnit = useGameStore(state => state.moveUnit);

  const handleTileClick = (x: number, y: number) => {
    // Check if there's a unit on this tile
    const unit = units.find(u => u.position.x === x && u.position.y === y);

    if (unit && unit.faction === currentFaction) {
      // Select unit if it belongs to current faction
      selectUnit(unit.id);
    } else if (selectedUnitId) {
      // Try to move selected unit
      const selectedUnit = units.find(u => u.id === selectedUnitId);
      if (selectedUnit) {
        moveUnit(selectedUnitId, { x, y });
      }
    }
  };

  const tiles = [];
  for (let y = 0; y < mapHeight; y++) {
    for (let x = 0; x < mapWidth; x++) {
      const unit = units.find(u => u.position.x === x && u.position.y === y);
      const isHighlighted = highlightedTiles.some(t => t.x === x && t.y === y);
      const isSelected = selectedUnitId && unit?.id === selectedUnitId;

      tiles.push(
        <Tile
          key={`${x}-${y}`}
          x={x}
          y={y}
          isHighlighted={isHighlighted}
          hasUnit={!!unit}
          unitFaction={unit?.faction}
          isSelected={!!isSelected}
          onTileClick={handleTileClick}
        />
      );
    }
  }

  return (
    <div
      className="map"
      style={{
        gridTemplateColumns: `repeat(${mapWidth}, 1fr)`,
      }}
    >
      {tiles}
    </div>
  );
};
