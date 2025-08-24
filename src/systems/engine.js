/**
 * Module: Systems/Game Engine
 * Responsibility:
 * - Encapsulate core gameplay loop: spawn, update, render, timing, and input hit-testing.
 * - Remain UI-agnostic; communicate via host-provided hooks (callbacks) only.
 * - Enforce end conditions: friendly hit, score < 0, time limit, score limit, manual stop.
 * Notes:
 * - Uses requestAnimationFrame; also installs a 250ms setInterval ticker to enforce
 *   time limits robustly in headless browsers (where rAF may be throttled).
 */

/**
 * @typedef {Object} EngineHooks
 * @property {(newScore:number)=>void} [onScoreChange]
 * @property {(text:string)=>void} [onTimerUpdate]
 * @property {(word:string)=>void} [onAddCaptionWord]
 * @property {(key:string)=>void} [onPlaySound]
 * @property {(reason:string, session:object, meta:{durationMs:number})=>void} [onStop]
 */

/**
 * @typedef {Object} EngineAPI
 * @property {()=>void} start
 * @property {()=>void} pause
 * @property {()=>void} resume
 * @property {(reason?:string)=>void} stop
 * @property {(x:number, y:number)=>void} handlePointer
 * @property {(nextConfig:Object)=>void} setConfig
 * @property {(nextAssets:Object)=>void} setAssets
 * @property {()=>Object} getState
 */

import { GAME_CONFIG_DEFAULTS } from '../core/config.js';

/**
 * Create a new game engine instance.
 * Inputs are plain objects and functions so the engine stays framework-free.
 *
 * @param {{
 *  canvas: HTMLCanvasElement,
 *  ctx: CanvasRenderingContext2D,
 *  gameConfig: any,
 *  renderFrame: (ctx:CanvasRenderingContext2D, canvas:HTMLCanvasElement, cfg:any, objects:any[], started:boolean)=>void,
 *  assets: { friendlyImages?: HTMLImageElement[] },
 *  hooks?: EngineHooks,
 * }} deps
 * @returns {EngineAPI}
 */
