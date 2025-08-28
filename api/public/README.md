# Frontend Public Directory

This directory contains the static frontend assets for the API.

## Structure

```
public/
├── css/
│   ├── styles.css          # Main stylesheet (imports all CSS)
│   ├── dracula-theme.css   # Custom Dracula theme with light/dark toggle
│   └── animations.css      # Animation and transition styles
├── js/
│   └── main.js            # Main JavaScript functionality
├── images/
│   ├── github.png         # GitHub logo
│   ├── patreon.svg        # Patreon logo
│   └── paypal.svg         # PayPal logo
└── index.html             # Main homepage
```

## Features

### 🎨 Theming
- **Dracula Theme** - Beautiful dark theme based on [Dracula color scheme](https://draculatheme.com)
- **Light Mode** - Clean light theme for accessibility
- **Theme Toggle** - Floating button to switch between themes
- **System Preference** - Respects user's OS theme preference
- **Persistent** - Theme choice is saved in localStorage

### ♿ Accessibility
- **Skip Links** - Skip to main content for screen readers
- **ARIA Labels** - Proper labels for interactive elements
- **Keyboard Navigation** - Full keyboard support
- **Focus Indicators** - Clear focus states
- **Semantic HTML** - Proper heading hierarchy and landmarks

### 🚀 Performance
- **Organized Assets** - CSS and JS in separate files
- **Minimal Dependencies** - Only Bootstrap and icons
- **Lazy Loading** - Images load with fade-in effect
- **Smooth Animations** - GPU-accelerated CSS animations

### ✨ Interactive Features
- **Version Badge** - Displays current API version
- **Health Monitor** - Shows API health status
- **Copy to Clipboard** - Click endpoint badges to copy
- **Search Ready** - Press `/` to search (UI coming soon)
- **Smooth Scrolling** - Smooth scroll to anchors

## Theme Colors

### Dracula Palette
- Background: `#282a36`
- Current Line: `#44475a`
- Foreground: `#f8f8f2`
- Comment: `#6272a4`
- Cyan: `#8be9fd`
- Green: `#50fa7b`
- Orange: `#ffb86c`
- Pink: `#ff79c6`
- Purple: `#bd93f9`
- Red: `#ff5555`
- Yellow: `#f1fa8c`

## Development

To modify styles:
1. Edit the appropriate CSS file in `/css/`
2. For theme changes, modify `dracula-theme.css`
3. For animations, modify `animations.css`
4. All imports are handled by `styles.css`

To modify functionality:
1. Edit `/js/main.js`
2. All modules are organized as objects
3. Initialization happens in DOMContentLoaded

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Android)

## Credits

- Dracula Theme: https://draculatheme.com
- Bootstrap: https://getbootstrap.com
- Bootstrap Icons: https://icons.getbootstrap.com