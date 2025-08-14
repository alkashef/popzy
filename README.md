# Shoot the Unicorn

A 2D browser game for kids: shoot targets, avoid friendlies, and learn along the way. Pure HTML/CSS/JS with ES modules—no build step. UI is composed from HTML partials at runtime.

> Code review: see the engineering review at [code-review.md](./code-review.md).

## Quick start

Prerequisites: Node.js installed.

Windows (cmd):

```cmd
npm install
npm start
```

Open http://127.0.0.1:8080 in your browser. Use Ctrl+F5 to hard-refresh after edits.

## Architecture overview

```
index.html (UI shell + partial loader) ──▶ app.js (orchestrator)
												 │
												 ├── Systems
												 │     └── src/systems/engine.js        # game loop, spawn/update, timer, pointer hits
												 ├── Render
												 │     └── src/render/draw.js           # renderFrame(ctx, canvas, config, objects)
												 ├── UI
												 │     ├── src/ui/dom.js                # DOM cache (UI.el)
												 │     ├── src/ui/scoreboard.js         # score/timer/player-name display
												 │     ├── src/ui/overlay.js            # game-over overlay
												 │     ├── src/ui/canvas.js             # canvas init + CSS-var sizing
												 │     ├── src/ui/caption.js            # caption line (words)
												 │     ├── src/ui/settings.js           # settings entry (composes tabs)
												 │     ├── src/ui/settings-gameplay.js  # speed/randomness/spawn/size/ratio/name/penalty
												 │     ├── src/ui/settings-limits.js    # time & score limits
												 │     ├── src/ui/settings-words.js     # target/friendly words & mode
												 │     ├── src/ui/settings-captions.js  # caption enable/direction/size/color/max tokens
												 │     ├── src/ui/settings-visuals.js   # colors/transparency/paths/shadows/background
												 │     ├── src/ui/settings-helpers.js   # shared helpers (formatSeconds)
												 │     ├── src/ui/scores.js             # scores dashboard modal
												 │     └── src/ui/about.js              # about modal + tabs
												 ├── Services
												 │     ├── src/services/assetManifest.js# lists of asset filenames
												 │     ├── src/services/assets.js       # image loading
												 │     ├── src/services/audio.js        # sound loading + play
												 │     ├── src/services/storage.js      # cookies: config + stats
												 │     └── src/services/stats.js        # pure ranking utilities
												 └── Core
												         └── src/core/config.js           # defaults (incl. UI constants)
```

### Module responsibilities
- app.js: orchestrates app init, loads config/stats/assets, wires UI, constructs engine, routes inputs. E2E test hooks are installed early from index.html before includes load.
- App modules:
	- src/app/init.js: bootstrap sequence (load config/stats, cache DOM, init canvas, load assets, create engine with hooks, bind settings/events, initial render, honor pending test start).
	- src/app/state.js: centralized mutable state (canvas, ctx, assets, engine, flags, score, config, stats); helpers: resetScore, setCanvas.
	- src/app/assets.js: orchestrates image/sound loading via services and sets state; ensures both targets and friendlies enabled.
	- src/app/controls.js: start/pause/resume/stop game; end-reason text/message; play sound; dismiss overlay; ensures canvas sizing vs right panel.
	- src/app/events.js: bind DOM events (controls, modals, canvas clicks); pause/resume around modals; resume via custom events.
	- src/app/settingsActions.js: cross-module actions like resetConfigToDefaults (resets cookie and re-syncs UI/name).
	- src/app/testHooks.js: installs window.__shootTest for deterministic E2E (see E2E stability below).
