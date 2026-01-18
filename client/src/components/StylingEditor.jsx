import { useState } from 'react';
import { Palette, RotateCcw, ChevronDown, ChevronRight, Plus, X, Eye } from 'lucide-react';

/**
 * StylingEditor - Enhanced unified styling interface for classes, modules, and submodules
 * Provides comprehensive UI for theme customization with better border controls and visual feedback
 */
function StylingEditor({ styling = {}, onChange, label = "Styling" }) {
  const [expandedSections, setExpandedSections] = useState(['presets', 'colors']);
  const [gradientStops, setGradientStops] = useState([
    { color: '#8b5cf6', position: 0 },
    { color: '#ec4899', position: 100 }
  ]);
  const [gradientAngle, setGradientAngle] = useState(135);

  const handleChange = (field, value) => {
    onChange({
      ...styling,
      [field]: value
    });
  };

  const handleReset = () => {
    onChange({});
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const buildGradient = () => {
    const stopsStr = gradientStops.map(s => `${s.color} ${s.position}%`).join(', ');
    return `linear-gradient(${gradientAngle}deg, ${stopsStr})`;
  };

  const applyGradient = () => {
    handleChange('background', buildGradient());
  };

  const presets = [
    {
      name: 'Purple Dream',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      textColor: '#ffffff',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'rgba(255,255,255,0.2)',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
    {
      name: 'Pink Passion',
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      textColor: '#ffffff',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'rgba(255,255,255,0.2)',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
    {
      name: 'Ocean Blue',
      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      textColor: '#ffffff',
      borderWidth: '2px',
      borderStyle: 'solid',
      borderColor: 'rgba(79,172,254,0.5)',
      borderRadius: '12px',
      boxShadow: '0 0 20px rgba(79,172,254,0.3)'
    },
    {
      name: 'Sunset',
      background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      textColor: '#ffffff',
      borderWidth: '2px',
      borderStyle: 'solid',
      borderColor: 'rgba(250,112,154,0.5)',
      borderRadius: '16px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
    {
      name: 'Mint Fresh',
      background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      textColor: '#1f2937',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'rgba(168,237,234,0.5)',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
    {
      name: 'Deep Ocean',
      background: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      textColor: '#ffffff',
      borderWidth: '2px',
      borderStyle: 'solid',
      borderColor: 'rgba(48,207,208,0.4)',
      borderRadius: '12px',
      boxShadow: '0 0 30px rgba(48,207,208,0.2)'
    },
    {
      name: 'Emerald',
      background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
      textColor: '#ffffff',
      borderWidth: '2px',
      borderStyle: 'solid',
      borderColor: 'rgba(56,239,125,0.4)',
      borderRadius: '16px',
      boxShadow: '0 0 20px rgba(56,239,125,0.2)'
    },
    {
      name: 'Dark Accent',
      background: 'rgba(15, 23, 42, 0.9)',
      textColor: '#ffffff',
      borderWidth: '2px',
      borderStyle: 'solid',
      borderColor: '#8b5cf6',
      borderRadius: '12px',
      boxShadow: '0 0 20px rgba(139,92,246,0.3)'
    }
  ];

  // Section component
  const Section = ({ id, title, children }) => {
    const isExpanded = expandedSections.includes(id);
    return (
      <div className="border border-white/10 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection(id)}
          className="w-full px-4 py-3 bg-white/5 flex items-center justify-between hover:bg-white/10 transition-colors"
        >
          <span className="text-sm font-medium text-white">{title}</span>
          {isExpanded ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
        </button>
        {isExpanded && (
          <div className="p-4 space-y-4 bg-black/20">
            {children}
          </div>
        )}
      </div>
    );
  };

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

      <div className="space-y-3">
        {/* Presets Section */}
        <Section id="presets" title="Schnellauswahl">
          <div className="grid grid-cols-4 gap-2">
            {presets.map((preset, index) => (
              <button
                key={index}
                type="button"
                onClick={() => onChange(preset)}
                className="group relative px-3 py-4 rounded-lg text-xs font-medium transition-all hover:scale-105"
                style={{
                  background: preset.background,
                  color: preset.textColor,
                  border: `${preset.borderWidth} ${preset.borderStyle} ${preset.borderColor}`,
                  borderRadius: preset.borderRadius,
                  boxShadow: preset.boxShadow
                }}
              >
                <span className="relative z-10 drop-shadow-md">{preset.name}</span>
              </button>
            ))}
          </div>
        </Section>

        {/* Colors Section */}
        <Section id="colors" title="Farben">
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
                className="w-12 h-10 rounded-lg border-2 border-white/20 cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={styling.background || ''}
                onChange={(e) => handleChange('background', e.target.value)}
                placeholder="Farbe oder Gradient"
                className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-mono placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Gradient Builder */}
          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-400">Verlauf erstellen</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Winkel:</span>
                <input
                  type="number"
                  value={gradientAngle}
                  onChange={(e) => setGradientAngle(parseInt(e.target.value) || 0)}
                  className="w-16 px-2 py-1 bg-white/5 border border-white/10 rounded text-white text-xs"
                  min="0"
                  max="360"
                />
              </div>
            </div>
            <div className="space-y-2 mb-3">
              {gradientStops.map((stop, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="color"
                    value={stop.color}
                    onChange={(e) => {
                      const newStops = [...gradientStops];
                      newStops[index].color = e.target.value;
                      setGradientStops(newStops);
                    }}
                    className="w-8 h-8 rounded border border-white/20 cursor-pointer"
                  />
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={stop.position}
                    onChange={(e) => {
                      const newStops = [...gradientStops];
                      newStops[index].position = parseInt(e.target.value);
                      setGradientStops(newStops);
                    }}
                    className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                  <span className="text-xs text-gray-400 w-8">{stop.position}%</span>
                  {gradientStops.length > 2 && (
                    <button
                      type="button"
                      onClick={() => setGradientStops(gradientStops.filter((_, i) => i !== index))}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setGradientStops([...gradientStops, { color: '#ffffff', position: 50 }])}
                className="flex-1 py-1 text-xs bg-white/10 hover:bg-white/20 text-gray-300 rounded flex items-center justify-center gap-1"
              >
                <Plus size={12} /> Farbstopp
              </button>
              <button
                type="button"
                onClick={applyGradient}
                className="flex-1 py-1 text-xs bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded"
              >
                Anwenden
              </button>
            </div>
            {/* Gradient Preview */}
            <div 
              className="h-6 mt-2 rounded border border-white/20"
              style={{ background: buildGradient() }}
            />
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
                className="w-12 h-10 rounded-lg border-2 border-white/20 cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={styling.textColor || ''}
                onChange={(e) => handleChange('textColor', e.target.value)}
                placeholder="#ffffff"
                className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-mono placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </Section>

        {/* Borders Section */}
        <Section id="borders" title="Rahmen">
          <div className="grid grid-cols-3 gap-3">
            {/* Border Width */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Breite</label>
              <select
                value={styling.borderWidth || '1px'}
                onChange={(e) => handleChange('borderWidth', e.target.value)}
                className="w-full px-2 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="0px">Keine</option>
                <option value="1px">1px</option>
                <option value="2px">2px</option>
                <option value="3px">3px</option>
                <option value="4px">4px</option>
              </select>
            </div>

            {/* Border Style */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Stil</label>
              <select
                value={styling.borderStyle || 'solid'}
                onChange={(e) => handleChange('borderStyle', e.target.value)}
                className="w-full px-2 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="solid">Durchgehend</option>
                <option value="dashed">Gestrichelt</option>
                <option value="dotted">Gepunktet</option>
                <option value="double">Doppelt</option>
              </select>
            </div>

            {/* Border Color */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Farbe</label>
              <div className="flex gap-1">
                <input
                  type="color"
                  value={styling.borderColor?.startsWith('#') ? styling.borderColor : '#8b5cf6'}
                  onChange={(e) => handleChange('borderColor', e.target.value)}
                  className="w-10 h-9 rounded border border-white/20 cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={styling.borderColor || ''}
                  onChange={(e) => handleChange('borderColor', e.target.value)}
                  placeholder="rgba(...)"
                  className="flex-1 px-2 py-1 bg-white/5 border border-white/10 rounded text-white text-xs font-mono placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Border Radius */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Eckenradius: <span className="text-purple-400 font-mono">{styling.borderRadius || '12px'}</span>
            </label>
            <input
              type="range"
              min={0}
              max={32}
              value={parseInt(styling.borderRadius) || 12}
              onChange={(e) => handleChange('borderRadius', `${e.target.value}px`)}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0px</span>
              <span>32px</span>
            </div>
          </div>

          {/* Quick Border Presets */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Subtle', borderWidth: '1px', borderColor: 'rgba(255,255,255,0.1)' },
              { label: 'Medium', borderWidth: '2px', borderColor: 'rgba(255,255,255,0.2)' },
              { label: 'Accent', borderWidth: '2px', borderColor: '#8b5cf6' },
              { label: 'Glow', borderWidth: '2px', borderColor: 'rgba(139,92,246,0.5)' },
            ].map((preset, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  handleChange('borderWidth', preset.borderWidth);
                  handleChange('borderColor', preset.borderColor);
                  handleChange('borderStyle', 'solid');
                }}
                className="py-2 text-xs bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                style={{ 
                  border: `${preset.borderWidth} solid ${preset.borderColor}`,
                  color: '#9ca3af'
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </Section>

        {/* Shadow Section */}
        <Section id="shadow" title="Schatten">
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Kein', value: 'none' },
              { label: 'Klein', value: '0 1px 3px rgba(0,0,0,0.12)' },
              { label: 'Mittel', value: '0 4px 6px rgba(0,0,0,0.1)' },
              { label: 'Groß', value: '0 10px 25px rgba(0,0,0,0.15)' },
              { label: 'XL', value: '0 20px 40px rgba(0,0,0,0.2)' },
              { label: 'Glow Violett', value: '0 0 20px rgba(139,92,246,0.4)' },
              { label: 'Glow Pink', value: '0 0 20px rgba(236,72,153,0.4)' },
              { label: 'Glow Cyan', value: '0 0 20px rgba(6,182,212,0.4)' },
            ].map((shadow, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleChange('boxShadow', shadow.value)}
                className={`py-2 px-3 text-xs rounded-lg transition-all ${
                  styling.boxShadow === shadow.value 
                    ? 'bg-purple-500/30 text-purple-300 ring-1 ring-purple-500' 
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {shadow.label}
              </button>
            ))}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Benutzerdefiniert</label>
            <input
              type="text"
              value={styling.boxShadow || ''}
              onChange={(e) => handleChange('boxShadow', e.target.value)}
              placeholder="0 4px 6px rgba(0,0,0,0.1)"
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs font-mono placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
        </Section>

        {/* Advanced Section */}
        <Section id="advanced" title="Erweitert">
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
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          {/* Backdrop Blur */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Backdrop Blur: <span className="text-purple-400 font-mono">{styling.backdropBlur || '0px'}</span>
            </label>
            <input
              type="range"
              min={0}
              max={24}
              value={parseInt(styling.backdropBlur) || 0}
              onChange={(e) => handleChange('backdropBlur', `${e.target.value}px`)}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
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
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs font-mono placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 min-h-[80px]"
            />
          </div>
        </Section>

        {/* Live Preview */}
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <Eye size={16} className="text-purple-400" />
            <span className="text-sm font-medium text-white">Vorschau</span>
          </div>
          <div 
            className="p-4 transition-all duration-300"
            style={{
              background: styling.background || 'rgba(255,255,255,0.05)',
              color: styling.textColor || '#ffffff',
              border: styling.borderWidth && styling.borderColor 
                ? `${styling.borderWidth} ${styling.borderStyle || 'solid'} ${styling.borderColor}`
                : styling.border || '1px solid rgba(255,255,255,0.1)',
              borderRadius: styling.borderRadius || '12px',
              boxShadow: styling.boxShadow || 'none',
              backdropFilter: styling.backdropBlur ? `blur(${styling.backdropBlur})` : undefined,
            }}
          >
            <h4 className="font-semibold mb-1">Beispiel-Inhalt</h4>
            <p className="text-sm opacity-80">So wird Ihr gestylter Inhalt aussehen.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StylingEditor;
