/**
 * Comprehensive Theme Schema
 * Defines all customizable styling properties for the application
 */

// Default theme values
export const defaultTheme = {
  id: null,
  name: 'Standard',
  version: '2.0',
  
  // Global Colors
  colors: {
    primary: '#8b5cf6',
    primaryHover: '#7c3aed',
    secondary: '#ec4899',
    secondaryHover: '#db2777',
    accent: '#06b6d4',
    accentHover: '#0891b2',
    
    // Backgrounds
    appBackground: '#0f172a',
    appBackgroundGradient: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
    cardBackground: 'rgba(255, 255, 255, 0.05)',
    cardBackgroundHover: 'rgba(255, 255, 255, 0.08)',
    inputBackground: 'rgba(255, 255, 255, 0.05)',
    
    // Text
    textPrimary: '#ffffff',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    textAccent: '#a78bfa',
    
    // Borders
    borderDefault: 'rgba(255, 255, 255, 0.1)',
    borderHover: 'rgba(255, 255, 255, 0.2)',
    borderFocus: '#8b5cf6',
    borderAccent: '#8b5cf6',
    
    // Status colors
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    
    // Overlays
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayDark: 'rgba(0, 0, 0, 0.8)',
  },
  
  // Borders
  borders: {
    width: {
      thin: '1px',
      default: '2px',
      thick: '3px',
    },
    style: 'solid', // solid, dashed, dotted, double
    radius: {
      none: '0px',
      sm: '4px',
      md: '8px',
      lg: '12px',
      xl: '16px',
      '2xl': '24px',
      full: '9999px',
    },
    defaultRadius: '12px',
  },
  
  // Shadows
  shadows: {
    none: 'none',
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.15)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.2)',
    '2xl': '0 25px 50px rgba(0, 0, 0, 0.25)',
    glow: '0 0 20px rgba(139, 92, 246, 0.3)',
    glowStrong: '0 0 40px rgba(139, 92, 246, 0.5)',
    inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  defaultShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  
  // Typography
  typography: {
    fontFamily: {
      primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      secondary: "'Poppins', sans-serif",
      mono: "'JetBrains Mono', 'Fira Code', monospace",
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
    letterSpacing: {
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
    },
  },
  
  // Spacing
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },
  
  // Card Styling
  cards: {
    background: 'rgba(255, 255, 255, 0.05)',
    backgroundHover: 'rgba(255, 255, 255, 0.08)',
    borderWidth: '1px',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderColorHover: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '12px',
    shadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    shadowHover: '0 10px 15px rgba(0, 0, 0, 0.15)',
    padding: '1.5rem',
    backdropBlur: '12px',
  },
  
  // Button Styling
  buttons: {
    primary: {
      background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
      backgroundHover: 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)',
      text: '#ffffff',
      borderRadius: '8px',
      padding: '0.75rem 1.5rem',
      shadow: '0 4px 14px rgba(139, 92, 246, 0.3)',
    },
    secondary: {
      background: 'rgba(255, 255, 255, 0.1)',
      backgroundHover: 'rgba(255, 255, 255, 0.15)',
      text: '#ffffff',
      borderRadius: '8px',
      padding: '0.75rem 1.5rem',
      border: '1px solid rgba(255, 255, 255, 0.2)',
    },
    ghost: {
      background: 'transparent',
      backgroundHover: 'rgba(255, 255, 255, 0.1)',
      text: '#94a3b8',
      textHover: '#ffffff',
    },
  },
  
  // Input Styling
  inputs: {
    background: 'rgba(255, 255, 255, 0.05)',
    backgroundFocus: 'rgba(255, 255, 255, 0.08)',
    borderWidth: '1px',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderColorFocus: '#8b5cf6',
    borderRadius: '8px',
    textColor: '#ffffff',
    placeholderColor: '#64748b',
    padding: '0.75rem 1rem',
  },
  
  // Animations
  animations: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
    enableAnimations: true,
    enableHoverEffects: true,
  },
  
  // Glass/Blur Effects
  effects: {
    backdropBlur: '12px',
    glassOpacity: 0.05,
    enableGlassEffect: true,
  },
  
  // Component-specific overrides
  components: {
    header: {
      background: 'rgba(0, 0, 0, 0.3)',
      backdropBlur: '12px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      height: '64px',
    },
    sidebar: {
      background: 'rgba(0, 0, 0, 0.2)',
      width: '280px',
      borderRight: '1px solid rgba(255, 255, 255, 0.1)',
    },
    modal: {
      background: 'linear-gradient(135deg, #1e293b 0%, #312e81 50%, #1e293b 100%)',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      shadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
    },
  },
  
  // Page-specific styles (override global styles for specific pages)
  pageStyles: {
    welcome: {
      background: null, // null = use global appBackgroundGradient
      textColor: null,
    },
    join: {
      background: null,
      textColor: null,
    },
    login: {
      background: null,
      textColor: null,
    },
    dashboard: {
      background: null,
      textColor: null,
    },
    adminDashboard: {
      background: null,
      textColor: null,
    },
    classes: {
      background: null,
      textColor: null,
    },
    moduleCreator: {
      background: null,
      textColor: null,
    },
    session: {
      background: null,
      textColor: null,
    },
  },
  
  // Mode (for potential light mode support)
  mode: 'dark',
};