- src/systems/engine.js: owns game state and RAF loop; emits side effects via hooks: onScoreChange, onTimerUpdate, onAddCaptionWord, onPlaySound, onStop.
- src/render/draw.js: given ctx/canvas/config/objects, draws the frame (background, objects, helpers).
- UI modules:
	- dom.js: caches DOM nodes in UI.el.
	- scoreboard.js: sets score/timer/player name; reset API.
	- overlay.js: show/hide game-over with message and session summary.
	- canvas.js: init canvas and size using CSS var; exports getRightPanelWidth().
	- caption.js: init/add/clear/trim caption; reacts to caption:configChanged.
		- settings.js: settings entry that composes per-tab modules; exports updateSettingsUI, bindSettingsControls, open/close, and re-exports formatSeconds.
		- settings-gameplay.js: speed, randomness, spawnRate, objectSize, sizeVariation, ratio, playerName, missPenaltyEnabled.
		- settings-limits.js: timeLimitEnabled/timeLimit and scoreLimitEnabled/scoreLimit (uses formatSeconds).
		- settings-words.js: targetWords, friendlyWords, friendlyMode.
		- settings-captions.js: captionEnabled, captionDirection, captionMaxTokens, captionColor, captionSize; dispatches caption:configChanged.
		- settings-visuals.js: target/friendly/background colors, transparency, showObjectPaths, objectShadows, background image/color; includes color presets.
		- settings-helpers.js: small shared helpers (formatSeconds).
	- scores.js: renders dashboard sections; open/close modal.
	- about.js: open/close modal; tab switching; exposes window.showAboutTab for inline onclick.
- Services:
	- assetManifest.js: filenames for images/sounds.
	- assets.js / audio.js: async loaders and playSound helper.
	- storage.js: cookie persistence for config + stats; addSession trims to last 50.
	- stats.js: rank calculators (rate, score, accuracy).
- Core: config.js contains GAME_CONFIG_DEFAULTS and UI constants (e.g., RIGHT_PANEL_WIDTH).

### Data flow
- UI controls update gameConfig (via settings.js) and persist using storage.saveConfig.
- app.js constructs engine with hooks. Engine pushes updates to UI (scoreboard, timer, caption), plays sounds, and signals stop with a session summary.
- On stop, app.js persists the session (storage.addSession) and shows overlay; scores modal reads from stored stats (scores.js).
- Canvas sizing reads CSS variable --right-panel-width; config exposes a matching JS fallback.

### E2E stability
- window.__shootTest is installed very early from index.html so tests can set config before app init. It exposes:
	- setTimeLimit(seconds): force time-limit for deterministic tests.
	- setConfig(cfg): merge arbitrary config keys before/after init.
	- start(): start the game once the engine is ready (or mark pending start if not yet ready).
	- getState(): inspect flags (gameStarted, gamePaused, score, endReason).
	- getObjects(): lightweight peek at active objects [{x,y,type,isFriendlyImage,word}].
	- clickFirstFriendly(): click the first friendly (prefers images) to deterministically end the game.
	- clickFirstTarget(): click the first target.

Additionally, the engine enforces time limits via both requestAnimationFrame and a 250ms setInterval fallback to avoid headless throttling issues.

## Project structure (selected)

