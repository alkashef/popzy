const path = require('path');
const { pathToFileURL } = require('url');

async function importThemes() {
  const mod = await import(pathToFileURL(path.resolve(__dirname, '../../src/services/themes.js')).href);
  return mod;
}
async function importManifest() {
  const mod = await import(pathToFileURL(path.resolve(__dirname, '../../src/services/themeManifest.js')).href);
  return mod;
}

module.exports = {
  'themes: list and get manifest': async () => {
    const { THEMES } = await importManifest();
    if (!THEMES.forest || !THEMES.volcano || !THEMES.skies) throw new Error('missing themes');
  },
  'themes: apply updates config colors and background': async () => {
    const { applyTheme, getCurrentThemeId, getSoundPack } = await importThemes();
    const cfg = { backgroundColor: '#000' };
    await applyTheme(cfg, 'forest', { persist: false });
    if (getCurrentThemeId() !== 'forest') throw new Error('id not set');
    if (!cfg.targetColor || !cfg.captionColor) throw new Error('colors not applied');
    const sp = getSoundPack();
    if (!sp || !sp.gameStart) throw new Error('sound pack not set');
  },
  'themes: initThemeOnBoot reapplies from config.themeId': async () => {
    const { initThemeOnBoot, getCurrentThemeId } = await importThemes();
    const cfg = { themeId: 'skies' };
    initThemeOnBoot(cfg);
    if (getCurrentThemeId() !== 'skies') throw new Error('boot init did not set theme');
  },
};
