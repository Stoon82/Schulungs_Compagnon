import { useState, useEffect, useCallback, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Save, X, Plus, Trash2, Eye, Edit3, GripVertical, BookOpen, FileText, MessageSquare, BarChart3, Image, Video, CheckSquare } from 'lucide-react';
import api from '../services/api';
import SubmoduleEditor from './SubmoduleEditor';

function ModuleCreatorV2({ onClose }) {
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [submodules, setSubmodules] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('metadata');
  const [showSubmoduleEditor, setShowSubmoduleEditor] = useState(false);
  const [editingSubmodule, setEditingSubmodule] = useState(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState(''); // '', 'saving', 'saved'
  const autoSaveTimerRef = useRef(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'beginner',
    estimated_duration: 60,
    prerequisites: [],
    learning_objectives: [],
    tags: [],
    theme_override: null,
    author: 'admin',
    is_published: false,
    order_index: 0
  });

  const difficultyOptions = [
    { value: 'beginner', label: 'Anfänger', color: 'green' },
    { value: 'intermediate', label: 'Fortgeschritten', color: 'yellow' },
    { value: 'advanced', label: 'Experte', color: 'red' }
  ];

  const categoryOptions = [
    'KI Grundlagen',
    'Prompt Engineering',
    'Praktische Anwendung',
    'Ethik & Verantwortung',
    'Tools & Technologien'
  ];

  useEffect(() => {
    loadModules();
  }, []);

  useEffect(() => {
    if (selectedModule) {
      loadSubmodules(selectedModule.id);
    }
  }, [selectedModule]);

  const loadModules = async () => {
    setLoading(true);
    try {
      const result = await api.getCreatorModules();
      if (result.success) {
        setModules(result.data);
      }
    } catch (error) {
      console.error('Error loading modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSubmodules = async (moduleId) => {
    try {
      const result = await api.getModuleSubmodules(moduleId);
      if (result.success) {
        setSubmodules(result.data);
      }
    } catch (error) {
      console.error('Error loading submodules:', error);
    }
  };

  const handleSelectModule = async (module) => {
    setSelectedModule(module);
    setFormData({
      title: module.title,
      description: module.description || '',
      category: module.category || '',
      difficulty: module.difficulty || 'beginner',
      estimated_duration: module.estimated_duration || 60,
      prerequisites: module.prerequisites || [],
      learning_objectives: module.learning_objectives || [],
      tags: module.tags || [],
      theme_override: module.theme_override,
      author: module.author || 'admin',
      is_published: module.is_published === 1,
      order_index: module.order_index || 0
    });
    setEditMode(true);
    setActiveTab('metadata');
  };

  const handleNewModule = () => {
    setSelectedModule(null);
    setSubmodules([]);
    setFormData({
      title: '',
      description: '',
      category: '',
      difficulty: 'beginner',
      estimated_duration: 60,
      prerequisites: [],
      learning_objectives: [],
      tags: [],
      theme_override: null,
      author: 'admin',
      is_published: false,
      order_index: modules.length
    });
    setEditMode(true);
    setActiveTab('metadata');
  };

  const handleSave = async () => {
    if (!formData.title) {
      alert('Bitte geben Sie einen Titel ein');
      return;
    }

    setSaving(true);
    try {
      let result;
      if (selectedModule) {
        result = await api.updateCreatorModule(selectedModule.id, formData);
      } else {
        result = await api.createCreatorModule(formData);
      }

      if (result.success) {
        await loadModules();
        if (result.data) {
          setSelectedModule(result.data);
        }
        alert(selectedModule ? 'Modul aktualisiert!' : 'Modul erstellt!');
      } else {
        alert('Fehler beim Speichern: ' + (result.error || 'Unbekannter Fehler'));
      }
    } catch (error) {
      console.error('Error saving module:', error);
      alert('Fehler beim Speichern des Moduls');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (moduleId) => {
    if (!confirm('Möchten Sie dieses Modul wirklich löschen?')) return;

    try {
      const result = await api.deleteCreatorModule(moduleId);
      if (result.success) {
        await loadModules();
        if (selectedModule?.id === moduleId) {
          setEditMode(false);
          setSelectedModule(null);
          setSubmodules([]);
        }
        alert('Modul gelöscht!');
      }
    } catch (error) {
      console.error('Error deleting module:', error);
      alert('Fehler beim Löschen des Moduls');
    }
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    
    // Trigger auto-save if module is already created
    if (selectedModule) {
      triggerAutoSave();
    }
  };

  const triggerAutoSave = useCallback(() => {
    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Set status to indicate changes pending
    setAutoSaveStatus('');

    // Set new timer for 2 seconds
    autoSaveTimerRef.current = setTimeout(() => {
      performAutoSave();
    }, 2000);
  }, []);

  const performAutoSave = async () => {
    if (!selectedModule || !formData.title) return;

    setAutoSaveStatus('saving');
    try {
      await api.updateCreatorModule(selectedModule.id, formData);
      setAutoSaveStatus('saved');
      
      // Clear 'saved' status after 2 seconds
      setTimeout(() => {
        setAutoSaveStatus('');
      }, 2000);
    } catch (error) {
      console.error('Auto-save failed:', error);
      setAutoSaveStatus('');
    }
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  const addLearningObjective = () => {
    setFormData({
      ...formData,
      learning_objectives: [...formData.learning_objectives, '']
    });
  };

  const updateLearningObjective = (index, value) => {
    const newObjectives = [...formData.learning_objectives];
    newObjectives[index] = value;
    setFormData({ ...formData, learning_objectives: newObjectives });
  };

  const removeLearningObjective = (index) => {
    setFormData({
      ...formData,
      learning_objectives: formData.learning_objectives.filter((_, i) => i !== index)
    });
  };

  const addTag = () => {
    const tag = prompt('Tag eingeben:');
    if (tag && tag.trim()) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tag.trim()]
      });
    }
  };

  const removeTag = (index) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((_, i) => i !== index)
    });
  };

  const togglePrerequisite = (moduleId) => {
    const prerequisites = formData.prerequisites || [];
    if (prerequisites.includes(moduleId)) {
      setFormData({
        ...formData,
        prerequisites: prerequisites.filter(id => id !== moduleId)
      });
    } else {
      setFormData({
        ...formData,
        prerequisites: [...prerequisites, moduleId]
      });
    }
  };

  const handlePublishToggle = async () => {
    if (!selectedModule) return;
    
    const newPublishState = !formData.is_published;
    handleChange('is_published', newPublishState);
    
    try {
      await api.updateCreatorModule(selectedModule.id, {
        ...formData,
        is_published: newPublishState
      });
      alert(newPublishState ? 'Modul veröffentlicht!' : 'Modul als Entwurf gespeichert');
    } catch (error) {
      console.error('Error toggling publish state:', error);
    }
  };

  const handleNewSubmodule = () => {
    if (!selectedModule) {
      alert('Bitte speichern Sie zuerst das Modul');
      return;
    }
    setEditingSubmodule(null);
    setShowSubmoduleEditor(true);
  };

  const handleEditSubmodule = (submodule) => {
    setEditingSubmodule(submodule);
    setShowSubmoduleEditor(true);
  };

  const handleSaveSubmodule = async (submoduleData) => {
    try {
      let result;
      if (editingSubmodule) {
        result = await api.updateSubmodule(editingSubmodule.id, submoduleData);
      } else {
        result = await api.createSubmodule(selectedModule.id, submoduleData);
      }

      if (result.success) {
        await loadSubmodules(selectedModule.id);
        setShowSubmoduleEditor(false);
        setEditingSubmodule(null);
      } else {
        throw new Error(result.error || 'Failed to save submodule');
      }
    } catch (error) {
      console.error('Error saving submodule:', error);
      throw error;
    }
  };

  const handleDeleteSubmodule = async (submoduleId) => {
    if (!confirm('Möchten Sie dieses Submodul wirklich löschen?')) return;

    try {
      const result = await api.deleteSubmodule(submoduleId);
      if (result.success) {
        await loadSubmodules(selectedModule.id);
        alert('Submodul gelöscht!');
      }
    } catch (error) {
      console.error('Error deleting submodule:', error);
      alert('Fehler beim Löschen des Submoduls');
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(submodules);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update local state immediately for smooth UX
    setSubmodules(items);

    // Update order_index for all affected submodules
    const updates = items.map((item, index) => ({
      id: item.id,
      order_index: index
    }));

    try {
      // Call API to persist the new order
      await api.reorderSubmodules(selectedModule.id, updates);
    } catch (error) {
      console.error('Error reordering submodules:', error);
      // Reload to restore correct order on error
      await loadSubmodules(selectedModule.id);
      alert('Fehler beim Neuordnen der Submodule');
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 z-50 overflow-hidden">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-lg border-b border-white/10 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <BookOpen size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Modul Creator</h1>
              <p className="text-sm text-gray-400">Erstelle und verwalte Schulungsmodule</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {autoSaveStatus && (
              <div className={`px-3 py-2 rounded-lg text-sm ${
                autoSaveStatus === 'saving' 
                  ? 'bg-blue-500/20 text-blue-400' 
                  : 'bg-green-500/20 text-green-400'
              }`}>
                {autoSaveStatus === 'saving' ? 'Speichert...' : '✓ Gespeichert'}
              </div>
            )}
            {selectedModule && (
              <button
                onClick={handlePublishToggle}
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                  formData.is_published
                    ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                    : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                }`}
              >
                <Eye size={18} />
                <span>{formData.is_published ? 'Veröffentlicht' : 'Entwurf'}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all flex items-center gap-2"
            >
              <X size={18} />
              <span>Schließen</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left: Module List */}
        <div className="w-80 bg-black/20 border-r border-white/10 p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Module</h3>
            <button
              onClick={handleNewModule}
              className="px-3 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-all flex items-center gap-2"
            >
              <Plus size={16} />
              <span className="text-sm">Neu</span>
            </button>
          </div>

          {loading ? (
            <div className="text-center text-gray-400 py-8">Laden...</div>
          ) : (
            <div className="space-y-2">
              {modules.sort((a, b) => a.order_index - b.order_index).map((module) => (
                <div
                  key={module.id}
                  className={`p-4 rounded-lg border transition-all cursor-pointer ${
                    selectedModule?.id === module.id
                      ? 'bg-purple-500/20 border-purple-500/50'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                  onClick={() => handleSelectModule(module)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-white font-medium text-sm flex-1">{module.title}</h4>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(module.id);
                      }}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-2 mb-2">{module.description}</p>
                  <div className="flex items-center gap-2">
                    {module.is_published === 1 && (
                      <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">
                        Veröffentlicht
                      </span>
                    )}
                    {module.difficulty && (
                      <span className={`text-xs px-2 py-1 rounded ${
                        module.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400' :
                        module.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {difficultyOptions.find(d => d.value === module.difficulty)?.label}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Editor */}
        <div className="flex-1 overflow-y-auto">
          {editMode ? (
            <div className="p-6">
              <div className="max-w-5xl mx-auto">
                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b border-white/10">
                  <button
                    onClick={() => setActiveTab('metadata')}
                    className={`px-4 py-2 font-medium transition-all ${
                      activeTab === 'metadata'
                        ? 'text-purple-400 border-b-2 border-purple-400'
                        : 'text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    Metadaten
                  </button>
                  {selectedModule && (
                    <button
                      onClick={() => setActiveTab('submodules')}
                      className={`px-4 py-2 font-medium transition-all ${
                        activeTab === 'submodules'
                          ? 'text-purple-400 border-b-2 border-purple-400'
                          : 'text-gray-400 hover:text-gray-300'
                      }`}
                    >
                      Submodule ({submodules.length})
                    </button>
                  )}
                </div>

                {/* Metadata Tab */}
                {activeTab === 'metadata' && (
                  <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-8">
                    <h2 className="text-2xl font-bold text-white mb-6">
                      {selectedModule ? 'Modul bearbeiten' : 'Neues Modul erstellen'}
                    </h2>

                    <div className="space-y-6">
                      {/* Title */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Titel *
                        </label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => handleChange('title', e.target.value)}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="z.B. KI Grundlagen für Einsteiger"
                        />
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Beschreibung
                        </label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => handleChange('description', e.target.value)}
                          className="w-full h-24 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                          placeholder="Kurze Beschreibung des Moduls"
                        />
                      </div>

                      {/* Category & Difficulty */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Kategorie
                          </label>
                          <select
                            value={formData.category}
                            onChange={(e) => handleChange('category', e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="">Kategorie wählen</option>
                            {categoryOptions.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Schwierigkeit
                          </label>
                          <select
                            value={formData.difficulty}
                            onChange={(e) => handleChange('difficulty', e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            {difficultyOptions.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Duration & Order */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Geschätzte Dauer (Minuten)
                          </label>
                          <input
                            type="number"
                            value={formData.estimated_duration}
                            onChange={(e) => handleChange('estimated_duration', parseInt(e.target.value))}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            min="1"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Reihenfolge
                          </label>
                          <input
                            type="number"
                            value={formData.order_index}
                            onChange={(e) => handleChange('order_index', parseInt(e.target.value))}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            min="0"
                          />
                        </div>
                      </div>

                      {/* Learning Objectives */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-300">
                            Lernziele
                          </label>
                          <button
                            onClick={addLearningObjective}
                            className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
                          >
                            <Plus size={16} />
                            Hinzufügen
                          </button>
                        </div>
                        <div className="space-y-2">
                          {formData.learning_objectives.map((objective, index) => (
                            <div key={index} className="flex gap-2">
                              <input
                                type="text"
                                value={objective}
                                onChange={(e) => updateLearningObjective(index, e.target.value)}
                                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Lernziel eingeben"
                              />
                              <button
                                onClick={() => removeLearningObjective(index)}
                                className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Prerequisites */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Voraussetzungen (andere Module)
                        </label>
                        <div className="bg-white/5 border border-white/10 rounded-lg p-4 max-h-48 overflow-y-auto">
                          {modules.filter(m => m.id !== selectedModule?.id).length === 0 ? (
                            <p className="text-sm text-gray-400">Keine anderen Module verfügbar</p>
                          ) : (
                            <div className="space-y-2">
                              {modules.filter(m => m.id !== selectedModule?.id).map(module => (
                                <label key={module.id} className="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-2 rounded">
                                  <input
                                    type="checkbox"
                                    checked={formData.prerequisites.includes(module.id)}
                                    onChange={() => togglePrerequisite(module.id)}
                                    className="w-4 h-4 text-purple-500 rounded focus:ring-purple-500"
                                  />
                                  <span className="text-sm text-white">{module.title}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Tags */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-300">
                            Tags
                          </label>
                          <button
                            onClick={addTag}
                            className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
                          >
                            <Plus size={16} />
                            Tag hinzufügen
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {formData.tags.map((tag, index) => (
                            <div
                              key={index}
                              className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm flex items-center gap-2"
                            >
                              <span>{tag}</span>
                              <button
                                onClick={() => removeTag(index)}
                                className="hover:text-purple-300 transition-colors"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                          {formData.tags.length === 0 && (
                            <p className="text-sm text-gray-400">Keine Tags hinzugefügt</p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-4 pt-4">
                        <button
                          onClick={handleSave}
                          disabled={!formData.title || saving}
                          className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold text-white hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          <Save size={20} />
                          <span>{saving ? 'Speichern...' : 'Speichern'}</span>
                        </button>
                        <button
                          onClick={() => {
                            setEditMode(false);
                            setSelectedModule(null);
                          }}
                          className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-lg font-semibold text-gray-300 transition-all"
                        >
                          Abbrechen
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submodules Tab */}
                {activeTab === 'submodules' && selectedModule && (
                  <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-white">Submodule</h2>
                      <button 
                        onClick={handleNewSubmodule}
                        className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-all flex items-center gap-2"
                      >
                        <Plus size={18} />
                        <span>Submodul hinzufügen</span>
                      </button>
                    </div>

                    {submodules.length === 0 ? (
                      <div className="text-center py-12">
                        <FileText size={48} className="mx-auto mb-4 text-gray-600" />
                        <p className="text-gray-400 mb-4">Noch keine Submodule vorhanden</p>
                        <button
                          onClick={handleNewSubmodule}
                          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold text-white hover:from-purple-600 hover:to-pink-600 transition-all inline-flex items-center gap-2"
                        >
                          <Plus size={20} />
                          <span>Erstes Submodul erstellen</span>
                        </button>
                      </div>
                    ) : (
                      <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="submodules">
                          {(provided, snapshot) => (
                            <div
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                              className="space-y-3"
                            >
                              {submodules.map((submodule, index) => (
                                <Draggable
                                  key={submodule.id}
                                  draggableId={String(submodule.id)}
                                  index={index}
                                >
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      className={`flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-lg transition-all ${
                                        snapshot.isDragging
                                          ? 'bg-white/10 shadow-xl scale-105 border-purple-500/50'
                                          : 'hover:bg-white/10'
                                      }`}
                                    >
                                      <div
                                        {...provided.dragHandleProps}
                                        className="cursor-grab active:cursor-grabbing"
                                      >
                                        <GripVertical size={20} className="text-gray-500" />
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs text-gray-500 font-mono">#{index + 1}</span>
                                          <h4 className="text-white font-medium">{submodule.title}</h4>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                          <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded">
                                            {submodule.template_type}
                                          </span>
                                          {submodule.duration_estimate && (
                                            <span className="text-xs text-gray-400">
                                              ~{submodule.duration_estimate} Min
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <button 
                                        onClick={() => handleEditSubmodule(submodule)}
                                        className="p-2 text-purple-400 hover:text-purple-300 transition-colors"
                                      >
                                        <Edit3 size={18} />
                                      </button>
                                      <button 
                                        onClick={() => handleDeleteSubmodule(submodule.id)}
                                        className="p-2 text-red-400 hover:text-red-300 transition-colors"
                                      >
                                        <Trash2 size={18} />
                                      </button>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </DragDropContext>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <BookOpen size={64} className="mx-auto mb-4 text-gray-600" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Kein Modul ausgewählt
                </h3>
                <p className="text-gray-400 mb-6">
                  Wähle ein Modul aus der Liste oder erstelle ein neues
                </p>
                <button
                  onClick={handleNewModule}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold text-white hover:from-purple-600 hover:to-pink-600 transition-all flex items-center gap-2 mx-auto"
                >
                  <Plus size={20} />
                  <span>Neues Modul</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Submodule Editor Modal */}
      {showSubmoduleEditor && (
        <SubmoduleEditor
          submodule={editingSubmodule}
          moduleId={selectedModule?.id}
          onSave={handleSaveSubmodule}
          onClose={() => {
            setShowSubmoduleEditor(false);
            setEditingSubmodule(null);
          }}
        />
      )}
    </div>
  );
}

export default ModuleCreatorV2;
