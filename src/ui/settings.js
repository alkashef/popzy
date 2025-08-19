/**
 * Module: UI/Settings Panel
 * Responsibility:
 * - Sync settings UI with gameConfig and persist changes.
 * - Bind input/change handlers for all settings controls.
 * API:
 * - updateSettingsUI(gameConfig)
 * - bindSettingsControls(gameConfig)
 */

import { UI } from './dom.js';
import { saveConfig as storageSaveConfig } from '../services/storage.js';
// import { clearCaption } from './caption.js';
import { updateSettingsUICaptions, bindCaptionsControls } from './settings-captions.js';
import { updateSettingsUIVisuals, bindVisualsControls } from './settings-visuals.js';
import { updateSettingsUIGameplay, bindGameplayControls } from './settings-gameplay.js';
import { updateSettingsUILimits, bindLimitsControls } from './settings-limits.js';
import { updateSettingsUIWords, bindWordsControls } from './settings-words.js';
import { formatSeconds as _formatSeconds } from './settings-helpers.js';
// Themes removed

export function updateSettingsUI(gameConfig) {
  // Delegate to submodules by tab
  updateSettingsUIGameplay(gameConfig);
  updateSettingsUILimits(gameConfig);
  updateSettingsUIWords(gameConfig);
  updateSettingsUICaptions(gameConfig);
  updateSettingsUIVisuals(gameConfig);
}

export function bindSettingsControls(gameConfig) {
  // Helpers
  const on = (el, type, fn) => el && el.addEventListener(type, fn);
  const get = (id) => UI?.el?.[id] || document.getElementById(id);
  const setText = (id, text) => {
    const el = UI?.el?.[id] || document.getElementById(id);
    if (el) el.textContent = text;
  };
  // Delegate bindings to submodules by tab
  bindGameplayControls(gameConfig);
  bindLimitsControls(gameConfig);
  bindWordsControls(gameConfig);
  bindCaptionsControls(gameConfig);
  bindVisualsControls(gameConfig);
  // themes removed

  // Presets and tabs
  setupTabSwitching();
}

// Color presets were moved into the visuals/captions submodules.

function setupTabSwitching() {
  const tabs = document.querySelectorAll('.settings-tab');
  const tabContents = document.querySelectorAll('.settings-tab-content');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tabContents.forEach((c) => c.classList.remove('active'));
      tab.classList.add('active');
      const targetTab = tab.getAttribute('data-tab');
      const targetContent = document.getElementById(`tab-${targetTab}`);
      if (targetContent) targetContent.classList.add('active');
    });
  });
}

// Simple exported helpers/APIs
export function openSettings() {
  const settingsModal = UI?.el?.settingsModal || document.getElementById('settings-modal');
  if (settingsModal) settingsModal.classList.remove('hidden');
}

export function closeSettings() {
  const settingsModal = UI?.el?.settingsModal || document.getElementById('settings-modal');
  if (settingsModal) settingsModal.classList.add('hidden');
}

export const formatSeconds = _formatSeconds;
