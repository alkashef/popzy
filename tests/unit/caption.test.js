const path = require('path');
const { pathToFileURL } = require('url');

async function importCaption() {
  const mod = await import(pathToFileURL(path.resolve(__dirname, '../../src/ui/caption.js')).href);
  return mod;
}

function bootstrapDOM() {
  const map = {};
  global.document = {
    getElementById: (id) => map[id] || null,
    createElement: (tag) => ({ id: '', className: '', style: {}, appendChild: (c) => {}, textContent: '' }),
    querySelector: () => null,
    addEventListener: () => {},
    body: { appendChild: () => {} },
  };
  return map;
}

module.exports = {
  'caption: add/clear/trim/update display': async () => {
    const { initCaptionSystem, addWordToCaption, clearCaption, trimCaptionToMaxTokens, updateCaptionDisplay } = await importCaption();
    const map = bootstrapDOM();
    // Provide container
    map['game-container'] = { appendChild: () => {} };
    initCaptionSystem();
    const cfg = { captionEnabled: true, captionMaxTokens: 3, captionColor: '#fff', captionSize: 18 };
    addWordToCaption('hello', cfg);
    addWordToCaption('world', cfg);
    trimCaptionToMaxTokens(1);
    addWordToCaption('kids', cfg);
    clearCaption(cfg);
    updateCaptionDisplay(cfg); // should not throw
  },
};
