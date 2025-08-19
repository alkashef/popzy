/**
 * Settings: Visuals
 * - Colors, transparency, paths, shadows, background image/color
 */
import { UI } from './dom.js';
import { saveConfig as storageSaveConfig } from '../services/storage.js';
import { openColorPicker } from './colorPicker.js';

// Helper: reflect selected value onto swatch grid
function reflectColorSwatches(selectId, value) {
  try {
    const grid = document.querySelector(`.color-swatch-grid[data-for="${selectId}"]`);
    if (!grid) return;
    grid.querySelectorAll('.color-swatch-button').forEach(btn => {
      btn.classList.toggle('selected', (btn.dataset.value === value));
    });
  } catch {}
}

export function updateSettingsUIVisuals(gameConfig) {
  const get = (id) => UI?.el?.[id] || document.getElementById(id);
  const setText = (id, text) => {
    const el = UI?.el?.[id] || document.getElementById(id);
    if (el) el.textContent = text;
  };

  const targetColorSelect = get('targetColorSelect');
  const friendlyColorSelect = get('friendlyColorSelect');
  if (targetColorSelect) targetColorSelect.value = gameConfig.useRandomColors ? 'random' : gameConfig.targetColor;
  if (friendlyColorSelect) friendlyColorSelect.value = gameConfig.useRandomColors ? 'random' : gameConfig.friendlyColor;
  // reflect to preview buttons
  try { document.getElementById('target-color-button')?.querySelector('.swatch-preview')?.style.setProperty('--swatch', (targetColorSelect?.value === 'random' ? '#ffffff' : targetColorSelect?.value || '#ffffff')); } catch {}
  try { document.getElementById('friendly-color-button')?.querySelector('.swatch-preview')?.style.setProperty('--swatch', (friendlyColorSelect?.value === 'random' ? '#ffffff' : friendlyColorSelect?.value || '#ffffff')); } catch {}

  const targetTransparency = get('targetTransparency');
  if (targetTransparency) targetTransparency.value = gameConfig.targetTransparency;
  setText('targetTransparencyValue', `${Math.round(gameConfig.targetTransparency * 100)}%`);

  const friendlyTransparency = get('friendlyTransparency');
  if (friendlyTransparency) friendlyTransparency.value = gameConfig.friendlyTransparency;
  setText('friendlyTransparencyValue', `${Math.round(gameConfig.friendlyTransparency * 100)}%`);

  const friendlyImagesTransparency = get('friendlyImagesTransparency');
  if (friendlyImagesTransparency) friendlyImagesTransparency.value = gameConfig.friendlyImagesTransparency;
  setText('friendlyImagesTransparencyValue', `${Math.round(gameConfig.friendlyImagesTransparency * 100)}%`);

  // show object paths control removed; force disable internally
  gameConfig.showObjectPaths = false;

  // object shadows control removed; always enable internally
  gameConfig.objectShadows = true;

  // background color selector removed
}

