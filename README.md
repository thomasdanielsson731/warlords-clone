# Warlords 2026

A modern remake of Warlords II (1990) — turn-based fantasy strategy with 3D rendering.

## Tech Stack

- **React 19** + **TypeScript** — UI framework
- **Zustand** — Game state management
- **React Three Fiber** + **drei** — 3D rendering
- **Vite** — Build tooling

## Getting Started

```bash
npm install
npm run dev
```

## Architecture

```
src/game/       — Game logic (types, rules, Zustand store)
src/scene/      — 3D rendering (React Three Fiber components)
src/components/ — HTML UI (sidebar, modals)
docs/           — Game design documents
.ai/            — AI agent prompts and system rules
```

## Current Features

- 20x20 seeded terrain map (grass, forest, mountain, water)
- 4 factions: Humans, Orcs, Elves, Lord Bane
- Unit types: militia, infantry, cavalry, knight, hero
- BFS pathfinding with terrain costs
- Turn-based combat (d6 rolls)
- 16 cities with production queues
- Heroes with XP, levels, artifacts
- 6 ruins with 5 reward types
- Unique faction bonuses
- 3D rendering with React Three Fiber
