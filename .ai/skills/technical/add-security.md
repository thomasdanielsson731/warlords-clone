# Skill: Add Security

Security best practices for the game.

---

## Description

Ensure the game follows security best practices, even as a client-side single-player game. Good habits now prevent vulnerabilities when multiplayer or server features are added.

---

## Requirements

- No `eval()` or `new Function()` anywhere.
- No `innerHTML` — use React's JSX rendering (which auto-escapes).
- Sanitize any user input (player names, save file names).
- localStorage data should be validated on load (don't trust saved data blindly).
- No secrets or API keys in client code.
- CSP-compatible: no inline scripts in index.html.

---

## Rules

- NEVER use `dangerouslySetInnerHTML` without sanitization.
- Validate save data shape on load — use a type guard or schema check.
- If loading external data (maps, mods), validate structure before use.
- Keep dependencies minimal and up-to-date (`npm audit`).
- No CORS issues if all assets are local.
- If adding multiplayer later: NEVER trust client state — validate server-side.

---

## Security Checklist

| Check | Status |
|-------|--------|
| No `eval()` or `new Function()` | Verify |
| No `innerHTML` / `dangerouslySetInnerHTML` | Verify |
| Save data validated on load | Implement |
| No hardcoded secrets | Verify |
| Dependencies audited | `npm audit` |
| CSP-compatible HTML | Verify |
| User input sanitized | Verify |

---

## Files to Modify

| File | Change |
|------|--------|
| `src/game/save.ts` | Add validation on load |
| `index.html` | Verify no inline scripts |

---

## Manual Test Steps

1. Run `npm audit`. Verify no critical vulnerabilities.
2. Search codebase for `eval`, `innerHTML`, `dangerouslySetInnerHTML`. Verify none found.
3. Corrupt a save in localStorage. Load it. Verify the game handles it gracefully (error message, not crash).
4. Verify `index.html` has no inline `<script>` tags with code.
5. Run `npx vite build` — build succeeds.
