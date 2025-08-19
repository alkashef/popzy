/**
 * Settings: Captions
 * - Sync caption-related UI with gameConfig
 * - Bind caption controls and dispatch caption:configChanged
 */
import { UI } from './dom.js';
import { saveConfig as storageSaveConfig } from '../services/storage.js';
import { openColorPicker } from './colorPicker.js';
import { clearCaption } from './caption.js';

function reflectCaptionSwatches(value) {
  try {
    const grid = document.querySelector('.color-swatch-grid[data-for="caption-color-select"]');
    if (!grid) return;
    grid.querySelectorAll('.color-swatch-button').forEach(btn => {
      btn.classList.toggle('selected', (btn.dataset.value === value));
    });
  } catch {}
}

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

  const captionColorSelect = get('captionColorSelect');
  if (captionColorSelect) captionColorSelect.value = gameConfig.captionColor;
  reflectCaptionSwatches(captionColorSelect?.value);

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
  function updateCaptionColorSelect(e) {
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
  on(get('captionColorSelect'), 'change', (e) => { updateCaptionColorSelect(e); reflectCaptionSwatches(e.target.value); });
  on(get('captionSize'), 'input', updateCaptionSize);
  // Bind caption swatch clicks
  const captionGrid = document.querySelector('.color-swatch-grid[data-for="caption-color-select"]');
  if (captionGrid) {
    captionGrid.addEventListener('click', () => {
      const sel = document.getElementById('caption-color-select');
      if (!sel) return;
      openColorPicker({
        title: 'Pick Caption Color',
        value: sel.value,
        includeRandom: false,
        returnFocusTo: captionGrid,
        onPick: (val) => {
          sel.value = val;
          updateCaptionColorSelect({ target: sel });
          reflectCaptionSwatches(sel.value);
        }
      });
    });
  }
  // Custom dropdown wiring for caption direction (OS/browser independent)
  try {
    const custom = document.querySelector('.custom-select[data-for="caption-direction"]');
    const native = get('captionDirection') || document.getElementById('caption-direction');
    if (custom && native) {
      const trigger = custom.querySelector('.custom-select-trigger');
      const items = Array.from(custom.querySelectorAll('[role="option"][data-value]'));
      const syncFromValue = (val) => {
        items.forEach(li => li.classList.toggle('selected', li.dataset.value === val));
        if (trigger) trigger.textContent = items.find(li => li.dataset.value === val)?.textContent || '';
      };
      // init
      syncFromValue(native.value);
      trigger?.addEventListener('click', () => {
        const expanded = custom.getAttribute('aria-expanded') === 'true';
        custom.setAttribute('aria-expanded', String(!expanded));
      });
      items.forEach(li => li.addEventListener('click', () => {
        const val = li.dataset.value;
        native.value = val;
        updateCaptionDirection({ target: native });
        syncFromValue(val);
        custom.setAttribute('aria-expanded', 'false');
      }));
      document.addEventListener('click', (e) => {
        const picker = document.getElementById('color-picker-modal');
        if (picker && picker.contains(e.target)) return;
        if (!custom.contains(e.target)) custom.setAttribute('aria-expanded', 'false');
      });
    }
  } catch {}
  // Caption presets removed; using dropdown instead
}
