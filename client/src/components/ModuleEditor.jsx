import { useState, useEffect } from 'react';
import { Save, X, Plus, Trash2, Eye, Edit3, FileText, MessageSquare, BarChart3 } from 'lucide-react';
import api from '../services/api';

function ModuleEditor({ onClose }) {
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    description: '',
    content: '',
    order: 0
  });

  const defaultModules = [
    { id: 'prolog', title: 'Prolog: Der Ruf', description: 'Einführung in die Welt der KI', order: 0 },
    { id: 'module_1', title: 'Modul 1: Schwelle überschreiten', description: 'Erste Schritte mit KI', order: 1 },
    { id: 'module_2', title: 'Modul 2: Verbündete finden', description: 'KI-Tools kennenlernen', order: 2 },
    { id: 'module_3', title: 'Modul 3: Die Prüfung', description: 'Praktische Anwendung', order: 3 },
    { id: 'module_4', title: 'Modul 4: Rückkehr mit dem Elixier', description: 'KI im Alltag integrieren', order: 4 },
    { id: 'epilog', title: 'Epilog: Material Hub', description: 'Ressourcen und Weiterbildung', order: 5 }
  ];

  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = () => {
    // In production, this would fetch from API
    setModules(defaultModules);
  };

  const handleSelectModule = (module) => {
    setSelectedModule(module);
    setFormData({
      id: module.id,
      title: module.title,
      description: module.description,
      content: module.content || '',
      order: module.order
    });
    setEditMode(true);
  };

  const handleNewModule = () => {
    setSelectedModule(null);
    setFormData({
      id: `module_${Date.now()}`,
      title: '',
      description: '',
      content: '',
      order: modules.length
    });
    setEditMode(true);
  };

  const handleSave = () => {
    if (selectedModule) {
      // Update existing module
      setModules(modules.map(m => m.id === formData.id ? formData : m));
    } else {
      // Add new module
      setModules([...modules, formData]);
    }
    setEditMode(false);
    setSelectedModule(null);
  };

  const handleDelete = (moduleId) => {
    if (confirm('Möchten Sie dieses Modul wirklich löschen?')) {
      setModules(modules.filter(m => m.id !== moduleId));
      if (selectedModule?.id === moduleId) {
        setEditMode(false);
        setSelectedModule(null);
      }
    }
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 z-50 overflow-hidden">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-lg border-b border-white/10 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Edit3 size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Module Editor</h1>
              <p className="text-sm text-gray-400">Inhalte verwalten und bearbeiten</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all flex items-center gap-2"
          >
            <X size={18} />
            <span>Schließen</span>
          </button>
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

          <div className="space-y-2">
            {modules.sort((a, b) => a.order - b.order).map((module) => (
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
                  <h4 className="text-white font-medium text-sm">{module.title}</h4>
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
                <p className="text-xs text-gray-400 line-clamp-2">{module.description}</p>
                <div className="mt-2 text-xs text-gray-500">Reihenfolge: {module.order}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Editor */}
        <div className="flex-1 p-6 overflow-y-auto">
          {editMode ? (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-8">
                <h2 className="text-2xl font-bold text-white mb-6">
                  {selectedModule ? 'Modul bearbeiten' : 'Neues Modul erstellen'}
                </h2>

                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Titel
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleChange('title', e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="z.B. Modul 1: Schwelle überschreiten"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Beschreibung
                    </label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Kurze Beschreibung des Moduls"
                    />
                  </div>

                  {/* Order */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Reihenfolge
                    </label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) => handleChange('order', parseInt(e.target.value))}
                      className="w-32 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      min="0"
                    />
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Inhalt (Markdown unterstützt)
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => handleChange('content', e.target.value)}
                      className="w-full h-64 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm resize-none"
                      placeholder="# Überschrift&#10;&#10;Dein Modulinhalt hier..."
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={handleSave}
                      disabled={!formData.title || !formData.description}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold text-white hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Save size={20} />
                      <span>Speichern</span>
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

              {/* Additional Tools */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <MessageSquare size={24} className="text-cyan-400" />
                    <h3 className="text-white font-semibold">Umfrage</h3>
                  </div>
                  <p className="text-sm text-gray-400 mb-4">
                    Erstelle eine Umfrage für dieses Modul
                  </p>
                  <button className="w-full px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-all text-sm">
                    Umfrage erstellen
                  </button>
                </div>

                <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <BarChart3 size={24} className="text-purple-400" />
                    <h3 className="text-white font-semibold">Wordcloud</h3>
                  </div>
                  <p className="text-sm text-gray-400 mb-4">
                    Erstelle eine interaktive Wordcloud
                  </p>
                  <button className="w-full px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-all text-sm">
                    Wordcloud erstellen
                  </button>
                </div>

                <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Eye size={24} className="text-green-400" />
                    <h3 className="text-white font-semibold">Vorschau</h3>
                  </div>
                  <p className="text-sm text-gray-400 mb-4">
                    Zeige eine Vorschau des Moduls
                  </p>
                  <button className="w-full px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-all text-sm">
                    Vorschau anzeigen
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FileText size={64} className="mx-auto mb-4 text-gray-600" />
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
    </div>
  );
}

export default ModuleEditor;
