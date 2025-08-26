/**
 * Settings: Limits
 * - Time/score limits
 */
import { UI } from './dom.js';
import { saveGameConfig } from '../services/configPersister.js';
import { formatSeconds } from './settings-helpers.js';

export function updateSettingsUILimits(gameConfig) {
  const get = (key) => UI?.el?.[key] || document.getElementById(key);
  const setText = (key, text) => {
    const el = UI?.el?.[key] || document.getElementById(key);
    if (el) el.textContent = text;
  };

  const timeLimitEnabled = get('timeLimitEnabled');
  if (timeLimitEnabled) timeLimitEnabled.checked = gameConfig.timeLimitEnabled;

  const timeLimit = get('timeLimit');
  if (timeLimit) timeLimit.value = gameConfig.timeLimit;
  setText('timeLimitValue', formatSeconds(gameConfig.timeLimit));

  const scoreLimitEnabled = get('scoreLimitEnabled');
  if (scoreLimitEnabled) scoreLimitEnabled.checked = gameConfig.scoreLimitEnabled;

  const scoreLimit = get('scoreLimit');
  if (scoreLimit) scoreLimit.value = gameConfig.scoreLimit;
  setText('scoreLimitValue', gameConfig.scoreLimit);
}

export function bindLimitsControls(gameConfig) {
  const on = (el, type, fn) => el && el.addEventListener(type, fn);
  const get = (key) => UI?.el?.[key] || document.getElementById(key);
  const setText = (key, text) => {
    const el = UI?.el?.[key] || document.getElementById(key);
    if (el) el.textContent = text;
  };

  function updateTimeLimitEnabled(e) { gameConfig.timeLimitEnabled = e.target.checked; saveGameConfig(gameConfig); }
  function updateTimeLimit(e) {
    gameConfig.timeLimit = parseInt(e.target.value);
    setText('timeLimitValue', formatSeconds(gameConfig.timeLimit));
  saveGameConfig(gameConfig);
  }
  function updateScoreLimitEnabled(e) { gameConfig.scoreLimitEnabled = e.target.checked; saveGameConfig(gameConfig); }
  function updateScoreLimit(e) {
    gameConfig.scoreLimit = parseInt(e.target.value);
    setText('scoreLimitValue', gameConfig.scoreLimit);
  saveGameConfig(gameConfig);
  }

  on(get('timeLimitEnabled'), 'change', updateTimeLimitEnabled);
  on(get('timeLimit'), 'input', updateTimeLimit);
  on(get('scoreLimitEnabled'), 'change', updateScoreLimitEnabled);
  on(get('scoreLimit'), 'input', updateScoreLimit);
}
