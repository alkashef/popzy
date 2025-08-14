const path = require('path');
const { pathToFileURL } = require('url');

async function importCanvas() {
  const mod = await import(pathToFileURL(path.resolve(__dirname, '../../src/ui/canvas.js')).href);
  return mod;
}

module.exports = {
  'canvas: getRightPanelWidth reads CSS var with fallback': async () => {
    const { getRightPanelWidth } = await importCanvas();
    global.document = {
      documentElement: {},
    };
    global.getComputedStyle = () => ({ getPropertyValue: () => '240px' });
    let w = getRightPanelWidth();
    if (w !== 240) throw new Error('Expected 240');
    global.getComputedStyle = () => ({ getPropertyValue: () => '' });
    w = getRightPanelWidth();
    if (typeof w !== 'number') throw new Error('Expected number fallback');
  },
};
