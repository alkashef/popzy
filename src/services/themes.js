/**
 * Themes service: apply and manage themes.
 */
import { getThemeById } from './themeManifest.js';
import { saveConfig as storageSaveConfig } from './storage.js';

let currentThemeId = null;
let reticleConfig = null;
let soundPack = null;

export function getCurrentThemeId() { return currentThemeId; }
export function getReticle() { return reticleConfig; }
export function getSoundPack() { return soundPack; }

export function setSoundPack(map) { soundPack = map || null; }

export function initThemeOnBoot(gameConfig) {
  if (gameConfig?.themeId) {
    // Defer a tick to let DOM mount styles before applying theme background
    return Promise.resolve().then(() => applyTheme(gameConfig, gameConfig.themeId, { persist: false }).catch(() => {}));
  }
  return Promise.resolve();
}

/**
 * Apply a theme to gameConfig and the document background/cursor.
 * @param {object} gameConfig
 * @param {string} themeId
 * @param {{ preview?: boolean, persist?: boolean }} opts
 */
export async function applyTheme(gameConfig, themeId, opts = {}) {
  const theme = getThemeById(themeId);
  if (!theme) {
    console.warn('Theme not found', themeId);
    return;
  }
  currentThemeId = themeId;
  const { colors } = theme;
  if (colors?.targetColor) gameConfig.targetColor = colors.targetColor;
  if (colors?.friendlyColor) gameConfig.friendlyColor = colors.friendlyColor;
  if (colors?.captionColor) gameConfig.captionColor = colors.captionColor;
  if (colors?.backgroundColor) {
    gameConfig.backgroundColor = colors.backgroundColor;
    try { document.body.style.background = colors.backgroundColor; } catch {}
  }
  const t = colors?.transparency || {};
  if (t.target != null) gameConfig.targetTransparency = t.target;
  if (t.friendly != null) gameConfig.friendlyTransparency = t.friendly;
  if (t.friendlyImages != null) gameConfig.friendlyImagesTransparency = t.friendlyImages;

  // UI CSS variables (readability-focused)
  try {
    const root = document.documentElement;
    const bg = colors?.backgroundColor || '#2a2a2a';
    const caption = colors?.captionColor || '#ffffff';
    const isLight = luminance(bg) > 0.5;
    const uiText = pickTextColor(bg, caption);
    root.style.setProperty('--ui-text', uiText);
    root.style.setProperty('--ui-muted', isLight ? '#333333' : '#bbbbbb');
    root.style.setProperty('--ui-border', isLight ? '#cccccc' : '#666666');
    root.style.setProperty('--panel-bg', 'linear-gradient(135deg, rgba(74,74,74,0.3), rgba(42,42,42,0.3))');
    // Allow theme override for modal background (solid color supported)
  const modalBg = theme.ui?.modalBg || 'linear-gradient(135deg, #4a4a4a, #2a2a2a)';
    root.style.setProperty('--modal-bg', modalBg);
  const modalText = theme.ui?.modalText || uiText;
  root.style.setProperty('--modal-text', modalText);
    // Buttons based on accent
    const accent = theme.accent || colors?.targetColor || '#00ff88';
    const btnText = pickTextColor(accent, '#000', '#fff');
    // Allow theme-specific overrides
    root.style.setProperty('--btn-bg', theme.ui?.btnBg || mix(bg, accent, 0.25));
    root.style.setProperty('--btn-bg-hover', theme.ui?.btnBgHover || mix(bg, accent, 0.35));
    root.style.setProperty('--btn-bg-active', theme.ui?.btnBgActive || mix(bg, accent, 0.15));
    root.style.setProperty('--btn-text', theme.ui?.btnText || btnText);
    root.style.setProperty('--btn-border', isLight ? '#bbbbbb' : '#888888');
    root.style.setProperty('--accent', accent);
    root.style.setProperty('--accent-contrast', pickTextColor(accent, '#000', '#fff'));
  // Score number color variable (theme may override via ui.scoreColor later if needed)
  const scoreColor = theme.id === 'forest' ? (theme.ui?.btnText || '#8B4513') : 'var(--btn-text)';
  root.style.setProperty('--score-number', scoreColor);
    // Forest-specific: score number brown when requested via ui.btnText
  // (no direct DOM write needed thanks to CSS var)
  } catch {}

  // Background image
  try {
    const bgUrl = theme.background?.imageUrl || theme.assets?.background || theme.background;
    if (bgUrl) {
      const resolved = await resolveBackgroundUrl(bgUrl);
      document.body.style.backgroundImage = `url('${resolved}')`;
      const fit = theme.background.imageFit || 'cover';
      if (fit === 'cover' || fit === 'contain') {
        document.body.style.backgroundSize = fit;
        document.body.style.backgroundRepeat = 'no-repeat';
        document.body.style.backgroundPosition = 'center';
      } else if (fit === 'repeat') {
        document.body.style.backgroundSize = 'auto';
        document.body.style.backgroundRepeat = 'repeat';
        document.body.style.backgroundPosition = 'left top';
      } else {
        document.body.style.backgroundSize = 'auto';
      }
      // Save resolved background URL for persistence
      try { gameConfig.__themeBackgroundResolved = resolved; } catch {}
    } else if (gameConfig.__themeBackgroundResolved) {
      // If theme omitted background in manifest this time, reuse last resolved
      document.body.style.backgroundImage = `url('${gameConfig.__themeBackgroundResolved}')`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundRepeat = 'no-repeat';
      document.body.style.backgroundPosition = 'center';
    } else {
      document.body.style.backgroundImage = '';
    }
  } catch {}

  // Cursor/reticle (cursor URL may not load in some contexts; fallback)
  try {
    if (theme.assets?.cursor) {
      document.body.style.cursor = `url('${theme.assets.cursor}') 8 8, crosshair`;
    } else {
      document.body.style.cursor = 'crosshair';
    }
  } catch {}

  // Sounds map; allow extensionless entries by resolving to existing URLs
  try {
    const sounds = theme.assets?.sounds || null;
    if (sounds) {
      const resolved = {};
      for (const [k, val] of Object.entries(sounds)) {
        if (typeof val === 'string') {
          // themed paths are absolute; if extensionless, try appending .mp3/.wav
          if (/\.(mp3|wav)$/i.test(val)) {
            resolved[k] = val;
          } else {
            // split into basePath + name
            const idx = val.lastIndexOf('/');
            const base = idx >= 0 ? val.slice(0, idx + 1) : '';
            const name = idx >= 0 ? val.slice(idx + 1) : val;
            const url = await import('./audio.js').then(m => m.resolveAudioSrc(base, name));
            resolved[k] = url;
          }
        }
      }
      setSoundPack(resolved);
    } else {
      setSoundPack(null);
    }
  } catch { setSoundPack(theme.assets?.sounds || null); }

  // Persist
  gameConfig.themeId = themeId;
  if (opts.persist) {
    // Persist current themeId and any UI-relevant overrides in config
    try {
      if (soundPack) gameConfig.__themeSoundPack = soundPack;
      if (document?.body?.style?.backgroundImage) {
        const m = document.body.style.backgroundImage.match(/url\("?'?([^"')]+)"?'?\)/);
        if (m && m[1]) gameConfig.__themeBackgroundResolved = m[1];
      }
    } catch {}
    storageSaveConfig(gameConfig);
  }

  // Event
  try {
    document.dispatchEvent(new CustomEvent('theme:changed', { detail: { themeId } }));
  } catch {}
}

