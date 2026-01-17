import { useState, useEffect } from 'react';
import { Search, Filter, Upload, Image, Video, FileText, Music, Download, Trash2, Eye, Tag, Calendar, HardDrive } from 'lucide-react';
import MediaUploadModal from './MediaUploadModal';

/**
 * AssetLibrary - Comprehensive media asset management
 * Features: search, filtering, preview, metadata display
 */
function AssetLibrary({ onSelectAsset, onClose, showInsertButton = true }) {
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedTags, setSelectedTags] = useState([]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const fileTypes = [
    { value: 'all', label: 'Alle Dateien', icon: FileText },
    { value: 'image', label: 'Bilder', icon: Image },
    { value: 'video', label: 'Videos', icon: Video },
    { value: 'audio', label: 'Audio', icon: Music },
    { value: 'document', label: 'Dokumente', icon: FileText }
  ];

  useEffect(() => {
    loadAssets();
  }, []);

  useEffect(() => {
    filterAssets();
  }, [assets, searchQuery, selectedType, selectedTags, dateRange]);

  const loadAssets = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/media/assets');
      const data = await response.json();
      
      if (data.success) {
        setAssets(data.data);
      }
    } catch (error) {
      console.error('Error loading assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAssets = () => {
    let filtered = [...assets];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(asset =>
        asset.original_filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(asset => asset.file_type === selectedType);
    }

    // Tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(asset => {
        const assetTags = asset.tags ? JSON.parse(asset.tags) : [];
        return selectedTags.some(tag => assetTags.includes(tag));
      });
    }

    // Date range filter
    if (dateRange.start) {
      filtered = filtered.filter(asset =>
        new Date(asset.uploaded_at) >= new Date(dateRange.start)
      );
    }
    if (dateRange.end) {
      filtered = filtered.filter(asset =>
        new Date(asset.uploaded_at) <= new Date(dateRange.end)
      );
    }

    setFilteredAssets(filtered);
  };

  const handleDeleteAsset = async (assetId) => {
    if (!confirm('Asset wirklich löschen?')) return;

    try {
      const response = await fetch(`/api/media/assets/${assetId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.success) {
        loadAssets();
      }
    } catch (error) {
      console.error('Error deleting asset:', error);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'image': return Image;
      case 'video': return Video;
      case 'audio': return Music;
      case 'document': return FileText;
      default: return FileText;
    }
  };

  const allTags = [...new Set(
    assets.flatMap(asset => asset.tags ? JSON.parse(asset.tags) : [])
  )];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-white/10 w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-black/30 backdrop-blur-lg border-b border-white/10 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Asset Library</h2>
              <p className="text-sm text-gray-400">
                {filteredAssets.length} von {assets.length} Assets
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-all flex items-center gap-2"
              >
                <Upload size={18} />
                <span>Upload</span>
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all"
                >
                  Schließen
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-black/20 border-b border-white/10 px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Assets durchsuchen..."
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {fileTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                  viewMode === 'list'
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                Liste
              </button>
            </div>
          </div>

          {/* Tag Filter */}
          {allTags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Tag size={14} />
                Tags:
              </span>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => {
                    if (selectedTags.includes(tag)) {
                      setSelectedTags(selectedTags.filter(t => t !== tag));
                    } else {
                      setSelectedTags([...selectedTags, tag]);
                    }
                  }}
                  className={`px-2 py-1 rounded text-xs transition-all ${
                    selectedTags.includes(tag)
                      ? 'bg-purple-500/30 text-purple-400 border border-purple-500/50'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Assets Grid/List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <FileText size={64} className="mb-4 opacity-50" />
              <p className="text-lg">Keine Assets gefunden</p>
              <p className="text-sm">Versuchen Sie, die Filter anzupassen</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredAssets.map(asset => {
                const Icon = getFileIcon(asset.file_type);
                return (
                  <div
                    key={asset.id}
                    className="bg-white/5 border border-white/10 rounded-lg overflow-hidden hover:border-purple-500/50 transition-all cursor-pointer group"
                    onClick={() => setSelectedAsset(asset)}
                  >
                    {/* Thumbnail */}
                    <div className="aspect-square bg-black/20 flex items-center justify-center relative">
                      {asset.file_type === 'image' ? (
                        <img
                          src={asset.thumbnail_path || asset.file_path}
                          alt={asset.original_filename}
                          className="w-full h-full object-cover"
                        />
                      ) : asset.file_type === 'video' ? (
                        <div className="relative w-full h-full">
                          {asset.thumbnail_path ? (
                            <img
                              src={asset.thumbnail_path}
                              alt={asset.original_filename}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Video size={48} className="text-gray-600" />
                            </div>
                          )}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                              <div className="w-0 h-0 border-l-8 border-l-white border-y-6 border-y-transparent ml-1"></div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <Icon size={48} className="text-gray-600" />
                      )}
                      
                      {/* Hover Actions */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAsset(asset);
                          }}
                          className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all"
                          title="Vorschau"
                        >
                          <Eye size={18} className="text-white" />
                        </button>
                        {showInsertButton && onSelectAsset && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectAsset(asset);
                            }}
                            className="p-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg transition-all"
                            title="Einfügen"
                          >
                            <Download size={18} className="text-green-400" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAsset(asset.id);
                          }}
                          className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-all"
                          title="Löschen"
                        >
                          <Trash2 size={18} className="text-red-400" />
                        </button>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      <p className="text-sm text-white font-medium truncate" title={asset.original_filename}>
                        {asset.original_filename}
                      </p>
                      <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                        <span>{formatFileSize(asset.file_size)}</span>
                        {asset.width && asset.height && (
                          <span>{asset.width}×{asset.height}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredAssets.map(asset => {
                const Icon = getFileIcon(asset.file_type);
                return (
                  <div
                    key={asset.id}
                    className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-purple-500/50 transition-all cursor-pointer flex items-center gap-4"
                    onClick={() => setSelectedAsset(asset)}
                  >
                    <div className="w-16 h-16 bg-black/20 rounded flex items-center justify-center flex-shrink-0">
                      {asset.file_type === 'image' ? (
                        <img
                          src={asset.thumbnail_path || asset.file_path}
                          alt={asset.original_filename}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <Icon size={32} className="text-gray-600" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{asset.original_filename}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <HardDrive size={12} />
                          {formatFileSize(asset.file_size)}
                        </span>
                        {asset.width && asset.height && (
                          <span>{asset.width}×{asset.height}</span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(asset.uploaded_at).toLocaleDateString('de-DE')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {showInsertButton && onSelectAsset && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectAsset(asset);
                          }}
                          className="px-3 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-all text-sm"
                        >
                          Einfügen
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAsset(asset.id);
                        }}
                        className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Asset Preview Modal */}
        {selectedAsset && (
          <AssetPreviewModal
            asset={selectedAsset}
            onClose={() => setSelectedAsset(null)}
            onInsert={showInsertButton && onSelectAsset ? () => {
              onSelectAsset(selectedAsset);
              setSelectedAsset(null);
            } : null}
          />
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <MediaUploadModal
            onClose={() => setShowUploadModal(false)}
            onUploadComplete={() => {
              setShowUploadModal(false);
              loadAssets();
            }}
          />
        )}
      </div>
    </div>
  );
}

// Asset Preview Modal Component
function AssetPreviewModal({ asset, onClose, onInsert }) {
  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-10">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-white/10 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-black/30 border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">{asset.original_filename}</h3>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all"
          >
            Schließen
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Preview */}
          <div className="bg-black/20 rounded-lg p-4 mb-6 flex items-center justify-center min-h-[300px]">
            {asset.file_type === 'image' && (
              <img
                src={asset.file_path}
                alt={asset.original_filename}
                className="max-w-full max-h-[500px] object-contain"
              />
            )}
            {asset.file_type === 'video' && (
              <video
                src={asset.file_path}
                controls
                className="max-w-full max-h-[500px]"
              />
            )}
            {asset.file_type === 'audio' && (
              <audio src={asset.file_path} controls className="w-full" />
            )}
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400 mb-1">Dateityp</p>
              <p className="text-white">{asset.mime_type}</p>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Dateigröße</p>
              <p className="text-white">{(asset.file_size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            {asset.width && asset.height && (
              <div>
                <p className="text-gray-400 mb-1">Abmessungen</p>
                <p className="text-white">{asset.width} × {asset.height} px</p>
              </div>
            )}
            {asset.duration && (
              <div>
                <p className="text-gray-400 mb-1">Dauer</p>
                <p className="text-white">{Math.floor(asset.duration / 60)}:{(asset.duration % 60).toFixed(0).padStart(2, '0')}</p>
              </div>
            )}
            <div>
              <p className="text-gray-400 mb-1">Hochgeladen am</p>
              <p className="text-white">{new Date(asset.uploaded_at).toLocaleString('de-DE')}</p>
            </div>
            {asset.uploaded_by && (
              <div>
                <p className="text-gray-400 mb-1">Hochgeladen von</p>
                <p className="text-white">{asset.uploaded_by}</p>
              </div>
            )}
          </div>

          {asset.description && (
            <div className="mt-4">
              <p className="text-gray-400 mb-1">Beschreibung</p>
              <p className="text-white">{asset.description}</p>
            </div>
          )}
        </div>

        {onInsert && (
          <div className="bg-black/30 border-t border-white/10 px-6 py-4">
            <button
              onClick={onInsert}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold text-white hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              In Modul einfügen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Placeholder for MediaUploadModal (to be implemented)
function MediaUploadModal({ onClose, onUploadComplete }) {
  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-10">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-white/10 max-w-2xl w-full p-6">
        <h3 className="text-xl font-bold text-white mb-4">Media Upload</h3>
        <p className="text-gray-400 mb-4">Upload functionality will be implemented next...</p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all"
        >
          Schließen
        </button>
      </div>
    </div>
  );
}

export default AssetLibrary;
