/**
 * Module: Utils/Includes
 * Responsibility:
 * - Load and inline small HTML partials declared via data-include attributes.
 * Usage:
 *   <div data-include="partials/right-panel.html"></div>
 *   await loadIncludes(); // replaces in place and removes the attribute
 */
export async function loadIncludes(root = document) {
  const nodes = Array.from(root.querySelectorAll('[data-include]'));
  await Promise.all(nodes.map(async (el) => {
    const path = el.getAttribute('data-include');
    if (!path) return;
    try {
      const res = await fetch(path, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
      el.innerHTML = await res.text();
      el.removeAttribute('data-include');
    } catch (e) {
      console.error('Include load error:', e);
    }
  }));
}
