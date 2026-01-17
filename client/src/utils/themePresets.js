/**
 * Pre-built theme library with various theme presets
 */

export const themePresets = {
  professional: {
    name: 'Professional',
    colors: {
      primary: '#2563eb',
      secondary: '#7c3aed',
      accent: '#0891b2',
      background: '#0f172a',
      text: '#f1f5f9'
    },
    typography: {
      fontFamily: 'Inter',
      fontSize: 16,
      fontWeight: 400
    },
    spacing: {
      margin: 16,
      padding: 20,
      cardSize: 'medium'
    },
    animation: {
      speed: 300,
      effect: 'ease-in-out'
    },
    mode: 'dark'
  },

  creative: {
    name: 'Creative',
    colors: {
      primary: '#ec4899',
      secondary: '#f59e0b',
      accent: '#8b5cf6',
      background: '#1e1b4b',
      text: '#fef3c7'
    },
    typography: {
      fontFamily: 'Poppins',
      fontSize: 17,
      fontWeight: 500
    },
    spacing: {
      margin: 24,
      padding: 24,
      cardSize: 'large'
    },
    animation: {
      speed: 400,
      effect: 'ease-out'
    },
    mode: 'dark'
  },

  minimal: {
    name: 'Minimal',
    colors: {
      primary: '#18181b',
      secondary: '#52525b',
      accent: '#71717a',
      background: '#ffffff',
      text: '#09090b'
    },
    typography: {
      fontFamily: 'system-ui',
      fontSize: 15,
      fontWeight: 400
    },
    spacing: {
      margin: 12,
      padding: 16,
      cardSize: 'small'
    },
    animation: {
      speed: 200,
      effect: 'linear'
    },
    mode: 'light'
  },

  darkMode: {
    name: 'Dark Mode',
    colors: {
      primary: '#a78bfa',
      secondary: '#c084fc',
      accent: '#60a5fa',
      background: '#000000',
      text: '#e5e7eb'
    },
    typography: {
      fontFamily: 'Roboto',
      fontSize: 16,
      fontWeight: 400
    },
    spacing: {
      margin: 16,
      padding: 20,
      cardSize: 'medium'
    },
    animation: {
      speed: 250,
      effect: 'ease'
    },
    mode: 'dark'
  },

  highContrast: {
    name: 'High Contrast',
    colors: {
      primary: '#ffff00',
      secondary: '#00ffff',
      accent: '#ff00ff',
      background: '#000000',
      text: '#ffffff'
    },
    typography: {
      fontFamily: 'Arial',
      fontSize: 18,
      fontWeight: 700
    },
    spacing: {
      margin: 20,
      padding: 24,
      cardSize: 'large'
    },
    animation: {
      speed: 150,
      effect: 'linear'
    },
    mode: 'dark'
  },

  retro: {
    name: 'Retro',
    colors: {
      primary: '#ff6b6b',
      secondary: '#4ecdc4',
      accent: '#ffe66d',
      background: '#2d3561',
      text: '#f7fff7'
    },
    typography: {
      fontFamily: 'Georgia',
      fontSize: 16,
      fontWeight: 400
    },
    spacing: {
      margin: 20,
      padding: 20,
      cardSize: 'medium'
    },
    animation: {
      speed: 500,
      effect: 'ease-in-out'
    },
    mode: 'dark'
  }
};

/**
 * Get a theme preset by name
 */
export const getThemePreset = (name) => {
  return themePresets[name.toLowerCase()] || themePresets.professional;
};

/**
 * Get all theme preset names
 */
export const getThemePresetNames = () => {
  return Object.keys(themePresets);
};

/**
 * Apply theme to document root
 */
export const applyTheme = (theme) => {
  const root = document.documentElement;
  
  // Apply CSS variables
  root.style.setProperty('--color-primary', theme.colors.primary);
  root.style.setProperty('--color-secondary', theme.colors.secondary);
  root.style.setProperty('--color-accent', theme.colors.accent);
  root.style.setProperty('--color-background', theme.colors.background);
  root.style.setProperty('--color-text', theme.colors.text);
  
  root.style.setProperty('--font-family', theme.typography.fontFamily);
  root.style.setProperty('--font-size', `${theme.typography.fontSize}px`);
  root.style.setProperty('--font-weight', theme.typography.fontWeight);
  
  root.style.setProperty('--spacing-margin', `${theme.spacing.margin}px`);
  root.style.setProperty('--spacing-padding', `${theme.spacing.padding}px`);
  
  root.style.setProperty('--animation-speed', `${theme.animation.speed}ms`);
  root.style.setProperty('--animation-effect', theme.animation.effect);
  
  // Apply mode class
  if (theme.mode === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
  } else {
    root.classList.add('light');
    root.classList.remove('dark');
  }
};

export default themePresets;
