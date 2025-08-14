# Code Review Report — Shoot the Unicorn

Date: 2025-08-14

## Executive summary

The codebase is in good shape for ongoing feature work: modular ES modules, clear separation (app/engine/UI/services), and deterministic E2E coverage of all end-game scenarios. Unit tests now pass and coverage is healthy (≈81.6% lines). Tooling is in place: ESLint/Prettier and CI (GitHub Actions) enforce linting, unit coverage, and E2E runs. Documentation is stronger (module headers, expanded README) and the README includes an auto-updated stats section.

Remaining gaps are incremental quality improvements: a few UI modules have lower coverage (e.g., `ui/canvas.js`, `ui/settings.js`, and background-image branches in `ui/settings-visuals.js`), per-function JSDoc is not universal, accessibility isn’t addressed explicitly, and cookie utilities are still simplistic. Overall, the project adheres well to the repository guidelines (clarity, modularity, small functions, DRY) with solid test hygiene.

## Current metrics (unit tests)

- Coverage (c8, unit only): Lines 81.6%, Functions 74.2%, Branches 78.4%
- Coverage gate (CI): Lines ≥70%, Functions ≥65%, Branches ≥70%
- Tests: 20 unit tests passing; E2E suite green

## Top positives (max. 10)

1) Clear modular architecture (app/engine/ui/services/core) with small, focused files.
2) UI-agnostic game engine with hook-based integration; deterministic end conditions.
3) E2E tests cover all end-game scenarios; early test hooks improve headless stability.
4) Time-limit robustness via rAF plus interval fallback.
5) Settings UI decomposed by tab with shared helpers and consistent patterns.
6) Asset/audio services are data-driven; centralized state keeps orchestration clear.
7) Client-side includes for HTML; boot sequence awaits includes to avoid races.
8) Tooling: ESLint/Prettier configured; CI runs lint, unit coverage, and E2E.
9) README is comprehensive; auto-updated stats block adds useful visibility.
10) Unit coverage improved to ~82% with targeted tests across under-covered UI modules.

## Top negatives (max. 10)

1) Uneven per-function JSDoc in UI/settings modules; documentation density varies.
2) Repetitive DOM binding/update helpers across settings modules (get/on/setText) could be DRYed.
3) Cookie utilities remain naive (string parsing) vs. robust cookie parsing/serialization.
4) Accessibility: missing ARIA roles/labels, keyboard navigation, and focus management in modals.
5) Limited UI error surfacing; asset/caption issues rely on console warnings.
6) `ui/canvas.js` coverage is low; more tests around sizing, canvas init errors would help.
7) `ui/settings.js` orchestration remains under-tested.
8) `ui/settings-visuals.js` background image branches (FileReader/Image) are not covered in unit tests.
9) No typed contracts; heavier JSDoc or TS would reduce ambiguity in engine/config shapes.
10) Minor Node warning (“MODULE_TYPELESS_PACKAGE_JSON”) when importing ESM in tests; adding `"type": "module"` would avoid reparsing overhead (may require adjusting CommonJS test runner).

## Must / Should / Could changes

### Must (next short iteration)

- Lift coverage in the lowest modules and raise the CI gate gradually:
  - Add unit tests for `ui/canvas.js` (canvas init failures, CSS var fallback branches).
  - Add tests for `ui/settings.js` entry wiring (open/close, tab composition).
  - Cover `ui/settings-visuals.js` background image path using stubs for FileReader/Image.
- Keep CI gates strict: bump lines to ≥75% once the above tests land.

### Should (maintainability)

- Extract tiny DOM helpers (getEl/on/setText) to a shared utility to remove repetition across settings modules.
- Expand JSDoc to per-function level for the UI/settings layer; keep functions small (<15 LOC) and focused.
- Improve cookie utilities with parse/serialize helpers and consistent attributes (path=/; samesite=lax); add unit tests.
- Add basic accessibility: ARIA roles/labels, keyboard handling, focus trap in modals.
- Surface non-fatal errors in the UI (status line/toast) for asset/caption issues.
- Consider adding a CONTRIBUTING.md with style, testing, and PR guidance.

### Could (enhancements)

- Adopt TypeScript gradually (or richer JSDoc typedefs) for engine state/settings/contracts.
- Add audio preferences (mute/persisted volume) and feature flags for experimental visuals.
- i18n scaffolding for UI strings; consider RTL support.
- Debug/perf tools: optional FPS meter, object cap per frame.
- Mobile polish: larger tap targets, haptics (where available), responsive panel improvements.
