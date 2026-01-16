import { useState } from 'react';
import { Palette, Type, Layout, Save, X, RotateCcw } from 'lucide-react';

function DesignEditor({ onClose }) {
  const [theme, setTheme] = useState({
    primaryColor: '#00fff2',
    secondaryColor: '#ff00ff',
    accentColor: '#ffff00',
    backgroundColor: '#0a0e1a',
    textColor: '#ffffff',
    fontFamily: 'Inter',
    fontSize: 'medium',
    borderRadius: 'rounded',
    layout: 'default'
  });

  const [previewMode, setPreviewMode] = useState(false);

  const colorPresets = [
    { name: 'Cyber Neon', primary: '#00fff2', secondary: '#ff00ff', accent: '#ffff00' },
    { name: 'Ocean Blue', primary: '#0ea5e9', secondary: '#3b82f6', accent: '#06b6d4' },
    { name: 'Forest Green', primary: '#10b981', secondary: '#059669', accent: '#34d399' },
    { name: 'Sunset Orange', primary: '#f97316', secondary: '#ea580c', accent: '#fb923c' },
    { name: 'Purple Dream', primary: '#a855f7', secondary: '#9333ea', accent: '#c084fc' },
    { name: 'Rose Gold', primary: '#f43f5e', secondary: '#e11d48', accent: '#fb7185' }
  ];

  const fontOptions = [
    { name: 'Inter', value: 'Inter, sans-serif' },
    { name: 'Roboto', value: 'Roboto, sans-serif' },
    { name: 'Poppins', value: 'Poppins, sans-serif' },
    { name: 'Montserrat', value: 'Montserrat, sans-serif' },
    { name: 'JetBrains Mono', value: 'JetBrains Mono, monospace' }
  ];

  const fontSizes = [
    { name: 'Klein', value: 'small' },
    { name: 'Mittel', value: 'medium' },
    { name: 'Groß', value: 'large' }
  ];

  const borderRadiusOptions = [
    { name: 'Eckig', value: 'square' },
    { name: 'Abgerundet', value: 'rounded' },
    { name: 'Sehr rund', value: 'pill' }
  ];

  const handleColorChange = (key, value) => {
    setTheme({ ...theme, [key]: value });
  };

  const applyPreset = (preset) => {
    setTheme({
      ...theme,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      accentColor: preset.accent
    });
  };

  const handleSave = () => {
    localStorage.setItem('compagnon_theme', JSON.stringify(theme));
    alert('Design gespeichert! Seite wird neu geladen...');
    window.location.reload();
  };

  const handleReset = () => {
    if (confirm('Möchten Sie wirklich alle Designeinstellungen zurücksetzen?')) {
      localStorage.removeItem('compagnon_theme');
      window.location.reload();
    }
  };

  const getPreviewStyle = () => ({
    '--primary-color': theme.primaryColor,
    '--secondary-color': theme.secondaryColor,
    '--accent-color': theme.accentColor,
    '--bg-color': theme.backgroundColor,
    '--text-color': theme.textColor,
    fontFamily: theme.fontFamily,
    fontSize: theme.fontSize === 'small' ? '14px' : theme.fontSize === 'large' ? '18px' : '16px'
  });

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 z-50 overflow-hidden">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-lg border-b border-white/10 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full flex items-center justify-center">
              <Palette size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Design Editor</h1>
              <p className="text-sm text-gray-400">Passe das Aussehen der App an</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-all"
            >
              {previewMode ? 'Editor' : 'Vorschau'}
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg transition-all flex items-center gap-2"
            >
              <RotateCcw size={18} />
              <span>Zurücksetzen</span>
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-all flex items-center gap-2"
            >
              <Save size={18} />
              <span>Speichern</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all flex items-center gap-2"
            >
              <X size={18} />
              <span>Schließen</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left: Controls */}
        {!previewMode && (
          <div className="w-96 bg-black/20 border-r border-white/10 p-6 overflow-y-auto">
            {/* Color Presets */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Palette size={20} />
                Farbschema
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset)}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all"
                  >
                    <div className="flex gap-2 mb-2">
                      <div className="w-6 h-6 rounded" style={{ backgroundColor: preset.primary }}></div>
                      <div className="w-6 h-6 rounded" style={{ backgroundColor: preset.secondary }}></div>
                      <div className="w-6 h-6 rounded" style={{ backgroundColor: preset.accent }}></div>
                    </div>
                    <div className="text-xs text-white font-medium">{preset.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Colors */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Eigene Farben</h3>
              <div className="space-y-3">
                {[
                  { key: 'primaryColor', label: 'Primärfarbe' },
                  { key: 'secondaryColor', label: 'Sekundärfarbe' },
                  { key: 'accentColor', label: 'Akzentfarbe' },
                  { key: 'backgroundColor', label: 'Hintergrund' },
                  { key: 'textColor', label: 'Textfarbe' }
                ].map((color) => (
                  <div key={color.key} className="flex items-center justify-between">
                    <label className="text-sm text-gray-400">{color.label}</label>
                    <input
                      type="color"
                      value={theme[color.key]}
                      onChange={(e) => handleColorChange(color.key, e.target.value)}
                      className="w-16 h-8 rounded cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Typography */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Type size={20} />
                Typografie
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Schriftart</label>
                  <select
                    value={theme.fontFamily}
                    onChange={(e) => setTheme({ ...theme, fontFamily: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {fontOptions.map((font) => (
                      <option key={font.name} value={font.value}>{font.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Schriftgröße</label>
                  <div className="grid grid-cols-3 gap-2">
                    {fontSizes.map((size) => (
                      <button
                        key={size.value}
                        onClick={() => setTheme({ ...theme, fontSize: size.value })}
                        className={`px-3 py-2 rounded-lg transition-all ${
                          theme.fontSize === size.value
                            ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50'
                            : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {size.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Layout */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Layout size={20} />
                Layout
              </h3>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Eckenradius</label>
                <div className="grid grid-cols-3 gap-2">
                  {borderRadiusOptions.map((radius) => (
                    <button
                      key={radius.value}
                      onClick={() => setTheme({ ...theme, borderRadius: radius.value })}
                      className={`px-3 py-2 transition-all ${
                        theme.borderRadius === radius.value
                          ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50'
                          : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                      } ${
                        radius.value === 'square' ? 'rounded-none' :
                        radius.value === 'rounded' ? 'rounded-lg' : 'rounded-full'
                      }`}
                    >
                      {radius.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Right: Preview */}
        <div className="flex-1 p-6 overflow-y-auto" style={getPreviewStyle()}>
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-8 mb-6">
              <h2 className="text-3xl font-bold mb-4" style={{ color: theme.primaryColor }}>
                Vorschau
              </h2>
              <p className="text-lg mb-6" style={{ color: theme.textColor }}>
                So wird deine App aussehen mit den aktuellen Einstellungen.
              </p>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-lg" style={{ backgroundColor: theme.primaryColor + '20', borderColor: theme.primaryColor + '50', borderWidth: '1px' }}>
                  <div className="text-sm font-medium" style={{ color: theme.primaryColor }}>Primär</div>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: theme.secondaryColor + '20', borderColor: theme.secondaryColor + '50', borderWidth: '1px' }}>
                  <div className="text-sm font-medium" style={{ color: theme.secondaryColor }}>Sekundär</div>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: theme.accentColor + '20', borderColor: theme.accentColor + '50', borderWidth: '1px' }}>
                  <div className="text-sm font-medium" style={{ color: theme.accentColor }}>Akzent</div>
                </div>
              </div>

              <button
                className="px-6 py-3 rounded-lg font-semibold text-white transition-all"
                style={{
                  background: `linear-gradient(to right, ${theme.primaryColor}, ${theme.secondaryColor})`,
                  borderRadius: theme.borderRadius === 'square' ? '0' : theme.borderRadius === 'pill' ? '9999px' : '0.5rem'
                }}
              >
                Beispiel Button
              </button>
            </div>

            <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-8">
              <h3 className="text-xl font-semibold mb-4" style={{ color: theme.textColor }}>
                Typografie Beispiel
              </h3>
              <p className="mb-4" style={{ color: theme.textColor, opacity: 0.9 }}>
                Dies ist ein Beispieltext in der gewählten Schriftart und -größe.
                Die Schriftart ist {theme.fontFamily.split(',')[0]} und die Größe ist {theme.fontSize}.
              </p>
              <p className="text-sm" style={{ color: theme.textColor, opacity: 0.7 }}>
                Kleinerer Text für Beschreibungen und Hinweise.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DesignEditor;
