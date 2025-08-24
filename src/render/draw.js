/**
 * Module: Render/Draw
 * Responsibility:
 * - Pure rendering helpers for the canvas: background and game objects.
 * - No state; all inputs are explicit (ctx, canvas, config, objects).
 * Data Model Expectations:
 * - gameConfig includes colors and transparency; shadows are always on.
 * - gameObjects: Array<{
 *     x:number, y:number, vx:number, vy:number,
 *     type:'target'|'friendly', radius:number,
 *     word?:string, image?:HTMLImageElement, color?:string,
 *     path?: {startX:number,startY:number,endX:number,endY:number}
 *   }>
 */

/**
 * Draw a subtle background grid pattern.
 * @param {CanvasRenderingContext2D} ctx - 2D context of the canvas.
 * @param {HTMLCanvasElement} canvas - Canvas element to draw onto.
 */
/**
 * Draw a horizontally scrolling background image.
 * @param {CanvasRenderingContext2D} ctx - 2D context of the canvas.
 * @param {HTMLCanvasElement} canvas - Canvas element to draw onto.
 */

const backgroundImageFolder = 'assets/images/backgrounds/';
// Start with a sensible fallback list; will be replaced if discovery succeeds.
let backgroundImageFiles = [
  'beach.png', 'coral.png', 'desert.png', 'hills.png', 'meadow.png',
  'mountain range.png', 'oasis.png', 'rainforest.png', 'savannah.png', 'snow.png',
  // extra images present in the folder but not in the legacy list
  'volcano.png', 'Wetland.png',
];
const ALLOWED_EXTS = ['.png', '.jpg', '.jpeg'];
const hasAllowedExt = (name) => /\.(png|jpg|jpeg)$/i.test(name);
const isFileNameOnly = (name) => name && !name.includes('/') && !name.endsWith('/');

let backgroundListDiscovering = false;
let backgroundListDiscovered = false;

/**
 * Try to discover background images at runtime by fetching a manifest or parsing
 * a directory index. This works on servers that expose either a JSON file or
 * an auto-index. Falls back to the baked-in list when unavailable.
 */
