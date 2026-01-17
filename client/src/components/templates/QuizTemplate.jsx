import { useState } from 'react';
import { CheckSquare, Save, Plus, Trash2 } from 'lucide-react';

function QuizTemplate({ content, onSave, isEditing }) {
  const [formData, setFormData] = useState({
    question: content?.question || '',
    options: content?.options || ['', '', '', ''],
    correctAnswer: content?.correctAnswer || 0,
    explanation: content?.explanation || '',
    points: content?.points || 1
  });

  const handleSave = () => {
    onSave(formData);
  };

  const addOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, '']
    });
  };

  const removeOption = (index) => {
    if (formData.options.length <= 2) {
      alert('Mindestens 2 Optionen erforderlich');
      return;
    }
    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      options: newOptions,
      correctAnswer: formData.correctAnswer >= newOptions.length ? 0 : formData.correctAnswer
    });
  };

  const updateOption = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  if (isEditing) {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Frage
          </label>
          <textarea
            value={formData.question}
            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
            className="w-full h-24 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            placeholder="Frage eingeben"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-300">
              Antwortoptionen
            </label>
            <button
              onClick={addOption}
              className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              <Plus size={16} />
              Option hinzufügen
            </button>
          </div>
          <div className="space-y-2">
            {formData.options.map((option, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  type="radio"
                  name="correctAnswer"
                  checked={formData.correctAnswer === index}
                  onChange={() => setFormData({ ...formData, correctAnswer: index })}
                  className="w-5 h-5 text-purple-500 focus:ring-purple-500"
                />
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder={`Option ${index + 1}`}
                />
                {formData.options.length > 2 && (
                  <button
                    onClick={() => removeOption(index)}
                    className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Wählen Sie die richtige Antwort mit dem Radio-Button aus
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Erklärung (optional)
          </label>
          <textarea
            value={formData.explanation}
            onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
            className="w-full h-20 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            placeholder="Erklärung zur richtigen Antwort"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Punkte
          </label>
          <input
            type="number"
            value={formData.points}
            onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
            className="w-32 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            min="1"
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold text-white hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2"
        >
          <Save size={20} />
          <span>Speichern</span>
        </button>
      </div>
    );
  }

  // Preview mode
  return (
    <div className="bg-white/5 rounded-lg p-6">
      <h3 className="text-xl font-semibold text-white mb-4">
        {formData.question || 'Frage'}
      </h3>
      <div className="space-y-3">
        {formData.options.map((option, index) => (
          <button
            key={index}
            className={`w-full px-4 py-3 rounded-lg border transition-all text-left ${
              index === formData.correctAnswer
                ? 'bg-green-500/20 border-green-500 text-green-400'
                : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
            }`}
          >
            {option || `Option ${index + 1}`}
          </button>
        ))}
      </div>
      {formData.explanation && (
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-sm text-blue-300">
            <strong>Erklärung:</strong> {formData.explanation}
          </p>
        </div>
      )}
      <div className="mt-4 text-sm text-gray-400">
        Punkte: {formData.points}
      </div>
    </div>
  );
}

export default QuizTemplate;
