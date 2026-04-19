# Skill: Add Sound Hooks

Prepare the architecture for sound effects and music.

---

## Description

Sound hooks are integration points where audio should play. This skill defines where sounds should trigger without implementing a specific audio library. The actual audio playback can use Howler.js, Web Audio API, or Tone.js.

---

## Requirements

- Define sound event types: combat, movement, UI click, ruin discovery, city capture, turn end, level up.
- Create a central sound dispatch function.
- Hook into game actions in the Zustand store.
- Sound should be optional — game works silently if audio not loaded.

---

## Rules

- Sound dispatch lives in `src/audio/` (new directory).
- Create `src/audio/soundEvents.ts` with event types and a `playSound(event)` function.
- Initially the function is a no-op or logs to console.
- Call `playSound()` from store actions at appropriate moments.
- Never block game logic on audio loading or playback.
- Keep audio files in `public/audio/` when added.

---

## Sound Event Map

| Event | Trigger Location | Sound Type |
|-------|-----------------|------------|
| `unit-select` | `store.ts` selectUnit | UI click |
| `unit-move` | `store.ts` moveUnit | Footstep/march |
| `combat-start` | `store.ts` moveUnit (combat) | Sword clash |
| `combat-win` | `store.ts` moveUnit (attacker wins) | Victory fanfare |
| `combat-lose` | `store.ts` moveUnit (attacker loses) | Defeat sound |
| `city-capture` | `store.ts` moveUnit (capture) | Trumpet/horn |
| `ruin-explore` | `store.ts` moveUnit (ruin) | Mystery chime |
| `ruin-dragon` | `store.ts` moveUnit (dragon) | Dragon roar |
| `turn-end` | `store.ts` endTurn | Drum/gong |
| `production-complete` | `store.ts` endTurn (spawn) | Anvil strike |
| `level-up` | `gamelogic.ts` grantXp | Magical chime |
| `hero-death` | `store.ts` moveUnit (hero killed) | Dramatic sting |

---

## Files to Modify

| File | Change |
|------|--------|
| `src/audio/soundEvents.ts` | New file: sound event types and dispatch |
| `src/game/store.ts` | Add `playSound()` calls at event points |

---

## Manual Test Steps

1. Verify `playSound()` is called at each trigger point (console.log initially).
2. Verify game still works with sound dispatch as no-op.
3. When audio files are added, verify sounds play at correct moments.
4. Verify no audio errors when sounds fail to load.
5. Run `npx tsc -b --noEmit` — zero errors.
6. Run `npx vite build` — build succeeds.
