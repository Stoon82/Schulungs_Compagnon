import { useState, useEffect } from 'react';
import { Type, Save, Upload, X, Image as ImageIcon } from 'lucide-react';

function TitleTemplate({ content, onChange, onSave, isEditing }) {
  const [formData, setFormData] = useState({
    title: content?.title || '',
    subtitle: content?.subtitle || '',
    alignment: content?.alignment || 'center',
    size: content?.size || 'large',
    backgroundImage: content?.backgroundImage || '',
    backgroundOpacity: content?.backgroundOpacity || 0.3,
    logo: content?.logo || '',
    logoPosition: content?.logoPosition || 'top-right',
    logoSize: content?.logoSize || 'medium'
  });

  useEffect(() => {
    if (content && !isEditing) {
      setFormData({
        title: content?.title || '',
        subtitle: content?.subtitle || '',
        alignment: content?.alignment || 'center',
        size: content?.size || 'large',
        backgroundImage: content?.backgroundImage || '',
        backgroundOpacity: content?.backgroundOpacity || 0.3,
        logo: content?.logo || '',
        logoPosition: content?.logoPosition || 'top-right',
        logoSize: content?.logoSize || 'medium'
      });
    }
  }, [content, isEditing]);

  const handleChange = (updates) => {
    const newData = { ...formData, ...updates };
    setFormData(newData);
    if (onChange) {
      onChange(newData);
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave(formData);
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Haupttitel
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange({ title: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Titel eingeben"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Untertitel (optional)
          </label>
          <input
            type="text"
            value={formData.subtitle}
            onChange={(e) => handleChange({ subtitle: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Untertitel eingeben"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Ausrichtung
            </label>
            <select
              value={formData.alignment}
              onChange={(e) => handleChange({ alignment: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="left">Links</option>
              <option value="center">Zentriert</option>
              <option value="right">Rechts</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Größe
            </label>
            <select
              value={formData.size}
              onChange={(e) => handleChange({ size: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="small">Klein</option>
              <option value="medium">Mittel</option>
              <option value="large">Groß</option>
            </select>
          </div>
        </div>

        {/* Background Image */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Hintergrundbild (URL)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.backgroundImage}
              onChange={(e) => handleChange({ backgroundImage: e.target.value })}
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="https://example.com/image.jpg"
            />
            {formData.backgroundImage && (
              <button
                onClick={() => handleChange({ backgroundImage: '' })}
                className="px-3 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all"
                title="Bild entfernen"
              >
                <X size={20} />
              </button>
            )}
          </div>
          {formData.backgroundImage && (
            <div className="mt-2">
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Deckkraft: {Math.round(formData.backgroundOpacity * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={formData.backgroundOpacity}
                onChange={(e) => handleChange({ backgroundOpacity: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>
          )}
        </div>

        {/* Logo */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Logo (URL)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.logo}
              onChange={(e) => handleChange({ logo: e.target.value })}
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="https://example.com/logo.png"
            />
            {formData.logo && (
              <button
                onClick={() => handleChange({ logo: '' })}
                className="px-3 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all"
                title="Logo entfernen"
              >
                <X size={20} />
              </button>
            )}
          </div>
          {formData.logo && (
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Position
                </label>
                <select
                  value={formData.logoPosition}
                  onChange={(e) => handleChange({ logoPosition: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="top-left">Oben Links</option>
                  <option value="top-center">Oben Mitte</option>
                  <option value="top-right">Oben Rechts</option>
                  <option value="bottom-left">Unten Links</option>
                  <option value="bottom-center">Unten Mitte</option>
                  <option value="bottom-right">Unten Rechts</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Größe
                </label>
                <select
                  value={formData.logoSize}
                  onChange={(e) => handleChange({ logoSize: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="small">Klein</option>
                  <option value="medium">Mittel</option>
                  <option value="large">Groß</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {onSave && (
          <button
            onClick={handleSave}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold text-white hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2"
          >
            <Save size={20} />
            <span>Speichern</span>
          </button>
        )}
      </div>
    );
  }

  // Preview mode
  const sizeClasses = {
    small: 'text-2xl',
    medium: 'text-4xl',
    large: 'text-6xl'
  };

  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  const logoSizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32'
  };

  const logoPositionClasses = {
    'top-left': 'top-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4'
  };

  return (
    <div className="relative py-12 min-h-[400px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      {formData.backgroundImage && (
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${formData.backgroundImage})`,
            opacity: formData.backgroundOpacity
          }}
        />
      )}

      {/* Logo */}
      {formData.logo && (
        <div className={`absolute ${logoPositionClasses[formData.logoPosition]}`}>
          <img 
            src={formData.logo} 
            alt="Logo" 
            className={`${logoSizeClasses[formData.logoSize]} object-contain`}
          />
        </div>
      )}

      {/* Content */}
      <div className={`relative z-10 px-8 ${alignmentClasses[formData.alignment]}`}>
        <h1 className={`font-bold text-white mb-4 ${sizeClasses[formData.size]} drop-shadow-lg`}>
          {formData.title || 'Titel'}
        </h1>
        {formData.subtitle && (
          <p className="text-xl text-gray-300 drop-shadow-lg">
            {formData.subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

export default TitleTemplate;
