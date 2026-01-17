import { useState, useEffect } from 'react';
import { Clock, Save, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

function TimelineTemplate({ content, onChange, onSave, isEditing }) {
  const [formData, setFormData] = useState({
    title: content?.title || '',
    orientation: content?.orientation || 'vertical',
    steps: content?.steps || [
      {
        title: 'Schritt 1',
        description: 'Beschreibung des ersten Schritts',
        date: '',
        expanded: false
      },
      {
        title: 'Schritt 2',
        description: 'Beschreibung des zweiten Schritts',
        date: '',
        expanded: false
      }
    ],
    showProgress: content?.showProgress || true,
    animated: content?.animated || true
  });

  const [expandedSteps, setExpandedSteps] = useState(new Set());

  useEffect(() => {
    if (content && !isEditing) {
      setFormData({
        title: content?.title || '',
        orientation: content?.orientation || 'vertical',
        steps: content?.steps || [
          {
            title: 'Schritt 1',
            description: 'Beschreibung des ersten Schritts',
            date: '',
            expanded: false
          },
          {
            title: 'Schritt 2',
            description: 'Beschreibung des zweiten Schritts',
            date: '',
            expanded: false
          }
        ],
        showProgress: content?.showProgress || true,
        animated: content?.animated || true
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

  const addStep = () => {
    const newSteps = [
      ...formData.steps,
      {
        title: `Schritt ${formData.steps.length + 1}`,
        description: '',
        date: '',
        expanded: false
      }
    ];
    handleChange({ steps: newSteps });
  };

  const removeStep = (index) => {
    if (formData.steps.length <= 1) {
      alert('Mindestens ein Schritt erforderlich');
      return;
    }
    handleChange({ steps: formData.steps.filter((_, i) => i !== index) });
  };

  const updateStep = (index, field, value) => {
    const newSteps = [...formData.steps];
    newSteps[index][field] = value;
    handleChange({ steps: newSteps });
  };

  const toggleExpanded = (index) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSteps(newExpanded);
  };

  if (isEditing) {
    return (
      <div className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Timeline-Titel (optional)
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange({ title: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="z.B. Projektablauf"
          />
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Ausrichtung
            </label>
            <select
              value={formData.orientation}
              onChange={(e) => handleChange({ orientation: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="vertical">Vertikal</option>
              <option value="horizontal">Horizontal</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.showProgress}
                onChange={(e) => handleChange({ showProgress: e.target.checked })}
                className="w-4 h-4 text-purple-500 rounded focus:ring-purple-500"
              />
              <span className="text-sm text-gray-300">Fortschritt anzeigen</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.animated}
                onChange={(e) => handleChange({ animated: e.target.checked })}
                className="w-4 h-4 text-purple-500 rounded focus:ring-purple-500"
              />
              <span className="text-sm text-gray-300">Animierte Übergänge</span>
            </label>
          </div>
        </div>

        {/* Steps Editor */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-300">
              Schritte
            </label>
            <button
              onClick={addStep}
              className="px-3 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-all text-sm flex items-center gap-1"
            >
              <Plus size={16} />
              Schritt hinzufügen
            </button>
          </div>

          <div className="space-y-3">
            {formData.steps.map((step, index) => (
              <div
                key={index}
                className="bg-white/5 border border-white/10 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs font-mono text-gray-500">
                    Schritt {index + 1}
                  </span>
                  <button
                    onClick={() => removeStep(index)}
                    className="p-1 text-red-400 hover:text-red-300 transition-colors"
                    disabled={formData.steps.length <= 1}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    value={step.title}
                    onChange={(e) => updateStep(index, 'title', e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Schritt-Titel"
                  />

                  <textarea
                    value={step.description}
                    onChange={(e) => updateStep(index, 'description', e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    rows="3"
                    placeholder="Beschreibung"
                  />

                  <input
                    type="text"
                    value={step.date}
                    onChange={(e) => updateStep(index, 'date', e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Datum/Zeit (optional)"
                  />
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
      </div>
    );
  }

  // Preview mode
  const completedSteps = formData.steps.length;
  const progressPercentage = formData.showProgress
    ? (completedSteps / formData.steps.length) * 100
    : 0;

  if (formData.orientation === 'horizontal') {
    return (
      <div className="p-6">
        {formData.title && (
          <h2 className="text-2xl font-bold text-white mb-6">{formData.title}</h2>
        )}

        {formData.showProgress && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Fortschritt</span>
              <span className="text-sm text-purple-400 font-semibold">
                {completedSteps} / {formData.steps.length}
              </span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex gap-4 overflow-x-auto pb-4">
          {formData.steps.map((step, index) => (
            <div
              key={index}
              className={`flex-shrink-0 w-64 bg-white/5 border border-white/10 rounded-lg p-4 ${
                formData.animated ? 'transition-all duration-300 hover:scale-105' : ''
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 font-semibold">
                  {index + 1}
                </div>
                <h3 className="text-white font-semibold flex-1">{step.title}</h3>
              </div>
              {step.date && (
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                  <Clock size={12} />
                  {step.date}
                </div>
              )}
              <p className="text-sm text-gray-300">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Vertical orientation
  return (
    <div className="p-6">
      {formData.title && (
        <h2 className="text-2xl font-bold text-white mb-6">{formData.title}</h2>
      )}

      {formData.showProgress && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Fortschritt</span>
            <span className="text-sm text-purple-400 font-semibold">
              {completedSteps} / {formData.steps.length}
            </span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-white/10" />

        <div className="space-y-6">
          {formData.steps.map((step, index) => (
            <div key={index} className="relative pl-12">
              {/* Timeline dot */}
              <div className="absolute left-0 top-0 w-8 h-8 bg-purple-500/20 border-2 border-purple-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-purple-400 font-semibold">
                  {index + 1}
                </span>
              </div>

              {/* Content card */}
              <div
                className={`bg-white/5 border border-white/10 rounded-lg p-4 ${
                  formData.animated ? 'transition-all duration-300' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-white font-semibold">{step.title}</h3>
                  {step.description && (
                    <button
                      onClick={() => toggleExpanded(index)}
                      className="text-gray-400 hover:text-gray-300 transition-colors"
                    >
                      {expandedSteps.has(index) ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                    </button>
                  )}
                </div>

                {step.date && (
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                    <Clock size={12} />
                    {step.date}
                  </div>
                )}

                {(expandedSteps.has(index) || !step.description) && (
                  <p className="text-sm text-gray-300 mt-2">{step.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TimelineTemplate;
