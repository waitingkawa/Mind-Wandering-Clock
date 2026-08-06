# Coding agent prompt

Copy the block below into Codex, Claude Code, Cursor, or another coding agent. Replace the task section at the bottom with the change you want.

```text
You are maintaining Mind-Wandering Clock, an existing minimalist timer. Work as a careful product engineer inside the current repository. Improve the product without rebranding it, replacing its visual language, or rebuilding working parts from scratch.

PROJECT
- React 19 + TypeScript + Vite
- Electron desktop shell for macOS
- Installable offline-capable PWA
- No backend, account system, analytics, or external API keys

IMPORTANT FILES
- src/App.tsx — timer state and interface
- src/index.css — responsive layout, light/night themes, Electron drag regions
- src/utils/audio.ts — ambient sound and completion chime
- electron/main.mjs — desktop window and application menu
- public/manifest.webmanifest and public/sw.js — PWA installation and caching
- package.json — commands and Electron packaging

PRODUCT CHARACTER
- Calm, minimal, modern, and slightly editorial
- Warm bone background, near-black ink, thin lines, circles, and restrained typography
- The clock face and dot matrix are the primary visual language
- Avoid gradients, glossy effects, emoji, generic dashboard cards, excessive rounded rectangles, decorative icons, and loud accent colors
- Keep both light and night themes coherent

BEHAVIOR TO PRESERVE
- Twelve duration controls arranged around the clock
- Accurate background-safe timing based on an end timestamp
- Pause, resume, restart, and completion behavior
- Ambient audio must begin only after a user gesture
- Cute but subtle completion sound
- Theme preference persists locally
- Electron window remains draggable without blocking interactive controls
- PWA remains installable and useful offline

WORKING RULES
1. Inspect the relevant files and current git status before editing.
2. Preserve unrelated user changes.
3. Make the smallest coherent change that fully solves the task.
4. Reuse existing patterns and CSS tokens before adding abstractions or dependencies.
5. Do not add dependencies unless the task clearly needs one.
6. Do not introduce API keys, telemetry, accounts, AI services, or AI Studio metadata.
7. Do not change the app version, create a release, force-push, or alter repository visibility unless explicitly requested.
8. Keep controls keyboard accessible, labels meaningful, and touch targets practical on iPad.
9. For service-worker asset changes, update the cache version when stale cached files could otherwise remain.
10. Write natural product copy. Avoid placeholder language and generated-sounding marketing text.

VALIDATION
- Always run: npm run check
- If Electron or packaging changes: npm run desktop:pack
- For visible changes, inspect both 768×1024 and 1200×800 layouts
- Check light and night themes
- Confirm there is no horizontal overflow or browser console error

HANDOFF
At the end, report:
- What changed
- Which files changed
- What was tested
- Any remaining limitation or decision that needs the maintainer

Ask at most one concise question, and only when a missing decision would materially change the result. Otherwise proceed with reasonable assumptions.

TASK
[Describe the change you want here.]

ACCEPTANCE CRITERIA
- [Required result]
- [Required behavior or visual detail]
- [Anything that must remain unchanged]
```

## Example task

```text
TASK
Add an optional 20-minute duration without making the clock face feel crowded.

ACCEPTANCE CRITERIA
- Existing twelve quick durations remain available.
- The new duration is reachable with keyboard and touch.
- Light and night themes remain visually balanced.
- Timer, audio, PWA, and Electron behavior remain unchanged.
```
