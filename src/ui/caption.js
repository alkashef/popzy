/**
 * Module: UI/Caption System
 * Responsibility:
 * - Maintain an in-memory list of recently hit words (captionWords) and render
 *   them as a single scrolling caption line.
 * - Owns its own minimal DOM node (#game-caption), created on init if absent.
 * - Provides a tiny API for app.js to add words, clear, trim, and update styles.
 * Key APIs:
 * - initCaptionSystem(): initialize DOM node and reset state.
 * - addWordToCaption(word, gameConfig): push a word and re-render based on config.
 * - clearCaption(gameConfig): clear all words and hide if needed.
 * - trimCaptionToMaxTokens(maxTokens): drop oldest tokens to fit limit.
 * - updateCaptionDisplay(gameConfig): apply style (color/size) and visibility.
 */

// Caption system (module-internal state)
let captionWords = [];
let captionElement = null;

function ensureInit() {
  if (captionElement) return;
  captionElement = document.getElementById('game-caption');
  if (!captionElement) {
    captionElement = document.createElement('div');
    captionElement.id = 'game-caption';
    captionElement.className = 'game-caption';
    const container = document.getElementById('game-container') || document.body;
    container.appendChild(captionElement);
  }
}

/**
 * Initialize caption DOM node and reset caption state.
 * Creates a div#game-caption under #game-container or document.body when missing.
 */
export function initCaptionSystem() {
  ensureInit();
  captionWords = [];
  // Will be shown/hidden on first update
}

/**
 * Add a word to the caption and re-render if caption is enabled.
 *
 * @param {string} word - The token/word to append.
 * @param {Object} gameConfig - Live game config containing caption flags and styles.
 * @param {boolean} gameConfig.captionEnabled
 * @param {number} gameConfig.captionMaxTokens
 * @param {string} gameConfig.captionColor
 * @param {number} gameConfig.captionSize
 */
export function addWordToCaption(word, gameConfig) {
  if (!word || !gameConfig?.captionEnabled) return;
  ensureInit();
  // Enforce max tokens before adding the new one
  trimCaptionToMaxTokens(gameConfig.captionMaxTokens - 1);
  captionWords.push({ text: word, id: Date.now() + Math.random(), opacity: 1 });
  updateCaptionDisplay(gameConfig);
}

/**
 * Clear all caption words and update the display.
 * @param {Object} gameConfig
 */
export function clearCaption(gameConfig) {
  ensureInit();
  captionWords = [];
  updateCaptionDisplay(gameConfig);
}

/**
 * Ensure captionWords length <= maxTokens by removing oldest.
 * @param {number} maxTokens
 */
export function trimCaptionToMaxTokens(maxTokens) {
  if (typeof maxTokens !== 'number' || maxTokens < 0) return;
  while (captionWords.length > maxTokens) captionWords.shift();
}

/**
 * Re-render the caption with the current captionWords and style from config.
 * Hides element if disabled or there are no words.
 *
 * @param {Object} gameConfig
 * @param {boolean} gameConfig.captionEnabled
 * @param {string} gameConfig.captionColor
 * @param {number} gameConfig.captionSize
 */
export function updateCaptionDisplay(gameConfig) {
  ensureInit();

  const enabled = !!gameConfig?.captionEnabled;
  if (!enabled || captionWords.length === 0) {
    captionElement.style.display = 'none';
    return;
  }

  captionElement.style.display = 'block';
  captionElement.style.fontSize = `${gameConfig.captionSize}px`;
  captionElement.style.lineHeight = '40px';

  // Rebuild content
  captionElement.innerHTML = '';
  const captionText = captionWords.map(w => w.text).join(' ');

  const textSpan = document.createElement('span');
  textSpan.className = 'caption-word instant-show';
  textSpan.textContent = captionText;
  textSpan.style.position = 'relative';
  textSpan.style.opacity = '1';
  textSpan.style.color = gameConfig.captionColor;
  textSpan.style.fontSize = `${gameConfig.captionSize}px`;
  captionElement.appendChild(textSpan);
}

// Listen for external config-change events to re-render without exposing more APIs
if (typeof document !== 'undefined' && document.addEventListener) {
  document.addEventListener('caption:configChanged', (e) => {
    const cfg = e?.detail?.gameConfig;
    if (!cfg) return;
    // If maxTokens decreased below current count, trim then update
    if (typeof cfg.captionMaxTokens === 'number' && captionWords.length > cfg.captionMaxTokens) {
      trimCaptionToMaxTokens(cfg.captionMaxTokens);
    }
    updateCaptionDisplay(cfg);
  });
}