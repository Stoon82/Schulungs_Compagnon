import { useState, useEffect } from 'react';
import { FileText, Save } from 'lucide-react';
import RichTextEditor from '../RichTextEditor';

function ContentTemplate({ content, onChange, onSave, isEditing }) {
  const [formData, setFormData] = useState({
    title: content?.title || '',
    text: content?.text || '',
    layout: content?.layout || 'single',
    backgroundColor: content?.backgroundColor || 'transparent'
  });

  useEffect(() => {
    if (content && !isEditing) {
      setFormData({
        title: content?.title || '',
        text: content?.text || '',
        layout: content?.layout || 'single',
        backgroundColor: content?.backgroundColor || 'transparent'
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

  if (isEditing) {
    return (
      <div className="space-y-4">
        {/* Title Bar */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Titel (optional)
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange({ title: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Titel eingeben"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Inhalt
          </label>
          <RichTextEditor
            content={formData.text}
            onChange={(html) => handleChange({ text: html })}
            placeholder="Textinhalt eingeben..."
          />
          <p className="text-xs text-gray-400 mt-2">
            Verwenden Sie die Toolbar für Formatierung, Links, Bilder und mehr
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Layout
            </label>
            <select
              value={formData.layout}
              onChange={(e) => handleChange({ layout: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="single">Einzelspalte</option>
              <option value="two-column">Zwei Spalten</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Hintergrund
            </label>
            <select
              value={formData.backgroundColor}
              onChange={(e) => handleChange({ backgroundColor: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="transparent">Transparent</option>
              <option value="light">Hell</option>
              <option value="dark">Dunkel</option>
            </select>
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
      </div>
    );
  }

  // Preview mode - simple markdown rendering
  const renderMarkdown = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mb-4">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mb-3">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold mb-2">$1</h3>')
      .replace(/\n\n/g, '</p><p class="mb-4">');
  };

  const bgClasses = {
    transparent: '',
    light: 'bg-white/10',
    dark: 'bg-black/30'
  };

  return (
    <div className={`p-6 rounded-lg ${bgClasses[formData.backgroundColor]}`}>
      {/* Title Bar */}
      {formData.title && (
        <div className="border-b border-white/20 pb-4 mb-6">
          <h2 className="text-3xl font-bold text-white">{formData.title}</h2>
        </div>
      )}

      {/* Content */}
      <div 
        className={`text-white ${formData.layout === 'two-column' ? 'columns-2 gap-6' : ''}`}
        dangerouslySetInnerHTML={{ __html: `<p class="mb-4">${renderMarkdown(formData.text || 'Kein Inhalt')}</p>` }}
      />
    </div>
  );
}

export default ContentTemplate;