// Generate CSS variables from theme
export const generateCSSVariables = (theme) => {
  const vars = {};
  
  // === PRIMARY COLORS ===
  vars['--color-primary'] = theme.colors?.primary || '#8b5cf6';
  vars['--color-primary-hover'] = theme.colors?.primaryHover || '#7c3aed';
  vars['--color-secondary'] = theme.colors?.secondary || '#ec4899';
  vars['--color-secondary-hover'] = theme.colors?.secondaryHover || '#db2777';
  vars['--color-accent'] = theme.colors?.accent || '#06b6d4';
  vars['--color-accent-hover'] = theme.colors?.accentHover || '#0891b2';
  
  // === BACKGROUND COLORS ===
  vars['--color-app-background'] = theme.colors?.appBackground || '#0f172a';
  vars['--color-app-background-gradient'] = theme.colors?.appBackgroundGradient || 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)';
  vars['--color-card-background'] = theme.colors?.cardBackground || 'rgba(255, 255, 255, 0.05)';
  vars['--color-card-background-hover'] = theme.colors?.cardBackgroundHover || 'rgba(255, 255, 255, 0.08)';
  vars['--color-input-background'] = theme.colors?.inputBackground || 'rgba(255, 255, 255, 0.05)';
  vars['--color-overlay'] = theme.colors?.overlay || 'rgba(0, 0, 0, 0.5)';
  vars['--color-overlay-dark'] = theme.colors?.overlayDark || 'rgba(0, 0, 0, 0.8)';
  
  // === TEXT COLORS ===
  vars['--color-text-primary'] = theme.colors?.textPrimary || '#ffffff';
  vars['--color-text-secondary'] = theme.colors?.textSecondary || '#94a3b8';
  vars['--color-text-muted'] = theme.colors?.textMuted || '#64748b';
  vars['--color-text-accent'] = theme.colors?.textAccent || '#a78bfa';
  
  // === BORDER COLORS ===
  vars['--color-border-default'] = theme.colors?.borderDefault || 'rgba(255, 255, 255, 0.1)';
  vars['--color-border-hover'] = theme.colors?.borderHover || 'rgba(255, 255, 255, 0.2)';
  vars['--color-border-focus'] = theme.colors?.borderFocus || '#8b5cf6';
  vars['--color-border-accent'] = theme.colors?.borderAccent || '#8b5cf6';
  
  // === STATUS COLORS ===
  vars['--color-success'] = theme.colors?.success || '#22c55e';
  vars['--color-warning'] = theme.colors?.warning || '#f59e0b';
  vars['--color-error'] = theme.colors?.error || '#ef4444';
  vars['--color-info'] = theme.colors?.info || '#3b82f6';
  
  // === BORDER RADIUS ===
  vars['--border-radius-default'] = theme.borders?.defaultRadius || '12px';
  vars['--border-radius-sm'] = theme.borders?.radius?.sm || '4px';
  vars['--border-radius-md'] = theme.borders?.radius?.md || '8px';
  vars['--border-radius-lg'] = theme.borders?.radius?.lg || '12px';
  vars['--border-radius-xl'] = theme.borders?.radius?.xl || '16px';
  vars['--border-radius-2xl'] = theme.borders?.radius?.['2xl'] || '24px';
  
  // === SHADOWS ===
  vars['--shadow-default'] = theme.defaultShadow || '0 4px 6px rgba(0, 0, 0, 0.1)';
  vars['--shadow-glow'] = theme.shadows?.glow || `0 0 20px ${theme.colors?.primary || '#8b5cf6'}4d`;
  vars['--shadow-glow-strong'] = theme.shadows?.glowStrong || `0 0 40px ${theme.colors?.primary || '#8b5cf6'}80`;
  Object.entries(theme.shadows || {}).forEach(([key, value]) => {
    vars[`--shadow-${camelToKebab(key)}`] = value;
  });
  
  // === CARD STYLING ===
  vars['--card-background'] = theme.cards?.background || 'rgba(255, 255, 255, 0.05)';
  vars['--card-background-hover'] = theme.cards?.backgroundHover || 'rgba(255, 255, 255, 0.08)';
  vars['--card-border-width'] = theme.cards?.borderWidth || '1px';
  vars['--card-border-color'] = theme.cards?.borderColor || 'rgba(255, 255, 255, 0.1)';
  vars['--card-border-color-hover'] = theme.cards?.borderColorHover || 'rgba(255, 255, 255, 0.2)';
  vars['--card-border-radius'] = theme.cards?.borderRadius || '12px';
  vars['--card-shadow'] = theme.cards?.shadow || '0 4px 6px rgba(0, 0, 0, 0.1)';
  vars['--card-shadow-hover'] = theme.cards?.shadowHover || '0 10px 15px rgba(0, 0, 0, 0.15)';
  vars['--card-padding'] = theme.cards?.padding || '1.5rem';
  vars['--card-backdrop-blur'] = theme.cards?.backdropBlur || '12px';
  
  // === BUTTON STYLING ===
  vars['--btn-primary-bg'] = theme.buttons?.primary?.background || `linear-gradient(135deg, ${theme.colors?.primary || '#8b5cf6'} 0%, ${theme.colors?.secondary || '#ec4899'} 100%)`;
  vars['--btn-primary-bg-hover'] = theme.buttons?.primary?.backgroundHover || `linear-gradient(135deg, ${theme.colors?.primaryHover || '#7c3aed'} 0%, ${theme.colors?.secondaryHover || '#db2777'} 100%)`;
  vars['--btn-primary-text'] = theme.buttons?.primary?.text || '#ffffff';
  vars['--btn-secondary-bg'] = theme.buttons?.secondary?.background || 'rgba(255, 255, 255, 0.1)';
  vars['--btn-secondary-bg-hover'] = theme.buttons?.secondary?.backgroundHover || 'rgba(255, 255, 255, 0.15)';
  vars['--btn-secondary-text'] = theme.buttons?.secondary?.text || '#ffffff';
  
  // === INPUT STYLING ===
  vars['--input-background'] = theme.inputs?.background || 'rgba(255, 255, 255, 0.05)';
  vars['--input-background-focus'] = theme.inputs?.backgroundFocus || 'rgba(255, 255, 255, 0.08)';
  vars['--input-border-color'] = theme.inputs?.borderColor || 'rgba(255, 255, 255, 0.1)';
  vars['--input-border-color-focus'] = theme.inputs?.borderColorFocus || theme.colors?.primary || '#8b5cf6';
  vars['--input-border-radius'] = theme.inputs?.borderRadius || '8px';
  vars['--input-text-color'] = theme.inputs?.textColor || '#ffffff';
  vars['--input-placeholder-color'] = theme.inputs?.placeholderColor || '#64748b';
  
  // === MODAL STYLING ===
  vars['--modal-background'] = theme.components?.modal?.background || `linear-gradient(135deg, #1e293b 0%, ${theme.colors?.primary || '#312e81'}40 50%, #1e293b 100%)`;
  vars['--modal-border-radius'] = theme.components?.modal?.borderRadius || '16px';
  vars['--modal-border-color'] = theme.components?.modal?.border || 'rgba(255, 255, 255, 0.1)';
  vars['--modal-shadow'] = theme.components?.modal?.shadow || '0 25px 50px rgba(0, 0, 0, 0.5)';
  
  // === ANIMATIONS ===
  vars['--animation-duration'] = theme.animations?.duration?.normal || '300ms';
  vars['--animation-easing'] = theme.animations?.easing?.default || 'cubic-bezier(0.4, 0, 0.2, 1)';
  
  // === EFFECTS ===
  vars['--backdrop-blur'] = theme.effects?.backdropBlur || '12px';
  
  // === LEGACY COMPATIBILITY ===
  vars['--primary-color'] = theme.colors?.primary || '#8b5cf6';
  vars['--secondary-color'] = theme.colors?.secondary || '#ec4899';
  vars['--accent-color'] = theme.colors?.accent || '#06b6d4';
  vars['--bg-color'] = theme.colors?.appBackground || '#0f172a';
  vars['--text-color'] = theme.colors?.textPrimary || '#ffffff';
  
  // Extract gradient colors for legacy support
  const gradient = theme.colors?.appBackgroundGradient || '';
  const gradientMatch = gradient.match(/#[a-fA-F0-9]{6}/g);
  if (gradientMatch && gradientMatch.length >= 2) {
    vars['--bg-gradient-start'] = gradientMatch[0];
    vars['--bg-gradient-middle'] = gradientMatch[1] || gradientMatch[0];
    vars['--bg-gradient-end'] = gradientMatch[2] || gradientMatch[0];
  } else {
    vars['--bg-gradient-start'] = '#0f172a';
    vars['--bg-gradient-middle'] = '#1e1b4b';
    vars['--bg-gradient-end'] = '#0f172a';
  }
  
  // === TYPOGRAPHY ===
  vars['--font-family-primary'] = theme.typography?.fontFamily?.primary || 'Inter, sans-serif';
  vars['--font-family-secondary'] = theme.typography?.fontFamily?.secondary || 'Poppins, sans-serif';
  vars['--font-family-mono'] = theme.typography?.fontFamily?.mono || 'monospace';
  
  // === SPACING ===
  Object.entries(theme.spacing || {}).forEach(([key, value]) => {
    vars[`--spacing-${key}`] = value;
  });
  
  return vars;
};

