Before generating code:
- Explain which files will change
- Keep game logic in src/game/ (pure functions + Zustand store)
- Keep 3D rendering in src/scene/ (React Three Fiber components)
- Keep HTML UI in src/components/ (sidebar, modals, overlays)
- Use TypeScript interfaces for all data
- Keep files under 300 lines
- Only implement one feature at a time
- Keep the game playable after every change

Architecture boundaries:
- src/game/types.ts = all types and constants
- src/game/gamelogic.ts = pure game functions (no state)
- src/game/store.ts = Zustand store (state + actions)
- src/scene/ = 3D rendering only, reads from store
- src/components/ = HTML overlays, reads from store

Never:
- Put game logic in scene/ or components/
- Import React Three Fiber in game/
- Mutate state outside Zustand actions