async function discoverBackgroundImages() {
  if (backgroundListDiscovering || backgroundListDiscovered) return;
  backgroundListDiscovering = true;
  const base = backgroundImageFolder;

  const applyList = (arr) => {
    const filtered = (arr || [])
      .filter(isFileNameOnly)
      .filter(hasAllowedExt)
      .sort((a, b) => a.localeCompare(b));
    if (filtered.length) {
      backgroundImageFiles = filtered;
    }
  };

  try {
    // 1) Preferred: fetch JSON manifest
    const manifestUrls = ['manifest.json', 'index.json'].map(n => base + n);
    for (const url of manifestUrls) {
      try {
        const r = await fetch(url, { cache: 'no-cache' });
        if (r.ok) {
          const data = await r.json();
          if (Array.isArray(data)) {
            applyList(data);
            backgroundListDiscovered = true;
            backgroundListDiscovering = false;
            return;
          }
        }
      } catch {}
    }

    // 2) Fallback: fetch directory listing HTML and parse hrefs
    try {
      const r = await fetch(base, { cache: 'no-cache' });
      if (r.ok) {
        const text = await r.text();
        const hrefs = Array.from(text.matchAll(/href="([^"]+)"/gi)).map(m => m[1]);
        // Normalize hrefs that may be absolute or relative
        const names = hrefs
          .map(h => decodeURIComponent(h))
          .map(h => h.split('?')[0])
          .map(h => h.replace(/^\/?assets\/images\/backgrounds\//, ''))
          .filter(isFileNameOnly);
        applyList(names);
      }
    } catch {}
  } finally {
    backgroundListDiscovered = true; // prevent repeated attempts every frame
    backgroundListDiscovering = false;
  }
}
let backgroundImage = null;
let backgroundLoaded = false;
let scrollX = 0;
const SCROLL_SPEED = 1.2; // pixels per frame

// Randomly select a background image on each game load
function getRandomBackgroundImageSrc() {
  const idx = Math.floor(Math.random() * backgroundImageFiles.length);
  return backgroundImageFolder + backgroundImageFiles[idx];
}

/**
 * Kick off background discovery (non-blocking) and preload one image.
 */
export function preloadBackgroundImage() {
  // Non-blocking discovery: improves coverage when the server exposes a list
  // while keeping first paint fast.
  // If discovery finishes before selection, it will use the updated list.
  try { discoverBackgroundImages(); } catch {}
  if (!backgroundImage) {
    const src = getRandomBackgroundImageSrc();
    backgroundImage = new window.Image();
    backgroundImage.src = src;
    backgroundImage.onload = () => { backgroundLoaded = true; };
  }
}

/**
 * Explicit initializer to be called on program start to attempt discovery ASAP.
 * Safe to call multiple times.
 */
export function initBackgrounds() {
  try { discoverBackgroundImages(); } catch {}
}

function loadBackgroundImage() {
  if (!backgroundImage) {
    preloadBackgroundImage();
  }
}

export function drawBackground(ctx, canvas, opts = {}) {
  const { withNoise = true } = opts;
  loadBackgroundImage();
  if (!backgroundLoaded || !backgroundImage) {
    // fallback: fill with pastel color and subtle paper texture
  ctx.fillStyle = '#DAE8E3'; // Mint cream
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (withNoise) {
      // Paper-like effect: subtle noise overlay
      ctx.globalAlpha = 0.08;
      for (let i = 0; i < 1000; i++) {
        ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.08})`;
        ctx.beginPath();
        ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;
    }
    return;
  }


  // Scale so the image width fits exactly into the play area (canvas width)
  const scale = canvas.width / backgroundImage.width;
  const imgW = canvas.width;
  const imgH = Math.round(backgroundImage.height * scale);
  const x = 0; // align to left edge of play area
  const y = Math.round((canvas.height - imgH) / 2); // center vertically

  ctx.drawImage(backgroundImage, x, y, imgW, imgH);

  if (withNoise) {
    // Paper-like effect: subtle noise overlay
    ctx.globalAlpha = 0.08;
    for (let i = 0; i < 1000; i++) {
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.08})`;
      ctx.beginPath();
      ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;
  }
}

/**
 * Draw all game objects with optional paths, shadows, and labels.
 * @param {CanvasRenderingContext2D} ctx - 2D context of the canvas.
 * @param {HTMLCanvasElement} canvas - Canvas element.
 * @param {object} gameConfig - Visual settings: colors, transparency, feature flags.
 * @param {Array} gameObjects - Objects to draw; see module header for shape.
 */
export function drawObjects(ctx, canvas, gameConfig, gameObjects) {
  gameObjects.forEach(object => {
    ctx.save();

    // Object path debug drawing removed

    // Apply transparency and pastel color palette
    if (object.type === 'target') {
      ctx.globalAlpha = gameConfig.targetTransparency;
      ctx.shadowColor = 'rgba(173,216,230,0.3)'; // pastel blue shadow
      ctx.shadowBlur = 8;
    } else if (object.type === 'friendly') {
      if (object.image) {
        ctx.globalAlpha = gameConfig.friendlyImagesTransparency;
        ctx.shadowColor = 'rgba(255,182,193,0.3)'; // pastel pink shadow
        ctx.shadowBlur = 8;
      } else {
        ctx.globalAlpha = gameConfig.friendlyTransparency;
        ctx.shadowColor = 'rgba(255,182,193,0.3)'; // pastel pink shadow
        ctx.shadowBlur = 8;
      }
    }

  // Draw shadow (always enabled)
      ctx.save();
      ctx.globalAlpha = 0.6; // Shadow opacity - more pronounced
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetX = 5;
      ctx.shadowOffsetY = 5;

      // Draw shadow shape
      if (object.image) {
        const size = object.radius * 2;
        ctx.drawImage(object.image, object.x - object.radius, object.y - object.radius, size, size);
      } else {
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(object.x, object.y, object.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Restore alpha for main object
      if (object.type === 'target') {
        ctx.globalAlpha = gameConfig.targetTransparency;
      } else if (object.type === 'friendly') {
        if (object.image) {
          ctx.globalAlpha = gameConfig.friendlyImagesTransparency;
        } else {
          ctx.globalAlpha = gameConfig.friendlyTransparency;
        }
      }

    // Use the image stored in the object if available
    if (object.image) {
      const size = object.radius * 2;
      ctx.drawImage(object.image, object.x - object.radius, object.y - object.radius, size, size);
    } else {
      // Use random color if provided; otherwise fall back to configured colors
      if (object.type === 'target') {
        const fill = object.color || (gameConfig?.targetColor || '#C9DBE0');
        ctx.fillStyle = fill;
        ctx.strokeStyle = '#ECEBDB'; // subtle border
        ctx.lineWidth = 2;
      } else {
        const fill = object.color || (gameConfig?.friendlyColor || '#ECE1DA');
        ctx.fillStyle = fill;
        ctx.strokeStyle = '#F3EAC9';
        ctx.lineWidth = 2;
      }

      ctx.beginPath();
      ctx.arc(object.x, object.y, object.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Draw word if available (either target word or friendly word)
      if (object.word) {
  ctx.fillStyle = '#F3EAC9'; // Parchment
  ctx.font = `bold ${Math.max(14, object.radius * 0.8)}px 'Segoe UI', 'Arial', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(object.word, object.x, object.y);
      }
    }

    ctx.restore();
  });
}

/**
 * Render an entire frame: clear canvas, draw background when idle, or objects when playing.
 * This keeps all drawing concerns inside the renderer.
 * @param {CanvasRenderingContext2D} ctx
 * @param {HTMLCanvasElement} canvas
 * @param {object} gameConfig
 * @param {Array} gameObjects
 * @param {boolean} gameStarted
 */
export function renderFrame(ctx, canvas, gameConfig, gameObjects, gameStarted) {
  // Clear canvas every frame
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Always draw background first so it remains visible after game starts
  drawBackground(ctx, canvas, { withNoise: !gameStarted });

  if (gameStarted) {
    drawObjects(ctx, canvas, gameConfig, gameObjects);
  }
}
