/**
 * Asset loading service.
 * - Loads image lists from a data-driven manifest.
 * - Returns maps of images keyed by category and arrays for random selection.
 */

/**
 * Load image assets from a manifest.
 * @param {Object} options
 * @param {string} options.baseTargetPath - Base path for target images.
 * @param {string} options.baseFriendlyPath - Base path for friendly images.
 * @param {{target:string[], friendly:string[]}} manifest - Image filenames.
 * @returns {Promise<{ target: HTMLImageElement[], friendly: HTMLImageElement[] }>}
 */
export async function loadImages({ baseTargetPath, baseFriendlyPath }, manifest) {
  const loadList = async (base, names) => {
    const out = [];
    for (const name of names) {
      try {
        const img = await loadImage(base + name);
        out.push(img);
      } catch (e) {
        // Continue loading other images
        console.warn('Image failed to load:', base + name, e);
      }
    }
    return out;
  };

  const [target, friendly] = await Promise.all([
    loadList(baseTargetPath, manifest.target || []),
    loadList(baseFriendlyPath, manifest.friendly || []),
  ]);

  return { target, friendly };
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}
