/**
 * Centralized mutable game state for Popzy
 */
import { createDefaultGameConfig } from '../core/config.js';

export const state = {
  // canvas & rendering
  canvas: null,
  ctx: null,

  // assets
  targetImages: [],
  friendlyImages: [],
  sounds: {},

  // engine & flow
  engine: null,
  gameStarted: false,
  gamePaused: false,

  // gameplay
  score: 0,
  gameConfig: createDefaultGameConfig(),
  currentGameEndReason: '',

  // persistence
  gameStats: {
    totalHits: 0,
    totalMisses: 0,
    totalTargetsPenalized: 0,
    gameSessionStats: [],
  },

  // test helpers
  __pendingTestStart: false,
  __pendingTestConfig: null,
};

export function resetScore() {
  state.score = 0;
}

export function setCanvas(canvas, ctx) {
  state.canvas = canvas;
  state.ctx = ctx;
}
