/**
 * Module: UI/Canvas
 * Responsibility:
 * - Initialize and resize the canvas based on viewport and right panel width.
 * - Provide a helper to read the right panel width consistently.
 * API:
 * - initCanvas(): { canvas, ctx, unbind }
 * - getRightPanelWidth(): number
 */

import { UI } from './dom.js';
import { GAME_CONFIG_DEFAULTS } from '../core/config.js';

/** Read the configured right panel width from CSS variable, with a config fallback */
export function getRightPanelWidth() {
  const cssVal = getComputedStyle(document.documentElement)
    .getPropertyValue('--right-panel-width')
    .trim();
  return cssVal.endsWith('px')
    ? parseInt(cssVal, 10)
    : (Number(cssVal) || GAME_CONFIG_DEFAULTS.UI.RIGHT_PANEL_WIDTH);
}

function applyCanvasSize(canvas) {
  const rightPanelWidth = getRightPanelWidth();
  canvas.width = window.innerWidth - rightPanelWidth;
  canvas.height = window.innerHeight;

  // Keep caption width in sync with canvas area
  const captionElement = document.querySelector('.game-caption');
  if (captionElement) {
    captionElement.style.width = `calc(100vw - ${rightPanelWidth}px)`;
  }
}

/** Initialize canvas, bind resize listener, and return refs */
export function initCanvas() {
  const canvas = UI.el.canvas || document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  function onResize() {
    applyCanvasSize(canvas);
  }

  onResize();
  window.addEventListener('resize', onResize);

  // Allow pointer events (controls live in the side panel)
  canvas.style.pointerEvents = 'auto';

  return {
    canvas,
    ctx,
    unbind: () => window.removeEventListener('resize', onResize),
  };
}
