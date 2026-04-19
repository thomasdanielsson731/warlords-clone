import { useState } from 'react'
import { useGameStore } from '../game/store'
import { FACTION_COLORS, FACTION_BONUSES, VICTORY_CITY_PERCENT } from '../game/types'
import type { Faction } from '../game/types'
import '../styles/KingdomOverview.css'

const FACTION_DISPLAY: Record<Faction, { name: string; icon: string; banner: string }> = {
  player: { name: 'Kingdom of Stormhold', icon: '🦁', banner: '⚔️' },
  orcs: { name: 'Orcish Horde', icon: '🐗', banner: '🪓' },
  elves: { name: 'Elvish Dominion', icon: '🦌', banner: '🏹' },
  bane: { name: 'Cult of Bane', icon: '🐉', banner: '💀' },
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
        👑
      </button>
    )
  }

  return (
    <div className="ko-overlay" onClick={() => setOpen(false)}>
      <div className="ko-panel" onClick={(e) => e.stopPropagation()}>
        <div className="ko-header">
          <span className="ko-crown">👑</span>
          <h2>Kingdom Overview</h2>
          <span className="ko-turn">Turn {turnNumber}</span>
          <button className="ko-close" onClick={() => setOpen(false)}>✕</button>
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
                className={`ko-card${isPlayer ? ' ko-card-player' : ''}`}
                style={{ '--faction-color': color } as React.CSSProperties}
              >
                <div className="ko-card-rank">#{rank + 1}</div>

                <div className="ko-card-banner" style={{ background: `linear-gradient(135deg, ${color}22 0%, ${color}08 100%)` }}>
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
                    <span className="ko-stat-icon">🏰</span>
                    <span className="ko-stat-label">Cities</span>
                    <span className="ko-stat-value">{s.cityCount}</span>
                  </div>
                  <div className="ko-stat">
                    <span className="ko-stat-icon">⚔️</span>
                    <span className="ko-stat-label">Units</span>
                    <span className="ko-stat-value">{s.unitCount}</span>
                  </div>
                  <div className="ko-stat">
                    <span className="ko-stat-icon">💪</span>
                    <span className="ko-stat-label">Strength</span>
                    <span className="ko-stat-value">{s.totalStrength}</span>
                  </div>
                  <div className="ko-stat">
                    <span className="ko-stat-icon">💰</span>
                    <span className="ko-stat-label">Gold</span>
                    <span className="ko-stat-value">{s.gold}</span>
                  </div>
                  <div className="ko-stat">
                    <span className="ko-stat-icon">★</span>
                    <span className="ko-stat-label">Heroes</span>
                    <span className="ko-stat-value">{s.heroCount}</span>
                  </div>
                </div>

                <div className="ko-card-progress">
                  <div className="ko-progress-bar">
                    <div className="ko-progress-fill" style={{ width: `${progress * 100}%`, backgroundColor: color }} />
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
