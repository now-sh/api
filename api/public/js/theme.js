/**
 * Theme Toggle - Dark/Light mode switcher
 * Persists preference in localStorage
 */
(function() {
  'use strict';

  const THEME_KEY = 'api-theme';
  const DARK_THEME = 'dark';
  const LIGHT_THEME = 'light';

  // Get saved theme or detect from system preference
  function getSavedTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === LIGHT_THEME || saved === DARK_THEME) {
      return saved;
    }
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return LIGHT_THEME;
    }
    return DARK_THEME;
  }

  // Apply theme to document
  function applyTheme(theme) {
    if (theme === LIGHT_THEME) {
      document.documentElement.setAttribute('data-theme', 'light');
      document.body?.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
      document.body?.removeAttribute('data-theme');
    }
    updateIcon(theme);
  }

  // Update the toggle button icon
  function updateIcon(theme) {
    const icon = document.getElementById('themeIcon');
    if (!icon) return;

    if (theme === LIGHT_THEME) {
      // Light theme: show sun icon (click to go dark)
      icon.classList.remove('bi-moon-fill');
      icon.classList.add('bi-sun-fill');
    } else {
      // Dark theme: show moon icon (click to go light)
      icon.classList.remove('bi-sun-fill');
      icon.classList.add('bi-moon-fill');
    }
  }

  // Toggle between themes
  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const newTheme = current === 'light' ? DARK_THEME : LIGHT_THEME;
    localStorage.setItem(THEME_KEY, newTheme);
    applyTheme(newTheme);
  }

  // Apply saved theme immediately (before DOM is fully ready)
  // This prevents flash of wrong theme
  (function() {
    const savedTheme = getSavedTheme();
    applyTheme(savedTheme);
  })();

  // Set up toggle button when DOM is ready
  function initToggle() {
    const toggleBtn = document.getElementById('themeToggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', toggleTheme);
    }
    // Update icon after DOM is ready
    updateIcon(getSavedTheme());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initToggle);
  } else {
    initToggle();
  }

  // Listen for system theme changes
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', function(e) {
      // Only auto-switch if user hasn't manually set a preference
      if (!localStorage.getItem(THEME_KEY)) {
        applyTheme(e.matches ? LIGHT_THEME : DARK_THEME);
      }
    });
  }
})();