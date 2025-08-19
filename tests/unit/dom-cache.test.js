const path = require('path');
const { pathToFileURL } = require('url');

async function importDOM() {
  const mod = await import(pathToFileURL(path.resolve(__dirname, '../../src/ui/dom.js')).href);
  return mod;
}

function makeEl() { return {}; }

module.exports = {
  'dom cache: initUIRefs populates UI.el': async () => {
    const ids = [
      'gameCanvas','right-panel','player-name-display','timer','speed','speed-value','spawnRate','spawnRate-value','object-size','object-size-value','size-variation','size-variation-value','ratio','ratio-value','player-name','target-words','friendly-words','target-color-select','friendly-color-select','miss-penalty-enabled','time-limit-enabled','time-limit','time-limit-value','score-limit-enabled','score-limit','score-limit-value','caption-enabled','caption-direction','caption-max-tokens','caption-max-tokens-value','caption-color-select','caption-size','caption-size-value','target-transparency','target-transparency-value','friendly-transparency','friendly-transparency-value','friendly-images-transparency','friendly-images-transparency-value','reset-settings-button','settings-button','settings-ok-button','settings-modal','scores-button','scores-ok-button','scores-modal','latest-game-rankings','overall-statistics','top-performers','game-end-histogram','about-button','close-about','about-modal','game-over-ok-button','game-over-overlay','final-player-name','final-score','game-statistics'
    ];
    const map = Object.fromEntries(ids.map((id) => [id, makeEl()]));
    // extras used in code
  map['pause-button'] = makeEl();
    map['score-number'] = makeEl();
    global.document = {
      getElementById: (id) => map[id] || null,
      querySelector: (sel) => (sel === '.score-number' ? map['score-number'] : null),
    };
    const { UI, initUIRefs } = await importDOM();
    initUIRefs();
    if (!UI.el || !UI.el.canvas) throw new Error('UI.el not populated');
  },
};
