import { useState, useEffect } from 'react';
import { Image as ImageIcon, Video, Save, Upload, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, FolderOpen } from 'lucide-react';
import AssetLibrary from '../AssetLibrary';

function MediaTemplate({ content, onChange, onSave, isEditing }) {
  const [formData, setFormData] = useState({
    mediaType: content?.mediaType || 'image',
    mediaUrl: content?.mediaUrl || '',
    mediaUrls: content?.mediaUrls || [],
    caption: content?.caption || '',
    size: content?.size || 'medium',
    position: content?.position || 'center',
    galleryMode: content?.galleryMode || false,
    zoomEnabled: content?.zoomEnabled || false
  });

  const [currentSlide, setCurrentSlide] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showAssetLibrary, setShowAssetLibrary] = useState(false);
  const [selectingForGallery, setSelectingForGallery] = useState(false);

  useEffect(() => {
    if (content && !isEditing) {
      console.log('[MediaTemplate] 🎬 Content received:', content);
      console.log('[MediaTemplate] 📁 Gallery mode:', content?.galleryMode);
      console.log('[MediaTemplate] 🎥 Media URLs array:', content?.mediaUrls);
      console.log('[MediaTemplate] 📺 Media type:', content?.mediaType);
      console.log('[MediaTemplate] 🔢 URLs count:', content?.mediaUrls?.length || 0);
      
      setFormData({
        mediaType: content?.mediaType || 'image',
        mediaUrl: content?.mediaUrl || '',
        mediaUrls: content?.mediaUrls || [],
        caption: content?.caption || '',
        size: content?.size || 'medium',
        position: content?.position || 'center',
        galleryMode: content?.galleryMode || false,
        zoomEnabled: content?.zoomEnabled || false
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

  // Auto-detect media type from file extension
  const getMediaType = (url) => {
    if (!url) return 'image';
    const ext = url.split('.').pop().toLowerCase().split('?')[0];
    
    if (['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'].includes(ext)) {
      return 'video';
    } else if (['mp3', 'm4a', 'wav', 'aac', 'flac'].includes(ext)) {
      return 'audio';
    } else if (['pdf'].includes(ext)) {
      return 'pdf';
    } else if (['doc', 'docx'].includes(ext)) {
      return 'word';
    } else if (['xls', 'xlsx'].includes(ext)) {
      return 'excel';
    } else if (['ppt', 'pptx'].includes(ext)) {
      return 'powerpoint';
    } else if (['txt', 'rtf', 'md'].includes(ext)) {
      return 'text';
    } else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
      return 'archive';
    } else if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(ext)) {
      return 'image';
    } else {
      return 'file';
    }
  };

  // Get file name from URL
  const getFileName = (url) => {
    if (!url) return 'Datei';
    const parts = url.split('/');
    const fileName = parts[parts.length - 1].split('?')[0];
    return decodeURIComponent(fileName);
  };

  // Get icon and color for document type
  const getDocumentStyle = (type) => {
    switch (type) {
      case 'pdf': return { icon: '📄', color: 'text-red-400', bg: 'bg-red-500/20' };
      case 'word': return { icon: '📝', color: 'text-blue-400', bg: 'bg-blue-500/20' };
      case 'excel': return { icon: '📊', color: 'text-green-400', bg: 'bg-green-500/20' };
      case 'powerpoint': return { icon: '📽️', color: 'text-orange-400', bg: 'bg-orange-500/20' };
      case 'text': return { icon: '📃', color: 'text-gray-400', bg: 'bg-gray-500/20' };
      case 'archive': return { icon: '📦', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
      default: return { icon: '📎', color: 'text-purple-400', bg: 'bg-purple-500/20' };
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-4">
        {/* Gallery Mode Toggle */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.galleryMode}
              onChange={(e) => handleChange({ galleryMode: e.target.checked })}
              className="w-4 h-4 text-purple-500 rounded focus:ring-purple-500"
            />
            <span className="text-sm text-gray-300">Galerie-Modus (Mehrere Medien)</span>
          </label>
        </div>

        {formData.galleryMode ? (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {formData.galleryMode ? 'Medien-URLs (eine pro Zeile)' : 'Medien-URL'}
            </label>
            <div className="space-y-2">
              <textarea
                value={formData.mediaUrls.join('\n')}
                onChange={(e) => handleChange({ mediaUrls: e.target.value.split('\n').filter(url => url.trim()) })}
                placeholder="https://example.com/image1.jpg\nhttps://example.com/image2.jpg"
                rows={5}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => {
                  setSelectingForGallery(true);
                  setShowAssetLibrary(true);
                }}
                className="w-full px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <FolderOpen size={18} />
                Aus Asset Library hinzufügen
              </button>
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Medien-URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.mediaUrl}
                onChange={(e) => handleChange({ mediaUrl: e.target.value })}
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="https://example.com/image.jpg"
              />
              <button
                type="button"
                onClick={() => {
                  setSelectingForGallery(false);
                  setShowAssetLibrary(true);
                }}
                className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-all flex items-center gap-2"
                title="Aus Asset Library wählen"
              >
                <FolderOpen size={18} />
                Assets
              </button>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Bildunterschrift (optional)
          </label>
          <input
            type="text"
            value={formData.caption}
            onChange={(e) => handleChange({ caption: e.target.value })}
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
              onChange={(e) => handleChange({ size: e.target.value })}
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
              onChange={(e) => handleChange({ position: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="left">Links</option>
              <option value="center">Zentriert</option>
              <option value="right">Rechts</option>
            </select>
          </div>
        </div>

        {/* Zoom Controls */}
        {formData.mediaType === 'image' && (
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.zoomEnabled}
                onChange={(e) => handleChange({ zoomEnabled: e.target.checked })}
                className="w-4 h-4 text-purple-500 rounded focus:ring-purple-500"
              />
              <span className="text-sm text-gray-300">Zoom/Pan-Steuerung aktivieren</span>
            </label>
          </div>
        )}

        {onSave && (
          <button
            onClick={handleSave}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold text-white hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2"
          >
            <Save size={20} />
            <span>Speichern</span>
          </button>
        )}

        {/* Asset Library Modal */}
        {showAssetLibrary && (
          <AssetLibrary
            onSelectAsset={(asset) => {
              if (selectingForGallery) {
                handleChange({ mediaUrls: [...formData.mediaUrls, asset.file_path] });
              } else {
                handleChange({ mediaUrl: asset.file_path });
              }
              setShowAssetLibrary(false);
            }}
            onClose={() => setShowAssetLibrary(false)}
            showInsertButton={true}
          />
        )}
      </div>
    );
  }

  // Preview mode
  const sizeClasses = {
    small: 'max-w-md',
    medium: 'max-w-2xl',
    large: 'max-w-4xl',
    full: 'w-full'
  };

  const positionClasses = {
    left: 'mr-auto',
    center: 'mx-auto',
    right: 'ml-auto'
  };

  const handlePrevSlide = () => {
    setCurrentSlide(prev => (prev === 0 ? formData.mediaUrls.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide(prev => (prev === formData.mediaUrls.length - 1 ? 0 : prev + 1));
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 1));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  if (formData.galleryMode && formData.mediaUrls.length > 0) {
    const currentUrl = formData.mediaUrls[currentSlide];
    const currentMediaType = getMediaType(currentUrl);
    
    console.log('[MediaTemplate] ✅ Rendering gallery mode');
    console.log('[MediaTemplate] 📍 Current slide:', currentSlide);
    console.log('[MediaTemplate] 🎯 Current URL:', currentUrl);
    console.log('[MediaTemplate] 📊 Total slides:', formData.mediaUrls.length);
    console.log('[MediaTemplate] 🎬 Auto-detected type:', currentMediaType);
    
    return (
      <div className="py-8">
        <div className={`relative ${sizeClasses[formData.size]} ${positionClasses[formData.position]}`}>
          {/* Gallery Media - Auto-detect type per item */}
          {currentMediaType === 'video' ? (
            <video
              src={currentUrl}
              controls
              className="w-full h-auto rounded-lg shadow-2xl"
              onLoadedData={() => console.log('[MediaTemplate] ✅ Video loaded:', currentUrl)}
              onError={(e) => console.error('[MediaTemplate] ❌ Video failed:', currentUrl, e)}
            >
              Ihr Browser unterstützt das Video-Tag nicht.
            </video>
          ) : currentMediaType === 'audio' ? (
            <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-lg p-8 shadow-2xl">
              <div className="flex items-center justify-center mb-4">
                <div className="w-24 h-24 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <Video size={48} className="text-purple-400" />
                </div>
              </div>
              <audio
                src={currentUrl}
                controls
                className="w-full"
                onLoadedData={() => console.log('[MediaTemplate] ✅ Audio loaded:', currentUrl)}
                onError={(e) => console.error('[MediaTemplate] ❌ Audio failed:', currentUrl, e)}
              >
                Ihr Browser unterstützt das Audio-Tag nicht.
              </audio>
            </div>
          ) : currentMediaType === 'pdf' ? (
            <div className="bg-gradient-to-br from-red-900/30 to-pink-900/30 rounded-lg shadow-2xl overflow-hidden">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">📄</span>
                  <span className="text-white font-medium">{getFileName(currentUrl)}</span>
                </div>
                <a
                  href={currentUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg flex items-center gap-2"
                >
                  <Upload size={16} className="rotate-180" />
                  Download
                </a>
              </div>
              <iframe
                src={currentUrl}
                className="w-full h-[500px] bg-white"
                title={getFileName(currentUrl)}
              />
            </div>
          ) : ['word', 'excel', 'powerpoint', 'text', 'archive', 'file'].includes(currentMediaType) ? (
            <div className={`${getDocumentStyle(currentMediaType).bg} rounded-lg p-8 shadow-2xl`}>
              <div className="flex flex-col items-center justify-center py-8">
                <span className="text-6xl mb-4">{getDocumentStyle(currentMediaType).icon}</span>
                <p className={`text-lg font-medium ${getDocumentStyle(currentMediaType).color} mb-2`}>
                  {getFileName(currentUrl)}
                </p>
                <p className="text-gray-400 text-sm mb-6">
                  {currentMediaType === 'word' && 'Microsoft Word Dokument'}
                  {currentMediaType === 'excel' && 'Microsoft Excel Tabelle'}
                  {currentMediaType === 'powerpoint' && 'Microsoft PowerPoint Präsentation'}
                  {currentMediaType === 'text' && 'Textdatei'}
                  {currentMediaType === 'archive' && 'Archivdatei'}
                  {currentMediaType === 'file' && 'Datei'}
                </p>
                <a
                  href={currentUrl}
                  download
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg flex items-center gap-2 transition-all"
                >
                  <Upload size={18} className="rotate-180" />
                  Herunterladen
                </a>
              </div>
            </div>
          ) : (
            <img
              src={currentUrl}
              alt={`${formData.caption || 'Gallery'} - ${currentSlide + 1}`}
              className="w-full h-auto rounded-lg shadow-2xl"
              onLoad={() => console.log('[MediaTemplate] ✅ Image loaded:', currentUrl)}
              onError={(e) => console.error('[MediaTemplate] ❌ Image failed:', currentUrl, e)}
            />
          )}

          {/* Navigation Arrows */}
          {formData.mediaUrls.length > 1 && (
            <>
              <button
                onClick={handlePrevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={handleNextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all"
              >
                <ChevronRight size={24} />
              </button>

              {/* Slide Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {formData.mediaUrls.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentSlide
                        ? 'bg-white w-8'
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Caption */}
          {formData.caption && (
            <div className="absolute bottom-12 left-0 right-0 text-center">
              <p className="inline-block bg-black/70 text-white px-4 py-2 rounded-lg">
                {formData.caption} ({currentSlide + 1}/{formData.mediaUrls.length})
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Single media mode
  const singleMediaType = getMediaType(formData.mediaUrl);
  console.log('[MediaTemplate] 📺 Single media mode, type:', singleMediaType);
  
  return (
    <div className="py-8">
      <div className={`relative ${sizeClasses[formData.size]} ${positionClasses[formData.position]}`}>
        {/* Zoom Controls */}
        {formData.zoomEnabled && singleMediaType === 'image' && formData.mediaUrl && (
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <button
              onClick={handleZoomOut}
              disabled={zoomLevel <= 1}
              className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-all disabled:opacity-30"
              title="Zoom Out"
            >
              <ZoomOut size={20} />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-all"
              title="Reset Zoom"
            >
              <Maximize2 size={20} />
            </button>
            <button
              onClick={handleZoomIn}
              disabled={zoomLevel >= 3}
              className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-all disabled:opacity-30"
              title="Zoom In"
            >
              <ZoomIn size={20} />
            </button>
          </div>
        )}

        {/* Media - Auto-detect type */}
        <div className="overflow-hidden rounded-lg">
          {singleMediaType === 'video' ? (
            <video
              src={formData.mediaUrl}
              controls
              className="w-full h-auto rounded-lg shadow-2xl"
            >
              Ihr Browser unterstützt das Video-Tag nicht.
            </video>
          ) : singleMediaType === 'audio' ? (
            <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-lg p-8 shadow-2xl">
              <div className="flex items-center justify-center mb-4">
                <div className="w-24 h-24 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <Video size={48} className="text-purple-400" />
                </div>
              </div>
              <audio
                src={formData.mediaUrl}
                controls
                className="w-full"
              >
                Ihr Browser unterstützt das Audio-Tag nicht.
              </audio>
            </div>
          ) : (
            <img
              src={formData.mediaUrl}
              alt={formData.caption || 'Media'}
              className="w-full h-auto shadow-2xl transition-transform duration-300"
              style={{
                transform: `scale(${zoomLevel})`,
                cursor: formData.zoomEnabled ? 'zoom-in' : 'default'
              }}
            />
          )}
        </div>

        {formData.caption && (
          <p className="text-center text-gray-300 mt-4 text-lg">
            {formData.caption}
          </p>
        )}
      </div>
    </div>
  );
}

export default MediaTemplate;
