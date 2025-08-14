/**
 * Asset loading orchestrator
 */
import { state } from './state.js';
import { GAME_CONFIG_DEFAULTS } from '../core/config.js';
import { imageFiles as IMAGE_MANIFEST, soundFiles as SOUND_MANIFEST } from '../services/assetManifest.js';
import { loadImages } from '../services/assets.js';
import { loadSounds as loadAudioMap } from '../services/audio.js';

export async function loadAllAssets() {
  try {
    const { target, friendly } = await loadImages(
      {
        baseTargetPath: GAME_CONFIG_DEFAULTS.ASSETS.TARGET_FOLDER,
        baseFriendlyPath: GAME_CONFIG_DEFAULTS.ASSETS.FRIENDLY_FOLDER,
      },
      { target: IMAGE_MANIFEST.target, friendly: IMAGE_MANIFEST.friendly }
    );
    state.targetImages = target;
    state.friendlyImages = friendly;

  state.sounds = await loadAudioMap(GAME_CONFIG_DEFAULTS.ASSETS.SOUNDS_FOLDER, SOUND_MANIFEST);

    // Always ensure both object types are enabled
    state.gameConfig.targetsEnabled = true;
    state.gameConfig.friendliesEnabled = true;
  } catch (err) {
    console.warn('Some assets failed to load, using fallbacks:', err);
  }
}
