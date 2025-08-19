/**
 * Module: Render/Draw
 * Responsibility:
 * - Pure rendering helpers for the canvas: background and game objects.
 * - No state; all inputs are explicit (ctx, canvas, config, objects).
 * Data Model Expectations:
 * - gameConfig includes colors, transparency, and flags like showObjectPaths, objectShadows.
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
const backgroundImageFiles = [
  'beach.png', 'coral.png', 'desert.png', 'hills.png', 'meadow.png',
  'mountain range.png', 'oasis.png', 'rainforest.png', 'savannah.png', 'snow.png'
];
let backgroundImage = null;
let backgroundLoaded = false;
let scrollX = 0;
const SCROLL_SPEED = 1.2; // pixels per frame

// Randomly select a background image on each game load
function getRandomBackgroundImageSrc() {
  const idx = Math.floor(Math.random() * backgroundImageFiles.length);
  return backgroundImageFolder + backgroundImageFiles[idx];
}

export function preloadBackgroundImage() {
  if (!backgroundImage) {
    const src = getRandomBackgroundImageSrc();
    backgroundImage = new window.Image();
    backgroundImage.src = src;
    backgroundImage.onload = () => { backgroundLoaded = true; };
  }
}

function loadBackgroundImage() {
  if (!backgroundImage) {
    preloadBackgroundImage();
  }
}

export function drawBackground(ctx, canvas) {
  loadBackgroundImage();
  if (!backgroundLoaded || !backgroundImage) {
    // fallback: fill with pastel color and subtle paper texture
  ctx.fillStyle = '#DAE8E3'; // Mint cream
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Paper-like effect: subtle noise overlay
    ctx.globalAlpha = 0.08;
    for (let i = 0; i < 1000; i++) {
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.08})`;
      ctx.beginPath();
      ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;
    return;
  }


  // Scale and center the image so the whole image fits (contain)
  const scale = Math.min(canvas.width / backgroundImage.width, canvas.height / backgroundImage.height);
  const imgW = backgroundImage.width * scale;
  const imgH = backgroundImage.height * scale;
  const x = (canvas.width - imgW) / 2;
  const y = (canvas.height - imgH) / 2;

  // No scrolling: just draw the image centered and fully visible
  ctx.drawImage(backgroundImage, x, y, imgW, imgH);

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

    // Draw object path if enabled
    if (gameConfig.showObjectPaths && object.path) {
      ctx.strokeStyle = object.type === 'target'
        ? `${gameConfig.targetColor}33`
        : `${gameConfig.friendlyColor}33`; // Add transparency to color
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(object.path.startX, object.path.startY);
      ctx.lineTo(object.path.endX, object.path.endY);
      ctx.stroke();
      ctx.setLineDash([]); // Reset dash
    }

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

    // Draw shadow if enabled
    if (gameConfig.objectShadows) {
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
    }

    // Use the image stored in the object if available
    if (object.image) {
      const size = object.radius * 2;
      ctx.drawImage(object.image, object.x - object.radius, object.y - object.radius, size, size);
    } else {
      // Fallback to pastel colored circles - use object.color if available (random color mode)
      if (object.type === 'target') {
  ctx.fillStyle = object.color || '#C9DBE0'; // Columbia blue
  ctx.strokeStyle = '#ECEBDB'; // Eggshell
        ctx.lineWidth = 2;
      } else {
  ctx.fillStyle = object.color || '#ECE1DA'; // Linen
  ctx.strokeStyle = '#F3EAC9'; // Parchment
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

  if (!gameStarted) {
    drawBackground(ctx, canvas);
    return;
  }

  drawObjects(ctx, canvas, gameConfig, gameObjects);
}
