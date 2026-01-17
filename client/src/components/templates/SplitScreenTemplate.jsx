import { useState, useEffect } from 'react';
import { Save, Columns } from 'lucide-react';
import RichTextEditor from '../RichTextEditor';

function SplitScreenTemplate({ content, onChange, onSave, isEditing }) {
  const [formData, setFormData] = useState({
    leftTitle: content?.leftTitle || '',
    leftContent: content?.leftContent || '',
    rightTitle: content?.rightTitle || '',
    rightContent: content?.rightContent || '',
    ratio: content?.ratio || '50-50',
    dividerDraggable: content?.dividerDraggable || false
  });

  const [dividerPosition, setDividerPosition] = useState(50);

  useEffect(() => {
    if (content && !isEditing) {
      setFormData({
        leftTitle: content?.leftTitle || '',
        leftContent: content?.leftContent || '',
        rightTitle: content?.rightTitle || '',
        rightContent: content?.rightContent || '',
        ratio: content?.ratio || '50-50',
        dividerDraggable: content?.dividerDraggable || false
      });
    }
  }, [content, isEditing]);

  useEffect(() => {
    const ratioMap = {
      '30-70': 30,
      '40-60': 40,
      '50-50': 50,
      '60-40': 60,
      '70-30': 70
    };
    setDividerPosition(ratioMap[formData.ratio] || 50);
  }, [formData.ratio]);

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
        {/* Ratio Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Panel-Verhältnis
          </label>
          <select
            value={formData.ratio}
            onChange={(e) => handleChange({ ratio: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="30-70">30% / 70%</option>
            <option value="40-60">40% / 60%</option>
            <option value="50-50">50% / 50%</option>
            <option value="60-40">60% / 40%</option>
            <option value="70-30">70% / 30%</option>
          </select>
        </div>

        {/* Divider Option */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.dividerDraggable}
              onChange={(e) => handleChange({ dividerDraggable: e.target.checked })}
              className="w-4 h-4 text-purple-500 rounded focus:ring-purple-500"
            />
            <span className="text-sm text-gray-300">Verschiebbare Trennlinie (Live-Ansicht)</span>
          </label>
        </div>

        {/* Left Panel */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Columns size={18} />
            Linkes Panel
          </h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Titel (optional)
              </label>
              <input
                type="text"
                value={formData.leftTitle}
                onChange={(e) => handleChange({ leftTitle: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Linker Titel"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Inhalt
              </label>
              <RichTextEditor
                content={formData.leftContent}
                onChange={(html) => handleChange({ leftContent: html })}
                placeholder="Linker Inhalt..."
              />
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Columns size={18} />
            Rechtes Panel
          </h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Titel (optional)
              </label>
              <input
                type="text"
                value={formData.rightTitle}
                onChange={(e) => handleChange({ rightTitle: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Rechter Titel"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Inhalt
              </label>
              <RichTextEditor
                content={formData.rightContent}
                onChange={(html) => handleChange({ rightContent: html })}
                placeholder="Rechter Inhalt..."
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
    <div className="flex h-full min-h-[500px]">
      {/* Left Panel */}
      <div
        className="p-6 overflow-y-auto border-r border-white/10"
        style={{ width: `${dividerPosition}%` }}
      >
        {formData.leftTitle && (
          <h2 className="text-2xl font-bold text-white mb-4 border-b border-white/20 pb-3">
            {formData.leftTitle}
          </h2>
        )}
        <div
          className="text-white prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: formData.leftContent || '<p class="text-gray-400">Kein Inhalt</p>' }}
        />
      </div>

      {/* Divider */}
      <div className="w-1 bg-gradient-to-b from-purple-500/50 to-pink-500/50 cursor-col-resize hover:w-2 transition-all" />

      {/* Right Panel */}
      <div
        className="p-6 overflow-y-auto"
        style={{ width: `${100 - dividerPosition}%` }}
      >
        {formData.rightTitle && (
          <h2 className="text-2xl font-bold text-white mb-4 border-b border-white/20 pb-3">
            {formData.rightTitle}
          </h2>
        )}
        <div
          className="text-white prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: formData.rightContent || '<p class="text-gray-400">Kein Inhalt</p>' }}
        />
      </div>

      {formData.dividerDraggable && (
        <div className="absolute bottom-4 right-4 text-xs text-gray-500 bg-black/30 px-2 py-1 rounded">
          💡 Trennlinie ist in der Live-Ansicht verschiebbar
        </div>
      )}
    </div>
  );
}

export default SplitScreenTemplate;
