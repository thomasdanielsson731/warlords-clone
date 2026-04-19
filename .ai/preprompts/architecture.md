# Architecture Rules

Before implementing anything:
- Read the existing files first
- Understand the current architecture before changing anything
- Keep gameplay logic in src/game
- Keep React UI in src/components
- Keep 3D rendering in src/scene
- Keep content and maps in src/data
- Never mix rendering and gameplay logic
- Never put combat, movement or production logic inside React components
- Use Zustand only as the source of truth
- Use TypeScript interfaces and explicit types
- Prefer pure functions
- Keep files under 300 lines if possible
- Prefer small reusable modules over large files
- Do not rewrite unrelated files

When creating new files:
- Name them clearly
- Keep consistent folder structure
- Reuse existing patterns before creating new ones
