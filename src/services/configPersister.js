import { getCurrentPlayerId, savePlayerConfig } from './player.js';
import { saveConfig as saveCookieConfig } from './storage.js';

export function saveGameConfig(cfg) {
  const id = getCurrentPlayerId();
  if (id) {
    const ok = savePlayerConfig(id, cfg || {});
    if (!ok) saveCookieConfig(cfg || {});
  } else {
    saveCookieConfig(cfg || {});
  }
}
