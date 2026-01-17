import { useState } from 'react';
import { Image as ImageIcon, Video, Save, Upload } from 'lucide-react';

function MediaTemplate({ content, onSave, isEditing }) {
  const [formData, setFormData] = useState({
    mediaType: content?.mediaType || 'image',
    mediaUrl: content?.mediaUrl || '',
    caption: content?.caption || '',
    size: content?.size || 'medium',
    position: content?.position || 'center'
  });

  const handleSave = () => {
    onSave(formData);
  };

  if (isEditing) {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Medientyp
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => setFormData({ ...formData, mediaType: 'image' })}
              className={`flex-1 px-4 py-3 rounded-lg border transition-all flex items-center justify-center gap-2 ${
                formData.mediaType === 'image'
                  ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
              }`}
            >
              <ImageIcon size={20} />
              <span>Bild</span>
            </button>
            <button
              onClick={() => setFormData({ ...formData, mediaType: 'video' })}
              className={`flex-1 px-4 py-3 rounded-lg border transition-all flex items-center justify-center gap-2 ${
                formData.mediaType === 'video'
                  ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
              }`}
            >
              <Video size={20} />
              <span>Video</span>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Medien-URL
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.mediaUrl}
              onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="https://example.com/image.jpg"
            />
            <button className="px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all flex items-center gap-2">
              <Upload size={18} />
              <span>Upload</span>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Bildunterschrift (optional)
          </label>
          <input
            type="text"
            value={formData.caption}
            onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Beschreibung des Mediums"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Größe
            </label>
            <select
              value={formData.size}
              onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="small">Klein</option>
              <option value="medium">Mittel</option>
              <option value="large">Groß</option>
              <option value="full">Vollbild</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Position
            </label>
            <select
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="left">Links</option>
              <option value="center">Zentriert</option>
              <option value="right">Rechts</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold text-white hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2"
        >
          <Save size={20} />
          <span>Speichern</span>
        </button>
      </div>
    );
  }

  // Preview mode
  const sizeClasses = {
    small: 'max-w-sm',
    medium: 'max-w-2xl',
    large: 'max-w-4xl',
    full: 'w-full'
  };

  const positionClasses = {
    left: 'mr-auto',
    center: 'mx-auto',
    right: 'ml-auto'
  };

  return (
    <div className={`${sizeClasses[formData.size]} ${positionClasses[formData.position]}`}>
      {formData.mediaType === 'image' ? (
        <div className="bg-white/5 rounded-lg overflow-hidden">
          {formData.mediaUrl ? (
            <img src={formData.mediaUrl} alt={formData.caption} className="w-full h-auto" />
          ) : (
            <div className="aspect-video flex items-center justify-center bg-white/10">
              <ImageIcon size={48} className="text-gray-600" />
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white/5 rounded-lg overflow-hidden">
          {formData.mediaUrl ? (
            <video src={formData.mediaUrl} controls className="w-full h-auto" />
          ) : (
            <div className="aspect-video flex items-center justify-center bg-white/10">
              <Video size={48} className="text-gray-600" />
            </div>
          )}
        </div>
      )}
      {formData.caption && (
        <p className="text-center text-gray-400 text-sm mt-3">{formData.caption}</p>
      )}
    </div>
  );
}

export default MediaTemplate;
