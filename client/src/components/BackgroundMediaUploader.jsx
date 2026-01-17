import { useState, useRef } from 'react';
import { Upload, Image, Video, X, Eye, EyeOff } from 'lucide-react';

/**
 * BackgroundMediaUploader - Upload and configure background images/videos
 * Includes positioning, overlay, and blur controls
 */
function BackgroundMediaUploader({ 
  currentBackground = {},
  onSave,
  entityType = 'global', // 'global', 'class', 'module', 'submodule'
  entityId = null
}) {
  const [background, setBackground] = useState({
    type: currentBackground.type || 'none', // 'none', 'image', 'video'
    url: currentBackground.url || '',
    position: currentBackground.position || 'center', // 'center', 'top', 'bottom', 'left', 'right'
    size: currentBackground.size || 'cover', // 'cover', 'contain', 'auto'
    repeat: currentBackground.repeat || 'no-repeat',
    overlay: currentBackground.overlay || 0.5, // 0-1
    blur: currentBackground.blur || 0, // 0-10
    fixed: currentBackground.fixed || false
  });

  const [preview, setPreview] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      alert('Bitte wählen Sie ein Bild oder Video aus');
      return;
    }

    // Create FormData for upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('entityType', entityType);
    if (entityId) formData.append('entityId', entityId);

    try {
      const response = await fetch('/api/themes/background/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setBackground(prev => ({
          ...prev,
          type: isImage ? 'image' : 'video',
          url: data.data.url
        }));
      } else {
        alert('Fehler beim Hochladen der Datei');
      }
    } catch (error) {
      console.error('Error uploading background:', error);
      alert('Fehler beim Hochladen der Datei');
    }
  };

  const handleChange = (key, value) => {
    setBackground(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(background);
    }
  };

  const handleRemove = () => {
    setBackground({
      type: 'none',
      url: '',
      position: 'center',
      size: 'cover',
      repeat: 'no-repeat',
      overlay: 0.5,
      blur: 0,
      fixed: false
    });
  };

  const positions = [
    { value: 'center', label: 'Zentriert' },
    { value: 'top', label: 'Oben' },
    { value: 'bottom', label: 'Unten' },
    { value: 'left', label: 'Links' },
    { value: 'right', label: 'Rechts' }
  ];

  const sizes = [
    { value: 'cover', label: 'Ausfüllen' },
    { value: 'contain', label: 'Einpassen' },
    { value: 'auto', label: 'Original' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Hintergrund-Medien</h3>
        <button
          onClick={() => setPreview(!preview)}
          className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all flex items-center gap-2 text-sm"
        >
          {preview ? <EyeOff size={16} /> : <Eye size={16} />}
          {preview ? 'Vorschau ausblenden' : 'Vorschau anzeigen'}
        </button>
      </div>

      {/* Upload Section */}
      <div className="space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-6 bg-white/5 hover:bg-white/10 border-2 border-dashed border-white/20 rounded-lg transition-all flex flex-col items-center gap-3"
          >
            <Image size={32} className="text-gray-400" />
            <span className="text-white font-medium">Bild hochladen</span>
            <span className="text-xs text-gray-400">JPG, PNG, WebP</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-6 bg-white/5 hover:bg-white/10 border-2 border-dashed border-white/20 rounded-lg transition-all flex flex-col items-center gap-3"
          >
            <Video size={32} className="text-gray-400" />
            <span className="text-white font-medium">Video hochladen</span>
            <span className="text-xs text-gray-400">MP4, WebM</span>
          </button>
        </div>

        {/* URL Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Oder URL eingeben
          </label>
          <input
            type="text"
            value={background.url}
            onChange={(e) => handleChange('url', e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Configuration */}
      {background.type !== 'none' && background.url && (
        <div className="space-y-4 p-4 bg-white/5 border border-white/10 rounded-lg">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-white">Konfiguration</h4>
            <button
              onClick={handleRemove}
              className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-all"
              title="Hintergrund entfernen"
            >
              <X size={16} />
            </button>
          </div>

          {/* Position */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Position
            </label>
            <select
              value={background.position}
              onChange={(e) => handleChange('position', e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {positions.map(pos => (
                <option key={pos.value} value={pos.value}>{pos.label}</option>
              ))}
            </select>
          </div>

          {/* Size */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Größe
            </label>
            <select
              value={background.size}
              onChange={(e) => handleChange('size', e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {sizes.map(size => (
                <option key={size.value} value={size.value}>{size.label}</option>
              ))}
            </select>
          </div>

          {/* Overlay Opacity */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Overlay-Deckkraft: {Math.round(background.overlay * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={background.overlay}
              onChange={(e) => handleChange('overlay', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Blur */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Unschärfe: {background.blur}px
            </label>
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={background.blur}
              onChange={(e) => handleChange('blur', parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Fixed Background */}
          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={background.fixed}
              onChange={(e) => handleChange('fixed', e.target.checked)}
              className="w-5 h-5 rounded border-white/20 bg-white/5 text-purple-500"
            />
            Fester Hintergrund (scrollt nicht mit)
          </label>
        </div>
      )}

      {/* Preview */}
      {preview && background.url && (
        <div className="relative h-64 rounded-lg overflow-hidden border border-white/10">
          {background.type === 'image' && (
            <img
              src={background.url}
              alt="Background preview"
              className="w-full h-full object-cover"
              style={{
                objectPosition: background.position,
                objectFit: background.size,
                filter: `blur(${background.blur}px)`
              }}
            />
          )}
          {background.type === 'video' && (
            <video
              src={background.url}
              autoPlay
              loop
              muted
              className="w-full h-full object-cover"
              style={{
                objectPosition: background.position,
                objectFit: background.size,
                filter: `blur(${background.blur}px)`
              }}
            />
          )}
          <div
            className="absolute inset-0 bg-black"
            style={{ opacity: background.overlay }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-white text-lg font-semibold">Vorschau-Text</p>
          </div>
        </div>
      )}

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold text-white hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2"
      >
        <Upload size={20} />
        Speichern
      </button>
    </div>
  );
}

export default BackgroundMediaUploader;
