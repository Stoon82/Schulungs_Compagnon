import { useState, useCallback } from 'react';
import { Upload, X, Image, Video, FileText, CheckCircle, AlertCircle } from 'lucide-react';

/**
 * MediaUploadModal - Drag-and-drop file upload with progress tracking
 * Supports images, videos, audio, and documents
 */
function MediaUploadModal({ onClose, onUploadComplete }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [dragActive, setDragActive] = useState(false);

  const maxFileSize = 100 * 1024 * 1024; // 100MB
  const allowedTypes = {
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    video: ['video/mp4', 'video/webm', 'video/quicktime'],
    audio: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
    document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (newFiles) => {
    const validFiles = newFiles.filter(file => {
      // Check file size
      if (file.size > maxFileSize) {
        alert(`${file.name} ist zu groß (max. 100MB)`);
        return false;
      }

      // Check file type
      const allAllowedTypes = Object.values(allowedTypes).flat();
      if (!allAllowedTypes.includes(file.type)) {
        alert(`${file.name} hat einen nicht unterstützten Dateityp`);
        return false;
      }

      return true;
    });

    setFiles(prev => [...prev, ...validFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending', // 'pending', 'uploading', 'success', 'error'
      progress: 0,
      description: '',
      tags: []
    }))]);
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const updateFileMetadata = (id, field, value) => {
    setFiles(prev => prev.map(f => 
      f.id === id ? { ...f, [field]: value } : f
    ));
  };

  const uploadFiles = async () => {
    setUploading(true);

    for (const fileItem of files) {
      if (fileItem.status === 'success') continue;

      try {
        // Update status
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { ...f, status: 'uploading' } : f
        ));

        const formData = new FormData();
        formData.append('file', fileItem.file);
        formData.append('description', fileItem.description);
        formData.append('tags', JSON.stringify(fileItem.tags));

        const xhr = new XMLHttpRequest();

        // Track upload progress
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(prev => ({ ...prev, [fileItem.id]: progress }));
          }
        });

        // Handle completion
        await new Promise((resolve, reject) => {
          xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
              const response = JSON.parse(xhr.responseText);
              if (response.success) {
                setFiles(prev => prev.map(f => 
                  f.id === fileItem.id ? { ...f, status: 'success' } : f
                ));
                resolve();
              } else {
                reject(new Error(response.error || 'Upload failed'));
              }
            } else {
              reject(new Error(`HTTP ${xhr.status}`));
            }
          });

          xhr.addEventListener('error', () => {
            reject(new Error('Network error'));
          });

          xhr.open('POST', '/api/media/upload');
          xhr.send(formData);
        });

      } catch (error) {
        console.error('Upload error:', error);
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { ...f, status: 'error', error: error.message } : f
        ));
      }
    }

    setUploading(false);
    
    // Check if all uploads succeeded
    const allSuccess = files.every(f => f.status === 'success');
    if (allSuccess && onUploadComplete) {
      onUploadComplete();
    }
  };

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) return Image;
    if (file.type.startsWith('video/')) return Video;
    return FileText;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-black/30 backdrop-blur-lg border-b border-white/10 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Media Upload</h2>
              <p className="text-sm text-gray-400">
                {files.length} {files.length === 1 ? 'Datei' : 'Dateien'} ausgewählt
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all flex items-center gap-2"
            >
              <X size={18} />
              Schließen
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Drag & Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 mb-6 transition-all ${
              dragActive
                ? 'border-purple-500 bg-purple-500/10'
                : 'border-white/20 bg-white/5 hover:border-white/40'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="text-center">
              <Upload size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-white font-medium mb-2">
                Dateien hierher ziehen oder klicken zum Auswählen
              </p>
              <p className="text-sm text-gray-400 mb-4">
                Unterstützt: Bilder, Videos, Audio, PDFs (max. 100MB)
              </p>
              <input
                type="file"
                multiple
                onChange={handleFileInput}
                className="hidden"
                id="file-upload"
                accept="image/*,video/*,audio/*,.pdf"
              />
              <label
                htmlFor="file-upload"
                className="inline-block px-6 py-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-all cursor-pointer"
              >
                Dateien auswählen
              </label>
            </div>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white mb-3">Ausgewählte Dateien</h3>
              {files.map(fileItem => {
                const Icon = getFileIcon(fileItem.file);
                const progress = uploadProgress[fileItem.id] || 0;

                return (
                  <div
                    key={fileItem.id}
                    className="bg-white/5 border border-white/10 rounded-lg p-4"
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="w-12 h-12 bg-black/20 rounded flex items-center justify-center flex-shrink-0">
                        <Icon size={24} className="text-gray-400" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-white font-medium truncate">{fileItem.file.name}</p>
                          <div className="flex items-center gap-2">
                            {fileItem.status === 'success' && (
                              <CheckCircle size={20} className="text-green-400" />
                            )}
                            {fileItem.status === 'error' && (
                              <AlertCircle size={20} className="text-red-400" />
                            )}
                            {fileItem.status === 'pending' && (
                              <button
                                onClick={() => removeFile(fileItem.id)}
                                className="p-1 hover:bg-red-500/20 text-red-400 rounded transition-all"
                              >
                                <X size={18} />
                              </button>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-gray-400 mb-2">
                          {formatFileSize(fileItem.file.size)} • {fileItem.file.type}
                        </p>

                        {/* Progress Bar */}
                        {fileItem.status === 'uploading' && (
                          <div className="mb-2">
                            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">{progress}%</p>
                          </div>
                        )}

                        {/* Error Message */}
                        {fileItem.status === 'error' && (
                          <p className="text-xs text-red-400 mb-2">{fileItem.error}</p>
                        )}

                        {/* Metadata Inputs */}
                        {fileItem.status === 'pending' && (
                          <div className="space-y-2 mt-3">
                            <input
                              type="text"
                              value={fileItem.description}
                              onChange={(e) => updateFileMetadata(fileItem.id, 'description', e.target.value)}
                              placeholder="Beschreibung (optional)"
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                            />
                            <input
                              type="text"
                              value={fileItem.tags.join(', ')}
                              onChange={(e) => updateFileMetadata(fileItem.id, 'tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                              placeholder="Tags (kommagetrennt)"
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {files.length > 0 && (
          <div className="bg-black/30 border-t border-white/10 px-6 py-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">
                {files.filter(f => f.status === 'success').length} von {files.length} hochgeladen
              </p>
              <button
                onClick={uploadFiles}
                disabled={uploading || files.every(f => f.status === 'success')}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold text-white hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Upload size={20} />
                {uploading ? 'Wird hochgeladen...' : 'Hochladen'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MediaUploadModal;
