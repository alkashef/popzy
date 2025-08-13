/**
 * Module: UI/About Modal
 * Responsibility:
 * - Control the About modal open/close
 * - Handle tab switching inside the About modal
 * API:
 * - initAbout()
 * - openAbout()
 * - closeAbout()
 * - showAboutTab(tabName)
 */

import { UI } from './dom.js';

export function initAbout() {
  // Close when clicking outside the modal content
  const aboutModal = UI?.el?.aboutModal || document.getElementById('about-modal');
  if (aboutModal) {
    aboutModal.addEventListener('click', (event) => {
      if (event.target === aboutModal) closeAbout();
    });
  }

  // Expose tab function for inline onclick in index.html
  try {
    if (typeof window !== 'undefined') {
      window.showAboutTab = showAboutTab;
    }
  } catch (_) {}
}

export function openAbout() {
  const aboutModal = UI?.el?.aboutModal || document.getElementById('about-modal');
  if (aboutModal) aboutModal.classList.remove('hidden');
}

export function closeAbout() {
  const aboutModal = UI?.el?.aboutModal || document.getElementById('about-modal');
  if (aboutModal) aboutModal.classList.add('hidden');
}

export function showAboutTab(tabName) {
  // Toggle tab contents
  const allTabs = document.querySelectorAll('.tab-content');
  allTabs.forEach((tab) => tab.classList.remove('active'));
  const selectedTab = document.getElementById(`${tabName}-tab`);
  if (selectedTab) selectedTab.classList.add('active');

  // Toggle tab buttons
  const allButtons = document.querySelectorAll('.about-tabs .tab-button');
  allButtons.forEach((btn) => btn.classList.remove('active'));

  // Try to use the event target if called from inline onclick
  const ev = typeof window !== 'undefined' ? window.event : null;
  if (ev && ev.target && ev.target.classList) {
    ev.target.classList.add('active');
  } else {
    // Fallback: try to match by argument in onclick attribute
    allButtons.forEach((btn) => {
      const attr = btn.getAttribute('onclick') || '';
      if (attr.includes(`'${tabName}'`) || attr.includes(`\"${tabName}\"`)) {
        btn.classList.add('active');
      }
    });
  }
}
