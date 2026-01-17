import { useState, useEffect } from 'react';
import { Palette, Download, RotateCcw } from 'lucide-react';

/**
 * ThemeSelector - Dropdown for selecting pre-built themes
 * Includes reset to default option
 */
function ThemeSelector({ currentTheme, onThemeChange, onReset }) {
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pre-built themes
  const prebuiltThemes = [
    {
      id: 'professional',
      name: 'Professional',
      colors: {
        primary: '#2563eb',
        secondary: '#7c3aed',
        accent: '#06b6d4',
        background: '#0f172a',
        text: '#f1f5f9'
      }
    },
    {
      id: 'creative',
      name: 'Creative',
      colors: {
        primary: '#ec4899',
        secondary: '#f59e0b',
        accent: '#8b5cf6',
        background: '#1e1b4b',
        text: '#fef3c7'
      }
    },
    {
      id: 'minimal',
      name: 'Minimal',
      colors: {
        primary: '#64748b',
        secondary: '#94a3b8',
        accent: '#cbd5e1',
        background: '#f8fafc',
        text: '#1e293b'
      }
    },
    {
      id: 'dark',
      name: 'Dark Mode',
      colors: {
        primary: '#8b5cf6',
        secondary: '#ec4899',
        accent: '#06b6d4',
        background: '#000000',
        text: '#ffffff'
      }
    },
    {
      id: 'high-contrast',
      name: 'High Contrast',
      colors: {
        primary: '#ffff00',
        secondary: '#00ffff',
        accent: '#ff00ff',
        background: '#000000',
        text: '#ffffff'
      }
    },
    {
      id: 'retro',
      name: 'Retro',
      colors: {
        primary: '#ff6b6b',
        secondary: '#4ecdc4',
        accent: '#ffe66d',
        background: '#2d3561',
        text: '#f7fff7'
      }
    }
  ];

  useEffect(() => {
    loadThemes();
  }, []);

  const loadThemes = async () => {
    try {
      const response = await fetch('/api/themes');
      const data = await response.json();
      
      if (data.success) {
        setThemes([...prebuiltThemes, ...data.data]);
      } else {
        setThemes(prebuiltThemes);
      }
    } catch (error) {
      console.error('Error loading themes:', error);
      setThemes(prebuiltThemes);
    } finally {
      setLoading(false);
    }
  };

  const handleThemeSelect = (theme) => {
    if (onThemeChange) {
      onThemeChange(theme);
    }
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Palette size={20} />
          Theme auswählen
        </h3>
        <button
          onClick={handleReset}
          className="px-3 py-2 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg transition-all flex items-center gap-2 text-sm"
          title="Auf Standard zurücksetzen"
        >
          <RotateCcw size={16} />
          Reset
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-400">
          Themes werden geladen...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => handleThemeSelect(theme)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                currentTheme?.id === theme.id
                  ? 'border-purple-500 bg-purple-500/20'
                  : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-white">{theme.name}</h4>
                {currentTheme?.id === theme.id && (
                  <span className="text-purple-400 text-sm">✓ Aktiv</span>
                )}
              </div>

              {/* Color Preview */}
              <div className="flex gap-2">
                {theme.colors && Object.values(theme.colors).slice(0, 5).map((color, idx) => (
                  <div
                    key={idx}
                    className="w-8 h-8 rounded border border-white/20"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Custom Theme Info */}
      {currentTheme && !prebuiltThemes.find(t => t.id === currentTheme.id) && (
        <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-sm text-blue-400">
            💡 Sie verwenden ein benutzerdefiniertes Theme. Verwenden Sie den Theme Editor, um es anzupassen.
          </p>
        </div>
      )}
    </div>
  );
}

export default ThemeSelector;
