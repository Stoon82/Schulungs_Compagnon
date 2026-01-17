import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, ChevronLeft, ChevronRight, Lock, Unlock, BarChart3 } from 'lucide-react';

/**
 * MultiPollTemplate - Poll template supporting multiple questions
 */
function MultiPollTemplate({ content, onChange, onSave, isEditing }) {
  const [formData, setFormData] = useState({
    questions: content?.questions || [{
      id: 1,
      question: '',
      options: ['', ''],
      allowMultiple: false,
      anonymousVoting: true,
      resultsDisplayMode: 'after', // 'never', 'after', 'live'
      visualizationType: 'bar', // 'bar', 'pie', 'emoji'
      pollClosed: false
    }]
  });

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const currentQuestion = formData.questions[currentQuestionIndex];

  useEffect(() => {
    if (content && !isEditing) {
      setFormData({
        questions: content?.questions || formData.questions
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
      question: '',
      options: ['', ''],
      allowMultiple: false,
      anonymousVoting: true,
      resultsDisplayMode: 'after',
      visualizationType: 'bar',
      pollClosed: false
    };
    handleChange({ questions: [...formData.questions, newQuestion] });
    setCurrentQuestionIndex(formData.questions.length);
  };

  const removeQuestion = (index) => {
    if (formData.questions.length <= 1) {
      alert('Eine Umfrage muss mindestens eine Frage haben.');
      return;
    }
    const newQuestions = formData.questions.filter((_, i) => i !== index);
    handleChange({ questions: newQuestions });
    if (currentQuestionIndex >= newQuestions.length) {
      setCurrentQuestionIndex(newQuestions.length - 1);
    }
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
    handleQuestionChange(currentQuestionIndex, { options: newOptions });
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

        {/* Options */}
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
            {currentQuestion.options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
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
        </div>

        {/* Poll Settings */}
        <div className="bg-white/5 rounded-lg p-4 border border-white/10 space-y-3">
          <h4 className="text-sm font-semibold text-white">Umfrage-Einstellungen</h4>
          
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={currentQuestion.allowMultiple}
              onChange={(e) => handleQuestionChange(currentQuestionIndex, { allowMultiple: e.target.checked })}
              className="w-5 h-5 rounded border-white/20 bg-white/5 text-purple-500"
            />
            Mehrfachauswahl erlauben
          </label>

          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={currentQuestion.anonymousVoting}
              onChange={(e) => handleQuestionChange(currentQuestionIndex, { anonymousVoting: e.target.checked })}
              className="w-5 h-5 rounded border-white/20 bg-white/5 text-purple-500"
            />
            Anonyme Abstimmung
          </label>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Ergebnisse anzeigen
            </label>
            <select
              value={currentQuestion.resultsDisplayMode}
              onChange={(e) => handleQuestionChange(currentQuestionIndex, { resultsDisplayMode: e.target.value })}
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
              value={currentQuestion.visualizationType}
              onChange={(e) => handleQuestionChange(currentQuestionIndex, { visualizationType: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="bar">Balkendiagramm</option>
              <option value="pie">Kreisdiagramm</option>
              <option value="emoji">Emoji-Anzeige</option>
            </select>
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

  // Client mode
  const [currentClientQuestion, setCurrentClientQuestion] = useState(0);
  const [votes, setVotes] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const currentQ = formData.questions[currentClientQuestion];
  const totalQuestions = formData.questions.length;
  const votedCount = Object.keys(votes).length;
  const progress = (votedCount / totalQuestions) * 100;

  const handleVote = (questionId, optionIndex) => {
    if (currentQ.allowMultiple) {
      const currentVotes = votes[questionId] || [];
      const newVotes = currentVotes.includes(optionIndex)
        ? currentVotes.filter(i => i !== optionIndex)
        : [...currentVotes, optionIndex];
      setVotes({ ...votes, [questionId]: newVotes });
    } else {
      setVotes({ ...votes, [questionId]: optionIndex });
    }
  };

  const handleNext = () => {
    if (currentClientQuestion < totalQuestions - 1) {
      setCurrentClientQuestion(currentClientQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentClientQuestion > 0) {
      setCurrentClientQuestion(currentClientQuestion - 1);
    }
  };

  const handleSubmitAll = () => {
    setSubmitted(true);
    // TODO: Send votes to backend
    console.log('Poll submitted:', votes);
  };

  return (
    <div className="bg-white/5 rounded-lg p-6">
      {/* Header with Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Umfrage</h2>
            <p className="text-gray-400">
              Frage {currentClientQuestion + 1} von {totalQuestions}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/10 rounded-full h-2 mb-2">
          <div
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-gray-400">
          {votedCount} von {totalQuestions} beantwortet
        </p>
      </div>

      {!submitted ? (
        <>
          {/* Question */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-white mb-4">{currentQ.question}</h3>
            
            {currentQ.allowMultiple && (
              <p className="text-sm text-gray-400 mb-3">Mehrfachauswahl möglich</p>
            )}

            <div className="space-y-3">
              {currentQ.options.map((option, index) => {
                const isSelected = currentQ.allowMultiple
                  ? (votes[currentQ.id] || []).includes(index)
                  : votes[currentQ.id] === index;

                return (
                  <button
                    key={index}
                    onClick={() => handleVote(currentQ.id, index)}
                    className={`w-full px-4 py-3 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'bg-purple-500/30 border-purple-500 text-white'
                        : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {currentQ.allowMultiple ? (
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          isSelected ? 'bg-purple-500 border-purple-500' : 'border-white/30'
                        }`}>
                          {isSelected && <span className="text-white text-xs">✓</span>}
                        </div>
                      ) : (
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-purple-500' : 'border-white/30'
                        }`}>
                          {isSelected && <div className="w-3 h-3 rounded-full bg-purple-500" />}
                        </div>
                      )}
                      <span>{option}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentClientQuestion === 0}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ChevronLeft size={20} />
              Zurück
            </button>

            <div className="flex gap-2">
              {formData.questions.map((q, index) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentClientQuestion(index)}
                  className={`w-10 h-10 rounded-lg ${
                    index === currentClientQuestion
                      ? 'bg-purple-500 text-white'
                      : votes[q.id] !== undefined
                      ? 'bg-green-500/30 text-green-400 border border-green-500'
                      : 'bg-white/5 text-gray-400 border border-white/10'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            {currentClientQuestion === totalQuestions - 1 ? (
              <button
                onClick={handleSubmitAll}
                disabled={votedCount < totalQuestions}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold text-white hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Umfrage abgeben
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg flex items-center gap-2"
              >
                Weiter
                <ChevronRight size={20} />
              </button>
            )}
          </div>
        </>
      ) : (
        /* Confirmation */
        <div className="text-center">
          <div className="text-6xl mb-4">✓</div>
          <h3 className="text-3xl font-bold text-white mb-2">Vielen Dank!</h3>
          <p className="text-xl text-gray-300">
            Ihre Antworten wurden gespeichert.
          </p>
          <p className="text-sm text-gray-400 mt-4">
            {votedCount} von {totalQuestions} Fragen beantwortet
          </p>
        </div>
      )}
    </div>
  );
}

export default MultiPollTemplate;
