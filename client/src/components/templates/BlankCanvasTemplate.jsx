import { useState, useEffect } from 'react';
import { Save, Code, Eye, Monitor, Smartphone, Tablet } from 'lucide-react';

function BlankCanvasTemplate({ content, onChange, onSave, isEditing }) {
  const [formData, setFormData] = useState({
    title: content?.title || '',
    html: content?.html || '',
    css: content?.css || '',
    js: content?.js || '',
    previewMode: content?.previewMode || 'desktop'
  });

  const [activeTab, setActiveTab] = useState('html');
  const [previewKey, setPreviewKey] = useState(0);

  useEffect(() => {
    if (content && !isEditing) {
      setFormData({
        title: content?.title || '',
        html: content?.html || '',
        css: content?.css || '',
        js: content?.js || '',
        previewMode: content?.previewMode || 'desktop'
      });
    }
  }, [content, isEditing]);

  const handleChange = (updates) => {
    const newData = { ...formData, ...updates };
    setFormData(newData);
    if (onChange) {
      onChange(newData);
    }
    // Refresh preview when code changes
    setPreviewKey(prev => prev + 1);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(formData);
    }
  };

  const getPreviewHTML = () => {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      margin: 0;
      padding: 20px;
      font-family: system-ui, -apple-system, sans-serif;
      background: #1a1a2e;
      color: white;
    }
    ${formData.css}
  </style>
</head>
<body>
  ${formData.html}
  <script>
    try {
      ${formData.js}
    } catch (error) {
      console.error('JavaScript Error:', error);
      document.body.innerHTML += '<div style="background: #ff4444; color: white; padding: 10px; margin-top: 20px; border-radius: 5px;">JavaScript Error: ' + error.message + '</div>';
    }
  </script>
</body>
</html>
    `;
  };

  const previewSizes = {
    desktop: { width: '100%', label: 'Desktop', icon: Monitor },
    tablet: { width: '768px', label: 'Tablet', icon: Tablet },
    mobile: { width: '375px', label: 'Mobile', icon: Smartphone }
  };

  if (isEditing) {
    return (
      <div className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Canvas-Titel (optional)
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange({ title: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="z.B. Interaktive Demo"
          />
        </div>

        {/* Code Tabs */}
        <div>
          <div className="flex gap-2 mb-2">
            {['html', 'css', 'js'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-purple-500/30 text-purple-400 border border-purple-500/50'
                    : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                }`}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>

          {/* HTML Editor */}
          {activeTab === 'html' && (
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                HTML Code
              </label>
              <textarea
                value={formData.html}
                onChange={(e) => handleChange({ html: e.target.value })}
                className="w-full h-64 px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                placeholder="<div>Dein HTML hier...</div>"
                spellCheck={false}
              />
            </div>
          )}

          {/* CSS Editor */}
          {activeTab === 'css' && (
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                CSS Code
              </label>
              <textarea
                value={formData.css}
                onChange={(e) => handleChange({ css: e.target.value })}
                className="w-full h-64 px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                placeholder=".container { padding: 20px; }"
                spellCheck={false}
              />
            </div>
          )}

          {/* JavaScript Editor */}
          {activeTab === 'js' && (
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                JavaScript Code
              </label>
              <textarea
                value={formData.js}
                onChange={(e) => handleChange({ js: e.target.value })}
                className="w-full h-64 px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                placeholder="console.log('Hello World!');"
                spellCheck={false}
              />
            </div>
          )}
        </div>

        {/* Preview Mode Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Vorschau-Modus
          </label>
          <div className="flex gap-2">
            {Object.entries(previewSizes).map(([key, { label, icon: Icon }]) => (
              <button
                key={key}
                onClick={() => handleChange({ previewMode: key })}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                  formData.previewMode === key
                    ? 'bg-purple-500/30 text-purple-400 border border-purple-500/50'
                    : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Live Preview */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
            <Eye size={16} />
            Live-Vorschau
          </label>
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 min-h-[300px]">
            <div className="mx-auto" style={{ width: previewSizes[formData.previewMode].width }}>
              <iframe
                key={previewKey}
                srcDoc={getPreviewHTML()}
                className="w-full h-[400px] bg-white/10 rounded border border-white/10"
                title="Preview"
                sandbox="allow-scripts"
              />
            </div>
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

  // Preview mode
  return (
    <div className="p-6">
      {formData.title && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">{formData.title}</h2>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Code size={14} />
            <span>Interaktiver Canvas</span>
          </div>
        </div>
      )}

      <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
        <div className="mx-auto" style={{ width: previewSizes[formData.previewMode].width }}>
          <iframe
            srcDoc={getPreviewHTML()}
            className="w-full h-[600px] bg-white/10"
            title="Canvas Preview"
            sandbox="allow-scripts"
          />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
        <span className="px-2 py-1 bg-white/5 rounded">
          {previewSizes[formData.previewMode].label}
        </span>
        {formData.html && <span className="px-2 py-1 bg-white/5 rounded">HTML ✓</span>}
        {formData.css && <span className="px-2 py-1 bg-white/5 rounded">CSS ✓</span>}
        {formData.js && <span className="px-2 py-1 bg-white/5 rounded">JS ✓</span>}
      </div>
    </div>
  );
}

export default BlankCanvasTemplate;
