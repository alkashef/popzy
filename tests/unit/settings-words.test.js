const path = require('path');
const { pathToFileURL } = require('url');

async function importWords() {
  const mod = await import(pathToFileURL(path.resolve(__dirname, '../../src/ui/settings-words.js')).href);
  return mod;
}
async function importUI() {
  const mod = await import(pathToFileURL(path.resolve(__dirname, '../../src/ui/dom.js')).href);
  return mod;
}

function makeEl(initial = {}) {
  const listeners = {};
  return Object.assign({ value: '', addEventListener: (t, fn) => (listeners[t] = fn), _fire: (t, ev) => listeners[t] && listeners[t](ev) }, initial);
}

module.exports = {
  'settings-words: update and bind handlers': async () => {
  // Reset shared UI cache
  const { UI } = await importUI();
  UI.el = {};
    const { updateSettingsUIWords, bindWordsControls } = await importWords();
  const els = { targetWords: makeEl(), friendlyWords: makeEl() };
    global.document = { getElementById: (id) => els[id] || null };
  const cfg = { targetWords: 'a b', friendlyWords: 'x y', friendlyMode: 'both' };
    updateSettingsUIWords(cfg);
    bindWordsControls(cfg);
    els.targetWords._fire('input', { target: { value: 'c d e' } });
    if (cfg.targetWords !== 'c d e') throw new Error('target words not updated');
  // friendlyMode UI control removed; programmatic changes only
  },
};
