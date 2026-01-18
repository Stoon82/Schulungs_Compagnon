import { useState, useEffect, useCallback } from 'react';
import { X, Plus, Trash2, Copy, Check, ChevronDown, Sparkles } from 'lucide-react';

/**
 * GradientModal - Comprehensive gradient editor modal
 * Features:
 * - Color pickers for each stop with position sliders
 * - Linear/radial gradient toggle
 * - Radial center position controls
 * - Copy/paste gradient code
 * - Gradient presets
 */
function GradientModal({ isOpen, onClose, value, onChange, title = "Verlauf bearbeiten" }) {
  // Parse existing gradient
  const parseGradient = useCallback((gradientStr) => {
    if (!gradientStr) {
      return {
        type: 'linear',
        angle: 135,
        radialX: 50,
        radialY: 50,
        stops: [
          { color: '#8b5cf6', position: 0 },
          { color: '#ec4899', position: 100 }
        ]
      };
    }

    const isRadial = gradientStr.includes('radial');
    const type = isRadial ? 'radial' : 'linear';

    // Extract angle for linear
    let angle = 135;
    const angleMatch = gradientStr.match(/(\d+)deg/);
    if (angleMatch) angle = parseInt(angleMatch[1]);

    // Extract radial position
    let radialX = 50, radialY = 50;
    const radialMatch = gradientStr.match(/at\s+(\d+)%?\s+(\d+)%?/);
    if (radialMatch) {
      radialX = parseInt(radialMatch[1]);
      radialY = parseInt(radialMatch[2]);
    }

    // Extract color stops
    const stops = [];
    const colorRegex = /(#[a-fA-F0-9]{6}|#[a-fA-F0-9]{3}|rgba?\([^)]+\)|hsl[a]?\([^)]+\))\s*(\d+)?%?/g;
    let match;
    let index = 0;
    while ((match = colorRegex.exec(gradientStr)) !== null) {
      const color = match[1];
      const position = match[2] ? parseInt(match[2]) : (index === 0 ? 0 : 100);
      stops.push({ color: color.startsWith('#') ? color : '#8b5cf6', position });
      index++;
    }

    if (stops.length < 2) {
      return {
        type: 'linear',
        angle: 135,
        radialX: 50,
        radialY: 50,
        stops: [
          { color: '#8b5cf6', position: 0 },
          { color: '#ec4899', position: 100 }
        ]
      };
    }

    return { type, angle, radialX, radialY, stops };
  }, []);

  const [gradientType, setGradientType] = useState('linear');
  const [angle, setAngle] = useState(135);
  const [radialX, setRadialX] = useState(50);
  const [radialY, setRadialY] = useState(50);
  const [stops, setStops] = useState([
    { color: '#8b5cf6', position: 0 },
    { color: '#ec4899', position: 100 }
  ]);
  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [codeInput, setCodeInput] = useState('');

  // Initialize from value when modal opens
  useEffect(() => {
    if (isOpen && value) {
      const parsed = parseGradient(value);
      setGradientType(parsed.type);
      setAngle(parsed.angle);
      setRadialX(parsed.radialX);
      setRadialY(parsed.radialY);
      setStops(parsed.stops);
    }
  }, [isOpen, value, parseGradient]);

  // Build gradient string
  const buildGradient = useCallback(() => {
    const stopsStr = [...stops]
      .sort((a, b) => a.position - b.position)
      .map(s => `${s.color} ${s.position}%`)
      .join(', ');
    
    if (gradientType === 'linear') {
      return `linear-gradient(${angle}deg, ${stopsStr})`;
    } else {
      return `radial-gradient(circle at ${radialX}% ${radialY}%, ${stopsStr})`;
    }
  }, [gradientType, angle, radialX, radialY, stops]);

  const currentGradient = buildGradient();

  // Update parent on every change
  useEffect(() => {
    if (isOpen) {
      onChange(currentGradient);
    }
  }, [currentGradient, isOpen, onChange]);

  const handleStopColorChange = (index, color) => {
    const newStops = [...stops];
    newStops[index] = { ...newStops[index], color };
    setStops(newStops);
  };

  const handleStopPositionChange = (index, position) => {
    const newStops = [...stops];
    newStops[index] = { ...newStops[index], position: parseInt(position) };
    setStops(newStops);
  };

  const addStop = () => {
    // Find middle position
    const positions = stops.map(s => s.position).sort((a, b) => a - b);
    let newPos = 50;
    if (positions.length >= 2) {
      newPos = Math.round((positions[0] + positions[positions.length - 1]) / 2);
    }
    setStops([...stops, { color: '#ffffff', position: newPos }]);
  };

  const removeStop = (index) => {
    if (stops.length > 2) {
      setStops(stops.filter((_, i) => i !== index));
    }
  };

  const copyGradient = () => {
    navigator.clipboard.writeText(currentGradient);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const applyCode = () => {
    if (codeInput.trim()) {
      const parsed = parseGradient(codeInput);
      setGradientType(parsed.type);
      setAngle(parsed.angle);
      setRadialX(parsed.radialX);
      setRadialY(parsed.radialY);
      setStops(parsed.stops);
      setCodeInput('');
      setShowCode(false);
    }
  };

  // Gradient presets
  const presets = [
    { name: 'Purple Dream', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { name: 'Ocean', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { name: 'Sunset', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
    { name: 'Forest', gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
    { name: 'Midnight', gradient: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0f172a 100%)' },
    { name: 'Rose', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { name: 'Gold', gradient: 'linear-gradient(135deg, #f5af19 0%, #f12711 100%)' },
    { name: 'Aurora', gradient: 'linear-gradient(135deg, #00c6fb 0%, #005bea 50%, #a855f7 100%)' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Sparkles size={20} className="text-purple-400" />
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Live Preview */}
          <div 
            className="h-24 rounded-xl border border-white/20 shadow-lg"
            style={{ background: currentGradient }}
          />

          {/* Type Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setGradientType('linear')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                gradientType === 'linear' 
                  ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30' 
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              Linear
            </button>
            <button
              onClick={() => setGradientType('radial')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                gradientType === 'radial' 
                  ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30' 
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              Radial
            </button>
          </div>

          {/* Angle (Linear) or Center (Radial) */}
          {gradientType === 'linear' ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-300">Winkel</label>
                <span className="text-sm text-purple-400 font-mono">{angle}°</span>
              </div>
              <input
                type="range"
                min={0}
                max={360}
                value={angle}
                onChange={(e) => setAngle(parseInt(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-300">Mitte X</label>
                  <span className="text-sm text-purple-400 font-mono">{radialX}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={radialX}
                  onChange={(e) => setRadialX(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-300">Mitte Y</label>
                  <span className="text-sm text-purple-400 font-mono">{radialY}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={radialY}
                  onChange={(e) => setRadialY(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>
            </div>
          )}

          {/* Color Stops */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-white">Farbstopps</label>
              <button 
                onClick={addStop}
                className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 px-2 py-1 bg-purple-500/10 rounded-lg hover:bg-purple-500/20 transition-colors"
              >
                <Plus size={14} /> Hinzufügen
              </button>
            </div>
            
            {stops.map((stop, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="relative">
                  <input
                    type="color"
                    value={stop.color}
                    onInput={(e) => handleStopColorChange(index, e.target.value)}
                    onChange={(e) => handleStopColorChange(index, e.target.value)}
                    className="w-12 h-12 rounded-lg border-2 border-white/20 cursor-pointer bg-transparent"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Position</span>
                    <span className="text-xs text-purple-400 font-mono">{stop.position}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={stop.position}
                    onChange={(e) => handleStopPositionChange(index, e.target.value)}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                </div>
                {stops.length > 2 && (
                  <button
                    onClick={() => removeStop(index)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Quick Presets */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Schnellvorlagen</label>
            <div className="grid grid-cols-4 gap-2">
              {presets.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => {
                    const parsed = parseGradient(preset.gradient);
                    setGradientType(parsed.type);
                    setAngle(parsed.angle);
                    setStops(parsed.stops);
                  }}
                  className="h-10 rounded-lg border border-white/10 hover:border-white/30 transition-all hover:scale-105"
                  style={{ background: preset.gradient }}
                  title={preset.name}
                />
              ))}
            </div>
          </div>

          {/* Code Section (Collapsible) */}
          <div className="border border-white/10 rounded-lg overflow-hidden">
            <button
              onClick={() => setShowCode(!showCode)}
              className="w-full px-4 py-3 bg-white/5 flex items-center justify-between hover:bg-white/10 transition-colors"
            >
              <span className="text-sm text-gray-300">Erweitert: Gradient-Code</span>
              <ChevronDown size={16} className={`text-gray-400 transition-transform ${showCode ? 'rotate-180' : ''}`} />
            </button>
            {showCode && (
              <div className="p-4 space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currentGradient}
                    readOnly
                    className="flex-1 px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-xs font-mono"
                  />
                  <button
                    onClick={copyGradient}
                    className="px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-colors"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value)}
                    placeholder="Gradient-Code einfügen..."
                    className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs font-mono placeholder-gray-500"
                  />
                  <button
                    onClick={applyCode}
                    disabled={!codeInput.trim()}
                    className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed text-purple-400 rounded-lg transition-colors text-sm"
                  >
                    Anwenden
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-colors"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
}

export default GradientModal;
