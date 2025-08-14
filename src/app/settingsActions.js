/**
 * Cross-module settings actions.
 */
import { state } from './state.js';
import { createDefaultGameConfig } from '../core/config.js';
import { deleteConfig as storageDeleteConfig } from '../services/storage.js';
import { updateSettingsUI } from '../ui/settings.js';
import { setPlayerNameDisplay } from '../ui/scoreboard.js';

export function resetConfigToDefaults() {
  state.gameConfig = createDefaultGameConfig();
  storageDeleteConfig();
  updateSettingsUI(state.gameConfig);
  setPlayerNameDisplay(state.gameConfig.playerName || 'player 1');
}
