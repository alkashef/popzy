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
export function drawBackground(ctx, canvas) {
  // Create a subtle grid pattern
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1;

  const gridSize = 50;

  // Draw vertical lines
  for (let x = 0; x <= canvas.width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  // Draw horizontal lines
  for (let y = 0; y <= canvas.height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
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

    // Apply transparency based on object type and settings
    if (object.type === 'target') {
      ctx.globalAlpha = gameConfig.targetTransparency;
    } else if (object.type === 'friendly') {
      if (object.image) {
        ctx.globalAlpha = gameConfig.friendlyImagesTransparency;
      } else {
        ctx.globalAlpha = gameConfig.friendlyTransparency;
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
      // Fallback to colored circles - use object.color if available (random color mode)
      if (object.type === 'target') {
        ctx.fillStyle = object.color || gameConfig.targetColor;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
      } else {
        ctx.fillStyle = object.color || gameConfig.friendlyColor;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
      }

      ctx.beginPath();
      ctx.arc(object.x, object.y, object.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Draw word if available (either target word or friendly word)
      if (object.word) {
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.max(14, object.radius * 0.8)}px Arial`;
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
