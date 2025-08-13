/**
 * Settings: Words
 * - targetWords, friendlyWords, friendlyMode
 */
import { UI } from './dom.js';
import { saveConfig as storageSaveConfig } from '../services/storage.js';

export function updateSettingsUIWords(gameConfig) {
  const get = (key) => UI?.el?.[key] || document.getElementById(key);

  const targetWords = get('targetWords');
  if (targetWords) targetWords.value = gameConfig.targetWords || '';

  const friendlyWords = get('friendlyWords');
  if (friendlyWords) friendlyWords.value = gameConfig.friendlyWords || '';

  const friendlyMode = get('friendlyMode');
  if (friendlyMode) friendlyMode.value = gameConfig.friendlyMode;
}

export function bindWordsControls(gameConfig) {
  const on = (el, type, fn) => el && el.addEventListener(type, fn);
  const get = (key) => UI?.el?.[key] || document.getElementById(key);

  function updateTargetWords(e) { gameConfig.targetWords = e.target.value; storageSaveConfig(gameConfig); }
  function updateFriendlyWords(e) { gameConfig.friendlyWords = e.target.value; storageSaveConfig(gameConfig); }
  function updateFriendlyMode(e) { gameConfig.friendlyMode = e.target.value; storageSaveConfig(gameConfig); }

  on(get('targetWords'), 'input', updateTargetWords);
  on(get('friendlyWords'), 'input', updateFriendlyWords);
  on(get('friendlyMode'), 'change', updateFriendlyMode);
}
