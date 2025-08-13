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
      const audio = new Audio(`${basePath}${filename}`);
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
