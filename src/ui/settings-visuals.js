/**
 * Settings: Visuals
 * - Colors, transparency, paths, shadows, background image/color
 */
import { UI } from './dom.js';
import { saveConfig as storageSaveConfig } from '../services/storage.js';

export function updateSettingsUIVisuals(gameConfig) {
  const get = (id) => UI?.el?.[id] || document.getElementById(id);
  const setText = (id, text) => {
    const el = UI?.el?.[id] || document.getElementById(id);
    if (el) el.textContent = text;
  };

  const targetColor = get('targetColor');
  const friendlyColor = get('friendlyColor');
  if (targetColor) targetColor.value = gameConfig.targetColor;
  if (friendlyColor) friendlyColor.value = gameConfig.friendlyColor;

  const targetTransparency = get('targetTransparency');
  if (targetTransparency) targetTransparency.value = gameConfig.targetTransparency;
  setText('targetTransparencyValue', `${Math.round(gameConfig.targetTransparency * 100)}%`);

  const friendlyTransparency = get('friendlyTransparency');
  if (friendlyTransparency) friendlyTransparency.value = gameConfig.friendlyTransparency;
  setText('friendlyTransparencyValue', `${Math.round(gameConfig.friendlyTransparency * 100)}%`);

  const friendlyImagesTransparency = get('friendlyImagesTransparency');
  if (friendlyImagesTransparency) friendlyImagesTransparency.value = gameConfig.friendlyImagesTransparency;
  setText('friendlyImagesTransparencyValue', `${Math.round(gameConfig.friendlyImagesTransparency * 100)}%`);

  const showObjectPaths = get('showObjectPaths');
  if (showObjectPaths) showObjectPaths.checked = gameConfig.showObjectPaths;

  const objectShadows = get('objectShadows');
  if (objectShadows) objectShadows.checked = gameConfig.objectShadows;

  const backgroundColor = get('backgroundColor');
  if (backgroundColor) {
    backgroundColor.value = gameConfig.backgroundColor;
    // Only set backgroundColor to avoid clearing any theme backgroundImage
    document.body.style.backgroundColor = gameConfig.backgroundColor;
  }
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
  function updateShowObjectPaths(e) { gameConfig.showObjectPaths = e.target.checked; storageSaveConfig(gameConfig); }
  function updateObjectShadows(e) { gameConfig.objectShadows = e.target.checked; storageSaveConfig(gameConfig); }
  function updateTargetColor(e) { gameConfig.targetColor = e.target.value; storageSaveConfig(gameConfig); }
  function updateFriendlyColor(e) { gameConfig.friendlyColor = e.target.value; storageSaveConfig(gameConfig); }

  function updateBackgroundColor(e) {
    gameConfig.backgroundColor = e.target.value;
    // Only set backgroundColor to avoid clearing any theme backgroundImage
    document.body.style.backgroundColor = gameConfig.backgroundColor;
    storageSaveConfig(gameConfig);
  }

  // Background image logic (module-scoped)
  let backgroundImage = null;
  function updateBackgroundImage(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) {
      backgroundImage = null;
      document.body.style.backgroundImage = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = function (ev) {
      backgroundImage = new window.Image();
      backgroundImage.src = ev.target.result;
      document.body.style.backgroundImage = `url('${ev.target.result}')`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundRepeat = 'no-repeat';
      document.body.style.backgroundPosition = 'center';
    };
    reader.readAsDataURL(file);
  }

  on(get('backgroundImage'), 'change', updateBackgroundImage);
  on(get('backgroundColor'), 'input', updateBackgroundColor);
  on(get('targetColor'), 'input', updateTargetColor);
  on(get('friendlyColor'), 'input', updateFriendlyColor);
  on(get('targetTransparency'), 'input', updateTargetTransparency);
  on(get('friendlyTransparency'), 'input', updateFriendlyTransparency);
  on(get('friendlyImagesTransparency'), 'input', updateFriendlyImagesTransparency);
  on(get('showObjectPaths'), 'change', updateShowObjectPaths);
  on(get('objectShadows'), 'change', updateObjectShadows);

  // Color presets (targets, friendlies, background)
  const colors = [
    '#ffffff', '#ff0000', '#ff8800', '#ffff00', '#88ff00', '#00ff00',
    '#00ffff', '#0088ff', '#0000ff', '#8800ff', '#ff00ff', '#ff0088', '#888888'
  ];
  const targetPresets = UI?.el?.targetColorPresets || document.getElementById('target-color-presets');
  const friendlyPresets = UI?.el?.friendlyColorPresets || document.getElementById('friendly-color-presets');
  const backgroundPresets = UI?.el?.backgroundColorPresets || document.getElementById('background-color-presets');

  if (targetPresets && targetPresets.childElementCount === 0) {
    const targetRandomPreset = document.createElement('div');
    targetRandomPreset.className = 'color-preset random-color-preset';
    targetRandomPreset.title = 'Use random colors';
    targetRandomPreset.addEventListener('click', () => {
      gameConfig.useRandomColors = true;
      storageSaveConfig(gameConfig);
    });
    targetPresets.appendChild(targetRandomPreset);

    colors.forEach((color) => {
      const t = document.createElement('div');
      t.className = 'color-preset';
      t.style.backgroundColor = color;
      t.addEventListener('click', () => {
        gameConfig.targetColor = color;
        gameConfig.useRandomColors = false;
        (UI?.el?.targetColor || document.getElementById('target-color')).value = color;
        storageSaveConfig(gameConfig);
      });
      targetPresets.appendChild(t);
    });
  }

  if (friendlyPresets && friendlyPresets.childElementCount === 0) {
    const friendlyRandomPreset = document.createElement('div');
    friendlyRandomPreset.className = 'color-preset random-color-preset';
    friendlyRandomPreset.title = 'Use random colors';
    friendlyRandomPreset.addEventListener('click', () => {
      gameConfig.useRandomColors = true;
      storageSaveConfig(gameConfig);
    });
    friendlyPresets.appendChild(friendlyRandomPreset);

    colors.forEach((color) => {
      const f = document.createElement('div');
      f.className = 'color-preset';
      f.style.backgroundColor = color;
      f.addEventListener('click', () => {
        gameConfig.friendlyColor = color;
        gameConfig.useRandomColors = false;
        (UI?.el?.friendlyColor || document.getElementById('friendly-color')).value = color;
        storageSaveConfig(gameConfig);
      });
      friendlyPresets.appendChild(f);
    });
  }

  if (backgroundPresets && backgroundPresets.childElementCount === 0) {
    colors.forEach((color) => {
      const b = document.createElement('div');
      b.className = 'color-preset';
      b.style.backgroundColor = color;
      b.addEventListener('click', () => {
        gameConfig.backgroundColor = color;
        (UI?.el?.backgroundColor || document.getElementById('background-color')).value = color;
  // Only set backgroundColor to avoid clearing any theme backgroundImage
  document.body.style.backgroundColor = color;
        storageSaveConfig(gameConfig);
      });
      backgroundPresets.appendChild(b);
    });
  }
}
