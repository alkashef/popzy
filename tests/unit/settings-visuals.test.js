const path = require('path');
const { pathToFileURL } = require('url');

async function importVisuals() {
  const mod = await import(pathToFileURL(path.resolve(__dirname, '../../src/ui/settings-visuals.js')).href);
  return mod;
}
async function importUI() {
  const mod = await import(pathToFileURL(path.resolve(__dirname, '../../src/ui/dom.js')).href);
  return mod;
}

function makeEl(initial = {}) {
  const listeners = {};
  return Object.assign({
    value: '', checked: false, textContent: '', style: {}, childElementCount: 0,
    addEventListener: (t, fn) => (listeners[t] = fn),
    appendChild: (c) => { (this||{}).childElementCount = (this?.childElementCount||0) + 1; },
    _fire: (t, ev) => listeners[t] && listeners[t](ev || { target: {} }),
  }, initial);
}

module.exports = {
  'settings-visuals: update and bind handlers (dropdown colors)': async () => {
  // Ensure clean UI.el cache to avoid using stale cached nodes without addEventListener
  const { UI } = await importUI();
  UI.el = {};
    const { updateSettingsUIVisuals, bindVisualsControls } = await importVisuals();
    const els = {
      targetColorSelect: makeEl(), friendlyColorSelect: makeEl(),
      targetTransparency: makeEl(), targetTransparencyValue: makeEl(),
      friendlyTransparency: makeEl(), friendlyTransparencyValue: makeEl(),
      friendlyImagesTransparency: makeEl(), friendlyImagesTransparencyValue: makeEl(),
      // removed controls: showObjectPaths, objectShadows, backgroundColor, presets
    };
    global.document = {
      getElementById: (id) => els[id] || null,
      body: { style: {} },
      createElement: () => ({ className: '', style: {}, addEventListener: () => {} }),
    };
    const cfg = {
      targetColor: '#f00', friendlyColor: '#0f0',
      targetTransparency: 0.8, friendlyTransparency: 0.5, friendlyImagesTransparency: 0.7,
      useRandomColors: false,
    };
    updateSettingsUIVisuals(cfg);
    bindVisualsControls(cfg);
    // fire some events
    els.targetTransparency._fire('input', { target: { value: '0.4' } });
    if (cfg.targetTransparency !== 0.4) throw new Error('targetTransparency not updated');
    els.friendlyTransparency._fire('input', { target: { value: '0.9' } });
    if (cfg.friendlyTransparency !== 0.9) throw new Error('friendlyTransparency not updated');
    // color selects
    els.targetColorSelect._fire('change', { target: { value: '#abcdef' } });
    if (cfg.useRandomColors || cfg.targetColor !== '#abcdef') throw new Error('targetColor select not updated');
    els.friendlyColorSelect._fire('change', { target: { value: 'random' } });
    if (!cfg.useRandomColors) throw new Error('useRandomColors not toggled by random');
  },
};
