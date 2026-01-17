import { useState, useEffect } from 'react';
import { Save, RotateCcw, Download, Upload, Palette, Type, Layout, Zap } from 'lucide-react';

/**
 * ThemeEditor - Global theme customization component
 * Allows editing colors, typography, spacing, and animations
 */
function ThemeEditor({ 
  currentTheme = {},
  onSave,
  onReset,
  showPreview = true
}) {
  const [theme, setTheme] = useState({
    name: currentTheme.name || 'Custom Theme',
    colors: {
      primary: currentTheme.colors?.primary || '#8b5cf6',
      secondary: currentTheme.colors?.secondary || '#ec4899',
      accent: currentTheme.colors?.accent || '#06b6d4',
      background: currentTheme.colors?.background || '#0f172a',
      text: currentTheme.colors?.text || '#f1f5f9'
    },
    typography: {
      fontFamily: currentTheme.typography?.fontFamily || 'system-ui',
      fontSize: currentTheme.typography?.fontSize || 16,
      fontWeight: currentTheme.typography?.fontWeight || 400
    },
    spacing: {
      margin: currentTheme.spacing?.margin || 16,
      padding: currentTheme.spacing?.padding || 16,
      cardSize: currentTheme.spacing?.cardSize || 'medium'
    },
    animation: {
      speed: currentTheme.animation?.speed || 300,
      effect: currentTheme.animation?.effect || 'ease-in-out'
    },
    mode: currentTheme.mode || 'dark'
  });

  const [activeTab, setActiveTab] = useState('colors');

  const handleColorChange = (colorKey, value) => {
    setTheme(prev => ({
      ...prev,
      colors: { ...prev.colors, [colorKey]: value }
    }));
  };

  const handleTypographyChange = (key, value) => {
    setTheme(prev => ({
      ...prev,
      typography: { ...prev.typography, [key]: value }
    }));
  };

  const handleSpacingChange = (key, value) => {
    setTheme(prev => ({
      ...prev,
      spacing: { ...prev.spacing, [key]: value }
    }));
  };

  const handleAnimationChange = (key, value) => {
    setTheme(prev => ({
      ...prev,
      animation: { ...prev.animation, [key]: value }
    }));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(theme);
    }
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(theme, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${theme.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          setTheme(imported);
        } catch (error) {
          alert('Fehler beim Importieren des Themes');
        }
      };
      reader.readAsText(file);
    }
  };

  const toggleMode = () => {
    setTheme(prev => ({
      ...prev,
      mode: prev.mode === 'dark' ? 'light' : 'dark'
    }));
  };

  const tabs = [
    { id: 'colors', label: 'Farben', icon: Palette },
    { id: 'typography', label: 'Typografie', icon: Type },
    { id: 'spacing', label: 'Layout', icon: Layout },
    { id: 'animation', label: 'Animation', icon: Zap }
  ];

  const fontFamilies = [
    'system-ui',
    'Inter',
    'Roboto',
    'Open Sans',
    'Lato',
    'Montserrat',
    'Poppins',
    'Arial',
    'Georgia',
    'Times New Roman'
  ];

  const animationEffects = [
    'linear',
    'ease',
    'ease-in',
    'ease-out',
    'ease-in-out'
  ];

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Theme Editor</h2>
          <div className="flex gap-2">
            <button
              onClick={toggleMode}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all text-sm"
            >
              {theme.mode === 'dark' ? '🌙 Dark' : '☀️ Light'}
            </button>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
              id="theme-import"
            />
            <label
              htmlFor="theme-import"
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all cursor-pointer flex items-center gap-2 text-sm"
            >
              <Upload size={16} />
              Import
            </label>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all flex items-center gap-2 text-sm"
            >
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                activeTab === id
                  ? 'bg-purple-500/30 text-purple-400 border border-purple-500/50'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Colors Tab */}
        {activeTab === 'colors' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4">Farbpalette</h3>
            
            {Object.entries(theme.colors).map(([key, value]) => (
              <div key={key} className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-300 mb-2 capitalize">
                    {key === 'primary' && 'Primärfarbe'}
                    {key === 'secondary' && 'Sekundärfarbe'}
                    {key === 'accent' && 'Akzentfarbe'}
                    {key === 'background' && 'Hintergrundfarbe'}
                    {key === 'text' && 'Textfarbe'}
                  </label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="color"
                      value={value}
                      onChange={(e) => handleColorChange(key, e.target.value)}
                      className="w-16 h-12 rounded-lg cursor-pointer border-2 border-white/20"
                    />
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => handleColorChange(key, e.target.value)}
                      className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <div
                      className="w-12 h-12 rounded-lg border-2 border-white/20"
                      style={{ backgroundColor: value }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Typography Tab */}
        {activeTab === 'typography' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4">Typografie</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Schriftart
              </label>
              <select
                value={theme.typography.fontFamily}
                onChange={(e) => handleTypographyChange('fontFamily', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {fontFamilies.map(font => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Schriftgröße: {theme.typography.fontSize}px
              </label>
              <input
                type="range"
                min="12"
                max="24"
                value={theme.typography.fontSize}
                onChange={(e) => handleTypographyChange('fontSize', parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Schriftstärke: {theme.typography.fontWeight}
              </label>
              <input
                type="range"
                min="100"
                max="900"
                step="100"
                value={theme.typography.fontWeight}
                onChange={(e) => handleTypographyChange('fontWeight', parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* Spacing Tab */}
        {activeTab === 'spacing' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4">Layout & Abstände</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Außenabstand: {theme.spacing.margin}px
              </label>
              <input
                type="range"
                min="0"
                max="48"
                step="4"
                value={theme.spacing.margin}
                onChange={(e) => handleSpacingChange('margin', parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Innenabstand: {theme.spacing.padding}px
              </label>
              <input
                type="range"
                min="0"
                max="48"
                step="4"
                value={theme.spacing.padding}
                onChange={(e) => handleSpacingChange('padding', parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Kartengröße
              </label>
              <select
                value={theme.spacing.cardSize}
                onChange={(e) => handleSpacingChange('cardSize', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="small">Klein</option>
                <option value="medium">Mittel</option>
                <option value="large">Groß</option>
              </select>
            </div>
          </div>
        )}

        {/* Animation Tab */}
        {activeTab === 'animation' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4">Animationen</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Übergangsgeschwindigkeit: {theme.animation.speed}ms
              </label>
              <input
                type="range"
                min="100"
                max="1000"
                step="50"
                value={theme.animation.speed}
                onChange={(e) => handleAnimationChange('speed', parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Effekttyp
              </label>
              <select
                value={theme.animation.effect}
                onChange={(e) => handleAnimationChange('effect', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {animationEffects.map(effect => (
                  <option key={effect} value={effect}>{effect}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Preview */}
        {showPreview && (
          <div className="mt-8 p-6 bg-white/5 border border-white/10 rounded-lg">
            <h4 className="text-sm font-medium text-gray-400 mb-4">Vorschau</h4>
            <div
              className="p-6 rounded-lg transition-all"
              style={{
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                fontFamily: theme.typography.fontFamily,
                fontSize: `${theme.typography.fontSize}px`,
                fontWeight: theme.typography.fontWeight,
                margin: `${theme.spacing.margin}px`,
                padding: `${theme.spacing.padding}px`,
                transitionDuration: `${theme.animation.speed}ms`,
                transitionTimingFunction: theme.animation.effect
              }}
            >
              <h3 style={{ color: theme.colors.primary }} className="text-2xl font-bold mb-2">
                Beispiel-Titel
              </h3>
              <p style={{ color: theme.colors.text }} className="mb-4">
                Dies ist ein Beispieltext, um das Theme zu testen.
              </p>
              <button
                style={{
                  backgroundColor: theme.colors.primary,
                  color: theme.colors.text
                }}
                className="px-4 py-2 rounded-lg"
              >
                Beispiel-Button
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-white/10 flex gap-3">
        <button
          onClick={handleSave}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold text-white hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2"
        >
          <Save size={20} />
          Theme speichern
        </button>
        <button
          onClick={handleReset}
          className="px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg transition-all flex items-center gap-2"
        >
          <RotateCcw size={20} />
          Zurücksetzen
        </button>
      </div>
    </div>
  );
}

export default ThemeEditor;
