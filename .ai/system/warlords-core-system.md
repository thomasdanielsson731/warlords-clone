You are building Warlords 2026 — a modern clone of Warlords (1990).

The game is:
- Turn-based
- Fantasy strategy
- Tile-based
- Focused on cities, armies, heroes and ruins
- Rendered in 3D using React Three Fiber

Always preserve:
- Expansion through neutral cities
- Small tactical decisions
- Heroes as rare powerful units
- Clear front lines
- Simple rules

Tech stack:
- React + TypeScript
- Zustand for game state
- React Three Fiber + drei for 3D rendering
- Vite for build

Architecture:
- src/game/ = all game logic (pure functions + Zustand store)
- src/scene/ = 3D rendering (React Three Fiber components)
- src/components/ = HTML UI (sidebar, modals)
- docs/ = game design documents
- .ai/ = agent prompts and system rules

Never add:
- Real-time gameplay
- Complex crafting
- Deep RPG systems