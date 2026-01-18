import { useState, useCallback } from 'react';
import { 
  Palette, RotateCcw, Save, Undo2, Download, Upload, Eye, EyeOff,
  Sun, Moon, Sparkles, Layers, Type, Square, Circle, 
  ChevronDown, ChevronRight, Plus, Trash2, Copy, Check, X,
  Sliders, Paintbrush, BoxSelect, MousePointer2, Wifi, WifiOff, LayoutGrid,
  MousePointer, FormInput, Maximize, Edit3
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { defaultTheme } from '../utils/themeSchema';
import GradientModal from './GradientModal';

function ThemeDesigner({ onClose }) {
  const { 
    theme, 
    updateTheme, 
    updateColor,
    updateCards,
    resetTheme, 
    undoThemeChange, 
    canUndo,
    saveTheme,
    loadTheme,
    deleteTheme,
    savedThemes,
    setAsGlobalTheme,
    isConnected 
  } = useTheme();

  const [activeTab, setActiveTab] = useState('colors');
  const [expandedSections, setExpandedSections] = useState(['primary', 'backgrounds']);
  const [showPreview, setShowPreview] = useState(true);
  const [saveName, setSaveName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [copiedColor, setCopiedColor] = useState(null);
  
  // Gradient modal state
  const [gradientModal, setGradientModal] = useState({
    isOpen: false,
    value: '',
    onChange: () => {},
    title: ''
  });

  const openGradientModal = (value, onChange, title = 'Verlauf bearbeiten') => {
    setGradientModal({ isOpen: true, value, onChange, title });
  };

  const closeGradientModal = () => {
    setGradientModal(prev => ({ ...prev, isOpen: false }));
  };

  const tabs = [
    { id: 'colors', label: 'Farben', icon: Palette },
    { id: 'cards', label: 'Karten', icon: Square },
    { id: 'components', label: 'Elemente', icon: MousePointer },
    { id: 'borders', label: 'Rahmen', icon: BoxSelect },
    { id: 'typography', label: 'Typografie', icon: Type },
    { id: 'effects', label: 'Effekte', icon: Sparkles },
    { id: 'pages', label: 'Seiten', icon: LayoutGrid },
    { id: 'presets', label: 'Vorlagen', icon: Layers },
  ];

  const toggleSection = (section) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const copyColor = (color) => {
    navigator.clipboard.writeText(color);
    setCopiedColor(color);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const handleSaveTheme = async () => {
    if (!saveName.trim()) return;
    const result = await saveTheme(saveName);
    if (result.success) {
      setShowSaveDialog(false);
      setSaveName('');
    }
  };

  const handleSetGlobal = async () => {
    const result = await setAsGlobalTheme();
    if (result.success) {
      alert('Theme als globales Theme gesetzt!');
    }
  };

  // Color input with picker and text - uses onInput for real-time updates
  const ColorInput = ({ label, value, onChange, description }) => (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-sm text-gray-300">{label}</label>
        <button 
          onClick={() => copyColor(value)}
          className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1"
        >
          {copiedColor === value ? <Check size={12} /> : <Copy size={12} />}
        </button>
      </div>
      <div className="flex gap-2">
        <input
          type="color"
          value={value?.startsWith('#') ? value : '#8b5cf6'}
          onInput={(e) => onChange(e.target.value)}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-10 rounded-lg border-2 border-white/20 cursor-pointer bg-transparent"
        />
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000 oder rgba(...)"
          className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-mono placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>
      {description && <p className="text-xs text-gray-500">{description}</p>}
    </div>
  );

  // Slider input
  const SliderInput = ({ label, value, onChange, min = 0, max = 100, unit = 'px', step = 1 }) => {
    const numValue = parseFloat(value) || 0;
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-300">{label}</label>
          <span className="text-sm text-purple-400 font-mono">{numValue}{unit}</span>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={numValue}
          onChange={(e) => onChange(`${e.target.value}${unit}`)}
          className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
        />
      </div>
    );
  };

  // Select input
  const SelectInput = ({ label, value, onChange, options }) => (
    <div className="space-y-2">
      <label className="text-sm text-gray-300">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );

  // Simple gradient picker that opens the modal
  const GradientPicker = ({ label, value, onChange, title }) => (
    <div className="space-y-2">
      {label && <label className="text-sm text-gray-300">{label}</label>}
      <button
        onClick={() => openGradientModal(value, onChange, title || label || 'Verlauf bearbeiten')}
        className="w-full group relative overflow-hidden rounded-xl border border-white/10 hover:border-purple-500/50 transition-all"
      >
        <div 
          className="h-16 w-full"
          style={{ background: value || 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)' }}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 text-white text-sm font-medium">
            <Edit3 size={16} /> Bearbeiten
          </span>
        </div>
      </button>
    </div>
  );

  // Collapsible section
  const Section = ({ id, title, children, icon: Icon }) => {
    const isExpanded = expandedSections.includes(id);
    return (
      <div className="border border-white/10 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection(id)}
          className="w-full px-4 py-3 bg-white/5 flex items-center justify-between hover:bg-white/10 transition-colors"
        >
          <div className="flex items-center gap-2">
            {Icon && <Icon size={16} className="text-purple-400" />}
            <span className="text-sm font-medium text-white">{title}</span>
          </div>
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

  // Render Colors Tab
  const renderColorsTab = () => (
    <div className="space-y-4">
      <Section id="primary" title="Primärfarben" icon={Palette}>
        <ColorInput 
          label="Primär" 
          value={theme.colors?.primary}
          onChange={(v) => updateColor('primary', v)}
          description="Hauptakzentfarbe für Buttons und Links"
        />
        <ColorInput 
          label="Sekundär" 
          value={theme.colors?.secondary}
          onChange={(v) => updateColor('secondary', v)}
        />
        <ColorInput 
          label="Akzent" 
          value={theme.colors?.accent}
          onChange={(v) => updateColor('accent', v)}
        />
      </Section>

      <Section id="backgrounds" title="Hintergründe" icon={Layers}>
        <GradientPicker
          label="App-Hintergrund"
          value={theme.colors?.appBackgroundGradient || theme.colors?.appBackground || 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)'}
          onChange={(v) => {
            updateColor('appBackgroundGradient', v);
            // Also set solid color if it's a simple color
            if (v && !v.includes('gradient')) {
              updateColor('appBackground', v);
            }
          }}
          title="App-Hintergrund"
        />
        <GradientPicker
          label="Karten-Hintergrund"
          value={theme.colors?.cardBackground || 'rgba(255, 255, 255, 0.05)'}
          onChange={(v) => updateColor('cardBackground', v)}
          title="Karten-Hintergrund"
        />
        <GradientPicker
          label="Input-Hintergrund"
          value={theme.colors?.inputBackground || 'rgba(255, 255, 255, 0.05)'}
          onChange={(v) => updateColor('inputBackground', v)}
          title="Input-Hintergrund"
        />
      </Section>

      <Section id="text" title="Textfarben" icon={Type}>
        <ColorInput 
          label="Primärer Text" 
          value={theme.colors?.textPrimary}
          onChange={(v) => updateColor('textPrimary', v)}
        />
        <ColorInput 
          label="Sekundärer Text" 
          value={theme.colors?.textSecondary}
          onChange={(v) => updateColor('textSecondary', v)}
        />
        <ColorInput 
          label="Gedämpfter Text" 
          value={theme.colors?.textMuted}
          onChange={(v) => updateColor('textMuted', v)}
        />
      </Section>

      <Section id="borders" title="Rahmenfarben" icon={Square}>
        <ColorInput 
          label="Standard-Rahmen" 
          value={theme.colors?.borderDefault}
          onChange={(v) => updateColor('borderDefault', v)}
        />
        <ColorInput 
          label="Hover-Rahmen" 
          value={theme.colors?.borderHover}
          onChange={(v) => updateColor('borderHover', v)}
        />
        <ColorInput 
          label="Fokus-Rahmen" 
          value={theme.colors?.borderFocus}
          onChange={(v) => updateColor('borderFocus', v)}
        />
        <ColorInput 
          label="Akzent-Rahmen" 
          value={theme.colors?.borderAccent}
          onChange={(v) => updateColor('borderAccent', v)}
        />
      </Section>

      <Section id="status" title="Statusfarben" icon={Circle}>
        <ColorInput 
          label="Erfolg" 
          value={theme.colors?.success}
          onChange={(v) => updateColor('success', v)}
        />
        <ColorInput 
          label="Warnung" 
          value={theme.colors?.warning}
          onChange={(v) => updateColor('warning', v)}
        />
        <ColorInput 
          label="Fehler" 
          value={theme.colors?.error}
          onChange={(v) => updateColor('error', v)}
        />
        <ColorInput 
          label="Info" 
          value={theme.colors?.info}
          onChange={(v) => updateColor('info', v)}
        />
      </Section>
    </div>
  );

  // Render Cards Tab
  const renderCardsTab = () => (
    <div className="space-y-4">
      <Section id="card-appearance" title="Karten-Erscheinung" icon={Square}>
        <GradientPicker
          label="Hintergrund"
          value={theme.cards?.background || 'rgba(255, 255, 255, 0.05)'}
          onChange={(v) => updateCards({ background: v })}
          title="Karten-Hintergrund"
        />
        <GradientPicker
          label="Hintergrund (Hover)"
          value={theme.cards?.backgroundHover || 'rgba(255, 255, 255, 0.08)'}
          onChange={(v) => updateCards({ backgroundHover: v })}
          title="Karten-Hintergrund (Hover)"
        />
        <SliderInput
          label="Innenabstand"
          value={parseFloat(theme.cards?.padding) || 24}
          onChange={(v) => updateCards({ padding: v })}
          min={8}
          max={48}
          unit="px"
        />
      </Section>

      <Section id="card-border" title="Karten-Rahmen" icon={BoxSelect}>
        <SelectInput
          label="Rahmenbreite"
          value={theme.cards?.borderWidth || '1px'}
          onChange={(v) => updateCards({ borderWidth: v })}
          options={[
            { value: '0px', label: 'Kein Rahmen' },
            { value: '1px', label: 'Dünn (1px)' },
            { value: '2px', label: 'Normal (2px)' },
            { value: '3px', label: 'Dick (3px)' },
            { value: '4px', label: 'Extra Dick (4px)' },
          ]}
        />
        <ColorInput 
          label="Rahmenfarbe" 
          value={theme.cards?.borderColor}
          onChange={(v) => updateCards({ borderColor: v })}
        />
        <ColorInput 
          label="Rahmenfarbe (Hover)" 
          value={theme.cards?.borderColorHover}
          onChange={(v) => updateCards({ borderColorHover: v })}
        />
        <SliderInput
          label="Eckenradius"
          value={parseFloat(theme.cards?.borderRadius) || 12}
          onChange={(v) => updateCards({ borderRadius: v })}
          min={0}
          max={32}
          unit="px"
        />
      </Section>

      <Section id="card-shadow" title="Karten-Schatten" icon={Layers}>
        <SelectInput
          label="Schatten"
          value={theme.cards?.shadow || 'none'}
          onChange={(v) => updateCards({ shadow: v })}
          options={[
            { value: 'none', label: 'Kein Schatten' },
            { value: '0 1px 2px rgba(0, 0, 0, 0.05)', label: 'Klein' },
            { value: '0 4px 6px rgba(0, 0, 0, 0.1)', label: 'Mittel' },
            { value: '0 10px 15px rgba(0, 0, 0, 0.15)', label: 'Groß' },
            { value: '0 20px 25px rgba(0, 0, 0, 0.2)', label: 'Extra Groß' },
            { value: '0 0 20px rgba(139, 92, 246, 0.3)', label: 'Glow (Violett)' },
            { value: '0 0 20px rgba(236, 72, 153, 0.3)', label: 'Glow (Pink)' },
          ]}
        />
        <div className="space-y-2">
          <label className="text-sm text-gray-300">Benutzerdefinierter Schatten</label>
          <input
            type="text"
            value={theme.cards?.shadow || ''}
            onChange={(e) => updateCards({ shadow: e.target.value })}
            placeholder="0 4px 6px rgba(0, 0, 0, 0.1)"
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-mono placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <SliderInput
          label="Backdrop Blur"
          value={parseFloat(theme.cards?.backdropBlur) || 12}
          onChange={(v) => updateCards({ backdropBlur: v })}
          min={0}
          max={24}
          unit="px"
        />
      </Section>

      {/* Live Card Preview */}
      <div className="p-4 bg-white/5 rounded-lg border border-white/10">
        <span className="text-sm font-medium text-white mb-3 block">Vorschau</span>
        <div 
          className="p-6 transition-all duration-300"
          style={{
            background: theme.cards?.background,
            border: `${theme.cards?.borderWidth} solid ${theme.cards?.borderColor}`,
            borderRadius: theme.cards?.borderRadius,
            boxShadow: theme.cards?.shadow,
            backdropFilter: `blur(${theme.cards?.backdropBlur})`,
          }}
        >
          <h4 className="text-white font-semibold mb-2">Beispiel-Karte</h4>
          <p className="text-gray-400 text-sm">Dies ist eine Vorschau der Karten-Styling-Einstellungen.</p>
        </div>
      </div>
    </div>
  );

  // Render Components Tab - Buttons, Inputs, Modals
  const renderComponentsTab = () => {
    const updateButtons = (type, updates) => {
      updateTheme({
        buttons: {
          ...theme.buttons,
          [type]: {
            ...theme.buttons?.[type],
            ...updates
          }
        }
      });
    };

    const updateInputs = (updates) => {
      updateTheme({
        inputs: {
          ...theme.inputs,
          ...updates
        }
      });
    };

    const updateModal = (updates) => {
      updateTheme({
        components: {
          ...theme.components,
          modal: {
            ...theme.components?.modal,
            ...updates
          }
        }
      });
    };

    return (
      <div className="space-y-4">
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 mb-4">
          <p className="text-sm text-purple-400">
            🎨 Hier können Sie Buttons, Eingabefelder und Modale anpassen. 
            Diese Stile werden automatisch auf alle passenden Elemente angewendet.
          </p>
        </div>

        {/* Primary Button */}
        <Section id="btn-primary" title="Primäre Buttons" icon={MousePointer}>
          <div className="space-y-3">
            <GradientPicker
              label="Button Hintergrund"
              value={theme.buttons?.primary?.background || 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)'}
              onChange={(v) => updateButtons('primary', { background: v })}
              title="Primärer Button Hintergrund"
            />
            <ColorInput
              label="Textfarbe"
              value={theme.buttons?.primary?.text || '#ffffff'}
              onChange={(v) => updateButtons('primary', { text: v })}
            />
            <SliderInput
              label="Eckenradius"
              value={parseInt(theme.buttons?.primary?.borderRadius) || 8}
              onChange={(v) => updateButtons('primary', { borderRadius: `${v}px` })}
              min={0}
              max={24}
              unit="px"
            />
            {/* Preview */}
            <button
              className="w-full py-3 rounded-lg font-medium transition-all"
              style={{
                background: theme.buttons?.primary?.background || 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                color: theme.buttons?.primary?.text || '#ffffff',
                borderRadius: theme.buttons?.primary?.borderRadius || '8px',
              }}
            >
              Vorschau: Primärer Button
            </button>
          </div>
        </Section>

        {/* Secondary Button */}
        <Section id="btn-secondary" title="Sekundäre Buttons" icon={MousePointer}>
          <div className="space-y-3">
            <GradientPicker
              label="Hintergrund"
              value={theme.buttons?.secondary?.background || 'rgba(255, 255, 255, 0.1)'}
              onChange={(v) => updateButtons('secondary', { background: v })}
              title="Sekundärer Button Hintergrund"
            />
            <ColorInput
              label="Textfarbe"
              value={theme.buttons?.secondary?.text || '#ffffff'}
              onChange={(v) => updateButtons('secondary', { text: v })}
            />
            <div>
              <label className="text-sm text-gray-300 block mb-1">Rahmen</label>
              <input
                type="text"
                value={theme.buttons?.secondary?.border || ''}
                onChange={(e) => updateButtons('secondary', { border: e.target.value })}
                placeholder="1px solid rgba(255, 255, 255, 0.2)"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-mono placeholder-gray-500"
              />
            </div>
            {/* Preview */}
            <button
              className="w-full py-3 rounded-lg font-medium transition-all"
              style={{
                background: theme.buttons?.secondary?.background || 'rgba(255, 255, 255, 0.1)',
                color: theme.buttons?.secondary?.text || '#ffffff',
                border: theme.buttons?.secondary?.border || '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
              }}
            >
              Vorschau: Sekundärer Button
            </button>
          </div>
        </Section>

        {/* Inputs */}
        <Section id="inputs" title="Eingabefelder" icon={FormInput}>
          <div className="space-y-3">
            <GradientPicker
              label="Hintergrund"
              value={theme.inputs?.background || 'rgba(255, 255, 255, 0.05)'}
              onChange={(v) => updateInputs({ background: v })}
              title="Eingabefeld Hintergrund"
            />
            <ColorInput
              label="Rahmenfarbe"
              value={theme.inputs?.borderColor || 'rgba(255, 255, 255, 0.1)'}
              onChange={(v) => updateInputs({ borderColor: v })}
            />
            <ColorInput
              label="Rahmenfarbe (Fokus)"
              value={theme.inputs?.borderColorFocus || '#8b5cf6'}
              onChange={(v) => updateInputs({ borderColorFocus: v })}
            />
            <ColorInput
              label="Textfarbe"
              value={theme.inputs?.textColor || '#ffffff'}
              onChange={(v) => updateInputs({ textColor: v })}
            />
            <ColorInput
              label="Platzhalterfarbe"
              value={theme.inputs?.placeholderColor || '#64748b'}
              onChange={(v) => updateInputs({ placeholderColor: v })}
            />
            <SliderInput
              label="Eckenradius"
              value={parseInt(theme.inputs?.borderRadius) || 8}
              onChange={(v) => updateInputs({ borderRadius: `${v}px` })}
              min={0}
              max={24}
              unit="px"
            />
            {/* Preview */}
            <input
              type="text"
              placeholder="Vorschau: Eingabefeld"
              className="w-full px-4 py-3 transition-all"
              style={{
                background: theme.inputs?.background || 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${theme.inputs?.borderColor || 'rgba(255, 255, 255, 0.1)'}`,
                borderRadius: theme.inputs?.borderRadius || '8px',
                color: theme.inputs?.textColor || '#ffffff',
              }}
            />
          </div>
        </Section>

        {/* Modals */}
        <Section id="modals" title="Modale / Dialoge" icon={Maximize}>
          <div className="space-y-3">
            <GradientPicker
              label="Modal Hintergrund"
              value={theme.components?.modal?.background || 'linear-gradient(135deg, #1e293b 0%, #312e81 50%, #1e293b 100%)'}
              onChange={(v) => updateModal({ background: v })}
              title="Modal Hintergrund"
            />
            <ColorInput
              label="Rahmenfarbe"
              value={theme.components?.modal?.border || 'rgba(255, 255, 255, 0.1)'}
              onChange={(v) => updateModal({ border: v })}
            />
            <SliderInput
              label="Eckenradius"
              value={parseInt(theme.components?.modal?.borderRadius) || 16}
              onChange={(v) => updateModal({ borderRadius: `${v}px` })}
              min={0}
              max={32}
              unit="px"
            />
            <div>
              <label className="text-sm text-gray-300 block mb-1">Schatten</label>
              <input
                type="text"
                value={theme.components?.modal?.shadow || ''}
                onChange={(e) => updateModal({ shadow: e.target.value })}
                placeholder="0 25px 50px rgba(0, 0, 0, 0.5)"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-mono placeholder-gray-500"
              />
            </div>
            {/* Preview */}
            <div 
              className="p-6 transition-all"
              style={{
                background: theme.components?.modal?.background || 'linear-gradient(135deg, #1e293b 0%, #312e81 50%, #1e293b 100%)',
                border: `1px solid ${theme.components?.modal?.border || 'rgba(255, 255, 255, 0.1)'}`,
                borderRadius: theme.components?.modal?.borderRadius || '16px',
                boxShadow: theme.components?.modal?.shadow || '0 25px 50px rgba(0, 0, 0, 0.5)',
              }}
            >
              <h4 className="text-white font-semibold mb-2">Vorschau: Modal</h4>
              <p className="text-gray-400 text-sm">So werden Ihre Modale aussehen.</p>
            </div>
          </div>
        </Section>
      </div>
    );
  };

  // Render Borders Tab
  const renderBordersTab = () => (
    <div className="space-y-4">
      <Section id="border-defaults" title="Standard-Rahmen" icon={BoxSelect}>
        <SelectInput
          label="Standard-Rahmenbreite"
          value={theme.borders?.width?.default || '2px'}
          onChange={(v) => updateTheme({ borders: { ...theme.borders, width: { ...theme.borders?.width, default: v } } })}
          options={[
            { value: '1px', label: 'Dünn (1px)' },
            { value: '2px', label: 'Normal (2px)' },
            { value: '3px', label: 'Dick (3px)' },
            { value: '4px', label: 'Extra Dick (4px)' },
          ]}
        />
        <SelectInput
          label="Rahmen-Stil"
          value={theme.borders?.style || 'solid'}
          onChange={(v) => updateTheme({ borders: { ...theme.borders, style: v } })}
          options={[
            { value: 'solid', label: 'Durchgehend' },
            { value: 'dashed', label: 'Gestrichelt' },
            { value: 'dotted', label: 'Gepunktet' },
            { value: 'double', label: 'Doppelt' },
          ]}
        />
      </Section>

      <Section id="border-radius" title="Eckenradien" icon={Circle}>
        <SliderInput
          label="Standard-Radius"
          value={parseFloat(theme.borders?.defaultRadius) || 12}
          onChange={(v) => updateTheme({ borders: { ...theme.borders, defaultRadius: v } })}
          min={0}
          max={32}
          unit="px"
        />
        <div className="grid grid-cols-2 gap-4 mt-4">
          {['sm', 'md', 'lg', 'xl'].map(size => (
            <div key={size} className="text-center">
              <div 
                className="w-16 h-16 mx-auto bg-purple-500/30 border-2 border-purple-500 mb-2"
                style={{ borderRadius: theme.borders?.radius?.[size] || '8px' }}
              />
              <span className="text-xs text-gray-400">{size}: {theme.borders?.radius?.[size]}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );

  // Render Typography Tab
  const renderTypographyTab = () => (
    <div className="space-y-4">
      <Section id="fonts" title="Schriftarten" icon={Type}>
        <SelectInput
          label="Primäre Schriftart"
          value={theme.typography?.fontFamily?.primary || 'Inter'}
          onChange={(v) => updateTypography({ fontFamily: { ...theme.typography?.fontFamily, primary: v } })}
          options={[
            { value: "'Inter', sans-serif", label: 'Inter' },
            { value: "'Poppins', sans-serif", label: 'Poppins' },
            { value: "'Roboto', sans-serif", label: 'Roboto' },
            { value: "'Open Sans', sans-serif", label: 'Open Sans' },
            { value: "'Lato', sans-serif", label: 'Lato' },
            { value: "'Montserrat', sans-serif", label: 'Montserrat' },
            { value: "Georgia, serif", label: 'Georgia' },
          ]}
        />
        <SelectInput
          label="Sekundäre Schriftart"
          value={theme.typography?.fontFamily?.secondary || 'Poppins'}
          onChange={(v) => updateTypography({ fontFamily: { ...theme.typography?.fontFamily, secondary: v } })}
          options={[
            { value: "'Poppins', sans-serif", label: 'Poppins' },
            { value: "'Inter', sans-serif", label: 'Inter' },
            { value: "'Roboto', sans-serif", label: 'Roboto' },
            { value: "'Open Sans', sans-serif", label: 'Open Sans' },
          ]}
        />
      </Section>

      <Section id="font-sizes" title="Schriftgrößen" icon={Sliders}>
        <div className="space-y-3">
          {['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl'].map(size => (
            <div key={size} className="flex items-center justify-between">
              <span className="text-sm text-gray-400 w-12">{size}</span>
              <span 
                className="text-white"
                style={{ fontSize: theme.typography?.fontSize?.[size] }}
              >
                Beispieltext
              </span>
              <span className="text-xs text-gray-500 font-mono">{theme.typography?.fontSize?.[size]}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );

  // Render Effects Tab
  const renderEffectsTab = () => (
    <div className="space-y-4">
      <Section id="animations" title="Animationen" icon={Sparkles}>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={theme.animations?.enableAnimations !== false}
            onChange={(e) => updateTheme({ animations: { ...theme.animations, enableAnimations: e.target.checked } })}
            className="w-5 h-5 rounded text-purple-500 focus:ring-purple-500"
          />
          <span className="text-sm text-gray-300">Animationen aktivieren</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={theme.animations?.enableHoverEffects !== false}
            onChange={(e) => updateTheme({ animations: { ...theme.animations, enableHoverEffects: e.target.checked } })}
            className="w-5 h-5 rounded text-purple-500 focus:ring-purple-500"
          />
          <span className="text-sm text-gray-300">Hover-Effekte aktivieren</span>
        </label>
        <SelectInput
          label="Animationsgeschwindigkeit"
          value={theme.animations?.duration?.normal || '300ms'}
          onChange={(v) => updateTheme({ animations: { ...theme.animations, duration: { ...theme.animations?.duration, normal: v } } })}
          options={[
            { value: '150ms', label: 'Schnell' },
            { value: '300ms', label: 'Normal' },
            { value: '500ms', label: 'Langsam' },
          ]}
        />
      </Section>

      <Section id="glass" title="Glas-Effekte" icon={Layers}>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={theme.effects?.enableGlassEffect !== false}
            onChange={(e) => updateTheme({ effects: { ...theme.effects, enableGlassEffect: e.target.checked } })}
            className="w-5 h-5 rounded text-purple-500 focus:ring-purple-500"
          />
          <span className="text-sm text-gray-300">Glasmorphismus aktivieren</span>
        </label>
        <SliderInput
          label="Backdrop Blur"
          value={parseFloat(theme.effects?.backdropBlur) || 12}
          onChange={(v) => updateTheme({ effects: { ...theme.effects, backdropBlur: v } })}
          min={0}
          max={24}
          unit="px"
        />
        <SliderInput
          label="Glas-Opacity"
          value={(theme.effects?.glassOpacity || 0.05) * 100}
          onChange={(v) => updateTheme({ effects: { ...theme.effects, glassOpacity: parseFloat(v) / 100 } })}
          min={0}
          max={30}
          unit="%"
        />
      </Section>
    </div>
  );

  // Render Pages Tab - Page-specific styling
  const renderPagesTab = () => {
    const pages = [
      { id: 'welcome', label: 'Willkommensseite', desc: 'Startseite vor dem Login' },
      { id: 'join', label: 'Beitrittsseite', desc: 'Teilnehmer-Beitritt' },
      { id: 'login', label: 'Login-Seite', desc: 'Admin-Anmeldung' },
      { id: 'dashboard', label: 'Persönliches Dashboard', desc: 'Teilnehmer-Übersicht' },
      { id: 'adminDashboard', label: 'Admin Dashboard', desc: 'Administratorbereich' },
      { id: 'classes', label: 'Klassenverwaltung', desc: 'Klassen-Übersicht' },
      { id: 'moduleCreator', label: 'Modul-Editor', desc: 'Module erstellen/bearbeiten' },
      { id: 'session', label: 'Sitzungsansicht', desc: 'Aktive Schulungssitzung' },
    ];

    const updatePageStyle = (pageId, key, value) => {
      const currentPageStyles = theme.pageStyles || {};
      const currentPage = currentPageStyles[pageId] || {};
      updateTheme({
        pageStyles: {
          ...currentPageStyles,
          [pageId]: {
            ...currentPage,
            [key]: value || null
          }
        }
      });
    };

    return (
      <div className="space-y-4">
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-400">
            💡 Hier können Sie für jede Seite individuelle Hintergrundstile festlegen. 
            Leere Felder verwenden den globalen App-Hintergrund.
          </p>
        </div>

        {pages.map(page => (
          <Section key={page.id} id={`page-${page.id}`} title={page.label} icon={LayoutGrid}>
            <p className="text-xs text-gray-500 mb-3">{page.desc}</p>
            
            <div className="space-y-3">
              <GradientPicker
                label="Hintergrund"
                value={theme.pageStyles?.[page.id]?.background || theme.colors?.appBackgroundGradient || 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)'}
                onChange={(v) => updatePageStyle(page.id, 'background', v)}
                title={`${page.label} Hintergrund`}
              />
              
              <ColorInput
                label="Textfarbe"
                value={theme.pageStyles?.[page.id]?.textColor || theme.colors?.textPrimary || '#ffffff'}
                onChange={(v) => updatePageStyle(page.id, 'textColor', v)}
                description="Primäre Textfarbe für diese Seite"
              />

              {/* Preview */}
              <div 
                className="h-16 rounded-lg border border-white/10 flex items-center justify-center text-sm"
                style={{
                  background: theme.pageStyles?.[page.id]?.background || theme.colors?.appBackgroundGradient,
                  color: theme.pageStyles?.[page.id]?.textColor || theme.colors?.textPrimary
                }}
              >
                Vorschau: {page.label}
              </div>

              {theme.pageStyles?.[page.id]?.background && (
                <button
                  onClick={() => updatePageStyle(page.id, 'background', null)}
                  className="text-xs text-gray-400 hover:text-red-400"
                >
                  Zurück zum globalen Hintergrund
                </button>
              )}
            </div>
          </Section>
        ))}
      </div>
    );
  };

  // Render Presets Tab
  const renderPresetsTab = () => {
    // Helper to generate complete theme from primary/secondary colors
    const generateCompleteTheme = (primary, primaryHover, secondary, secondaryHover, bgGradient, bgDark) => ({
      colors: {
        primary,
        primaryHover,
        secondary,
        secondaryHover,
        accent: secondary,
        accentHover: secondaryHover,
        appBackground: bgDark,
        appBackgroundGradient: bgGradient,
        cardBackground: 'rgba(255, 255, 255, 0.05)',
        cardBackgroundHover: 'rgba(255, 255, 255, 0.08)',
        inputBackground: 'rgba(255, 255, 255, 0.05)',
        overlay: 'rgba(0, 0, 0, 0.5)',
        overlayDark: 'rgba(0, 0, 0, 0.8)',
        textPrimary: '#ffffff',
        textSecondary: '#94a3b8',
        textMuted: '#64748b',
        textAccent: primary,
        borderDefault: 'rgba(255, 255, 255, 0.1)',
        borderHover: 'rgba(255, 255, 255, 0.2)',
        borderFocus: primary,
        borderAccent: primary,
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
      },
      cards: {
        background: 'rgba(255, 255, 255, 0.05)',
        backgroundHover: 'rgba(255, 255, 255, 0.08)',
        borderWidth: '1px',
        borderColor: `${primary}4d`,
        borderColorHover: `${primary}80`,
        borderRadius: '12px',
        shadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        shadowHover: '0 10px 15px rgba(0, 0, 0, 0.15)',
        padding: '1.5rem',
        backdropBlur: '12px',
      },
      buttons: {
        primary: {
          background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`,
          backgroundHover: `linear-gradient(135deg, ${primaryHover} 0%, ${secondaryHover} 100%)`,
          text: '#ffffff',
          borderRadius: '8px',
          padding: '0.75rem 1.5rem',
          shadow: `0 4px 14px ${primary}4d`,
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
      inputs: {
        background: 'rgba(255, 255, 255, 0.05)',
        backgroundFocus: 'rgba(255, 255, 255, 0.08)',
        borderWidth: '1px',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderColorFocus: primary,
        borderRadius: '8px',
        textColor: '#ffffff',
        placeholderColor: '#64748b',
        padding: '0.75rem 1rem',
      },
      components: {
        header: {
          background: 'rgba(0, 0, 0, 0.3)',
          backdropBlur: '12px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        },
        sidebar: {
          background: 'rgba(0, 0, 0, 0.2)',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        },
        modal: {
          background: bgGradient,
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          shadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
        },
      },
      shadows: {
        glow: `0 0 20px ${primary}4d`,
        glowStrong: `0 0 40px ${primary}80`,
        card: '0 4px 6px rgba(0, 0, 0, 0.1)',
        cardHover: '0 10px 15px rgba(0, 0, 0, 0.15)',
      },
      borders: {
        defaultRadius: '12px',
        radius: { sm: '4px', md: '8px', lg: '12px', xl: '16px', '2xl': '24px' },
        width: { default: '1px', thick: '2px' },
      },
    });

    const presets = [
      {
        name: 'Purple Dream',
        preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        theme: generateCompleteTheme(
          '#8b5cf6', '#7c3aed', '#a78bfa', '#8b5cf6',
          'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
          '#0f172a'
        )
      },
      {
        name: 'Ocean Breeze',
        preview: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        theme: generateCompleteTheme(
          '#06b6d4', '#0891b2', '#22d3ee', '#06b6d4',
          'linear-gradient(135deg, #0c4a6e 0%, #164e63 50%, #0c4a6e 100%)',
          '#0c4a6e'
        )
      },
      {
        name: 'Sunset Glow',
        preview: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        theme: generateCompleteTheme(
          '#f97316', '#ea580c', '#fb923c', '#f97316',
          'linear-gradient(135deg, #431407 0%, #7c2d12 50%, #431407 100%)',
          '#431407'
        )
      },
      {
        name: 'Emerald Forest',
        preview: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
        theme: generateCompleteTheme(
          '#10b981', '#059669', '#34d399', '#10b981',
          'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #064e3b 100%)',
          '#064e3b'
        )
      },
      {
        name: 'Rose Gold',
        preview: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        theme: generateCompleteTheme(
          '#ec4899', '#db2777', '#f472b6', '#ec4899',
          'linear-gradient(135deg, #500724 0%, #831843 50%, #500724 100%)',
          '#500724'
        )
      },
      {
        name: 'Midnight Blue',
        preview: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)',
        theme: generateCompleteTheme(
          '#3b82f6', '#2563eb', '#60a5fa', '#3b82f6',
          'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0f172a 100%)',
          '#0f172a'
        )
      },
      {
        name: 'Golden Hour',
        preview: 'linear-gradient(135deg, #f5af19 0%, #f12711 100%)',
        theme: generateCompleteTheme(
          '#eab308', '#ca8a04', '#fbbf24', '#eab308',
          'linear-gradient(135deg, #422006 0%, #713f12 50%, #422006 100%)',
          '#422006'
        )
      },
      {
        name: 'Neon Night',
        preview: 'linear-gradient(135deg, #00f260 0%, #0575e6 100%)',
        theme: generateCompleteTheme(
          '#22c55e', '#16a34a', '#4ade80', '#22c55e',
          'linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%)',
          '#020617'
        )
      },
      // Soft Light / Beige Tones
      {
        name: 'Soft Cream',
        preview: 'linear-gradient(135deg, #fef9ef 0%, #f5e6d3 50%, #e8d5c4 100%)',
        theme: generateCompleteTheme(
          '#b8860b', '#9a7209', '#d4a84b', '#c49a3d',
          'linear-gradient(135deg, #fef9ef 0%, #f5e6d3 50%, #e8d5c4 100%)',
          '#fef9ef'
        )
      },
      {
        name: 'Warm Sand',
        preview: 'linear-gradient(135deg, #f5f0e8 0%, #e6ddd0 50%, #d4c4b0 100%)',
        theme: generateCompleteTheme(
          '#8b7355', '#755f45', '#a08060', '#8b7050',
          'linear-gradient(135deg, #f5f0e8 0%, #e6ddd0 50%, #d4c4b0 100%)',
          '#f5f0e8'
        )
      },
      // Pastel Palettes
      {
        name: 'Pastel Dream',
        preview: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 50%, #f8b4d9 100%)',
        theme: generateCompleteTheme(
          '#e879a9', '#d96a9a', '#f8b4d9', '#e8a4c9',
          'linear-gradient(135deg, #ffecd2 0%, #fcb69f 50%, #f8b4d9 100%)',
          '#ffecd2'
        )
      },
      {
        name: 'Lavender Mist',
        preview: 'linear-gradient(135deg, #e0c3fc 0%, #c3b5fd 50%, #a5b4fc 100%)',
        theme: generateCompleteTheme(
          '#8b5cf6', '#7c3aed', '#a78bfa', '#9b7bea',
          'linear-gradient(135deg, #e0c3fc 0%, #c3b5fd 50%, #a5b4fc 100%)',
          '#e0c3fc'
        )
      },
      {
        name: 'Mint Fresh',
        preview: 'linear-gradient(135deg, #d4f4e4 0%, #a7e8c5 50%, #86efac 100%)',
        theme: generateCompleteTheme(
          '#22c55e', '#16a34a', '#4ade80', '#3ace70',
          'linear-gradient(135deg, #d4f4e4 0%, #a7e8c5 50%, #86efac 100%)',
          '#d4f4e4'
        )
      },
      // Professional / Corporate
      {
        name: 'Corporate Blue',
        preview: 'linear-gradient(135deg, #1e3a5f 0%, #2c5282 50%, #1e3a5f 100%)',
        theme: generateCompleteTheme(
          '#3182ce', '#2b6cb0', '#4299e1', '#3a89d1',
          'linear-gradient(135deg, #1e3a5f 0%, #2c5282 50%, #1e3a5f 100%)',
          '#1e3a5f'
        )
      },
      {
        name: 'Executive Gray',
        preview: 'linear-gradient(135deg, #2d3748 0%, #4a5568 50%, #2d3748 100%)',
        theme: generateCompleteTheme(
          '#667eea', '#5a67d8', '#818cf8', '#7179e8',
          'linear-gradient(135deg, #2d3748 0%, #4a5568 50%, #2d3748 100%)',
          '#2d3748'
        )
      },
      {
        name: 'Slate Pro',
        preview: 'linear-gradient(135deg, #0f172a 0%, #334155 50%, #0f172a 100%)',
        theme: generateCompleteTheme(
          '#94a3b8', '#7f8fa3', '#cbd5e1', '#b5c5d1',
          'linear-gradient(135deg, #0f172a 0%, #334155 50%, #0f172a 100%)',
          '#0f172a'
        )
      },
      // Modern High-Def / Impressive
      {
        name: 'Aurora Borealis',
        preview: 'linear-gradient(135deg, #00c6fb 0%, #005bea 33%, #a855f7 66%, #ec4899 100%)',
        theme: generateCompleteTheme(
          '#8b5cf6', '#7c3aed', '#a855f7', '#9845e7',
          'linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 25%, #0a1a2e 50%, #0a0a1a 100%)',
          '#0a0a1a'
        )
      },
      {
        name: 'Cyber Punk',
        preview: 'linear-gradient(135deg, #ff00ff 0%, #00ffff 50%, #ff00aa 100%)',
        theme: generateCompleteTheme(
          '#f0f', '#d000d0', '#0ff', '#00d0d0',
          'linear-gradient(135deg, #0a0014 0%, #140028 50%, #0a0014 100%)',
          '#0a0014'
        )
      },
      {
        name: 'Holographic',
        preview: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
        theme: generateCompleteTheme(
          '#f093fb', '#e083eb', '#f5576c', '#e5475c',
          'linear-gradient(135deg, #0d0d1a 0%, #1a1a2e 50%, #0d0d1a 100%)',
          '#0d0d1a'
        )
      },
      {
        name: 'Deep Space',
        preview: 'linear-gradient(135deg, #000428 0%, #004e92 50%, #000428 100%)',
        theme: generateCompleteTheme(
          '#00d4ff', '#00b4df', '#38bdf8', '#28adf8',
          'linear-gradient(135deg, #000428 0%, #004e92 50%, #000428 100%)',
          '#000428'
        )
      },
      {
        name: 'Glass Morphism',
        preview: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        theme: generateCompleteTheme(
          '#8b5cf6', '#7c3aed', '#a78bfa', '#9b7bea',
          'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
          '#1a1a2e'
        )
      },
    ];

    return (
      <div className="space-y-6">
        {/* Built-in Presets */}
        <div>
          <h4 className="text-sm font-medium text-white mb-3">Eingebaute Vorlagen</h4>
          <div className="grid grid-cols-2 gap-3">
            {presets.map((preset, index) => (
              <button
                key={index}
                onClick={() => updateTheme(preset.theme)}
                className="group relative p-4 rounded-xl text-left transition-all hover:scale-105 border border-white/10 hover:border-white/30"
                style={{ background: preset.preview }}
              >
                <span className="text-white font-medium text-sm drop-shadow-lg">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Saved Themes */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-white">Gespeicherte Themes</h4>
            <button
              onClick={() => setShowSaveDialog(true)}
              className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              <Plus size={14} /> Neues Theme speichern
            </button>
          </div>
          {savedThemes.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">Noch keine gespeicherten Themes</p>
          ) : (
            <div className="space-y-2">
              {savedThemes.map((saved) => (
                <div 
                  key={saved.id}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                >
                  <span className="text-sm text-white">{saved.name}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => loadTheme(saved)}
                      className="px-2 py-1 text-xs bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded"
                    >
                      Laden
                    </button>
                    <button
                      onClick={() => deleteTheme(saved.id)}
                      className="px-2 py-1 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex">
      {/* Main Panel */}
      <div className="w-[480px] bg-gradient-to-b from-slate-900 to-slate-950 border-r border-white/10 flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Paintbrush size={24} className="text-purple-400" />
            <div>
              <h2 className="text-lg font-bold text-white">Theme Designer</h2>
              <div className="flex items-center gap-2 text-xs">
                {isConnected ? (
                  <span className="flex items-center gap-1 text-green-400">
                    <Wifi size={12} /> Live-Sync aktiv
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-gray-500">
                    <WifiOff size={12} /> Offline
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={undoThemeChange}
              disabled={!canUndo}
              className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg disabled:opacity-30"
              title="Rückgängig"
            >
              <Undo2 size={18} />
            </button>
            <button
              onClick={resetTheme}
              className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg"
              title="Zurücksetzen"
            >
              <RotateCcw size={18} />
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-500/10' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'colors' && renderColorsTab()}
          {activeTab === 'cards' && renderCardsTab()}
          {activeTab === 'components' && renderComponentsTab()}
          {activeTab === 'borders' && renderBordersTab()}
          {activeTab === 'typography' && renderTypographyTab()}
          {activeTab === 'effects' && renderEffectsTab()}
          {activeTab === 'pages' && renderPagesTab()}
          {activeTab === 'presets' && renderPresetsTab()}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <button
            onClick={handleSetGlobal}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-medium flex items-center justify-center gap-2"
          >
            <Save size={18} />
            Als globales Theme setzen
          </button>
          <button
            onClick={() => setShowSaveDialog(true)}
            className="w-full py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-sm flex items-center justify-center gap-2"
          >
            <Download size={16} />
            Theme speichern
          </button>
        </div>
      </div>

      {/* Preview Panel */}
      <div 
        className="flex-1 p-8 overflow-y-auto"
        style={{
          background: theme.colors?.appBackgroundGradient || theme.colors?.appBackground,
        }}
      >
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-white">Live-Vorschau</h3>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-3 py-1 bg-white/10 rounded-lg text-sm text-gray-300 flex items-center gap-2"
            >
              {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
              {showPreview ? 'Verbergen' : 'Anzeigen'}
            </button>
          </div>

          {showPreview && (
            <>
              {/* Sample Card */}
              <div 
                className="p-6 transition-all duration-300"
                style={{
                  background: theme.cards?.background,
                  border: `${theme.cards?.borderWidth} solid ${theme.cards?.borderColor}`,
                  borderRadius: theme.cards?.borderRadius,
                  boxShadow: theme.cards?.shadow,
                  backdropFilter: theme.effects?.enableGlassEffect ? `blur(${theme.cards?.backdropBlur})` : undefined,
                }}
              >
                <h4 className="text-xl font-bold mb-2" style={{ color: theme.colors?.textPrimary }}>
                  Beispiel-Modul
                </h4>
                <p className="mb-4" style={{ color: theme.colors?.textSecondary }}>
                  Dies ist eine Vorschau, wie Ihre Inhalte mit dem aktuellen Theme aussehen werden.
                </p>
                <div className="flex gap-3">
                  <button
                    className="px-4 py-2 rounded-lg font-medium text-white"
                    style={{ 
                      background: theme.buttons?.primary?.background || `linear-gradient(135deg, ${theme.colors?.primary} 0%, ${theme.colors?.secondary} 100%)`,
                      boxShadow: theme.buttons?.primary?.shadow,
                    }}
                  >
                    Primär Button
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg font-medium"
                    style={{ 
                      background: theme.buttons?.secondary?.background || 'rgba(255,255,255,0.1)',
                      color: theme.colors?.textPrimary,
                      border: theme.buttons?.secondary?.border,
                    }}
                  >
                    Sekundär
                  </button>
                </div>
              </div>

              {/* Sample Input */}
              <div 
                className="p-6 transition-all duration-300"
                style={{
                  background: theme.cards?.background,
                  border: `${theme.cards?.borderWidth} solid ${theme.cards?.borderColor}`,
                  borderRadius: theme.cards?.borderRadius,
                }}
              >
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors?.textPrimary }}>
                  Eingabefeld
                </label>
                <input
                  type="text"
                  placeholder="Beispiel-Eingabe..."
                  className="w-full px-4 py-3 transition-all"
                  style={{
                    background: theme.inputs?.background,
                    border: `${theme.inputs?.borderWidth || '1px'} solid ${theme.inputs?.borderColor}`,
                    borderRadius: theme.inputs?.borderRadius,
                    color: theme.inputs?.textColor || theme.colors?.textPrimary,
                  }}
                />
              </div>

              {/* Status Colors */}
              <div className="grid grid-cols-4 gap-3">
                {['success', 'warning', 'error', 'info'].map(status => (
                  <div 
                    key={status}
                    className="p-3 rounded-lg text-center text-white text-sm font-medium"
                    style={{ background: theme.colors?.[status] }}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60">
          <div className="bg-slate-900 rounded-xl p-6 w-96 border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4">Theme speichern</h3>
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="Theme-Name..."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="flex-1 py-2 bg-white/10 text-gray-300 rounded-lg"
              >
                Abbrechen
              </button>
              <button
                onClick={handleSaveTheme}
                disabled={!saveName.trim()}
                className="flex-1 py-2 bg-purple-500 text-white rounded-lg disabled:opacity-50"
              >
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gradient Modal */}
      <GradientModal
        isOpen={gradientModal.isOpen}
        onClose={closeGradientModal}
        value={gradientModal.value}
        onChange={gradientModal.onChange}
        title={gradientModal.title}
      />
    </div>
  );
}

export default ThemeDesigner;
