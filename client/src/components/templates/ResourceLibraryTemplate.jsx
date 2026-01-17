import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, FileText, Link as LinkIcon, Search, Folder, Download, ExternalLink, FolderOpen } from 'lucide-react';
import AssetLibrary from '../AssetLibrary';

function ResourceLibraryTemplate({ content, onChange, onSave, isEditing }) {
  const [formData, setFormData] = useState({
    title: content?.title || '',
    description: content?.description || '',
    categories: content?.categories || [
      {
        name: 'Dokumente',
        resources: []
      }
    ],
    searchable: content?.searchable !== false
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [showAssetLibrary, setShowAssetLibrary] = useState(false);
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(null);
  const [selectedResourceIndex, setSelectedResourceIndex] = useState(null);

  useEffect(() => {
    if (content && !isEditing) {
      setFormData({
        title: content?.title || '',
        description: content?.description || '',
        categories: content?.categories || [
          {
            name: 'Dokumente',
            resources: []
          }
        ],
        searchable: content?.searchable !== false
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

  const addCategory = () => {
    const categoryName = prompt('Kategorie-Name:');
    if (categoryName && categoryName.trim()) {
      handleChange({
        categories: [...formData.categories, { name: categoryName.trim(), resources: [] }]
      });
    }
  };

  const removeCategory = (index) => {
    if (formData.categories.length <= 1) {
      alert('Mindestens eine Kategorie erforderlich');
      return;
    }
    handleChange({
      categories: formData.categories.filter((_, i) => i !== index)
    });
  };

  const updateCategoryName = (index, name) => {
    const newCategories = [...formData.categories];
    newCategories[index].name = name;
    handleChange({ categories: newCategories });
  };

  const addResource = (categoryIndex) => {
    const newCategories = [...formData.categories];
    newCategories[categoryIndex].resources.push({
      title: '',
      type: 'file',
      url: '',
      description: '',
      fileType: 'pdf'
    });
    handleChange({ categories: newCategories });
  };

  const removeResource = (categoryIndex, resourceIndex) => {
    const newCategories = [...formData.categories];
    newCategories[categoryIndex].resources = newCategories[categoryIndex].resources.filter(
      (_, i) => i !== resourceIndex
    );
    handleChange({ categories: newCategories });
  };

  const updateResource = (categoryIndex, resourceIndex, field, value) => {
    const newCategories = [...formData.categories];
    newCategories[categoryIndex].resources[resourceIndex][field] = value;
    handleChange({ categories: newCategories });
  };

  if (isEditing) {
    return (
      <div className="space-y-4">
        {/* Title & Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Bibliotheks-Titel
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange({ title: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="z.B. Lernressourcen"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Beschreibung (optional)
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange({ description: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            rows="2"
            placeholder="Kurze Beschreibung der Ressourcen"
          />
        </div>

        {/* Options */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.searchable}
              onChange={(e) => handleChange({ searchable: e.target.checked })}
              className="w-4 h-4 text-purple-500 rounded focus:ring-purple-500"
            />
            <span className="text-sm text-gray-300">Suchfunktion aktivieren</span>
          </label>
        </div>

        {/* Categories */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-300">
              Kategorien & Ressourcen
            </label>
            <button
              onClick={addCategory}
              className="px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-all text-sm flex items-center gap-1"
            >
              <Plus size={16} />
              Kategorie
            </button>
          </div>

          <div className="space-y-4">
            {formData.categories.map((category, catIndex) => (
              <div
                key={catIndex}
                className="bg-white/5 border border-white/10 rounded-lg p-4"
              >
                {/* Category Header */}
                <div className="flex items-center gap-2 mb-3">
                  <Folder size={18} className="text-purple-400" />
                  <input
                    type="text"
                    value={category.name}
                    onChange={(e) => updateCategoryName(catIndex, e.target.value)}
                    className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Kategorie-Name"
                  />
                  <button
                    onClick={() => addResource(catIndex)}
                    className="px-3 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-all text-sm"
                  >
                    <Plus size={16} />
                  </button>
                  <button
                    onClick={() => removeCategory(catIndex)}
                    className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all"
                    disabled={formData.categories.length <= 1}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Resources */}
                <div className="space-y-2 ml-6">
                  {category.resources.length === 0 ? (
                    <p className="text-xs text-gray-500 italic">Keine Ressourcen</p>
                  ) : (
                    category.resources.map((resource, resIndex) => (
                      <div
                        key={resIndex}
                        className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-2"
                      >
                        <div className="flex items-start gap-2">
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              value={resource.title}
                              onChange={(e) =>
                                updateResource(catIndex, resIndex, 'title', e.target.value)
                              }
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                              placeholder="Ressourcen-Titel"
                            />

                            <div className="grid grid-cols-2 gap-2">
                              <select
                                value={resource.type}
                                onChange={(e) =>
                                  updateResource(catIndex, resIndex, 'type', e.target.value)
                                }
                                className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                              >
                                <option value="file">Datei</option>
                                <option value="link">Externer Link</option>
                              </select>

                              {resource.type === 'file' && (
                                <select
                                  value={resource.fileType}
                                  onChange={(e) =>
                                    updateResource(catIndex, resIndex, 'fileType', e.target.value)
                                  }
                                  className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                  <option value="pdf">PDF</option>
                                  <option value="doc">Word</option>
                                  <option value="xls">Excel</option>
                                  <option value="ppt">PowerPoint</option>
                                  <option value="img">Bild</option>
                                  <option value="zip">Archiv</option>
                                </select>
                              )}
                            </div>

                            <div className="flex gap-2 flex-1">
                              <input
                                type="text"
                                value={resource.url}
                                onChange={(e) => updateResource(catIndex, resIndex, 'url', e.target.value)}
                                placeholder="https://..."
                                className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedCategoryIndex(catIndex);
                                  setSelectedResourceIndex(resIndex);
                                  setShowAssetLibrary(true);
                                }}
                                className="px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded transition-all"
                                title="Aus Asset Library wählen"
                              >
                                <FolderOpen size={16} />
                              </button>
                            </div>

                            <input
                              type="text"
                              value={resource.description}
                              onChange={(e) =>
                                updateResource(catIndex, resIndex, 'description', e.target.value)
                              }
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                              placeholder="Beschreibung (optional)"
                            />
                          </div>

                          <button
                            onClick={() => removeResource(catIndex, resIndex)}
                            className="p-2 text-red-400 hover:text-red-300 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
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

        {/* Asset Library Modal */}
        {showAssetLibrary && (
          <AssetLibrary
            onSelectAsset={(asset) => {
              if (selectedCategoryIndex !== null && selectedResourceIndex !== null) {
                updateResource(selectedCategoryIndex, selectedResourceIndex, 'url', asset.file_path);
                updateResource(selectedCategoryIndex, selectedResourceIndex, 'title', asset.original_filename);
              }
              setShowAssetLibrary(false);
              setSelectedCategoryIndex(null);
              setSelectedResourceIndex(null);
            }}
            onClose={() => {
              setShowAssetLibrary(false);
              setSelectedCategoryIndex(null);
              setSelectedResourceIndex(null);
            }}
            showInsertButton={true}
          />
        )}
      </div>
    );
  }

  // Preview mode
  const fileTypeIcons = {
    pdf: '📄',
    doc: '📝',
    xls: '📊',
    ppt: '📽️',
    img: '🖼️',
    zip: '📦'
  };

  const filteredCategories = formData.searchable && searchQuery
    ? formData.categories.map(cat => ({
        ...cat,
        resources: cat.resources.filter(res =>
          res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          res.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(cat => cat.resources.length > 0)
    : formData.categories;

  return (
    <div className="p-6">
      {/* Header */}
      {formData.title && (
        <h2 className="text-2xl font-bold text-white mb-2">{formData.title}</h2>
      )}
      {formData.description && (
        <p className="text-gray-300 mb-4">{formData.description}</p>
      )}

      {/* Search */}
      {formData.searchable && (
        <div className="mb-6">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Ressourcen durchsuchen..."
            />
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="space-y-6">
        {filteredCategories.map((category, catIndex) => (
          <div key={catIndex}>
            <div className="flex items-center gap-2 mb-3">
              <Folder size={20} className="text-purple-400" />
              <h3 className="text-xl font-semibold text-white">{category.name}</h3>
              <span className="text-sm text-gray-500">({category.resources.length})</span>
            </div>

            {category.resources.length === 0 ? (
              <p className="text-gray-400 text-sm ml-7">Keine Ressourcen in dieser Kategorie</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-7">
                {category.resources.map((resource, resIndex) => (
                  <a
                    key={resIndex}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-purple-500/50 transition-all group"
                  >
                    <div className="text-2xl flex-shrink-0">
                      {resource.type === 'link' ? (
                        <ExternalLink size={24} className="text-purple-400" />
                      ) : (
                        <span>{fileTypeIcons[resource.fileType] || '📄'}</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium group-hover:text-purple-400 transition-colors truncate">
                        {resource.title || 'Unbenannte Ressource'}
                      </h4>
                      {resource.description && (
                        <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                          {resource.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded">
                          {resource.type === 'link' ? 'Link' : resource.fileType.toUpperCase()}
                        </span>
                        <Download size={14} className="text-gray-500 group-hover:text-purple-400 transition-colors" />
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredCategories.length === 0 && searchQuery && (
        <div className="text-center py-12">
          <Search size={48} className="mx-auto mb-3 text-gray-600" />
          <p className="text-gray-400">Keine Ressourcen gefunden für "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
}

export default ResourceLibraryTemplate;
