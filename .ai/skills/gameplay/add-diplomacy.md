# Skill: Add Diplomacy

Add diplomacy mechanics between factions.

---

## Description

Diplomacy in Warlords II tracks relationships between factions: Allied, Neutral, or At War. Actions like attacking allies or razing cities affect a faction's reputation. AI factions react to the player's diplomatic behavior.

---

## Requirements

- Diplomatic states: Allied, Neutral, At War.
- Track reputation for each faction pair.
- Attacking a neutral or allied faction triggers a diplomatic penalty.
- AI factions may ally against aggressive players.
- Having excessive territory or gold makes you a target.
- Diplomacy UI shows current relationships.

---

## Rules

- Add a `diplomacy` field to the game store: `Record<Faction, Record<Faction, DiplomaticState>>`.
- Define `DiplomaticState` in `src/game/types.ts`: `'allied' | 'neutral' | 'war'`.
- Add a `reputation` tracker: `Record<Faction, number>` (higher = more trustworthy).
- Combat initiation should check diplomatic state and trigger penalties.
- AI uses diplomacy to decide targets (see `add-ai.md` when available).
- Display diplomatic states in the sidebar or a dedicated panel.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/game/types.ts` | Add `DiplomaticState` type, diplomacy interfaces |
| `src/game/gamelogic.ts` | Add diplomacy update functions |
| `src/game/store.ts` | Add diplomacy state, modify combat to check diplomacy |
| `src/components/GameBoard.tsx` | Add diplomacy display to sidebar |
| `src/styles/GameBoard.css` | Style diplomacy indicators |

---

## Diplomatic Events

| Action | Reputation Effect |
|--------|------------------|
| Attack neutral faction | -20 reputation with all factions |
| Attack allied faction | -50 reputation with all factions |
| Raze a city | -15 reputation with all factions |
| Maintain alliance for 10 turns | +10 reputation |
| Control > 50% of cities | -5 per turn (threat level) |

---

## Manual Test Steps

1. Start game. Verify all factions start as Neutral toward each other.
2. Attack an enemy unit. Verify war is declared between the two factions.
3. Verify reputation decreases are applied.
4. Check sidebar or diplomacy panel shows correct states.
5. Verify AI behavior changes based on diplomatic state (when AI exists).
6. Run `npx tsc -b --noEmit` — zero errors.
7. Run `npx vite build` — build succeeds.
