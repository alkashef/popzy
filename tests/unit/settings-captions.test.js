const path = require('path');
const { pathToFileURL } = require('url');

async function importCaptions() {
  const mod = await import(pathToFileURL(path.resolve(__dirname, '../../src/ui/settings-captions.js')).href);
  return mod;
}
async function importUI() {
  const mod = await import(pathToFileURL(path.resolve(__dirname, '../../src/ui/dom.js')).href);
  return mod;
}

function makeEl(initial = {}) {
  const listeners = {};
  return Object.assign({ value: '', checked: false, textContent: '', addEventListener: (t, fn) => (listeners[t] = fn), _fire: (t, ev) => listeners[t] && listeners[t](ev) }, initial);
}

module.exports = {
  'settings-captions: update and bind handlers': async () => {
  // Ensure clean UI.el cache
  const { UI } = await importUI();
  UI.el = {};
    const { updateSettingsUICaptions, bindCaptionsControls } = await importCaptions();
    const els = {
      captionEnabled: makeEl(), captionDirection: makeEl(), captionMaxTokens: makeEl(),
      captionMaxTokensValue: makeEl(), captionColor: makeEl(), captionSize: makeEl(), captionSizeValue: makeEl(),
      captionColorPresets: { childElementCount: 0, appendChild: () => {} },
    };
    global.CustomEvent = function (type, detail) { return { type, ...detail }; };
    global.document = {
      getElementById: (id) => els[id] || null,
      dispatchEvent: () => {},
      createElement: () => ({ className: '', style: {}, addEventListener: () => {} }),
    };
    const cfg = { captionEnabled: true, captionDirection: 'left', captionMaxTokens: 5, captionColor: '#fff', captionSize: 18 };
    updateSettingsUICaptions(cfg);
    bindCaptionsControls(cfg);
    els.captionMaxTokens._fire('input', { target: { value: '3' } });
    if (cfg.captionMaxTokens !== 3) throw new Error('max tokens not updated');
    els.captionSize._fire('input', { target: { value: '24' } });
    if (cfg.captionSize !== 24) throw new Error('size not updated');
  },
};
