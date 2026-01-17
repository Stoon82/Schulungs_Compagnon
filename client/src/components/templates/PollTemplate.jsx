import { useState, useEffect } from 'react';
import { BarChart3, Save, Plus, Trash2, Lock, Unlock, Eye, PieChart } from 'lucide-react';

function PollTemplate({ content, onChange, onSave, isEditing }) {
  const [formData, setFormData] = useState({
    question: content?.question || '',
    options: content?.options || ['', ''],
    allowMultiple: content?.allowMultiple || false,
    showResults: content?.showResults || 'after',
    anonymousVoting: content?.anonymousVoting !== false,
    visualizationType: content?.visualizationType || 'bar',
    pollClosed: content?.pollClosed || false
  });
  
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);

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

  const handleClosePoll = () => {
    handleChange({ pollClosed: !formData.pollClosed });
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
              <option value="never">Nie (nur Admin)</option>
              <option value="after">Nach Abstimmung</option>
              <option value="live">Live (Echtzeit)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Visualisierung
            </label>
            <select
              value={formData.visualizationType}
              onChange={(e) => handleChange({ visualizationType: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="bar">Balkendiagramm</option>
              <option value="pie">Kreisdiagramm</option>
              <option value="emoji">Emoji-Anzeige</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.anonymousVoting}
              onChange={(e) => handleChange({ anonymousVoting: e.target.checked })}
              className="w-4 h-4 text-purple-500 rounded focus:ring-purple-500"
            />
            <span className="text-sm text-gray-300">Anonyme Abstimmung</span>
          </label>
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
  const mockResults = formData.options.map((_, i) => Math.floor(Math.random() * 50) + 10);
  const total = mockResults.reduce((a, b) => a + b, 0);

  const handleVote = () => {
    if (formData.allowMultiple) {
      if (selectedOptions.length > 0) {
        setHasVoted(true);
        // TODO: Send vote to backend via socket/API
      }
    } else {
      if (selectedOptions.length > 0) {
        setHasVoted(true);
        // TODO: Send vote to backend via socket/API
      }
    }
  };

  const handleOptionClick = (index) => {
    if (formData.allowMultiple) {
      setSelectedOptions(prev => 
        prev.includes(index) 
          ? prev.filter(i => i !== index)
          : [...prev, index]
      );
    } else {
      setSelectedOptions([index]);
    }
  };

  const renderVisualization = () => {
    if (formData.visualizationType === 'bar') {
      return (
        <div className="space-y-2">
          {formData.options.map((option, index) => {
            const percentage = total > 0 ? (mockResults[index] / total) * 100 : 0;
            return (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white">{option || `Option ${index + 1}`}</span>
                  <span className="text-gray-400">{mockResults[index]} ({percentage.toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      );
    }
    
    if (formData.visualizationType === 'pie') {
      return (
        <div className="text-center text-gray-400 py-8">
          <PieChart size={48} className="mx-auto mb-2" />
          <p>Kreisdiagramm-Ansicht</p>
        </div>
      );
    }
    
    if (formData.visualizationType === 'emoji') {
      return (
        <div className="space-y-3">
          {formData.options.map((option, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className="text-white min-w-[120px]">{option || `Option ${index + 1}`}</span>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(mockResults[index], 20) }).map((_, i) => (
                  <span key={i}>👤</span>
                ))}
                {mockResults[index] > 20 && <span className="text-gray-400 ml-2">+{mockResults[index] - 20}</span>}
              </div>
            </div>
          ))}
        </div>
      );
    }
  };

  return (
    <div className="bg-white/5 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 size={24} className="text-purple-400" />
          <h3 className="text-2xl font-bold text-white">
            {formData.question || 'Umfrage-Frage'}
          </h3>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Poll Status Indicator */}
          {formData.pollClosed && (
            <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded text-sm flex items-center gap-1">
              <Lock size={14} />
              Geschlossen
            </span>
          )}
          
          {/* Admin Close Poll Button */}
          {!isEditing && (
            <button
              onClick={handleClosePoll}
              className={`px-3 py-1 rounded text-sm flex items-center gap-2 ${
                formData.pollClosed
                  ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
                  : 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
              }`}
              title={formData.pollClosed ? 'Umfrage öffnen' : 'Umfrage schließen'}
            >
              {formData.pollClosed ? <Unlock size={14} /> : <Lock size={14} />}
              {formData.pollClosed ? 'Öffnen' : 'Schließen'}
            </button>
          )}
          
          {/* Visualization Type Indicator */}
          {formData.visualizationType === 'pie' && <PieChart size={16} className="text-gray-400" />}
        </div>
      </div>
      
      {formData.pollClosed && !hasVoted ? (
        // Poll Closed Message
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
          <Lock size={48} className="mx-auto mb-3 text-red-400" />
          <p className="text-red-400 font-semibold">Diese Umfrage wurde geschlossen</p>
          <p className="text-sm text-gray-400 mt-2">Abstimmungen sind nicht mehr möglich</p>
        </div>
      ) : !hasVoted ? (
        // Voting Interface
        <div className="space-y-3">
          {formData.options.map((option, index) => {
            const isSelected = selectedOptions.includes(index);
            
            return (
              <button
                key={index}
                onClick={() => handleOptionClick(index)}
                disabled={formData.pollClosed}
                className={`w-full px-4 py-3 rounded-lg border transition-all text-left ${
                  isSelected
                    ? 'bg-purple-500/30 border-purple-500 text-white'
                    : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                } ${formData.pollClosed ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 ${formData.allowMultiple ? 'rounded' : 'rounded-full'} border-2 flex items-center justify-center ${
                    isSelected ? 'border-purple-500' : 'border-white/30'
                  }`}>
                    {isSelected && (
                      <div className={`w-3 h-3 ${formData.allowMultiple ? 'rounded' : 'rounded-full'} bg-purple-500`} />
                    )}
                  </div>
                  <span>{option || `Option ${index + 1}`}</span>
                </div>
              </button>
            );
          })}
          
          <button
            onClick={handleVote}
            disabled={(formData.allowMultiple ? selectedOptions.length === 0 : selectedOptions.length !== 1) || formData.pollClosed}
            className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold text-white hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Abstimmen
          </button>
        </div>
      ) : (
        // Results Display
        <div className="space-y-4">
          <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
            <p className="text-green-400 font-semibold">✓ Ihre Stimme wurde gezählt!</p>
          </div>
          
          {formData.showResults !== 'never' && renderVisualization()}
          
          {formData.showResults === 'never' && (
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg text-center">
              <Eye size={32} className="mx-auto mb-2 text-blue-400" />
              <p className="text-blue-400">Ergebnisse werden nicht angezeigt</p>
              <p className="text-xs text-gray-400 mt-1">Nur Administratoren können die Ergebnisse sehen</p>
            </div>
          )}
        </div>
      )}

      {/* Live Results (when showResults is 'live' and user hasn't voted) */}
      {formData.showResults === 'live' && !hasVoted && !formData.pollClosed && (
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Eye size={16} className="text-blue-400" />
            <p className="text-sm font-semibold text-blue-400">Live-Ergebnisse</p>
          </div>
          {renderVisualization()}
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center gap-3">
            {formData.allowMultiple && <span>✓ Mehrfachauswahl</span>}
            {formData.anonymousVoting && <span>🔒 Anonym</span>}
            <span>
              Ergebnisse: {formData.showResults === 'never' ? 'Verborgen' : formData.showResults === 'after' ? 'Nach Abstimmung' : 'Live'}
            </span>
          </div>
          <div>
            <span className="font-semibold text-white">{total}</span> Stimmen gesamt
          </div>
        </div>
      </div>
    </div>
  );
}

export default PollTemplate;
 