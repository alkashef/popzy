const path = require('path');
const { pathToFileURL } = require('url');

async function importGameplay() {
  const mod = await import(pathToFileURL(path.resolve(__dirname, '../../src/ui/settings-gameplay.js')).href);
  return mod;
}
async function importLimits() {
  const mod = await import(pathToFileURL(path.resolve(__dirname, '../../src/ui/settings-limits.js')).href);
  return mod;
}
async function importUI() {
  const mod = await import(pathToFileURL(path.resolve(__dirname, '../../src/ui/dom.js')).href);
  return mod;
}

function makeEl(initial = {}) {
  const listeners = {};
  return Object.assign({
    value: '',
    checked: false,
    textContent: '',
    addEventListener: (t, fn) => (listeners[t] = fn),
    _fire: (t, ev) => listeners[t] && listeners[t](ev || { target: {} }),
  }, initial);
}

function makeDOM(map) {
  global.document = {
    getElementById: (id) => map[id] || null,
  };
}

module.exports = {
  'settings-gameplay: update and bind handlers': async () => {
  const { UI } = await importUI();
  UI.el = {};
    const { updateSettingsUIGameplay, bindGameplayControls } = await importGameplay();
    const els = {
      speed: makeEl(), speedValue: makeEl(),
      randomness: makeEl(), randomnessValue: makeEl(),
      spawnRate: makeEl(), spawnRateValue: makeEl(),
      objectSize: makeEl(), objectSizeValue: makeEl(),
      sizeVariation: makeEl(), sizeVariationValue: makeEl(),
      ratio: makeEl(), ratioValue: makeEl(),
      playerName: makeEl(),
      missPenaltyEnabled: makeEl(),
    };
    makeDOM(els);
    const cfg = {
      speed: 1, randomness: 0.5, spawnRate: 60, objectSize: 20, sizeVariation: 0.3, ratio: 0.5,
      playerName: 'p', missPenaltyEnabled: false,
    };
    updateSettingsUIGameplay(cfg);
    if (els.speed.value !== 1) throw new Error('speed not synced');
    bindGameplayControls(cfg);
    els.speed._fire('input', { target: { value: '2.5' } });
    if (cfg.speed !== 2.5) throw new Error('speed not updated');
    els.ratio._fire('input', { target: { value: '0.75' } });
    if (cfg.ratio !== 0.75) throw new Error('ratio not updated');
    els.missPenaltyEnabled._fire('change', { target: { checked: true } });
    if (!cfg.missPenaltyEnabled) throw new Error('miss penalty not updated');
  },

  'settings-limits: update and bind handlers': async () => {
  const { UI } = await importUI();
  UI.el = {};
    const { updateSettingsUILimits, bindLimitsControls } = await importLimits();
    const els = {
      timeLimitEnabled: makeEl(), timeLimit: makeEl(), timeLimitValue: makeEl(),
      scoreLimitEnabled: makeEl(), scoreLimit: makeEl(), scoreLimitValue: makeEl(),
    };
    makeDOM(els);
    const cfg = { timeLimitEnabled: true, timeLimit: 90, scoreLimitEnabled: false, scoreLimit: 10 };
    updateSettingsUILimits(cfg);
    if (els.timeLimit.value !== 90) throw new Error('time not synced');
    bindLimitsControls(cfg);
    els.timeLimit._fire('input', { target: { value: '120' } });
    if (cfg.timeLimit !== 120) throw new Error('time not updated');
    els.scoreLimitEnabled._fire('change', { target: { checked: true } });
    if (!cfg.scoreLimitEnabled) throw new Error('score limit not updated');
  },
};