// Apply theme to document
export const applyThemeToDocument = (theme) => {
  const root = document.documentElement;
  const vars = generateCSSVariables(theme);
  
  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
  
  // Apply mode class
  root.classList.remove('light', 'dark');
  root.classList.add(theme.mode || 'dark');
  
  // Store in localStorage for persistence
  localStorage.setItem('app-theme', JSON.stringify(theme));
};

// Load theme from localStorage
export const loadStoredTheme = () => {
  try {
    const stored = localStorage.getItem('app-theme');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error loading stored theme:', e);
  }
  return null;
};

// Merge themes (base + overrides)
export const mergeThemes = (base, overrides) => {
  if (!overrides) return base;
  
  return deepMerge(base, overrides);
};

// Deep merge utility
const deepMerge = (target, source) => {
  const output = { ...target };
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          output[key] = source[key];
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        output[key] = source[key];
      }
    });
  }
  
  return output;
};

const isObject = (item) => {
  return item && typeof item === 'object' && !Array.isArray(item);
};

// Convert camelCase to kebab-case
const camelToKebab = (str) => {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
};

// Validate theme structure
export const validateTheme = (theme) => {
  const errors = [];
  
  if (!theme.colors) {
    errors.push('Missing colors object');
  }
  if (!theme.colors?.primary) {
    errors.push('Missing primary color');
  }
  if (!theme.colors?.appBackground) {
    errors.push('Missing app background color');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

export default defaultTheme;
