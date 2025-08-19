/**
 * Module: UI/Color Picker Modal
 * Responsibility:
 * - Provide a reusable modal for choosing a color from the same palette used in settings swatches.
 * API:
 * - openColorPicker({ title?, value?, includeRandom?, onPick }): open modal; calls onPick(value)
 */
import { UI } from './dom.js';

let _docClickHandler = null;
let _escHandler = null;
let _returnFocusEl = null;

const PALETTE = [
  { value: 'random', title: 'Random Rainbow', rainbow: true },
  { value: '#ffffff', title: 'White' },
  { value: '#ff0000', title: 'Red' },
  { value: '#ff8800', title: 'Orange' },
  { value: '#ffff00', title: 'Yellow' },
  { value: '#88ff00', title: 'Lime' },
  { value: '#00ff00', title: 'Green' },
  { value: '#00ffff', title: 'Cyan' },
  { value: '#0088ff', title: 'Sky' },
  { value: '#0000ff', title: 'Blue' },
  { value: '#8800ff', title: 'Purple' },
  { value: '#ff00ff', title: 'Magenta' },
  { value: '#ff0088', title: 'Pink' },
  { value: '#888888', title: 'Grey' },
];

function ensureRefs() {
  const byId = (id) => document.getElementById(id) || null;
  UI.el.colorPickerModal = UI.el.colorPickerModal || byId('color-picker-modal');
  UI.el.colorPickerGrid = UI.el.colorPickerGrid || byId('color-picker-grid');
  UI.el.colorPickerClose = UI.el.colorPickerClose || byId('color-picker-close');
  return UI.el;
}

export function openColorPicker({ title, value, includeRandom = true, onPick, returnFocusTo } = {}) {
  const el = ensureRefs();
  const modal = el.colorPickerModal; const grid = el.colorPickerGrid; const closeBtn = el.colorPickerClose;
  if (!modal || !grid) return;
  _returnFocusEl = returnFocusTo || document.activeElement;
  // header
  try { if (title) modal.querySelector('.settings-header h2').textContent = title; } catch {}
  // build grid
  grid.innerHTML = '';
  const frag = document.createDocumentFragment();
  PALETTE.forEach((c) => {
    if (!includeRandom && c.value === 'random') return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'color-swatch-button' + (c.rainbow ? ' rainbow' : '');
    btn.dataset.value = c.value;
    if (!c.rainbow) btn.style.setProperty('--swatch', c.value);
    btn.title = c.title;
    if (value && value === c.value) btn.classList.add('selected');
    btn.addEventListener('click', () => {
      if (typeof onPick === 'function') onPick(c.value);
      closeColorPicker();
    });
    frag.appendChild(btn);
  });
  grid.appendChild(frag);
  // prevent clicks inside from bubbling to document handler
  modal.querySelector('.color-picker-modal-content')?.addEventListener('click', (ev) => ev.stopPropagation());
  // show
  modal.classList.remove('hidden');
  // focus grid for keyboard users
  try { grid.focus(); } catch {}
  // close button
  if (closeBtn) {
    const onClose = () => { closeColorPicker(); closeBtn.removeEventListener('click', onClose); };
    closeBtn.addEventListener('click', onClose);
  }
  // outside click (capture one-off)
  const onDoc = (e) => {
    // if target is inside modal content, ignore (we already stopped propagation above)
    if (modal.contains(e.target)) return;
    closeColorPicker();
  };
  _docClickHandler = onDoc;
  setTimeout(() => document.addEventListener('click', _docClickHandler, true), 0);
  // ESC to close
  _escHandler = (ev) => { if (ev.key === 'Escape') closeColorPicker(); };
  document.addEventListener('keydown', _escHandler);
}

export function closeColorPicker() {
  const { colorPickerModal } = ensureRefs();
  if (colorPickerModal) colorPickerModal.classList.add('hidden');
  if (_docClickHandler) { document.removeEventListener('click', _docClickHandler, true); _docClickHandler = null; }
  if (_escHandler) { document.removeEventListener('keydown', _escHandler); _escHandler = null; }
  // restore focus
  try { _returnFocusEl && _returnFocusEl.focus && _returnFocusEl.focus(); } catch {}
  _returnFocusEl = null;
}
