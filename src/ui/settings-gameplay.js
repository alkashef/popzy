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

  const randomness = get('randomness');
  if (randomness) randomness.value = gameConfig.randomness;
  setText('randomnessValue', gameConfig.randomness.toFixed(1));

  const spawnRate = get('spawnRate');
  if (spawnRate) spawnRate.value = gameConfig.spawnRate;
  setText('spawnRateValue', gameConfig.spawnRate);

  const objectSize = get('objectSize');
  if (objectSize) objectSize.value = gameConfig.objectSize;
  setText('objectSizeValue', gameConfig.objectSize);

  const sizeVariation = get('sizeVariation');
  if (sizeVariation) sizeVariation.value = gameConfig.sizeVariation;
  setText('sizeVariationValue', gameConfig.sizeVariation.toFixed(1));

  const ratio = get('ratio');
  if (ratio) ratio.value = gameConfig.ratio;
  setText('ratioValue', gameConfig.ratio.toFixed(2));

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
  function updateRandomness(e) {
    gameConfig.randomness = parseFloat(e.target.value);
    setText('randomnessValue', gameConfig.randomness.toFixed(1));
    storageSaveConfig(gameConfig);
  }
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
  function updateRatio(e) {
    gameConfig.ratio = parseFloat(e.target.value);
    setText('ratioValue', gameConfig.ratio.toFixed(2));
    storageSaveConfig(gameConfig);
  }
  function updatePlayerName(e) {
    gameConfig.playerName = e.target.value;
    storageSaveConfig(gameConfig);
  }
  function updateMissPenaltyEnabled(e) { gameConfig.missPenaltyEnabled = e.target.checked; storageSaveConfig(gameConfig); }

  on(get('speed'), 'input', updateSpeed);
  on(get('randomness'), 'input', updateRandomness);
  on(get('spawnRate'), 'input', updateSpawnRate);
  on(get('objectSize'), 'input', updateObjectSize);
  on(get('sizeVariation'), 'input', updateSizeVariation);
  on(get('ratio'), 'input', updateRatio);
  on(get('playerName'), 'input', updatePlayerName);
  on(get('missPenaltyEnabled'), 'change', updateMissPenaltyEnabled);
}