- index.html — App shell, loads HTML partials via data-include and boots app
- styles/*.css — Modular styles (base, panel, buttons, caption, modals, settings, scores, overlay, about, responsive)
- app.js — Orchestrator and glue code
- src/core/config.js — Defaults and UI constants
- src/systems/engine.js — Game loop and rules
- src/render/draw.js — Rendering helpers
- src/ui/*.js — Modular UI (dom, caption, scoreboard, overlay, canvas, settings, scores, about)
	- Settings tabs: settings-gameplay.js, settings-limits.js, settings-words.js, settings-captions.js, settings-visuals.js; entry: settings.js; helpers: settings-helpers.js
- src/services/*.js — Assets/audio/storage/stats + manifest
	- src/services/themeManifest.js — declarative theme definitions
	- src/services/themes.js — theme application and boot initialization
- assets/** — Images and sounds
- partials/*.html — Modular HTML fragments (title, right-panel, settings, scores, about, game-over)

## Gameplay & controls

- Play, Pause/Resume, Stop controls in the right panel.
- Click targets to score; hitting a friendly ends the game immediately.
- Optional caption shows collected words.
- Scores dashboard: latest ranks (score/rate/accuracy), aggregates, and end-reason histogram.

## Themes

- Themes tab lets you preview/apply a theme (forest, volcano, skies).
- A theme sets game colors, transparencies, background (color/image), cursor, and sound pack.
- Assets live under `assets/themes/<themeId>/` (backgrounds/, sounds/, cursors/). You can still override visuals afterwards.

## Configuration and UI controls

Settings map to these controls (IDs):
- speed → #speed (label: #speed-value)
- randomness → #randomness (label: #randomness-value), spawnRate → #spawnRate (label: #spawnRate-value)
- objectSize → #object-size (label: #object-size-value), sizeVariation → #size-variation (label: #size-variation-value)
- ratio → #ratio (label: #ratio-value), playerName → #player-name (display: #player-name-display)
- targetWords → #target-words, friendlyWords → #friendly-words, friendlyMode → #friendly-mode
- missPenaltyEnabled → #miss-penalty-enabled, showObjectPaths → #show-object-paths, objectShadows → #object-shadows
- timeLimitEnabled → #time-limit-enabled, timeLimit → #time-limit (label: #time-limit-value)
- scoreLimitEnabled → #score-limit-enabled, scoreLimit → #score-limit (label: #score-limit-value)
- captionEnabled → #caption-enabled, captionDirection → #caption-direction
- captionMaxTokens → #caption-max-tokens (label: #caption-max-tokens-value)
- captionColor → #caption-color (presets: #caption-color-presets), captionSize → #caption-size (label: #caption-size-value)
- targetColor → #target-color (presets: #target-color-presets), friendlyColor → #friendly-color (presets: #friendly-color-presets)
- backgroundColor → #background-color (presets: #background-color-presets), background image → #background-image

Notes
- Targets/friendlies are always enabled; `ratio` controls frequency.
- A “random colors” preset toggles useRandomColors.
- UI.RIGHT_PANEL_WIDTH mirrors CSS var --right-panel-width to keep JS/CSS in sync.

## Assets and sounds

- Update src/services/assetManifest.js to add/remove filenames.
- Loaders resolve paths using GAME_CONFIG_DEFAULTS.ASSETS base folders.
- Images: PNG with transparency recommended; Sounds: MP3.

### Audio
- Background music plays during gameplay (looped) from `assets/sounds/background.mp3`.
- Global Volume control is available in Settings → Gameplay; it affects SFX and background music.
- SFX files (base pack): `game-start.mp3`, `game-over.mp3`, `target-hit.mp3`, `friendly-hit.mp3`, `obstacle-hit.mp3`.
- Themes may override SFX via their own `assets/themes/<theme>/sounds/` files.

## Testing

- E2E (Playwright): tests/e2e/*.spec.js; server auto-starts via playwright.config.js.
- Unit (Node runner): tests/unit/*.test.js discovered by tests/unit/runner.js.

Install and run (Windows cmd)

```cmd
npm install
npx playwright install --with-deps

:: Unit tests
npm run test:unit

:: E2E tests
npm test

:: All tests
npm run test:all
```

Tips
- Single file: `npx playwright test tests\e2e\smoke.spec.js`
- Debug: `set PWDEBUG=1 && npx playwright test`

## HTML partials loader

index.html uses a tiny loader (`src/utils/includes.js`) to fetch and inline HTML fragments declared with `data-include`. Boot order:
1) Install test hooks
2) Await includes
3) Import `app.js` to initialize the app

## Contributing

Proprietary project. If collaborating:
- Small, focused PRs; one responsibility per change.
- Follow .github/copilot-instructions.md (clarity, small functions, DRY, separation of concerns).
- Update tests and docs alongside code changes.

## Troubleshooting

- Port in use: change `-p` in package.json (e.g., 3000).
- Cache: Ctrl+F5 or disable cache with devtools open.
- Audio: browsers require user interaction; click once before expecting sound.

## Copyright & License

© 2025 Ahmad Alkashef (alkashef@gmail.com). All rights reserved.

PROPRIETARY SOFTWARE — PERSONAL USE ONLY

This software is the exclusive property of Ahmad Alkashef. Licensed for personal use only by Ahmad Alkashef. No reproduction, distribution, modification, or commercial use is permitted without explicit written authorization.

Author & Owner: Ahmad Alkashef — alkashef@gmail.com

This game is the exclusive intellectual property of Ahmad Alkashef. Unauthorized use is prohibited.

<!-- stats:start -->

## Project stats

- Total lines (non-empty): 3414
- Actual code lines (prod): 2247 (65.8%)
- Documentation lines (prod): 511 (15.0%)
- Test code lines: 656 (19.2%)
- Unit test coverage (lines): 81.6%

<sub>Notes: Totals exclude blank lines. Documentation = comment lines in production files (.js/.css/.html). Test lines count non-comment lines under tests/. Coverage is from unit tests (c8).</sub>

<!-- stats:end -->
