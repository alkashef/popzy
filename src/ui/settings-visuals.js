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
  // reflect to swatches
  reflectColorSwatches('target-color-select', targetColorSelect?.value);
  reflectColorSwatches('friendly-color-select', friendlyColorSelect?.value);

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
  reflectColorSwatches('target-color-select', targetSel?.value);
  reflectColorSwatches('friendly-color-select', friendlySel?.value);
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
  reflectColorSwatches('target-color-select', targetSel?.value);
  reflectColorSwatches('friendly-color-select', friendlySel?.value);
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

  // presets removed; selection is via dropdowns
  // Bind swatch grids
  const swatchGrids = document.querySelectorAll('.color-swatch-grid[data-for]');
  swatchGrids.forEach(grid => {
    grid.addEventListener('click', (e) => {
      const forId = grid.getAttribute('data-for');
      const sel = document.getElementById(forId);
      if (!sel) return;
      const includeRandom = (forId !== 'caption-color-select');
      const current = sel.value;
      openColorPicker({
        title: forId.includes('target') ? 'Pick Target Color' : 'Pick Friendly Color',
        value: current,
        includeRandom,
        returnFocusTo: grid,
        onPick: (val) => {
          sel.value = val;
          if (forId === 'target-color-select') updateTargetColorSelect({ target: sel });
          else if (forId === 'friendly-color-select') updateFriendlyColorSelect({ target: sel });
        }
      });
    });
  });
}
