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
  const [currentClientQuestion, setCurrentClientQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(formData.timeLimit);
  const [timerExpired, setTimerExpired] = useState(false);

  const currentQ = formData.questions[currentClientQuestion];
  const totalQuestions = formData.questions.length;
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / totalQuestions) * 100;

  // Timer countdown
  useEffect(() => {
    if (formData.timeLimit > 0 && !submitted && !timerExpired) {
      setTimeRemaining(formData.timeLimit);
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setTimerExpired(true);
            handleSubmitAll();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [formData.timeLimit, submitted, timerExpired]);

  const handleAnswer = (questionId, answer) => {
    setAnswers({ ...answers, [questionId]: answer });
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
    // TODO: Send answers to backend
    console.log('Quiz submitted:', answers);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateScore = () => {
    let correct = 0;
    formData.questions.forEach((q) => {
      const userAnswer = answers[q.id];
      if (q.questionType === 'multiple-choice' && userAnswer !== undefined) {
        const correctAnswers = q.correctAnswers || [0];
        if (Array.isArray(userAnswer)) {
          // Multiple correct answers - check if arrays match
          if (userAnswer.length === correctAnswers.length &&
              userAnswer.every(a => correctAnswers.includes(a))) {
            correct++;
          }
        } else {
          // Single answer
          if (correctAnswers.includes(userAnswer)) {
            correct++;
          }
        }
      }
    });
    return { correct, total: formData.questions.length };
  };

  return (
    <div className="bg-white/5 rounded-lg p-6">
      {/* Header with Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Quiz</h2>
            <p className="text-gray-400">
              Frage {currentClientQuestion + 1} von {totalQuestions}
            </p>
          </div>
          
          {formData.timeLimit > 0 && formData.showTimer && !submitted && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              timeRemaining <= 10 ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
            }`}>
              <Clock size={20} />
              <span className="font-mono font-bold text-lg">{formatTime(timeRemaining)}</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/10 rounded-full h-2 mb-2">
          <div
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-gray-400">
          {answeredCount} von {totalQuestions} beantwortet
        </p>
      </div>

      {!submitted ? (
        <>
          {/* Question */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-white mb-4">{currentQ.question}</h3>

            {/* Multiple Choice */}
            {currentQ.questionType === 'multiple-choice' && (
              <div className="space-y-3">
                {currentQ.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(currentQ.id, index)}
                    className={`w-full px-4 py-3 rounded-lg border text-left transition-all ${
                      answers[currentQ.id] === index
                        ? 'bg-purple-500/30 border-purple-500 text-white'
                        : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            {/* Short Answer */}
            {currentQ.questionType === 'short-answer' && (
              <textarea
                value={answers[currentQ.id] || ''}
                onChange={(e) => handleAnswer(currentQ.id, e.target.value)}
                className="w-full h-32 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Ihre Antwort hier eingeben..."
              />
            )}
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
                      : answers[q.id] !== undefined
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
                disabled={answeredCount < totalQuestions}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold text-white hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Quiz abgeben
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
        /* Results */
        <div className="text-center">
          <div className="mb-6">
            <div className="text-6xl mb-4">
              {(() => {
                const { correct, total } = calculateScore();
                const percentage = (correct / total) * 100;
                return percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : '📚';
              })()}
            </div>
            <h3 className="text-3xl font-bold text-white mb-2">Quiz abgeschlossen!</h3>
            <p className="text-xl text-gray-300">
              {(() => {
                const { correct, total } = calculateScore();
                return `${correct} von ${total} richtig`;
              })()}
            </p>
            <p className="text-lg text-gray-400 mt-2">
              {(() => {
                const { correct, total } = calculateScore();
                const percentage = Math.round((correct / total) * 100);
                return `${percentage}% korrekt`;
              })()}
            </p>
          </div>

          {timerExpired && (
            <p className="text-red-400 mb-4">⏱️ Zeit abgelaufen</p>
          )}

          {/* Question Review */}
          <div className="mt-8 space-y-4 text-left">
            <h4 className="text-lg font-semibold text-white mb-4">Überprüfung:</h4>
            {formData.questions.map((q, index) => {
              const userAnswer = answers[q.id];
              const isCorrect = q.questionType === 'multiple-choice' &&
                (q.correctAnswers || [0]).includes(userAnswer);
              
              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-lg border ${
                    isCorrect
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-red-500/10 border-red-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-semibold text-white">
                      {index + 1}. {q.question}
                    </p>
                    <span className={isCorrect ? 'text-green-400' : 'text-red-400'}>
                      {isCorrect ? '✓' : '✗'}
                    </span>
                  </div>
                  {q.questionType === 'multiple-choice' && (
                    <p className="text-sm text-gray-300">
                      Ihre Antwort: {q.options[userAnswer] || 'Keine Antwort'}
                    </p>
                  )}
                  {q.explanation && (
                    <p className="text-sm text-gray-400 mt-2">
                      <strong>Erklärung:</strong> {q.explanation}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default MultiQuizTemplate;
