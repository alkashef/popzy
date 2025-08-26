import { listPlayers, getCurrentPlayerId, setCurrentPlayer, createPlayer, renamePlayer, deletePlayer } from '../services/player.js';
import { UI } from './dom.js';

function byId(id) { return UI?.el?.[id] || document.getElementById(id); }

function tileColor(idx) {
  // Distinct but friendly palette using HSL
  const hue = (idx * 47) % 360; // pseudo-random spread
  return `hsl(${hue} 70% 70%)`;
}

let selectedId = null;

function selectTile(id) {
  selectedId = id;
  const container = byId('player-list'); if (!container) return;
  container.querySelectorAll('.player-tile').forEach(tile => {
    tile.classList.toggle('selected', tile.dataset.id === id);
  });
  // enable/disable actions
  const rn = byId('player-rename'); const del = byId('player-delete');
  const enabled = !!id;
  if (rn) rn.disabled = !enabled;
  if (del) del.disabled = !enabled;
  const sel = byId('player-select');
  if (sel) sel.disabled = !enabled;
}

function renderList() {
  const container = byId('player-list'); if (!container) return;
  const players = listPlayers();
  const cur = getCurrentPlayerId();
  container.innerHTML = '';
  // First tile: New Player button
  const addTile = document.createElement('div');
  addTile.className = 'player-tile new-player';
  const addLabel = document.createElement('div');
  addLabel.className = 'player-name';
  addLabel.textContent = '+ New Player';
  addTile.appendChild(addLabel);
  addTile.addEventListener('click', () => {
    const name = (prompt('Enter new name (alphanumeric, 1-20):', '') || '').trim();
    if (!name) return; // user canceled/empty
    const res = createPlayer(name);
    if (!res.ok) { showError(res.error); return; }
    showError('');
    renderList();
    try { document.dispatchEvent(new CustomEvent('player:changed', { detail: { id: res.player.id } })); } catch {}
  });
  container.appendChild(addTile);

  if (!players.length) { selectTile(null); return; }
  players.forEach((p, i) => {
    const tile = document.createElement('div');
    tile.className = 'player-tile';
    tile.dataset.id = p.id;
    tile.style.background = tileColor(i);
    const name = document.createElement('div');
  name.className = 'player-name';
  name.textContent = p.name;
    tile.appendChild(name);
  tile.addEventListener('click', () => selectTile(p.id));
    container.appendChild(tile);
  });
  // keep previous selection if it still exists, otherwise select current
  const exists = players.some(p => p.id === selectedId);
  selectTile(exists ? selectedId : cur || (players[0]?.id || null));
}

function showError(code) {
  const m = {
    duplicate: 'Name already exists. Pick a unique name.',
    length: 'Name must be 1–20 characters.',
    chars: 'Only letters and numbers are allowed.',
    storage: 'Couldn’t save—storage is full.',
    not_found: 'Player not found.',
  };
  const el = byId('player-error'); if (el) el.textContent = m[code] || '';
}

export function showPlayerModal() {
  const modal = byId('player-modal'); if (!modal) return;
  showError('');
  renderList();
  modal.classList.remove('hidden');
}
export function hidePlayerModal() { const modal = byId('player-modal'); if (modal) modal.classList.add('hidden'); }

export function bindPlayerUI() {
  const okBtn = byId('player-ok');
  if (okBtn) okBtn.addEventListener('click', ()=>{
    if (!selectedId) { hidePlayerModal(); return; }
    setCurrentPlayer(selectedId);
    hidePlayerModal();
    try { document.dispatchEvent(new CustomEvent('player:changed', { detail: { id: selectedId } })); } catch {}
  });

  const renameBtn = byId('player-rename');
  if (renameBtn) renameBtn.addEventListener('click', ()=>{
    if (!selectedId) return;
    const players = listPlayers();
    const p = players.find(x => x.id === selectedId); if (!p) return;
    const next = prompt('Enter new name (alphanumeric, 1-20):', p.name) || '';
    const res = renamePlayer(p.id, next);
    if (!res.ok) return showError(res.error);
    showError('');
    renderList();
  });

  const deleteBtn = byId('player-delete');
  if (deleteBtn) deleteBtn.addEventListener('click', ()=>{
    if (!selectedId) return;
    const players = listPlayers();
    const p = players.find(x => x.id === selectedId); if (!p) return;
    if (!confirm(`Delete player "${p.name}" and all their data? This cannot be undone.`)) return;
    const curId = getCurrentPlayerId();
    deletePlayer(p.id);
    if (curId === p.id) showPlayerModal(); // force reselect if current deleted
    else renderList();
  });

  const nameDisplay = byId('player-name-display');
  if (nameDisplay) {
    nameDisplay.style.cursor = 'pointer';
    nameDisplay.title = 'Change player';
    nameDisplay.addEventListener('click', showPlayerModal);
  }

  // no explicit Select button; OK confirms current selection
}
