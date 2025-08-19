/**
 * Settings: Gameplay
 * - Speed, randomness, spawn rate, size, variation, ratio, player name, miss penalty
 */
import { UI } from './dom.js';
import { saveConfig as storageSaveConfig } from '../services/storage.js';

export function updateSettingsUIGameplay(gameConfig) {
  const get = (key) => UI?.el?.[key] || document.getElementById(key);
  const setText = (key, text) => {
    const el = UI?.el?.[key] || document.getElementById(key);
    if (el) el.textContent = text;
  };

  const speed = get('speed');
  if (speed) speed.value = gameConfig.speed;
  setText('speedValue', `${gameConfig.speed.toFixed(1)}x`);

  // randomness control removed; enforce max internally
  gameConfig.randomness = 1;

  const spawnRate = get('spawnRate');
  if (spawnRate) spawnRate.value = gameConfig.spawnRate;
  setText('spawnRateValue', gameConfig.spawnRate);

  const objectSize = get('objectSize');
  if (objectSize) objectSize.value = gameConfig.objectSize;
  setText('objectSizeValue', gameConfig.objectSize);

  const sizeVariation = get('sizeVariation');
  if (sizeVariation) sizeVariation.value = gameConfig.sizeVariation;
  setText('sizeVariationValue', gameConfig.sizeVariation.toFixed(1));

  const volume = get('volume');
  if (volume) volume.value = gameConfig.volume != null ? gameConfig.volume : 0.5;
  setText('volumeValue', `${Math.round((gameConfig.volume != null ? gameConfig.volume : 0.5) * 100)}%`);

  const ratio = get('ratio');
  if (ratio) ratio.value = gameConfig.ratio;
  setText('ratioValue', gameConfig.ratio.toFixed(1));

  const playerName = get('playerName');
  if (playerName) playerName.value = gameConfig.playerName || '';

  const missPenaltyEnabled = get('missPenaltyEnabled');
  if (missPenaltyEnabled) missPenaltyEnabled.checked = gameConfig.missPenaltyEnabled;
}

export function bindGameplayControls(gameConfig) {
  const on = (el, type, fn) => el && el.addEventListener(type, fn);
  const get = (key) => UI?.el?.[key] || document.getElementById(key);
  const setText = (key, text) => {
    const el = UI?.el?.[key] || document.getElementById(key);
    if (el) el.textContent = text;
  };

  function updateSpeed(e) {
    gameConfig.speed = parseFloat(e.target.value);
    setText('speedValue', `${gameConfig.speed.toFixed(1)}x`);
    storageSaveConfig(gameConfig);
  }
  // randomness control removed; no binding
  function updateSpawnRate(e) {
    gameConfig.spawnRate = parseInt(e.target.value);
    setText('spawnRateValue', gameConfig.spawnRate);
    storageSaveConfig(gameConfig);
  }
  function updateObjectSize(e) {
    gameConfig.objectSize = parseInt(e.target.value);
    setText('objectSizeValue', gameConfig.objectSize);
    storageSaveConfig(gameConfig);
  }
  function updateSizeVariation(e) {
    gameConfig.sizeVariation = parseFloat(e.target.value);
    setText('sizeVariationValue', gameConfig.sizeVariation.toFixed(1));
    storageSaveConfig(gameConfig);
  }
  function updateVolume(e) {
    const v = parseFloat(e.target.value);
    gameConfig.volume = isNaN(v) ? 0.5 : v;
    setText('volumeValue', `${Math.round(gameConfig.volume * 100)}%`);
    storageSaveConfig(gameConfig);
    try {
      const { setGlobalVolume } = require('../services/audio.js');
      // dynamic import not needed in browser; tests use Node require shim
      if (typeof setGlobalVolume === 'function') {
        // We can't access state.sounds here directly; dispatch an event that init/controls can handle.
      }
    } catch {}
    try { document.dispatchEvent(new CustomEvent('audio:volume', { detail: { volume: gameConfig.volume } })); } catch {}
  }
  function updateRatio(e) {
    gameConfig.ratio = parseFloat(e.target.value);
    setText('ratioValue', gameConfig.ratio.toFixed(1));
    storageSaveConfig(gameConfig);
  }
  function updatePlayerName(e) {
    gameConfig.playerName = e.target.value;
    storageSaveConfig(gameConfig);
  }
  function updateMissPenaltyEnabled(e) { gameConfig.missPenaltyEnabled = e.target.checked; storageSaveConfig(gameConfig); }

  on(get('speed'), 'input', updateSpeed);
  // randomness control removed
  on(get('spawnRate'), 'input', updateSpawnRate);
  on(get('objectSize'), 'input', updateObjectSize);
  on(get('sizeVariation'), 'input', updateSizeVariation);
  on(get('ratio'), 'input', updateRatio);
  on(get('playerName'), 'input', updatePlayerName);
  on(get('missPenaltyEnabled'), 'change', updateMissPenaltyEnabled);
  on(get('volume'), 'input', updateVolume);
}
