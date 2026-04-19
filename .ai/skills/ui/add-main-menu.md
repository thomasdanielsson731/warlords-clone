# Skill: Add Main Menu

Add a main menu / title screen.

---

## Description

The main menu is the first screen the player sees. It sets the mood with a dark fantasy atmosphere and provides options to start a new game, load a saved game, or view settings.

---

## Requirements

- Title: "Warlords 2026" in a fantasy font or styled heading.
- Buttons: New Game, Load Game (future), Settings (future).
- Dark fantasy background — atmospheric, not plain black.
- Transition: clicking New Game starts the game (renders GameBoard).
- Optional: subtle animation (particles, fog, or pulsing glow).

---

## Rules

- Main menu is a new component: `src/components/MainMenu.tsx`.
- App.tsx routes between MainMenu and GameBoard based on state.
- Add a `gameStarted` state to the store or use local React state in App.
- Menu styling in `src/styles/MainMenu.css`.
- The menu should load instantly — no heavy 3D rendering on the menu screen.
- Keep the menu simple initially. Polish later.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/MainMenu.tsx` | New file: menu component |
| `src/styles/MainMenu.css` | New file: menu styling |
| `src/App.tsx` | Add routing between menu and game |
| `src/game/store.ts` | Optional: add `gameStarted` state |

---

## Manual Test Steps

1. Start the app. Verify main menu appears (not the game).
2. Verify title "Warlords 2026" is displayed.
3. Click "New Game". Verify the game loads.
4. Verify the menu has a dark fantasy aesthetic.
5. Verify menu loads quickly without lag.
6. Run `npx vite build` — build succeeds.
