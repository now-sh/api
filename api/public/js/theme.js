// Enhanced Theme Management
(function() {
  const THEME_KEY = 'api-theme';
  let themeToggle, sunIcon, moonIcon;
  
  // Initialize elements (called when DOM is ready)
  const initElements = () => {
    themeToggle = document.querySelector('.theme-toggle');
    sunIcon = document.querySelector('.sun-icon');
    moonIcon = document.querySelector('.moon-icon');
  };
  
  // Get stored theme or default to dark
  const getTheme = () => localStorage.getItem(THEME_KEY) || 'dark';
  
  // Set theme
  const setTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    updateIcons(theme);
    console.log('Theme set to:', theme);
  };
  
  // Update toggle icons (inverted - show sun for light theme, moon for dark theme)
  const updateIcons = (theme) => {
    if (!sunIcon || !moonIcon) return;
    
    if (theme === 'light') {
      sunIcon.style.display = 'block';
      moonIcon.style.display = 'none';
    } else {
      sunIcon.style.display = 'none';
      moonIcon.style.display = 'block';
    }
  };
  
  // Toggle theme
  const toggleTheme = () => {
    const currentTheme = getTheme();
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };
  
  // Initialize theme system
  const init = () => {
    initElements();
    setTheme(getTheme());
    
    // Add click event
    if (themeToggle) {
      themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Watch for system preference changes
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', (e) => {
        if (!localStorage.getItem(THEME_KEY)) {
          setTheme(e.matches ? 'dark' : 'light');
        }
      });
    }
  };
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();