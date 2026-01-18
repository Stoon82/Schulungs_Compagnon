import { useState } from 'react';
import { Palette, RotateCcw } from 'lucide-react';

/**
 * StylingEditor - Unified styling interface for classes, modules, and submodules
 * Provides consistent UI for theme customization across the application
 */
function StylingEditor({ styling = {}, onChange, label = "Styling" }) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleChange = (field, value) => {
    onChange({
      ...styling,
      [field]: value
    });
  };

  const handleReset = () => {
    onChange({});
  };

  const presets = [
    {
      name: 'Purple Dream',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      textColor: '#ffffff',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
    {
      name: 'Pink Passion',
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      textColor: '#ffffff',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
    {
      name: 'Ocean Blue',
      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      textColor: '#ffffff',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
    {
      name: 'Sunset',
      background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      textColor: '#ffffff',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
    {
      name: 'Mint Fresh',
      background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      textColor: '#1f2937',
      border: '1px solid rgba(255,255,255,0.3)',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
    {
      name: 'Deep Ocean',
      background: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      textColor: '#ffffff',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
    {
      name: 'Peach',
      background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      textColor: '#1f2937',
      border: '1px solid rgba(255,255,255,0.3)',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
    {
      name: 'Dark Mode',
      background: '#1f2937',
      textColor: '#ffffff',
      border: '2px solid #8b5cf6',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }
  ];

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Palette size={20} className="text-purple-400" />
          <h3 className="text-lg font-semibold text-white">{label}</h3>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="text-xs text-gray-400 hover:text-gray-300 flex items-center gap-1"
        >
          <RotateCcw size={14} />
          Zurücksetzen
        </button>
      </div>

      {/* Presets */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Schnellauswahl
        </label>
        <div className="grid grid-cols-4 gap-2">
          {presets.map((preset, index) => (
            <button
              key={index}
              type="button"
              onClick={() => onChange(preset)}
              className="group relative px-3 py-4 rounded-lg text-white text-xs font-medium transition-all hover:scale-105"
              style={{
                background: preset.background,
                color: preset.textColor
              }}
            >
              <span className="relative z-10">{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Basic Options */}
      <div className="space-y-4">
        {/* Background */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Hintergrund
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={styling.background?.startsWith('#') ? styling.background : '#667eea'}
              onChange={(e) => handleChange('background', e.target.value)}
              className="w-12 h-10 rounded border-2 border-white/20 cursor-pointer"
            />
            <input
              type="text"
              value={styling.background || ''}
              onChange={(e) => handleChange('background', e.target.value)}
              placeholder="Farbe oder Gradient (z.B. linear-gradient(...))"
              className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Hex-Code, RGB oder CSS-Gradient
          </p>
        </div>

        {/* Text Color */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Textfarbe
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={styling.textColor || '#ffffff'}
              onChange={(e) => handleChange('textColor', e.target.value)}
              className="w-12 h-10 rounded border-2 border-white/20 cursor-pointer"
            />
            <input
              type="text"
              value={styling.textColor || ''}
              onChange={(e) => handleChange('textColor', e.target.value)}
              placeholder="#ffffff"
              className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm font-mono placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Border Radius */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Eckenradius
          </label>
          <select
            value={styling.borderRadius || '12px'}
            onChange={(e) => handleChange('borderRadius', e.target.value)}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="0px">Keine (0px)</option>
            <option value="4px">Klein (4px)</option>
            <option value="8px">Mittel (8px)</option>
            <option value="12px">Groß (12px)</option>
            <option value="16px">Extra Groß (16px)</option>
            <option value="24px">Rund (24px)</option>
          </select>
        </div>

        {/* Box Shadow */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Schatten
          </label>
          <select
            value={styling.boxShadow || '0 4px 6px rgba(0,0,0,0.1)'}
            onChange={(e) => handleChange('boxShadow', e.target.value)}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="none">Kein Schatten</option>
            <option value="0 1px 3px rgba(0,0,0,0.12)">Klein</option>
            <option value="0 4px 6px rgba(0,0,0,0.1)">Mittel</option>
            <option value="0 10px 25px rgba(0,0,0,0.15)">Groß</option>
            <option value="0 20px 40px rgba(0,0,0,0.2)">Extra Groß</option>
          </select>
        </div>

        {/* Border */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Rahmen
          </label>
          <input
            type="text"
            value={styling.border || ''}
            onChange={(e) => handleChange('border', e.target.value)}
            placeholder="z.B. 2px solid #8b5cf6"
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Advanced Options */}
      <details className="mt-4 bg-white/5 rounded-lg border border-white/10">
        <summary className="px-3 py-2 cursor-pointer text-sm font-medium text-gray-400 hover:text-gray-300">
          Erweiterte Optionen
        </summary>
        <div className="p-3 space-y-3 border-t border-white/10">
          {/* Background Image */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Hintergrundbild URL
            </label>
            <input
              type="text"
              value={styling.backgroundImage || ''}
              onChange={(e) => handleChange('backgroundImage', e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-xs placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          {/* Custom CSS */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Custom CSS
            </label>
            <textarea
              value={styling.customCSS || ''}
              onChange={(e) => handleChange('customCSS', e.target.value)}
              placeholder="padding: 20px;&#10;border-radius: 12px;"
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-xs font-mono placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 min-h-[80px]"
            />
          </div>
        </div>
      </details>
    </div>
  );
}

export default StylingEditor;
