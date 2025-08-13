/**
 * Settings: Captions
 * - Sync caption-related UI with gameConfig
 * - Bind caption controls and dispatch caption:configChanged
 */
import { UI } from './dom.js';
import { saveConfig as storageSaveConfig } from '../services/storage.js';
import { clearCaption } from './caption.js';

export function updateSettingsUICaptions(gameConfig) {
  const get = (id) => UI?.el?.[id] || document.getElementById(id);
  const setText = (id, text) => {
    const el = UI?.el?.[id] || document.getElementById(id);
    if (el) el.textContent = text;
  };

  const captionEnabled = get('captionEnabled');
  if (captionEnabled) captionEnabled.checked = gameConfig.captionEnabled;

  const captionDirection = get('captionDirection');
  if (captionDirection) captionDirection.value = gameConfig.captionDirection;

  const captionMaxTokens = get('captionMaxTokens');
  if (captionMaxTokens) captionMaxTokens.value = gameConfig.captionMaxTokens;
  setText('captionMaxTokensValue', gameConfig.captionMaxTokens);

  const captionColor = get('captionColor');
  if (captionColor) captionColor.value = gameConfig.captionColor;

  const captionSize = get('captionSize');
  if (captionSize) captionSize.value = gameConfig.captionSize;
  setText('captionSizeValue', `${gameConfig.captionSize}px`);
}

export function bindCaptionsControls(gameConfig) {
  const on = (el, type, fn) => el && el.addEventListener(type, fn);
  const get = (id) => UI?.el?.[id] || document.getElementById(id);

  function emitConfigChanged() {
    document.dispatchEvent(new CustomEvent('caption:configChanged', { detail: { gameConfig } }));
  }

  function updateCaptionEnabled(e) {
    gameConfig.captionEnabled = e.target.checked;
    emitConfigChanged();
    storageSaveConfig(gameConfig);
  }
  function updateCaptionDirection(e) {
    gameConfig.captionDirection = e.target.value;
    clearCaption(gameConfig);
    emitConfigChanged();
    storageSaveConfig(gameConfig);
  }
  function updateCaptionMaxTokens(e) {
    gameConfig.captionMaxTokens = parseInt(e.target.value);
    const el = UI?.el?.captionMaxTokensValue || document.getElementById('caption-max-tokens-value');
    if (el) el.textContent = gameConfig.captionMaxTokens;
    emitConfigChanged();
    storageSaveConfig(gameConfig);
  }
  function updateCaptionColor(e) {
    gameConfig.captionColor = e.target.value;
    emitConfigChanged();
    storageSaveConfig(gameConfig);
  }
  function updateCaptionSize(e) {
    gameConfig.captionSize = parseInt(e.target.value);
    const el = UI?.el?.captionSizeValue || document.getElementById('caption-size-value');
    if (el) el.textContent = `${gameConfig.captionSize}px`;
    emitConfigChanged();
    storageSaveConfig(gameConfig);
  }

  on(get('captionEnabled'), 'change', updateCaptionEnabled);
  on(get('captionDirection'), 'change', updateCaptionDirection);
  on(get('captionMaxTokens'), 'input', updateCaptionMaxTokens);
  on(get('captionColor'), 'input', updateCaptionColor);
  on(get('captionSize'), 'input', updateCaptionSize);

  // Caption color presets
  const colors = [
    '#ffffff', '#ff0000', '#ff8800', '#ffff00', '#88ff00', '#00ff00',
    '#00ffff', '#0088ff', '#0000ff', '#8800ff', '#ff00ff', '#ff0088', '#888888'
  ];
  const captionPresets = UI?.el?.captionColorPresets || document.getElementById('caption-color-presets');
  if (captionPresets && captionPresets.childElementCount === 0) {
    colors.forEach((color) => {
      const c = document.createElement('div');
      c.className = 'color-preset';
      c.style.backgroundColor = color;
      c.addEventListener('click', () => {
        gameConfig.captionColor = color;
        (UI?.el?.captionColor || document.getElementById('caption-color')).value = color;
        emitConfigChanged();
        storageSaveConfig(gameConfig);
      });
      captionPresets.appendChild(c);
    });
  }
}
