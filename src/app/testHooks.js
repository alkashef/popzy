/**
 * Lightweight E2E test hooks mounted on window.__shootTest
 */
import { state } from './state.js';
import { startGame } from './controls.js';

export function installTestHooks() {
  try {
    if (typeof window !== 'undefined') {
      window.__shootTest = {
        setTimeLimit(seconds) {
          try {
            state.gameConfig.timeLimitEnabled = true;
            state.gameConfig.timeLimit = Number(seconds) || 0;
            state.__pendingTestConfig = {
              timeLimitEnabled: true,
              timeLimit: Number(seconds) || 0,
            };
            if (state.engine) state.engine.setConfig(state.__pendingTestConfig);
          } catch (_) {}
        },
        /** Merge arbitrary config keys for testing */
        setConfig(cfg) {
          try {
            if (!cfg || typeof cfg !== 'object') return;
            state.__pendingTestConfig = { ...(state.__pendingTestConfig || {}), ...cfg };
            Object.assign(state.gameConfig, cfg);
            if (state.engine) state.engine.setConfig(cfg);
          } catch (_) {}
        },
        start() {
          try {
            if (state.engine) startGame();
            else state.__pendingTestStart = true;
          } catch (_) {}
        },
        /** Lightweight peek at active objects for targeting in tests */
        getObjects() {
          try {
            if (!state.engine) return [];
            const s = state.engine.getState?.();
            if (!s || !Array.isArray(s.gameObjects)) return [];
            return s.gameObjects.map(o => ({ x: o.x, y: o.y, type: o.type, isFriendlyImage: !!o.isFriendlyImage, word: o.word || '' }));
          } catch (_) { return []; }
        },
        /** Click the first friendly object (prefers images) */
        clickFirstFriendly() {
          try {
            if (!state.engine) return false;
            const s = state.engine.getState?.();
            if (!s || !Array.isArray(s.gameObjects)) return false;
            let obj = s.gameObjects.find(o => o.type === 'friendly' && o.isFriendlyImage);
            if (!obj) obj = s.gameObjects.find(o => o.type === 'friendly');
            if (!obj) return false;
            state.engine.handlePointer(Math.round(obj.x), Math.round(obj.y));
            return true;
          } catch (_) { return false; }
        },
        /** Click the first target object */
        clickFirstTarget() {
          try {
            if (!state.engine) return false;
            const s = state.engine.getState?.();
            if (!s || !Array.isArray(s.gameObjects)) return false;
            const obj = s.gameObjects.find(o => o.type === 'target');
            if (!obj) return false;
            state.engine.handlePointer(Math.round(obj.x), Math.round(obj.y));
            return true;
          } catch (_) { return false; }
        },
        getState() {
          return {
            gameStarted: state.gameStarted,
            gamePaused: state.gamePaused,
            score: state.score,
            endReason: state.currentGameEndReason,
          };
        },
      };
    }
  } catch (_) { /* ignore */ }
}
