import { useState, useEffect } from 'react';
import { Save, Code, Youtube, Video, ExternalLink } from 'lucide-react';

function EmbedTemplate({ content, onChange, onSave, isEditing }) {
  const [formData, setFormData] = useState({
    title: content?.title || '',
    embedType: content?.embedType || 'custom',
    embedUrl: content?.embedUrl || '',
    aspectRatio: content?.aspectRatio || '16:9',
    allowFullscreen: content?.allowFullscreen !== false,
    sandbox: content?.sandbox || 'allow-scripts allow-same-origin'
  });

  useEffect(() => {
    if (content && !isEditing) {
      setFormData({
        title: content?.title || '',
        embedType: content?.embedType || 'custom',
        embedUrl: content?.embedUrl || '',
        aspectRatio: content?.aspectRatio || '16:9',
        allowFullscreen: content?.allowFullscreen !== false,
        sandbox: content?.sandbox || 'allow-scripts allow-same-origin'
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

  const detectEmbedType = (url) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'youtube';
    } else if (url.includes('vimeo.com')) {
      return 'vimeo';
    } else if (url.includes('codepen.io')) {
      return 'codepen';
    } else if (url.includes('codesandbox.io')) {
      return 'codesandbox';
    } else if (url.includes('figma.com')) {
      return 'figma';
    }
    return 'custom';
  };

  const formatEmbedUrl = (url, type) => {
    if (!url) return '';

    switch (type) {
      case 'youtube': {
        const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)?.[1];
        return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
      }
      case 'vimeo': {
        const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
        return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
      }
      case 'codepen': {
        const penId = url.match(/codepen\.io\/[^\/]+\/pen\/([^\/\?]+)/)?.[1];
        const username = url.match(/codepen\.io\/([^\/]+)\/pen/)?.[1];
        return penId && username ? `https://codepen.io/${username}/embed/${penId}?default-tab=result` : url;
      }
      case 'codesandbox': {
        const sandboxId = url.match(/codesandbox\.io\/s\/([^\/\?]+)/)?.[1];
        return sandboxId ? `https://codesandbox.io/embed/${sandboxId}` : url;
      }
      case 'figma': {
        return url.includes('embed') ? url : url.replace('figma.com/file', 'figma.com/embed');
      }
      default:
        return url;
    }
  };

  const handleUrlChange = (url) => {
    const detectedType = detectEmbedType(url);
    handleChange({
      embedUrl: url,
      embedType: detectedType
    });
  };

  if (isEditing) {
    return (
      <div className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Titel (optional)
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange({ title: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="z.B. Video-Tutorial"
          />
        </div>

        {/* Embed Type */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Embed-Typ
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'youtube', label: 'YouTube', icon: Youtube },
              { value: 'vimeo', label: 'Vimeo', icon: Video },
              { value: 'codepen', label: 'CodePen', icon: Code },
              { value: 'codesandbox', label: 'CodeSandbox', icon: Code },
              { value: 'figma', label: 'Figma', icon: ExternalLink },
              { value: 'custom', label: 'Custom', icon: ExternalLink }
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => handleChange({ embedType: value })}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  formData.embedType === value
                    ? 'bg-purple-500/30 text-purple-400 border border-purple-500/50'
                    : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* URL Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            URL
          </label>
          <input
            type="text"
            value={formData.embedUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="https://..."
          />
          <p className="text-xs text-gray-400 mt-1">
            💡 URL wird automatisch für {formData.embedType} formatiert
          </p>
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Seitenverhältnis
            </label>
            <select
              value={formData.aspectRatio}
              onChange={(e) => handleChange({ aspectRatio: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="16:9">16:9 (Standard)</option>
              <option value="4:3">4:3 (Klassisch)</option>
              <option value="21:9">21:9 (Ultrawide)</option>
              <option value="1:1">1:1 (Quadrat)</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.allowFullscreen}
                onChange={(e) => handleChange({ allowFullscreen: e.target.checked })}
                className="w-4 h-4 text-purple-500 rounded focus:ring-purple-500"
              />
              <span className="text-sm text-gray-300">Vollbild erlauben</span>
            </label>
          </div>
        </div>

        {/* Sandbox Settings */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Sicherheitseinstellungen (Sandbox)
          </label>
          <select
            value={formData.sandbox}
            onChange={(e) => handleChange({ sandbox: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          >
            <option value="allow-scripts allow-same-origin">Standard (Scripts + Same-Origin)</option>
            <option value="allow-scripts allow-same-origin allow-forms">+ Formulare</option>
            <option value="allow-scripts allow-same-origin allow-popups">+ Popups</option>
            <option value="">Streng (Keine Berechtigungen)</option>
          </select>
          <p className="text-xs text-gray-400 mt-1">
            🔒 Sandbox-Attribute schützen vor schädlichem Code
          </p>
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
  const aspectRatioMap = {
    '16:9': 'pb-[56.25%]',
    '4:3': 'pb-[75%]',
    '21:9': 'pb-[42.86%]',
    '1:1': 'pb-[100%]'
  };

  const formattedUrl = formatEmbedUrl(formData.embedUrl, formData.embedType);

  return (
    <div className="p-6">
      {formData.title && (
        <h2 className="text-2xl font-bold text-white mb-4">{formData.title}</h2>
      )}

      {formattedUrl ? (
        <div className="relative w-full overflow-hidden rounded-lg bg-black/30">
          <div className={`relative ${aspectRatioMap[formData.aspectRatio]}`}>
            <iframe
              src={formattedUrl}
              className="absolute inset-0 w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen={formData.allowFullscreen}
              sandbox={formData.sandbox}
              title={formData.title || 'Eingebetteter Inhalt'}
              loading="lazy"
            />
          </div>
        </div>
      ) : (
        <div className="bg-white/5 rounded-lg p-12 text-center border border-white/10">
          <Globe size={48} className="mx-auto mb-4 text-gray-500" />
          <p className="text-gray-400">Keine URL konfiguriert</p>
        </div>
      )}
    </div>
  );
}

export default EmbedTemplate;
