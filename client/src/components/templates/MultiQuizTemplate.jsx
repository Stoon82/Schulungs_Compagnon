import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, ChevronLeft, ChevronRight, Clock, Eye, EyeOff, Star } from 'lucide-react';

/**
 * MultiQuizTemplate - Quiz template supporting multiple questions
 * Each question can have multiple correct answers
 */
function MultiQuizTemplate({ content, onChange, onSave, isEditing }) {
  const [formData, setFormData] = useState({
    questions: content?.questions || [{
      id: 1,
      questionType: 'multiple-choice',
      question: '',
      options: ['', '', '', ''],
      correctAnswers: [0], // Array for multiple correct answers
      correctText: '',
      ratingScale: 5,
      ratingStyle: 'stars',
      explanation: '',
      points: 1,
      matchingPairs: [
        { id: 1, left: '', right: '' },
        { id: 2, left: '', right: '' }
      ]
    }],
    timeLimit: content?.timeLimit || 0,
    showTimer: content?.showTimer || false
  });

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const currentQuestion = formData.questions[currentQuestionIndex];

  useEffect(() => {
    if (content && !isEditing) {
      setFormData({
        questions: content?.questions || formData.questions,
        timeLimit: content?.timeLimit || 0,
        showTimer: content?.showTimer || false
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

  const handleQuestionChange = (questionIndex, updates) => {
    const newQuestions = [...formData.questions];
    newQuestions[questionIndex] = { ...newQuestions[questionIndex], ...updates };
    handleChange({ questions: newQuestions });
  };

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      questionType: 'multiple-choice',
      question: '',
      options: ['', '', '', ''],
      correctAnswers: [0],
      correctText: '',
      ratingScale: 5,
      ratingStyle: 'stars',
      explanation: '',
      points: 1,
      matchingPairs: [
        { id: 1, left: '', right: '' },
        { id: 2, left: '', right: '' }
      ]
    };
    handleChange({ questions: [...formData.questions, newQuestion] });
    setCurrentQuestionIndex(formData.questions.length);
  };

  const removeQuestion = (index) => {
    if (formData.questions.length <= 1) {
      alert('Ein Quiz muss mindestens eine Frage haben.');
      return;
    }
    const newQuestions = formData.questions.filter((_, i) => i !== index);
    handleChange({ questions: newQuestions });
    if (currentQuestionIndex >= newQuestions.length) {
      setCurrentQuestionIndex(newQuestions.length - 1);
    }
  };

  const toggleCorrectAnswer = (optionIndex) => {
    const currentAnswers = currentQuestion.correctAnswers || [0];
    const newAnswers = currentAnswers.includes(optionIndex)
      ? currentAnswers.filter(i => i !== optionIndex)
      : [...currentAnswers, optionIndex];
    
    // Ensure at least one answer is selected
    if (newAnswers.length === 0) {
      return;
    }
    
    handleQuestionChange(currentQuestionIndex, { correctAnswers: newAnswers });
  };

  const updateOption = (index, value) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    handleQuestionChange(currentQuestionIndex, { options: newOptions });
  };

  const addOption = () => {
    handleQuestionChange(currentQuestionIndex, {
      options: [...currentQuestion.options, '']
    });
  };

  const removeOption = (index) => {
    if (currentQuestion.options.length <= 2) return;
    const newOptions = currentQuestion.options.filter((_, i) => i !== index);
    const newCorrectAnswers = currentQuestion.correctAnswers
      .filter(i => i !== index)
      .map(i => i > index ? i - 1 : i);
    handleQuestionChange(currentQuestionIndex, {
      options: newOptions,
      correctAnswers: newCorrectAnswers.length > 0 ? newCorrectAnswers : [0]
    });
  };

  if (isEditing) {
    return (
      <div className="space-y-4">
        {/* Question Navigation */}
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              Frage {currentQuestionIndex + 1} von {formData.questions.length}
            </h3>
            <button
              onClick={addQuestion}
              className="px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg flex items-center gap-2"
            >
              <Plus size={16} />
              Frage hinzufügen
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
              className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="flex-1 flex gap-2 overflow-x-auto">
              {formData.questions.map((q, index) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                    index === currentQuestionIndex
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentQuestionIndex(Math.min(formData.questions.length - 1, currentQuestionIndex + 1))}
              disabled={currentQuestionIndex === formData.questions.length - 1}
              className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={20} />
            </button>

            {formData.questions.length > 1 && (
              <button
                onClick={() => removeQuestion(currentQuestionIndex)}
                className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Question Type Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Fragetyp
          </label>
          <select
            value={currentQuestion.questionType}
            onChange={(e) => handleQuestionChange(currentQuestionIndex, { questionType: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="multiple-choice">Multiple Choice</option>
            <option value="short-answer">Kurzantwort (Text)</option>
            <option value="rating-scale">Bewertungsskala</option>
            <option value="matching">Zuordnung (Drag & Drop)</option>
          </select>
        </div>

        {/* Question Text */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Frage
          </label>
          <textarea
            value={currentQuestion.question}
            onChange={(e) => handleQuestionChange(currentQuestionIndex, { question: e.target.value })}
            className="w-full h-24 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            placeholder="Frage eingeben"
          />
        </div>

        {/* Multiple Choice Options */}
        {currentQuestion.questionType === 'multiple-choice' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-300">
                Antwortoptionen (mehrere richtige Antworten möglich)
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
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={currentQuestion.correctAnswers.includes(index)}
                    onChange={() => toggleCorrectAnswer(index)}
                    className="w-5 h-5 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-2 focus:ring-purple-500"
                    title="Als richtige Antwort markieren"
                  />
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder={`Option ${index + 1}`}
                  />
                  {currentQuestion.options.length > 2 && (
                    <button
                      onClick={() => removeOption(index)}
                      className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              ✓ = Richtige Antwort(en). Mehrere Antworten können richtig sein.
            </p>
          </div>
        )}

        {/* Short Answer */}
        {currentQuestion.questionType === 'short-answer' && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Musterantwort (optional)
            </label>
            <textarea
              value={currentQuestion.correctText}
              onChange={(e) => handleQuestionChange(currentQuestionIndex, { correctText: e.target.value })}
              className="w-full h-20 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              placeholder="Beispielantwort"
            />
          </div>
        )}

        {/* Explanation */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Erklärung (optional)
          </label>
          <textarea
            value={currentQuestion.explanation}
            onChange={(e) => handleQuestionChange(currentQuestionIndex, { explanation: e.target.value })}
            className="w-full h-20 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            placeholder="Erklärung zur richtigen Antwort"
          />
        </div>

        {/* Points */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Punkte
          </label>
          <input
            type="number"
            value={currentQuestion.points}
            onChange={(e) => handleQuestionChange(currentQuestionIndex, { points: parseInt(e.target.value) })}
            className="w-32 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            min="1"
          />
        </div>

        {/* Timer Settings */}
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <h4 className="text-sm font-semibold text-white mb-3">Timer-Einstellungen (für gesamtes Quiz)</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Zeitlimit (Sekunden, 0 = kein Limit)
              </label>
              <input
                type="number"
                value={formData.timeLimit}
                onChange={(e) => handleChange({ timeLimit: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                min="0"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mt-8">
                <input
                  type="checkbox"
                  checked={formData.showTimer}
                  onChange={(e) => handleChange({ showTimer: e.target.checked })}
                  className="w-5 h-5 rounded border-white/20 bg-white/5 text-purple-500"
                />
                Timer anzeigen
              </label>
            </div>
          </div>
        </div>

        {onSave && (
          <button
            onClick={() => onSave(formData)}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold text-white hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2"
          >
            <Save size={20} />
            <span>Speichern</span>
          </button>
        )}
      </div>
    );
  }

  // Client mode - render quiz
  return (
    <div className="bg-white/5 rounded-lg p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Quiz</h2>
        <p className="text-gray-400">
          {formData.questions.length} {formData.questions.length === 1 ? 'Frage' : 'Fragen'}
        </p>
      </div>
      
      <div className="text-center text-gray-300">
        Multi-question quiz client view coming soon...
      </div>
    </div>
  );
}

export default MultiQuizTemplate;