export function createGameEngine({ canvas, ctx, gameConfig, renderFrame, assets, hooks }) {
  // Keep a reference to the external config object and use a per-session snapshot
  // so settings changes apply on the next game start, not mid-session.
  let sourceConfig = gameConfig;
  function cloneConfig(obj) {
    try { return JSON.parse(JSON.stringify(obj || {})); } catch { return { ...(obj || {}) }; }
  }
  const state = {
    gameObjects: [],
    score: 0,
    started: false,
    paused: false,
    lastTimestamp: undefined,
    lastSpawnTime: 0,
    // timing
    gameStartTime: 0,
    totalPausedTime: 0,
    pauseStartTime: 0,
    // per-session stats
    hits: 0,
    misses: 0,
    clicks: 0,
    targetsPenalized: 0,
    endReason: '',
  // timers
  limitTickerId: 0,
  };

  function setAssets(nextAssets) {
    assets = nextAssets || assets;
  }

  function setConfig(nextConfig) {
    // Update the source (to be applied on next start)
    Object.assign(sourceConfig, nextConfig || {});
  }

  function start() {
    if (state.started && state.paused) return resume();
    // Snapshot current settings for this session
    gameConfig = cloneConfig(sourceConfig);
    state.started = true;
    state.paused = false;
    state.gameStartTime = Date.now();
    state.totalPausedTime = 0;
    state.pauseStartTime = 0;
    state.lastTimestamp = undefined;
    state.lastSpawnTime = 0; // force immediate spawn
    state.gameObjects = [];
    state.score = 0;
    state.hits = 0;
    state.misses = 0;
    state.clicks = 0;
    state.targetsPenalized = 0;
    state.endReason = '';
    // start raf loop
    requestAnimationFrame(raf);
    // start resilient time-limit ticker (in case rAF is throttled in headless)
    if (gameConfig.timeLimitEnabled) {
      if (state.limitTickerId) clearInterval(state.limitTickerId);
      state.limitTickerId = setInterval(() => {
        if (!state.started || state.paused) return;
        const now = Date.now();
        const elapsed = now - state.gameStartTime - state.totalPausedTime;
        const elapsedSec = Math.floor(elapsed / 1000);
        if (elapsedSec >= gameConfig.timeLimit) stop('time_limit');
      }, 250);
    }
  }

  function pause() {
    if (!state.started || state.paused) return;
    state.pauseStartTime = Date.now();
    state.paused = true;
  }

  function resume() {
    if (!state.started || !state.paused) return;
    state.totalPausedTime += (Date.now() - state.pauseStartTime);
    state.paused = false;
  state.lastTimestamp = undefined;
  requestAnimationFrame(raf);
  }

  function stop(reason = 'manual') {
    if (!state.started) return;
    state.endReason = reason;
    if (state.limitTickerId) {
      clearInterval(state.limitTickerId);
      state.limitTickerId = 0;
    }

    // duration (account for paused time)
    const endTime = Date.now();
    const pauseTimeToAdd = state.paused ? (endTime - state.pauseStartTime) : 0;
    const durationMs = endTime - state.gameStartTime - state.totalPausedTime - pauseTimeToAdd;
    const durationSeconds = Math.floor(durationMs / 1000);
    const durationMinutes = durationSeconds / 60;

    // stats
    const effectiveHits = state.hits - state.targetsPenalized;
    const averageHitRate = durationMinutes > 0 ? (effectiveHits / durationMinutes) : 0;
    const accuracy = state.clicks > 0 ? ((state.hits / state.clicks) * 100) : 0;

    const session = {
      gameEndTime: new Date().toISOString(),
      playerName: gameConfig.playerName || 'player 1',
      score: state.score,
      gameDurationSeconds: durationSeconds,
      averageHitRate: Math.round(averageHitRate * 100) / 100,
      hits: state.hits,
      misses: state.misses,
      clicks: state.clicks,
      accuracy: Math.round(accuracy * 100) / 100,
      targetsPenalized: state.targetsPenalized,
      gameEndReason: reason,
    };

    // notify host before resetting internals
    hooks?.onStop?.(reason, session, { durationMs });

    // reset engine state
    state.started = false;
    state.paused = false;
    state.gameObjects = [];
    state.lastTimestamp = undefined;
    state.lastSpawnTime = 0;
    // reset outward indicators
    hooks?.onScoreChange?.(state.score);
    hooks?.onTimerUpdate?.('00:00');
  }

  function handlePointer(x, y) {
    if (!state.started) return;
    state.clicks++;

    let hit = false;
    for (let i = state.gameObjects.length - 1; i >= 0; i--) {
      const obj = state.gameObjects[i];
      const dx = x - obj.x;
      const dy = y - obj.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= obj.radius) {
        // hit
        state.gameObjects.splice(i, 1);
        hit = true;
        state.hits++;

        if (obj.isFriendlyImage) {
          hooks?.onPlaySound?.('obstacleHit');
          return stop('friendly_shot');
        } else {
          // Reflect all hits in caption when a word is present (targets and friendlies)
          if (obj.word) hooks?.onAddCaptionWord?.(obj.word);
          if (obj.type === 'target') hooks?.onPlaySound?.('targetHit');
          else if (obj.type === 'friendly' && obj.word) hooks?.onPlaySound?.('friendlyHit');

          state.score += obj.points;
          hooks?.onScoreChange?.(state.score);
          if (state.score < 0) return stop('score_negative');
          if (gameConfig.scoreLimitEnabled && state.score >= gameConfig.scoreLimit) {
            return stop('score_limit');
          }
        }
        break;
      }
    }

    if (!hit) state.misses++;
  }

  function raf(ts) {
    if (state.paused) return requestAnimationFrame(raf);
    if (!state.started) return; // stop scheduling when not started

    // delta
    let dt = ts - (state.lastTimestamp || ts);
    dt = Math.min(dt, 50);
    state.lastTimestamp = ts;

    spawnObject();
    updateObjects(dt);
    renderFrame?.(ctx, canvas, gameConfig, state.gameObjects, state.started);
    updateTimer();

    requestAnimationFrame(raf);
  }

  function spawnObject() {
    if (!state.started || state.paused) return;
    const now = Date.now();
    const spawnInterval = (60 / gameConfig.spawnRate) * 1000;
    if (now - state.lastSpawnTime < spawnInterval) return;

    const type = Math.random() < gameConfig.ratio ? 'target' : 'friendly';
    const edge = Math.floor(Math.random() * 4);
    let startX, startY;
    switch (edge) {
      case 0: startX = Math.random() * canvas.width; startY = -gameConfig.objectSize; break;
      case 1: startX = canvas.width + gameConfig.objectSize; startY = Math.random() * canvas.height; break;
      case 2: startX = Math.random() * canvas.width; startY = canvas.height + gameConfig.objectSize; break;
      case 3: startX = -gameConfig.objectSize; startY = Math.random() * canvas.height; break;
    }

    const sizeVar = gameConfig.sizeVariation || 0.3;
    const minSize = gameConfig.objectSize * (1 - sizeVar);
    const maxSize = gameConfig.objectSize * (1 + sizeVar);
    const radius = minSize + Math.random() * (maxSize - minSize);

    const baseSpeed = GAME_CONFIG_DEFAULTS.BASE_SPEED * gameConfig.speed;
    const randomness = gameConfig.randomness;
    const targetX = canvas.width / 2 + (Math.random() - 0.5) * canvas.width * randomness;
    const targetY = canvas.height / 2 + (Math.random() - 0.5) * canvas.height * randomness;
    const dx = targetX - startX;
    const dy = targetY - startY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const pxPerSec = baseSpeed;
    const vx = (dx / dist) * pxPerSec / 1000;
    const vy = (dy / dist) * pxPerSec / 1000;

    const obj = {
      x: startX, y: startY,
      vx, vy,
      type,
      radius,
      points: type === 'target' ? 1 : -1,
      path: { startX, startY, endX: targetX, endY: targetY },
    };

    if (gameConfig.useRandomColors) {
      const colors = ['#ff0000','#ff8800','#ffff00','#88ff00','#00ff00','#00ffff','#0088ff','#0000ff','#8800ff','#ff00ff','#ff0088'];
      obj.color = colors[Math.floor(Math.random() * colors.length)];
    } else {
      // Apply configured static colors for non-random mode
      if (type === 'target') obj.color = gameConfig.targetColor;
      else obj.color = gameConfig.friendlyColor;
    }

    if (type === 'target' && gameConfig.targetWords) {
      const words = gameConfig.targetWords.trim().split(/\s+/);
      if (words.length && words[0] !== '') obj.word = words[Math.floor(Math.random() * words.length)];
    }

    if (type === 'friendly') {
      const mode = gameConfig.friendlyMode;
      if (mode === 'images' && assets?.friendlyImages?.length) {
        obj.image = assets.friendlyImages[Math.floor(Math.random() * assets.friendlyImages.length)];
        obj.isFriendlyImage = true;
      } else if (mode === 'words' && gameConfig.friendlyWords) {
        const words = gameConfig.friendlyWords.trim().split(/\s+/);
        if (words.length && words[0] !== '') obj.word = words[Math.floor(Math.random() * words.length)];
      } else if (mode === 'both') {
        const useImage = assets?.friendlyImages?.length && Math.random() < 0.5;
        if (useImage) {
          obj.image = assets.friendlyImages[Math.floor(Math.random() * assets.friendlyImages.length)];
          obj.isFriendlyImage = true;
        } else if (gameConfig.friendlyWords) {
          const words = gameConfig.friendlyWords.trim().split(/\s+/);
          if (words.length && words[0] !== '') obj.word = words[Math.floor(Math.random() * words.length)];
        }
      }
    }

    state.gameObjects.push(obj);
    state.lastSpawnTime = now;
  }

  function updateObjects(dt) {
    for (let i = state.gameObjects.length - 1; i >= 0; i--) {
      const obj = state.gameObjects[i];
      const smooth = Math.min(dt, 16.67);
      obj.x += obj.vx * smooth;
      obj.y += obj.vy * smooth;
      const margin = gameConfig.objectSize * 2;
      const off = obj.x < -margin || obj.x > canvas.width + margin || obj.y < -margin || obj.y > canvas.height + margin;
      if (off) {
        if (gameConfig.missPenaltyEnabled && obj.type === 'target') {
          state.score -= 1;
          state.targetsPenalized++;
          hooks?.onScoreChange?.(state.score);
          if (state.score < 0) return stop('score_negative');
        }
        state.gameObjects.splice(i, 1);
      }
    }
  }

  function updateTimer() {
    let elapsed;
    if (!state.started) {
      hooks?.onTimerUpdate?.('00:00');
      return;
    }
    if (state.paused) elapsed = state.pauseStartTime - state.gameStartTime - state.totalPausedTime;
    else elapsed = Date.now() - state.gameStartTime - state.totalPausedTime;
    const minutes = Math.floor(elapsed / (1000 * 60));
    const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    hooks?.onTimerUpdate?.(timeString);
    if (!state.paused && gameConfig.timeLimitEnabled) {
      const elapsedSec = Math.floor(elapsed / 1000);
      if (elapsedSec >= gameConfig.timeLimit) return stop('time_limit');
    }
  }

  function getState() {
    return { ...state };
  }

  return { start, pause, resume, stop, handlePointer, setConfig, setAssets, getState };
}
