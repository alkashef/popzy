/**
 * Audio service.
 * - Preloads audio files and exposes a simple play API with safe guards.
 */

/**
 * Load a map of HTMLAudioElement objects keyed by sound id.
 * @param {string} basePath - Base path for sound files.
 * @param {Record<string,string>} manifest - Map of sound keys to filenames.
 * @returns {Promise<Record<string, HTMLAudioElement>>}
 */
export async function loadSounds(basePath, manifest) {
  const entries = Object.entries(manifest || {});
  const sounds = {};
  for (const [key, filename] of entries) {
    try {
  const resolved = await resolveAudioSrc(basePath, filename);
  const audio = new Audio(resolved);
      audio.preload = 'auto';
      sounds[key] = audio;
    } catch (e) {
      console.warn('Failed to create audio for', key, filename, e);
    }
  }
  return sounds;
}

/**
 * Play a sound by key with defensive checks.
 * @param {Record<string, HTMLAudioElement>} soundMap
 * @param {string} key
 */
export function playSound(soundMap, key) {
  const audio = soundMap?.[key];
  if (!audio) return;
  try {
    audio.currentTime = 0;
    // Note: browsers may block autoplay without user gesture
    audio.play().catch(() => {});
  } catch (e) {
    // Swallow errors to avoid breaking gameplay
  }
}

// Background music support
let _bgAudio = null;

export function ensureBackgroundAudio(src) {
  if (_bgAudio) return _bgAudio;
  try {
    _bgAudio = new Audio(src);
    _bgAudio.loop = true;
    _bgAudio.preload = 'auto';
  } catch {}
  return _bgAudio;
}

export function playBackground() {
  try { _bgAudio?.play()?.catch(() => {}); } catch {}
}

export function pauseBackground() {
  try { if (_bgAudio) _bgAudio.pause(); } catch {}
}

export function setGlobalVolume(soundMap, volume) {
  const v = Math.max(0, Math.min(1, Number(volume) || 0));
  try { if (_bgAudio) _bgAudio.volume = v; } catch {}
  const entries = Object.values(soundMap || {});
  for (const a of entries) {
    try { a.volume = v; } catch {}
  }
}

// Helpers: resolve sources by trying allowed extensions if none provided
export const AUDIO_EXTS = ['.mp3', '.wav'];
export function hasAudioExt(name) { return /\.(mp3|wav)$/i.test(name); }
export async function resolveAudioSrc(base, name) {
  if (hasAudioExt(name)) return base + name;
  for (const ext of AUDIO_EXTS) {
    const candidate = base + name + ext;
    const ok = await quickHead(candidate).catch(() => false);
    if (ok) return candidate;
  }
  // Fallback to mp3 for permissive behavior
  return base + name + '.mp3';
}

async function quickHead(url) {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return res.ok;
  } catch {
    return false;
  }
}