export function bindVisualsControls(gameConfig) {
  const on = (el, type, fn) => el && el.addEventListener(type, fn);
  const get = (id) => UI?.el?.[id] || document.getElementById(id);
  const setText = (id, text) => {
    const el = UI?.el?.[id] || document.getElementById(id);
    if (el) el.textContent = text;
  };

  function updateTargetTransparency(e) {
    gameConfig.targetTransparency = parseFloat(e.target.value);
    setText('targetTransparencyValue', `${Math.round(gameConfig.targetTransparency * 100)}%`);
    storageSaveConfig(gameConfig);
  }
  function updateFriendlyTransparency(e) {
    gameConfig.friendlyTransparency = parseFloat(e.target.value);
    setText('friendlyTransparencyValue', `${Math.round(gameConfig.friendlyTransparency * 100)}%`);
    storageSaveConfig(gameConfig);
  }
  function updateFriendlyImagesTransparency(e) {
    gameConfig.friendlyImagesTransparency = parseFloat(e.target.value);
    setText('friendlyImagesTransparencyValue', `${Math.round(gameConfig.friendlyImagesTransparency * 100)}%`);
    storageSaveConfig(gameConfig);
  }
  // removed controls; enforce defaults
  gameConfig.showObjectPaths = false;
  gameConfig.objectShadows = true;
  storageSaveConfig(gameConfig);
  function updateTargetColorSelect(e) {
    const val = e.target.value;
    if (val === 'random') gameConfig.useRandomColors = true;
    else { gameConfig.useRandomColors = false; gameConfig.targetColor = val; }
    // reflect selection on both
    const targetSel = get('targetColorSelect');
    const friendlySel = get('friendlyColorSelect');
    if (targetSel) targetSel.value = gameConfig.useRandomColors ? 'random' : gameConfig.targetColor;
    if (friendlySel) friendlySel.value = gameConfig.useRandomColors ? 'random' : (friendlySel.value === 'random' ? '#ffffff' : friendlySel.value);
  try { document.getElementById('target-color-button')?.querySelector('.swatch-preview')?.style.setProperty('--swatch', (targetSel?.value === 'random' ? '#ffffff' : targetSel?.value || '#ffffff')); } catch {}
  try { document.getElementById('friendly-color-button')?.querySelector('.swatch-preview')?.style.setProperty('--swatch', (friendlySel?.value === 'random' ? '#ffffff' : friendlySel?.value || '#ffffff')); } catch {}
    storageSaveConfig(gameConfig);
  }
  function updateFriendlyColorSelect(e) {
    const val = e.target.value;
    if (val === 'random') gameConfig.useRandomColors = true;
    else { gameConfig.useRandomColors = false; gameConfig.friendlyColor = val; }
    const targetSel = get('targetColorSelect');
    const friendlySel = get('friendlyColorSelect');
    if (targetSel) targetSel.value = gameConfig.useRandomColors ? 'random' : (targetSel.value === 'random' ? '#ffffff' : targetSel.value);
    if (friendlySel) friendlySel.value = gameConfig.useRandomColors ? 'random' : gameConfig.friendlyColor;
  try { document.getElementById('target-color-button')?.querySelector('.swatch-preview')?.style.setProperty('--swatch', (targetSel?.value === 'random' ? '#ffffff' : targetSel?.value || '#ffffff')); } catch {}
  try { document.getElementById('friendly-color-button')?.querySelector('.swatch-preview')?.style.setProperty('--swatch', (friendlySel?.value === 'random' ? '#ffffff' : friendlySel?.value || '#ffffff')); } catch {}
    storageSaveConfig(gameConfig);
  }

  // background color removed

  // Background image selection removed

  on(get('targetColorSelect'), 'change', updateTargetColorSelect);
  on(get('friendlyColorSelect'), 'change', updateFriendlyColorSelect);
  on(get('targetTransparency'), 'input', updateTargetTransparency);
  on(get('friendlyTransparency'), 'input', updateFriendlyTransparency);
  on(get('friendlyImagesTransparency'), 'input', updateFriendlyImagesTransparency);
  // removed bindings for showObjectPaths and objectShadows

  // Single choose buttons open color picker
  const targetBtn = document.getElementById('target-color-button');
  const friendlyBtn = document.getElementById('friendly-color-button');
  if (targetBtn) {
    targetBtn.addEventListener('click', () => {
      const sel = document.getElementById('target-color-select');
      if (!sel) return;
      openColorPicker({
        title: 'Pick Target Color',
        value: sel.value,
        includeRandom: true,
        returnFocusTo: targetBtn,
        onPick: (val) => {
          sel.value = val;
          updateTargetColorSelect({ target: sel });
          // reflect preview
          try { targetBtn.querySelector('.swatch-preview').style.setProperty('--swatch', val === 'random' ? '#ffffff' : val); } catch {}
        },
      });
    });
  }
  if (friendlyBtn) {
    friendlyBtn.addEventListener('click', () => {
      const sel = document.getElementById('friendly-color-select');
      if (!sel) return;
      openColorPicker({
        title: 'Pick Friendly Color',
        value: sel.value,
        includeRandom: true,
        returnFocusTo: friendlyBtn,
        onPick: (val) => {
          sel.value = val;
          updateFriendlyColorSelect({ target: sel });
          try { friendlyBtn.querySelector('.swatch-preview').style.setProperty('--swatch', val === 'random' ? '#ffffff' : val); } catch {}
        },
      });
    });
  }
}
