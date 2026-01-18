import { useState, useEffect } from 'react';
import { 
  Save, BarChart3, TrendingUp, TrendingDown, Minus, Plus, Trash2,
  ChevronDown, RefreshCw, PieChart, ArrowRight, Layers
} from 'lucide-react';

function ResultsComparisonTemplate({ content, onChange, onSave, isEditing, isSessionMode = false, socket, sessionCode }) {
  const [formData, setFormData] = useState({
    title: content?.title || 'Ergebnisvergleich',
    description: content?.description || '',
    comparisons: content?.comparisons || [],
    visualizationType: content?.visualizationType || 'side-by-side', // 'side-by-side', 'overlay', 'delta'
    showPercentageChange: content?.showPercentageChange !== false,
    showTrend: content?.showTrend !== false,
    colorScheme: content?.colorScheme || 'default'
  });

  const [availableModules, setAvailableModules] = useState([]);
  const [availableQuestions, setAvailableQuestions] = useState({});
  const [liveResults, setLiveResults] = useState({});
  const [isLoadingModules, setIsLoadingModules] = useState(false);

  useEffect(() => {
    if (content && !isEditing) {
      setFormData({
        title: content?.title || 'Ergebnisvergleich',
        description: content?.description || '',
        comparisons: content?.comparisons || [],
        visualizationType: content?.visualizationType || 'side-by-side',
        showPercentageChange: content?.showPercentageChange !== false,
        showTrend: content?.showTrend !== false,
        colorScheme: content?.colorScheme || 'default'
      });
    }
  }, [content, isEditing]);

  // Fetch available modules and their quiz/poll questions
  useEffect(() => {
    if (isEditing) {
      fetchAvailableModules();
    }
  }, [isEditing]);

  // Listen for live results updates
  useEffect(() => {
    if (!socket || !isSessionMode) return;

    const handleComparisonResults = (data) => {
      setLiveResults(prev => ({
        ...prev,
        [data.comparisonId]: data.results
      }));
    };

    socket.on('comparison:results', handleComparisonResults);

    // Request results for all comparisons
    if (sessionCode && formData.comparisons.length > 0) {
      socket.emit('comparison:getResults', { 
        sessionCode, 
        comparisons: formData.comparisons 
      });
    }

    return () => {
      socket.off('comparison:results', handleComparisonResults);
    };
  }, [socket, isSessionMode, sessionCode, formData.comparisons]);

  const fetchAvailableModules = async () => {
    setIsLoadingModules(true);
    try {
      // Fetch modules from the current class/session
      const response = await fetch('/api/modules', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      if (response.ok) {
        const modules = await response.json();
        setAvailableModules(modules);
        
        // Fetch questions for each module that has quiz/poll submodules
        const questionsMap = {};
        for (const module of modules) {
          if (module.submodules) {
            for (const sub of module.submodules) {
              if (sub.template_type === 'quiz' || sub.template_type === 'poll') {
                const key = `${module.id}-${sub.id}`;
                questionsMap[key] = {
                  moduleId: module.id,
                  moduleTitle: module.title,
                  submoduleId: sub.id,
                  submoduleTitle: sub.title,
                  type: sub.template_type,
                  questions: sub.content?.questions || []
                };
              }
            }
          }
        }
        setAvailableQuestions(questionsMap);
      }
    } catch (error) {
      console.error('Error fetching modules:', error);
    }
    setIsLoadingModules(false);
  };

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

  const addComparison = () => {
    const newComparison = {
      id: Date.now(),
      title: `Vergleich ${formData.comparisons.length + 1}`,
      source1: { moduleId: null, submoduleId: null, questionIndex: null },
      source2: { moduleId: null, submoduleId: null, questionIndex: null },
      comparisonType: 'direct' // 'direct', 'trend', 'progress'
    };
    handleChange({ comparisons: [...formData.comparisons, newComparison] });
  };

  const updateComparison = (id, updates) => {
    const newComparisons = formData.comparisons.map(c =>
      c.id === id ? { ...c, ...updates } : c
    );
    handleChange({ comparisons: newComparisons });
  };

  const removeComparison = (id) => {
    handleChange({ comparisons: formData.comparisons.filter(c => c.id !== id) });
  };

  const getQuestionLabel = (source) => {
    if (!source.moduleId || !source.submoduleId || source.questionIndex === null) {
      return 'Frage auswählen...';
    }
    const key = `${source.moduleId}-${source.submoduleId}`;
    const questionData = availableQuestions[key];
    if (!questionData) return 'Unbekannte Frage';
    
    const question = questionData.questions[source.questionIndex];
    return question?.question || `Frage ${source.questionIndex + 1}`;
  };

  const renderSourceSelector = (comparison, sourceKey) => {
    const source = comparison[sourceKey];
    const allQuestionKeys = Object.keys(availableQuestions);

    return (
      <div className="space-y-2">
        <label className="block text-xs text-gray-400">
          {sourceKey === 'source1' ? 'Erste Quelle' : 'Zweite Quelle'}
        </label>
        <select
          value={source.moduleId && source.submoduleId && source.questionIndex !== null 
            ? `${source.moduleId}-${source.submoduleId}-${source.questionIndex}` 
            : ''}
          onChange={(e) => {
            if (!e.target.value) {
              updateComparison(comparison.id, {
                [sourceKey]: { moduleId: null, submoduleId: null, questionIndex: null }
              });
              return;
            }
            const [moduleId, submoduleId, questionIndex] = e.target.value.split('-');
            updateComparison(comparison.id, {
              [sourceKey]: {
                moduleId: parseInt(moduleId),
                submoduleId: parseInt(submoduleId),
                questionIndex: parseInt(questionIndex)
              }
            });
          }}
          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
        >
          <option value="">Frage auswählen...</option>
          {allQuestionKeys.map(key => {
            const data = availableQuestions[key];
            return data.questions.map((q, idx) => (
              <option key={`${key}-${idx}`} value={`${data.moduleId}-${data.submoduleId}-${idx}`}>
                [{data.type === 'quiz' ? 'Quiz' : 'Umfrage'}] {data.moduleTitle} → {q.question || `Frage ${idx + 1}`}
              </option>
            ));
          })}
        </select>
      </div>
    );
  };

  const calculateDelta = (value1, value2) => {
    if (value1 === 0) return value2 > 0 ? 100 : 0;
    return ((value2 - value1) / value1) * 100;
  };

  const renderComparisonVisualization = (comparison) => {
    // Get results from liveResults or use mock data for preview
    const results1 = liveResults[`${comparison.id}-1`] || [30, 25, 20, 15, 10];
    const results2 = liveResults[`${comparison.id}-2`] || [35, 20, 25, 12, 8];
    
    const labels = ['Option A', 'Option B', 'Option C', 'Option D', 'Option E'];
    const total1 = results1.reduce((a, b) => a + b, 0);
    const total2 = results2.reduce((a, b) => a + b, 0);

    const colors1 = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'];
    const colors2 = ['#ec4899', '#f472b6', '#f9a8d4', '#fbcfe8', '#fce7f3'];

    if (formData.visualizationType === 'side-by-side') {
      return (
        <div className="space-y-3">
          {labels.slice(0, Math.max(results1.length, results2.length)).map((label, idx) => {
            const pct1 = total1 > 0 ? (results1[idx] / total1) * 100 : 0;
            const pct2 = total2 > 0 ? (results2[idx] / total2) * 100 : 0;
            const delta = pct2 - pct1;

            return (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white">{label}</span>
                  {formData.showTrend && (
                    <span className={`flex items-center gap-1 ${
                      delta > 0 ? 'text-green-400' : delta < 0 ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      {delta > 0 ? <TrendingUp size={14} /> : delta < 0 ? <TrendingDown size={14} /> : <Minus size={14} />}
                      {formData.showPercentageChange && `${delta > 0 ? '+' : ''}${delta.toFixed(1)}%`}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-purple-400">Quelle 1</span>
                      <span className="text-xs text-gray-400">{pct1.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3">
                      <div
                        className="h-3 rounded-full transition-all duration-500"
                        style={{ width: `${pct1}%`, backgroundColor: colors1[idx % colors1.length] }}
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-pink-400">Quelle 2</span>
                      <span className="text-xs text-gray-400">{pct2.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3">
                      <div
                        className="h-3 rounded-full transition-all duration-500"
                        style={{ width: `${pct2}%`, backgroundColor: colors2[idx % colors2.length] }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    if (formData.visualizationType === 'overlay') {
      return (
        <div className="space-y-3">
          {labels.slice(0, Math.max(results1.length, results2.length)).map((label, idx) => {
            const pct1 = total1 > 0 ? (results1[idx] / total1) * 100 : 0;
            const pct2 = total2 > 0 ? (results2[idx] / total2) * 100 : 0;

            return (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white">{label}</span>
                  <div className="flex gap-4 text-xs">
                    <span className="text-purple-400">{pct1.toFixed(1)}%</span>
                    <span className="text-pink-400">{pct2.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="relative w-full h-6 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="absolute h-full rounded-full opacity-70"
                    style={{ width: `${pct1}%`, backgroundColor: colors1[idx % colors1.length] }}
                  />
                  <div
                    className="absolute h-full rounded-full opacity-70"
                    style={{ width: `${pct2}%`, backgroundColor: colors2[idx % colors2.length] }}
                  />
                </div>
              </div>
            );
          })}
          <div className="flex justify-center gap-6 mt-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span className="text-gray-400">Quelle 1</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-pink-500" />
              <span className="text-gray-400">Quelle 2</span>
            </div>
          </div>
        </div>
      );
    }

    if (formData.visualizationType === 'delta') {
      return (
        <div className="space-y-3">
          {labels.slice(0, Math.max(results1.length, results2.length)).map((label, idx) => {
            const pct1 = total1 > 0 ? (results1[idx] / total1) * 100 : 0;
            const pct2 = total2 > 0 ? (results2[idx] / total2) * 100 : 0;
            const delta = pct2 - pct1;
            const absDelta = Math.abs(delta);

            return (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white">{label}</span>
                  <span className={`font-semibold ${
                    delta > 0 ? 'text-green-400' : delta < 0 ? 'text-red-400' : 'text-gray-400'
                  }`}>
                    {delta > 0 ? '+' : ''}{delta.toFixed(1)}%
                  </span>
                </div>
                <div className="relative w-full h-4 bg-white/10 rounded-full overflow-hidden">
                  <div className="absolute left-1/2 w-px h-full bg-white/30" />
                  {delta !== 0 && (
                    <div
                      className={`absolute h-full rounded-full ${delta > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{
                        width: `${Math.min(absDelta, 50)}%`,
                        left: delta > 0 ? '50%' : `${50 - Math.min(absDelta, 50)}%`
                      }}
                    />
                  )}
                </div>
              </div>
            );
          })}
          <p className="text-xs text-gray-400 text-center mt-2">
            Änderung von Quelle 1 zu Quelle 2
          </p>
        </div>
      );
    }

    return null;
  };

  if (isEditing) {
    return (
      <div className="space-y-4">
        {/* Title & Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Titel
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange({ title: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="z.B. Vorher-Nachher Vergleich"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Beschreibung (optional)
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange({ description: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none h-20"
            placeholder="Erklärung zum Vergleich..."
          />
        </div>

        {/* Visualization Settings */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Visualisierung
            </label>
            <select
              value={formData.visualizationType}
              onChange={(e) => handleChange({ visualizationType: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            >
              <option value="side-by-side">Nebeneinander</option>
              <option value="overlay">Überlagernd</option>
              <option value="delta">Differenz-Anzeige</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.showPercentageChange}
                onChange={(e) => handleChange({ showPercentageChange: e.target.checked })}
                className="w-4 h-4 rounded text-purple-500"
              />
              Prozentuale Änderung anzeigen
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.showTrend}
                onChange={(e) => handleChange({ showTrend: e.target.checked })}
                className="w-4 h-4 rounded text-purple-500"
              />
              Trend-Pfeile anzeigen
            </label>
          </div>
        </div>

        {/* Comparisons */}
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <Layers size={16} className="text-purple-400" />
              Vergleiche
            </h4>
            <div className="flex gap-2">
              <button
                onClick={fetchAvailableModules}
                disabled={isLoadingModules}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg text-sm flex items-center gap-2"
              >
                <RefreshCw size={14} className={isLoadingModules ? 'animate-spin' : ''} />
                Aktualisieren
              </button>
              <button
                onClick={addComparison}
                className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg text-sm flex items-center gap-2"
              >
                <Plus size={14} />
                Vergleich hinzufügen
              </button>
            </div>
          </div>

          {formData.comparisons.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">
              Noch keine Vergleiche definiert. Klicken Sie auf "Vergleich hinzufügen".
            </p>
          ) : (
            <div className="space-y-4">
              {formData.comparisons.map((comparison, idx) => (
                <div key={comparison.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <input
                      type="text"
                      value={comparison.title}
                      onChange={(e) => updateComparison(comparison.id, { title: e.target.value })}
                      className="bg-transparent border-none text-white font-medium focus:outline-none focus:ring-0"
                      placeholder={`Vergleich ${idx + 1}`}
                    />
                    <button
                      onClick={() => removeComparison(comparison.id)}
                      className="p-1 text-red-400 hover:bg-red-500/20 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-end">
                    {renderSourceSelector(comparison, 'source1')}
                    <ArrowRight className="text-gray-500 mb-2" size={20} />
                    {renderSourceSelector(comparison, 'source2')}
                  </div>

                  {/* Preview */}
                  {comparison.source1.questionIndex !== null && comparison.source2.questionIndex !== null && (
                    <div className="mt-4 p-3 bg-black/20 rounded-lg">
                      <p className="text-xs text-gray-400 mb-2">Vorschau:</p>
                      {renderComparisonVisualization(comparison)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
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

  // Display mode
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <BarChart3 size={28} className="text-purple-400" />
          <h2 className="text-2xl font-bold text-white">{formData.title}</h2>
        </div>
        {formData.description && (
          <p className="text-gray-400">{formData.description}</p>
        )}
      </div>

      {formData.comparisons.length === 0 ? (
        <div className="bg-white/5 rounded-lg p-8 text-center">
          <BarChart3 size={48} className="mx-auto text-gray-500 mb-4" />
          <p className="text-gray-400">Keine Vergleiche konfiguriert</p>
        </div>
      ) : (
        <div className="space-y-6">
          {formData.comparisons.map((comparison) => (
            <div key={comparison.id} className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-purple-400" />
                {comparison.title}
              </h3>
              
              <div className="flex items-center gap-4 mb-4 text-sm">
                <div className="flex-1 p-2 bg-purple-500/10 rounded border border-purple-500/30">
                  <span className="text-purple-400 font-medium">Quelle 1:</span>
                  <span className="text-gray-300 ml-2">{getQuestionLabel(comparison.source1)}</span>
                </div>
                <ArrowRight className="text-gray-500" size={20} />
                <div className="flex-1 p-2 bg-pink-500/10 rounded border border-pink-500/30">
                  <span className="text-pink-400 font-medium">Quelle 2:</span>
                  <span className="text-gray-300 ml-2">{getQuestionLabel(comparison.source2)}</span>
                </div>
              </div>

              {renderComparisonVisualization(comparison)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ResultsComparisonTemplate;
