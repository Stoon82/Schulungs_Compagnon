import { useState, useEffect } from 'react';
import { Palette, Check, RotateCcw, Eye, Sparkles } from 'lucide-react';

/**
 * TemplateSelector - Unified component for selecting saved styling templates
 * Used in ClassManagement, ModuleCreatorV2, and SubmoduleEditor
 */
function TemplateSelector({ 
  selectedTemplate, 
  onSelect, 
  onClear,
  label = "Styling-Vorlage",
  showPreview = true,
  compact = false 
}) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewTemplate, setPreviewTemplate] = useState(null);

  // Helper to generate complete styling preset
  const generateCompletePreset = (id, name, primary, secondary, bgGradient) => ({
    id,
    name,
    isBuiltIn: true,
    theme_data: {
      // Container styling
      background: bgGradient,
      textColor: '#ffffff',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: `${primary}4d`,
      borderRadius: '12px',
      boxShadow: `0 4px 20px ${primary}33`,
      backdropBlur: '12px',
      // Full theme colors for nested elements
      colors: {
        primary,
        primaryHover: primary,
        secondary,
        secondaryHover: secondary,
        accent: secondary,
        textPrimary: '#ffffff',
        textSecondary: '#94a3b8',
        textMuted: '#64748b',
        cardBackground: 'rgba(255, 255, 255, 0.05)',
        cardBackgroundHover: 'rgba(255, 255, 255, 0.08)',
        borderDefault: 'rgba(255, 255, 255, 0.1)',
        borderHover: 'rgba(255, 255, 255, 0.2)',
        borderFocus: primary,
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
      },
      // Card styling
      cards: {
        background: 'rgba(255, 255, 255, 0.05)',
        backgroundHover: 'rgba(255, 255, 255, 0.08)',
        borderColor: `${primary}4d`,
        borderRadius: '12px',
        shadow: `0 4px 14px ${primary}26`,
      },
      // Button styling
      buttons: {
        primary: {
          background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`,
          text: '#ffffff',
          borderRadius: '8px',
        },
        secondary: {
          background: 'rgba(255, 255, 255, 0.1)',
          text: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        },
      },
      // Input styling
      inputs: {
        background: 'rgba(255, 255, 255, 0.05)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderColorFocus: primary,
        textColor: '#ffffff',
        placeholderColor: '#64748b',
        borderRadius: '8px',
      },
      // Shadows
      shadows: {
        glow: `0 0 20px ${primary}4d`,
        card: `0 4px 14px ${primary}26`,
      },
      // Border settings
      borders: {
        defaultRadius: '12px',
      },
    }
  });

  // Built-in presets (always available)
  const builtInPresets = [
    generateCompletePreset(
      'preset-purple-dream', 'Purple Dream',
      '#8b5cf6', '#a78bfa',
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    ),
    generateCompletePreset(
      'preset-ocean-blue', 'Ocean Blue',
      '#06b6d4', '#22d3ee',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    ),
    generateCompletePreset(
      'preset-sunset', 'Sunset',
      '#f97316', '#fb923c',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    ),
    generateCompletePreset(
      'preset-emerald', 'Emerald',
      '#10b981', '#34d399',
      'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
    ),
    generateCompletePreset(
      'preset-rose-gold', 'Rose Gold',
      '#ec4899', '#f472b6',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    ),
    generateCompletePreset(
      'preset-midnight', 'Midnight',
      '#3b82f6', '#60a5fa',
      'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0f172a 100%)'
    ),
    generateCompletePreset(
      'preset-dark-accent', 'Dark Accent',
      '#8b5cf6', '#a78bfa',
      'rgba(15, 23, 42, 0.95)'
    ),
    {
      id: 'preset-glass',
      name: 'Glass',
      isBuiltIn: true,
      theme_data: {
        background: 'rgba(255, 255, 255, 0.1)',
        textColor: '#ffffff',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'rgba(255,255,255,0.2)',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        backdropBlur: '16px',
        colors: {
          primary: '#8b5cf6',
          secondary: '#a78bfa',
          textPrimary: '#ffffff',
          textSecondary: '#94a3b8',
          cardBackground: 'rgba(255, 255, 255, 0.08)',
          borderDefault: 'rgba(255, 255, 255, 0.15)',
          borderFocus: '#8b5cf6',
        },
        cards: {
          background: 'rgba(255, 255, 255, 0.08)',
          borderColor: 'rgba(255, 255, 255, 0.15)',
          borderRadius: '16px',
        },
        buttons: {
          primary: {
            background: 'rgba(139, 92, 246, 0.8)',
            text: '#ffffff',
          },
          secondary: {
            background: 'rgba(255, 255, 255, 0.1)',
            text: '#ffffff',
          },
        },
        inputs: {
          background: 'rgba(255, 255, 255, 0.08)',
          borderColor: 'rgba(255, 255, 255, 0.15)',
          borderColorFocus: '#8b5cf6',
          textColor: '#ffffff',
        },
      }
    }
  ];

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/themes');
      const data = await response.json();
      
      if (data.success && data.data) {
        // Combine built-in presets with saved templates
        const savedTemplates = data.data.map(t => ({
          ...t,
          isBuiltIn: false,
          theme_data: typeof t.theme_data === 'string' ? JSON.parse(t.theme_data) : t.theme_data
        }));
        setTemplates([...builtInPresets, ...savedTemplates]);
      } else {
        setTemplates(builtInPresets);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      setTemplates(builtInPresets);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (template) => {
    if (onSelect) {
      onSelect(template.theme_data, template);
    }
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    }
  };

  const getPreviewStyle = (themeData) => {
    if (!themeData) return {};
    
    // Handle both flat structure (built-in presets) and nested structure (saved themes from ThemeDesigner)
    const background = themeData.background 
      || themeData.colors?.appBackgroundGradient 
      || themeData.colors?.appBackground 
      || themeData.colors?.cardBackground
      || 'rgba(255,255,255,0.05)';
    
    const textColor = themeData.textColor 
      || themeData.colors?.textPrimary 
      || '#ffffff';
    
    const borderColor = themeData.borderColor 
      || themeData.colors?.borderDefault 
      || 'rgba(255,255,255,0.1)';
    
    const borderWidth = themeData.borderWidth 
      || themeData.borders?.width?.default 
      || '1px';
    
    const borderStyle = themeData.borderStyle 
      || themeData.borders?.style 
      || 'solid';
    
    const borderRadius = themeData.borderRadius 
      || themeData.borders?.defaultRadius 
      || '12px';
    
    const boxShadow = themeData.boxShadow 
      || themeData.shadows?.glow 
      || 'none';
    
    return {
      background,
      color: textColor,
      border: `${borderWidth} ${borderStyle} ${borderColor}`,
      borderRadius,
      boxShadow,
      backdropFilter: themeData.backdropBlur ? `blur(${themeData.backdropBlur})` : undefined,
    };
  };

  const isSelected = (template) => {
    if (!selectedTemplate) return false;
    // Compare by ID or by comparing theme data
    if (selectedTemplate.id && template.id) {
      return selectedTemplate.id === template.id;
    }
    // Compare theme data properties
    return JSON.stringify(selectedTemplate) === JSON.stringify(template.theme_data);
  };

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
            <Palette size={16} className="text-purple-400" />
            {label}
          </label>
          {selectedTemplate && (
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-gray-400 hover:text-gray-300 flex items-center gap-1"
            >
              <RotateCcw size={12} />
              Zurücksetzen
            </button>
          )}
        </div>
        
        {loading ? (
          <div className="text-center py-4 text-gray-400 text-sm">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500 mx-auto mb-2"></div>
            Laden...
          </div>
        ) : (
          <div className="space-y-3">
            {/* Built-in Presets as styled buttons */}
            <div className="grid grid-cols-4 gap-2">
              {templates.filter(t => t.isBuiltIn).map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => handleSelect(template)}
                  className={`relative h-12 rounded-lg text-[10px] font-medium transition-all hover:scale-105 overflow-hidden ${
                    isSelected(template) ? 'ring-2 ring-purple-500 ring-offset-1 ring-offset-slate-900' : ''
                  }`}
                  style={getPreviewStyle(template.theme_data)}
                  title={template.name}
                >
                  <span className="relative z-10 drop-shadow-md px-1">{template.name}</span>
                  {isSelected(template) && (
                    <div className="absolute top-0.5 right-0.5 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                      <Check size={10} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Saved Templates */}
            {templates.filter(t => !t.isBuiltIn).length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Gespeicherte Vorlagen:</p>
                <div className="grid grid-cols-4 gap-2">
                  {templates.filter(t => !t.isBuiltIn).map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => handleSelect(template)}
                      className={`relative h-12 rounded-lg text-[10px] font-medium transition-all hover:scale-105 overflow-hidden ${
                        isSelected(template) ? 'ring-2 ring-purple-500 ring-offset-1 ring-offset-slate-900' : ''
                      }`}
                      style={getPreviewStyle(template.theme_data)}
                      title={template.name}
                    >
                      <span className="relative z-10 drop-shadow-md px-1">{template.name}</span>
                      {isSelected(template) && (
                        <div className="absolute top-0.5 right-0.5 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                          <Check size={10} className="text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {selectedTemplate && showPreview && (
          <div 
            className="p-3 transition-all duration-300"
            style={getPreviewStyle(selectedTemplate)}
          >
            <span className="text-sm font-medium">Vorschau</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Palette size={20} className="text-purple-400" />
          <h3 className="text-lg font-semibold text-white">{label}</h3>
        </div>
        {selectedTemplate && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-gray-400 hover:text-gray-300 flex items-center gap-1"
          >
            <RotateCcw size={14} />
            Zurücksetzen
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-400">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mx-auto mb-2"></div>
          Vorlagen werden geladen...
        </div>
      ) : (
        <div className="space-y-4">
          {/* Built-in Presets */}
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
              <Sparkles size={14} />
              Eingebaute Vorlagen
            </h4>
            <div className="grid grid-cols-4 gap-2">
              {templates.filter(t => t.isBuiltIn).map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => handleSelect(template)}
                  onMouseEnter={() => setPreviewTemplate(template)}
                  onMouseLeave={() => setPreviewTemplate(null)}
                  className={`relative px-3 py-4 rounded-lg text-xs font-medium transition-all hover:scale-105 ${
                    isSelected(template) ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-slate-900' : ''
                  }`}
                  style={getPreviewStyle(template.theme_data)}
                >
                  <span className="relative z-10 drop-shadow-md">{template.name}</span>
                  {isSelected(template) && (
                    <div className="absolute top-1 right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Saved Templates */}
          {templates.filter(t => !t.isBuiltIn).length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                <Palette size={14} />
                Gespeicherte Vorlagen
              </h4>
              <div className="grid grid-cols-4 gap-2">
                {templates.filter(t => !t.isBuiltIn).map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => handleSelect(template)}
                    onMouseEnter={() => setPreviewTemplate(template)}
                    onMouseLeave={() => setPreviewTemplate(null)}
                    className={`relative px-3 py-4 rounded-lg text-xs font-medium transition-all hover:scale-105 ${
                      isSelected(template) ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-slate-900' : ''
                    }`}
                    style={getPreviewStyle(template.theme_data)}
                  >
                    <span className="relative z-10 drop-shadow-md">{template.name}</span>
                    {isSelected(template) && (
                      <div className="absolute top-1 right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Live Preview */}
          {showPreview && (previewTemplate || selectedTemplate) && (
            <div className="mt-4 p-4 bg-black/20 rounded-lg border border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <Eye size={16} className="text-purple-400" />
                <span className="text-sm font-medium text-white">
                  {previewTemplate ? 'Vorschau: ' + previewTemplate.name : 'Ausgewählt: ' + (selectedTemplate?.name || 'Benutzerdefiniert')}
                </span>
              </div>
              <div 
                className="p-4 transition-all duration-300"
                style={getPreviewStyle(previewTemplate?.theme_data || selectedTemplate)}
              >
                <h4 className="font-semibold mb-1">Beispiel-Inhalt</h4>
                <p className="text-sm opacity-80">So wird Ihr gestylter Inhalt aussehen.</p>
              </div>
            </div>
          )}

          {/* No template selected hint */}
          {!selectedTemplate && (
            <p className="text-xs text-gray-500 text-center mt-2">
              Wählen Sie eine Vorlage aus oder lassen Sie das Feld leer für Standard-Styling
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default TemplateSelector;