// --- Helpers: background image resolution (.png/.jpg/.jpeg) ---
const IMAGE_EXTS = ['.png', '.jpg', '.jpeg'];
function hasImageExt(url) { return /\.(png|jpg|jpeg)$/i.test(url); }
async function headOk(url) {
  try { const r = await fetch(url, { method: 'HEAD' }); return r.ok; } catch { return false; }
}
async function resolveBackgroundUrl(url) {
  // Absolute path expected (e.g., assets/themes/forest/backgrounds/main.jpg)
  if (!url) return url;
  if (hasImageExt(url)) {
    if (await headOk(url)) return url;
    // Try alternate extensions by replacing trailing extension
    const i = url.lastIndexOf('.');
    const base = i >= 0 ? url.slice(0, i) : url;
    for (const ext of IMAGE_EXTS) {
      const candidate = base + ext;
      if (await headOk(candidate)) return candidate;
    }
    return url;
  }
  // No extension provided: try allowed ones
  for (const ext of IMAGE_EXTS) {
    const candidate = url + ext;
    if (await headOk(candidate)) return candidate;
  }
  // Fallback to .png
  return url + '.png';
}

// --- Color utilities ---
function hexToRgb(hex) {
  try {
    const h = hex.replace('#', '');
    const bigint = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
    return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
  } catch { return { r: 255, g: 255, b: 255 }; }
}
function luminance(hex) {
  const { r, g, b } = hexToRgb(hex || '#ffffff');
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}
function contrastRatio(l1, l2) {
  const [L1, L2] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (L1 + 0.05) / (L2 + 0.05);
}
function pickTextColor(bgHex, dark = '#000', light = '#fff') {
  const Lbg = luminance(bgHex);
  const Ldark = luminance(dark);
  const Llight = luminance(light);
  return contrastRatio(Lbg, Ldark) >= contrastRatio(Lbg, Llight) ? dark : light;
}
function mix(hex1, hex2, weight = 0.5) {
  const a = hexToRgb(hex1 || '#000');
  const b = hexToRgb(hex2 || '#fff');
  const w = Math.max(0, Math.min(1, weight));
  const r = Math.round(a.r * (1 - w) + b.r * w);
  const g = Math.round(a.g * (1 - w) + b.g * w);
  const b2 = Math.round(a.b * (1 - w) + b.b * w);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b2).toString(16).slice(1)}`;
}
