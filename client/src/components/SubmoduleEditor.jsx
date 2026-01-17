import { useState, useEffect } from 'react';
import { Save, X, Eye, EyeOff, Maximize2, Minimize2 } from 'lucide-react';
import { TitleTemplate, ContentTemplate, MediaTemplate, QuizTemplate, PollTemplate, WordCloudTemplate, AppGalleryTemplate, TableTemplate, TimelineTemplate, SplitScreenTemplate, EmbedTemplate } from './templates';

const TEMPLATE_TYPES = [
  { value: 'title', label: 'Titel-Folie', icon: '📋', component: TitleTemplate },
  { value: 'content', label: 'Inhalts-Folie', icon: '📝', component: ContentTemplate },
  { value: 'media', label: 'Medien-Präsentation', icon: '🖼️', component: MediaTemplate },
  { value: 'quiz', label: 'Interaktives Quiz', icon: '❓', component: QuizTemplate },
  { value: 'poll', label: 'Live-Umfrage', icon: '📊', component: PollTemplate },
  { value: 'wordcloud', label: 'Wortwolke', icon: '☁️', component: WordCloudTemplate },
  { value: 'appgallery', label: 'App-Galerie', icon: '📱', component: AppGalleryTemplate },
  { value: 'table', label: 'Tabelle/Vergleich', icon: '📊', component: TableTemplate },
  { value: 'timeline', label: 'Timeline/Prozess', icon: '⏱️', component: TimelineTemplate },
  { value: 'splitscreen', label: 'Split Screen', icon: '⬌', component: SplitScreenTemplate },
  { value: 'embed', label: 'Eingebetteter Inhalt', icon: '🔗', component: EmbedTemplate }
];

function SubmoduleEditor({ submodule, moduleId, onSave, onClose }) {
  const [formData, setFormData] = useState({
    title: submodule?.title || '',
    template_type: submodule?.template_type || 'content',
    content: submodule?.content || {},
    styling: submodule?.styling || {},
    duration_estimate: submodule?.duration_estimate || 5,
    notes: submodule?.notes || '',
    order_index: submodule?.order_index || 0
  });

  const [showLivePreview, setShowLivePreview] = useState(true);
  const [previewFullscreen, setPreviewFullscreen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [splitRatio, setSplitRatio] = useState(50);

  const selectedTemplate = TEMPLATE_TYPES.find(t => t.value === formData.template_type);
  const TemplateComponent = selectedTemplate?.component;

  const handleTemplateChange = (templateType) => {
    setFormData({
      ...formData,
      template_type: templateType,
      content: {} // Reset content when changing template
    });
  };

  const handleContentChange = (content) => {
    setFormData({
      ...formData,
      content
    });
  };

  const handleSave = async () => {
    if (!formData.title) {
      alert('Bitte geben Sie einen Titel ein');
      return;
    }

    setSaving(true);
    try {
      await onSave(formData);
      alert('Submodul gespeichert!');
    } catch (error) {
      console.error('Error saving submodule:', error);
      alert('Fehler beim Speichern');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-2xl border border-white/10 w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-black/30 backdrop-blur-lg border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {submodule ? 'Submodul bearbeiten' : 'Neues Submodul'}
            </h2>
            <p className="text-sm text-gray-400">
              {selectedTemplate?.label}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowLivePreview(!showLivePreview)}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                showLivePreview
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {showLivePreview ? <Eye size={18} /> : <EyeOff size={18} />}
              <span>Live-Vorschau</span>
            </button>
            {showLivePreview && (
              <button
                onClick={() => setPreviewFullscreen(!previewFullscreen)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg transition-all flex items-center gap-2"
              >
                {previewFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                <span>{previewFullscreen ? 'Normal' : 'Vollbild'}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all flex items-center gap-2"
            >
              <X size={18} />
              <span>Abbrechen</span>
            </button>
          </div>
        </div>

        {/* Content - Split Pane Layout */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left Panel - Editor */}
          <div className={`${
            previewFullscreen ? 'hidden' : (showLivePreview ? 'w-1/2' : 'w-full')
          } overflow-y-auto p-6 border-r border-white/10`}>
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Grundeinstellungen</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Titel *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Submodul-Titel"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Template-Typ
                      </label>
                      <select
                        value={formData.template_type}
                        onChange={(e) => handleTemplateChange(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        {TEMPLATE_TYPES.map(template => (
                          <option key={template.value} value={template.value}>
                            {template.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Geschätzte Dauer (Min)
                      </label>
                      <input
                        type="number"
                        value={formData.duration_estimate}
                        onChange={(e) => setFormData({ ...formData, duration_estimate: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        min="1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Admin-Notizen (optional)
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full h-20 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      placeholder="Interne Notizen für Trainer"
                    />
                  </div>
                </div>
              </div>

              {/* Template Editor */}
              <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Inhalt bearbeiten
                </h3>
                
                {TemplateComponent && (
                  <TemplateComponent
                    content={formData.content}
                    onChange={handleContentChange}
                    isEditing={true}
                  />
                )}
              </div>

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={!formData.title || saving}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold text-white hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Save size={20} />
                <span>{saving ? 'Speichern...' : 'Submodul speichern'}</span>
              </button>
            </div>
          </div>

          {/* Right Panel - Live Preview */}
          {showLivePreview && (
            <div className={`${
              previewFullscreen ? 'w-full' : 'w-1/2'
            } overflow-y-auto p-6 bg-gradient-to-br from-slate-800 to-slate-900`}>
              <div className="sticky top-0 bg-slate-900/80 backdrop-blur-lg border border-white/10 rounded-lg px-4 py-2 mb-4 z-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">Live-Vorschau</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Echtzeit-Updates
                  </div>
                </div>
              </div>
              
              <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-8 min-h-[500px]">
                {formData.title && (
                  <div className="mb-6 pb-4 border-b border-white/10">
                    <h2 className="text-2xl font-bold text-white">{formData.title}</h2>
                    <p className="text-sm text-gray-400 mt-1">
                      {selectedTemplate?.label} • {formData.duration_estimate} Min
                    </p>
                  </div>
                )}
                
                {TemplateComponent && (
                  <TemplateComponent
                    content={formData.content}
                    onChange={handleContentChange}
                    isEditing={false}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SubmoduleEditor;
