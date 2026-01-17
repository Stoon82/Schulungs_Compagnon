import { useState } from 'react';
import { Smartphone, Plus, Trash2, Edit3, ThumbsUp, ThumbsDown, Meh, GripVertical, ExternalLink } from 'lucide-react';

function AppGalleryTemplate({ content = {}, onSave, isEditing = true }) {
  const [formData, setFormData] = useState({
    title: content.title || '',
    description: content.description || '',
    apps: content.apps || [],
    allowFeedback: content.allowFeedback !== false,
    showVoteCounts: content.showVoteCounts !== false,
    filterByRating: content.filterByRating || false,
    sortBy: content.sortBy || 'order' // 'order', 'rating', 'name'
  });

  const [editingApp, setEditingApp] = useState(null);
  const [showAppEditor, setShowAppEditor] = useState(false);

  const handleChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    if (onSave) onSave(updated);
  };

  const addApp = () => {
    const newApp = {
      id: Date.now().toString(),
      name: '',
      description: '',
      screenshotUrl: '',
      promptUsed: '',
      appUrl: '',
      order: formData.apps.length
    };
    setEditingApp(newApp);
    setShowAppEditor(true);
  };

  const editApp = (app) => {
    setEditingApp({ ...app });
    setShowAppEditor(true);
  };

  const saveApp = () => {
    if (!editingApp.name) {
      alert('Bitte geben Sie einen App-Namen ein');
      return;
    }

    let updatedApps;
    const existingIndex = formData.apps.findIndex(a => a.id === editingApp.id);
    
    if (existingIndex >= 0) {
      updatedApps = [...formData.apps];
      updatedApps[existingIndex] = editingApp;
    } else {
      updatedApps = [...formData.apps, editingApp];
    }

    const updated = { ...formData, apps: updatedApps };
    setFormData(updated);
    if (onSave) onSave(updated);
    
    setShowAppEditor(false);
    setEditingApp(null);
  };

  const deleteApp = (appId) => {
    if (!confirm('App wirklich löschen?')) return;
    
    const updated = {
      ...formData,
      apps: formData.apps.filter(a => a.id !== appId)
    };
    setFormData(updated);
    if (onSave) onSave(updated);
  };

  const moveApp = (index, direction) => {
    const newApps = [...formData.apps];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= newApps.length) return;
    
    [newApps[index], newApps[newIndex]] = [newApps[newIndex], newApps[index]];
    
    const updated = { ...formData, apps: newApps };
    setFormData(updated);
    if (onSave) onSave(updated);
  };

  const sortOptions = [
    { value: 'order', label: 'Reihenfolge' },
    { value: 'rating', label: 'Bewertung' },
    { value: 'name', label: 'Name' }
  ];

  // Mock feedback data for preview
  const getMockFeedback = (appId) => ({
    up: Math.floor(Math.random() * 20),
    down: Math.floor(Math.random() * 5),
    neutral: Math.floor(Math.random() * 10)
  });

  if (!isEditing) {
    return (
      <div className="space-y-6">
        {/* Header */}
        {(formData.title || formData.description) && (
          <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl p-6 border border-blue-500/30">
            {formData.title && (
              <h3 className="text-2xl font-bold text-white mb-2">{formData.title}</h3>
            )}
            {formData.description && (
              <p className="text-gray-200">{formData.description}</p>
            )}
          </div>
        )}

        {/* Apps Grid */}
        {formData.apps.length === 0 ? (
          <div className="bg-white/5 rounded-xl p-12 border border-white/10 text-center">
            <Smartphone size={48} className="mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400">Keine Apps hinzugefügt</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {formData.apps.map((app) => {
              const feedback = getMockFeedback(app.id);
              const totalVotes = feedback.up + feedback.down + feedback.neutral;
              
              return (
                <div
                  key={app.id}
                  className="bg-white/5 rounded-xl border border-white/10 overflow-hidden hover:border-purple-500/50 transition-all"
                >
                  {/* Screenshot */}
                  {app.screenshotUrl && (
                    <div className="aspect-video bg-gradient-to-br from-purple-900/20 to-pink-900/20 flex items-center justify-center">
                      <img
                        src={app.screenshotUrl}
                        alt={app.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = '<div class="text-gray-500"><svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
                        }}
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-1">{app.name}</h4>
                      {app.description && (
                        <p className="text-sm text-gray-400 line-clamp-2">{app.description}</p>
                      )}
                    </div>

                    {app.promptUsed && (
                      <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                        <p className="text-xs text-gray-400 mb-1">Verwendeter Prompt:</p>
                        <p className="text-xs text-gray-300 italic line-clamp-2">{app.promptUsed}</p>
                      </div>
                    )}

                    {/* Feedback Buttons */}
                    {formData.allowFeedback && (
                      <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                        <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-all">
                          <ThumbsUp size={16} />
                          {formData.showVoteCounts && <span className="text-xs">{feedback.up}</span>}
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 rounded-lg transition-all">
                          <Meh size={16} />
                          {formData.showVoteCounts && <span className="text-xs">{feedback.neutral}</span>}
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all">
                          <ThumbsDown size={16} />
                          {formData.showVoteCounts && <span className="text-xs">{feedback.down}</span>}
                        </button>
                      </div>
                    )}

                    {/* App Link */}
                    {app.appUrl && (
                      <a
                        href={app.appUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-all text-sm"
                      >
                        <ExternalLink size={16} />
                        App öffnen
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Gallery Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Galerie-Titel
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="z.B. 'Unsere KI-Apps'"
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Sortierung
          </label>
          <select
            value={formData.sortBy}
            onChange={(e) => handleChange('sortBy', e.target.value)}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {sortOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Beschreibung
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Beschreiben Sie die App-Galerie..."
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[80px]"
        />
      </div>

      {/* Toggles */}
      <div className="space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.allowFeedback}
            onChange={(e) => handleChange('allowFeedback', e.target.checked)}
            className="w-5 h-5 text-purple-500 rounded focus:ring-purple-500"
          />
          <span className="text-white">Feedback-Buttons anzeigen</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.showVoteCounts}
            onChange={(e) => handleChange('showVoteCounts', e.target.checked)}
            className="w-5 h-5 text-purple-500 rounded focus:ring-purple-500"
          />
          <span className="text-white">Anzahl der Stimmen anzeigen</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.filterByRating}
            onChange={(e) => handleChange('filterByRating', e.target.checked)}
            className="w-5 h-5 text-purple-500 rounded focus:ring-purple-500"
          />
          <span className="text-white">Filterung nach Bewertung ermöglichen</span>
        </label>
      </div>

      {/* Apps List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-white">Apps ({formData.apps.length})</h4>
          <button
            onClick={addApp}
            className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-all flex items-center gap-2"
          >
            <Plus size={18} />
            App hinzufügen
          </button>
        </div>

        {formData.apps.length === 0 ? (
          <div className="bg-white/5 rounded-xl p-8 border border-white/10 text-center">
            <Smartphone size={48} className="mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400 mb-4">Noch keine Apps hinzugefügt</p>
            <button
              onClick={addApp}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold text-white hover:from-purple-600 hover:to-pink-600 transition-all inline-flex items-center gap-2"
            >
              <Plus size={20} />
              Erste App hinzufügen
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {formData.apps.map((app, index) => (
              <div
                key={app.id}
                className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all"
              >
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => moveApp(index, 'up')}
                    disabled={index === 0}
                    className="text-gray-500 hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => moveApp(index, 'down')}
                    disabled={index === formData.apps.length - 1}
                    className="text-gray-500 hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    ▼
                  </button>
                </div>
                
                <GripVertical size={20} className="text-gray-500" />
                
                <div className="flex-1">
                  <h5 className="text-white font-medium">{app.name || 'Unbenannte App'}</h5>
                  {app.description && (
                    <p className="text-sm text-gray-400 line-clamp-1">{app.description}</p>
                  )}
                </div>
                
                <button
                  onClick={() => editApp(app)}
                  className="p-2 text-purple-400 hover:text-purple-300 transition-colors"
                >
                  <Edit3 size={18} />
                </button>
                <button
                  onClick={() => deleteApp(app.id)}
                  className="p-2 text-red-400 hover:text-red-300 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* App Editor Modal */}
      {showAppEditor && editingApp && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10">
              <h3 className="text-xl font-bold text-white">
                {formData.apps.find(a => a.id === editingApp.id) ? 'App bearbeiten' : 'Neue App'}
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  App-Name *
                </label>
                <input
                  type="text"
                  value={editingApp.name}
                  onChange={(e) => setEditingApp({ ...editingApp, name: e.target.value })}
                  placeholder="z.B. 'Chatbot Assistant'"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Beschreibung
                </label>
                <textarea
                  value={editingApp.description}
                  onChange={(e) => setEditingApp({ ...editingApp, description: e.target.value })}
                  placeholder="Kurze Beschreibung der App..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[100px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Screenshot URL
                </label>
                <input
                  type="url"
                  value={editingApp.screenshotUrl}
                  onChange={(e) => setEditingApp({ ...editingApp, screenshotUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Verwendeter Prompt
                </label>
                <textarea
                  value={editingApp.promptUsed}
                  onChange={(e) => setEditingApp({ ...editingApp, promptUsed: e.target.value })}
                  placeholder="Der Prompt, der zur Erstellung verwendet wurde..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[80px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  App URL
                </label>
                <input
                  type="url"
                  value={editingApp.appUrl}
                  onChange={(e) => setEditingApp({ ...editingApp, appUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="p-6 border-t border-white/10 flex gap-3">
              <button
                onClick={saveApp}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold text-white hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                Speichern
              </button>
              <button
                onClick={() => {
                  setShowAppEditor(false);
                  setEditingApp(null);
                }}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AppGalleryTemplate;
