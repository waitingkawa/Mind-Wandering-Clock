# Mind-Wandering Clock

![Mind-Wandering Clock](public/og.png)

A quiet timer for deliberate pauses. Choose a duration from the clock face, let the dot field mark the passing time, and listen to a soft rain-and-wind soundscape while your attention drifts.

The clock works as a macOS desktop app and as an installable web app. It runs locally and does not send timer or audio data anywhere.

## Download

Download the latest macOS build from [GitHub Releases](https://github.com/waitingkawa/Mind-Wandering-Clock/releases/latest).

- `arm64` is for Apple Silicon Macs (M1 and newer).
- `x64` is for Intel Macs.
- The DMG is the usual installer; the ZIP contains the app directly.

The downloadable builds are currently unsigned. If macOS blocks the first launch, Control-click the app, choose **Open**, then confirm once. Signed and notarized builds are planned.

For iPad or iPhone, open the [web version](https://waitingkawa.github.io/Mind-Wandering-Clock/) in Safari and choose **Share → Add to Home Screen**.

## What it includes

- Twelve quick timer durations arranged around a clock face
- Light and night themes with a remembered preference
- A 60-dot progress field
- Synthesized rain, wind, and a gentle completion chime
- A draggable, always-available macOS window
- Offline-capable PWA support

## Development

Requires Node.js 22 or newer.

```bash
git clone https://github.com/waitingkawa/Mind-Wandering-Clock.git
cd Mind-Wandering-Clock
npm ci
npm run dev
```

Before committing:

```bash
npm run check
```

To open the desktop app locally:

```bash
npm run desktop:start
```

To create a DMG and ZIP for the current Mac architecture:

```bash
npm run desktop:dist
```

Build outputs are written to `release/`.

## Working with coding agents

[`AGENT_PROMPT.md`](AGENT_PROMPT.md) contains a copy-ready maintenance prompt for Codex, Claude Code, Cursor, and similar tools. Add the task and acceptance criteria at the bottom; the rest keeps changes aligned with the clock's design, behavior, and release process.

## Publishing a release

The release workflow builds both Apple Silicon and Intel installers. Keep `package.json` and the Git tag on the same version:

```bash
npm version patch
git push origin main --follow-tags
```

Pushing a tag such as `v1.1.1` creates a GitHub Release and attaches the four macOS downloads automatically. Use `minor` or `major` instead of `patch` when appropriate.

The web version is published from `main` through GitHub Pages. In the repository settings, select **Pages → Source → GitHub Actions** once.

## Contributing

Small, focused pull requests are welcome. For visual changes, include a screenshot; for behavior changes, describe what you tested. Please open an issue before beginning a large redesign so the direction can be discussed first.

## License

[MIT](LICENSE)
