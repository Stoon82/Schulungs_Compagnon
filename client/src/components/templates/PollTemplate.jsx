import { useState, useEffect } from 'react';
import { BarChart3, Save, Plus, Trash2 } from 'lucide-react';

function PollTemplate({ content, onChange, onSave, isEditing }) {
  const [formData, setFormData] = useState({
    question: content?.question || '',
    options: content?.options || ['', ''],
    allowMultiple: content?.allowMultiple || false,
    showResults: content?.showResults || 'after'
  });

  useEffect(() => {
    if (content && !isEditing) {
      setFormData({
        question: content?.question || '',
        options: content?.options || ['', ''],
        allowMultiple: content?.allowMultiple || false,
        showResults: content?.showResults || 'after'
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

  const addOption = () => {
    handleChange({
      options: [...formData.options, '']
    });
  };

  const removeOption = (index) => {
    if (formData.options.length <= 2) {
      alert('Mindestens 2 Optionen erforderlich');
      return;
    }
    const newOptions = formData.options.filter((_, i) => i !== index);
    handleChange({ options: newOptions });
  };

  const updateOption = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    handleChange({ options: newOptions });
  };

  if (isEditing) {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Umfrage-Frage
          </label>
          <textarea
            value={formData.question}
            onChange={(e) => handleChange({ question: e.target.value })}
            className="w-full h-24 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            placeholder="Frage eingeben"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-300">
              Optionen
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
              <div key={index} className="flex gap-2">
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
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.allowMultiple}
                onChange={(e) => handleChange({ allowMultiple: e.target.checked })}
                className="w-5 h-5 text-purple-500 rounded focus:ring-purple-500"
              />
              <span>Mehrfachauswahl erlauben</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Ergebnisse anzeigen
            </label>
            <select
              value={formData.showResults}
              onChange={(e) => handleChange({ showResults: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="never">Nie</option>
              <option value="after">Nach Abstimmung</option>
              <option value="live">Live</option>
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

  // Client mode - Interactive voting
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const mockResults = formData.options.map((_, i) => Math.floor(Math.random() * 50) + 10);
  const total = mockResults.reduce((a, b) => a + b, 0);

  const handleVote = () => {
    if (selectedOption !== null) {
      setHasVoted(true);
      // TODO: Send vote to backend via socket/API
    }
  };

  return (
    <div className="bg-white/5 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 size={24} className="text-purple-400" />
        <h3 className="text-2xl font-bold text-white">
          {formData.question || 'Umfrage-Frage'}
        </h3>
      </div>
      
      {!hasVoted ? (
        // Voting Interface
        <div className="space-y-3">
          {formData.options.map((option, index) => (
            <button
              key={index}
              onClick={() => setSelectedOption(index)}
              className={`w-full px-4 py-3 rounded-lg border transition-all text-left ${
                selectedOption === index
                  ? 'bg-purple-500/30 border-purple-500 text-white'
                  : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedOption === index ? 'border-purple-500' : 'border-white/30'
                }`}>
                  {selectedOption === index && (
                    <div className="w-3 h-3 rounded-full bg-purple-500" />
                  )}
                </div>
                <span>{option || `Option ${index + 1}`}</span>
              </div>
            </button>
          ))}
          
          <button
            onClick={handleVote}
            disabled={selectedOption === null}
            className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold text-white hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Abstimmen
          </button>
        </div>
      ) : (
        // Results Display
        <div className="space-y-3 mb-4">
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
            <p className="text-green-400 font-semibold">✓ Ihre Stimme wurde gezählt!</p>
          </div>
          
          {formData.options.map((option, index) => {
            const percentage = total > 0 ? Math.round((mockResults[index] / total) * 100) : 0;
            const isUserChoice = selectedOption === index;
            return (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`${isUserChoice ? 'text-purple-400 font-semibold' : 'text-white'}`}>
                    {option || `Option ${index + 1}`}
                    {isUserChoice && ' (Ihre Wahl)'}
                  </span>
                  <span className="text-sm text-gray-400">{percentage}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
          );
        })}
        </div>
      )}

      <div className="text-sm text-gray-400 mt-4">
        {formData.allowMultiple && '✓ Mehrfachauswahl möglich • '}
        Ergebnisse: {formData.showResults === 'never' ? 'Verborgen' : formData.showResults === 'after' ? 'Nach Abstimmung' : 'Live'}
      </div>
    </div>
  );
}

export default PollTemplate;
