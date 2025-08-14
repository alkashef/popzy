/**
 * Settings: Themes tab
 */
import { listThemes } from '../services/themeManifest.js';
import { applyTheme } from '../services/themes.js';
import { UI } from './dom.js';

export function updateSettingsUIThemes(gameConfig) {
  const container = document.getElementById('tab-themes');
  if (!container) return;
  if (container.__initialized) return;
  container.__initialized = true;

  const themes = listThemes();
  const grid = document.createElement('div');
  grid.style.display = 'grid';
  grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(200px, 1fr))';
  grid.style.gap = '10px';

  const icons = { forest: '🌲', volcano: '🌋', skies: '☁️' };

  themes.forEach((t) => {
    const card = document.createElement('div');
    card.style.border = '1px solid rgba(255,255,255,0.3)';
    card.style.borderRadius = '8px';
    card.style.padding = '10px';
    const title = document.createElement('div');
    title.textContent = `${icons[t.id] || '🎨'} ${t.name}`;
    title.style.fontWeight = 'bold';
    const applyBtn = document.createElement('button');
    applyBtn.textContent = 'Apply';
    applyBtn.className = 'settings-btn';
    applyBtn.addEventListener('click', () => applyTheme(gameConfig, t.id, { persist: true }));

    card.appendChild(title);
    card.appendChild(applyBtn);
    grid.appendChild(card);
  });

  container.appendChild(grid);
}

export function bindThemesControls() {
  // events bound inline in update function for simplicity; no global handlers required
}
