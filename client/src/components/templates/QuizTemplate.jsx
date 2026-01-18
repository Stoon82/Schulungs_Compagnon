import { useState, useEffect } from 'react';
import { HelpCircle, Plus, Trash2, Save, Star, Clock, Eye, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react';

function QuizTemplate({ content, onChange, onSave, isEditing, isSessionMode = false, isAdmin = false, socket, sessionCode, onComplete }) {
  const [formData, setFormData] = useState({
    multipleQuestions: content?.multipleQuestions || false,
    questions: content?.questions || [{
      id: 1,
      questionType: 'multiple-choice',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: [0],
      allowMultipleCorrect: false,
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
    showTimer: content?.showTimer || false,
    currentQuestionIndex: content?.currentQuestionIndex || 0
  });

  const currentQuestion = formData.questions[formData.currentQuestionIndex] || formData.questions[0];
  const totalQuestions = formData.questions.length;

  const [matchingAnswers, setMatchingAnswers] = useState({});
  const [draggedItem, setDraggedItem] = useState(null);
  const [selectedMatchItem, setSelectedMatchItem] = useState(null); // For tap-to-match on mobile
  const [touchDragItem, setTouchDragItem] = useState(null); // For touch drag-and-drop
  const [touchDragPosition, setTouchDragPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (content && !isEditing) {
      setFormData({
        multipleQuestions: content?.multipleQuestions || false,
        questions: content?.questions || [{
          id: 1,
          questionType: 'multiple-choice',
          question: '',
          options: ['', '', '', ''],
          correctAnswer: [0],
          allowMultipleCorrect: false,
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
        showTimer: content?.showTimer || false,
        currentQuestionIndex: 0
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
      correctAnswer: [0],
      allowMultipleCorrect: false,
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
    const newQuestions = [...formData.questions, newQuestion];
    // Combine both updates into single handleChange to avoid race condition
    handleChange({ 
      questions: newQuestions, 
      multipleQuestions: true,
      currentQuestionIndex: newQuestions.length - 1  // Navigate to new question
    });
  };

  const removeQuestion = (index) => {
    if (formData.questions.length <= 1) {
      alert('Ein Quiz muss mindestens eine Frage haben.');
      return;
    }
    const newQuestions = formData.questions.filter((_, i) => i !== index);
    // Calculate new index before updating state
    const newIndex = formData.currentQuestionIndex >= newQuestions.length 
      ? newQuestions.length - 1 
      : formData.currentQuestionIndex;
    // Combine both updates into single handleChange
    handleChange({ 
      questions: newQuestions,
      currentQuestionIndex: newIndex
    });
  };

  const handleSave = () => {
    if (onSave) {
      onSave(formData);
    }
  };

  const addOption = () => {
    const newOptions = [...currentQuestion.options, ''];
    handleQuestionChange(formData.currentQuestionIndex, { options: newOptions });
  };

  const removeOption = (index) => {
    if (currentQuestion.options.length <= 2) {
      alert('Mindestens 2 Optionen erforderlich');
      return;
    }
    const newOptions = currentQuestion.options.filter((_, i) => i !== index);
    const newCorrectAnswer = currentQuestion.correctAnswer.filter(ans => ans < newOptions.length);
    handleQuestionChange(formData.currentQuestionIndex, { 
      options: newOptions,
      correctAnswer: newCorrectAnswer.length > 0 ? newCorrectAnswer : [0]
    });
  };

  const updateOption = (index, value) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    handleQuestionChange(formData.currentQuestionIndex, { options: newOptions });
  };

  const toggleCorrectAnswer = (index) => {
    if (currentQuestion.allowMultipleCorrect) {
      const newCorrectAnswer = currentQuestion.correctAnswer.includes(index)
        ? currentQuestion.correctAnswer.filter(i => i !== index)
        : [...currentQuestion.correctAnswer, index];
      handleQuestionChange(formData.currentQuestionIndex, { 
        correctAnswer: newCorrectAnswer.length > 0 ? newCorrectAnswer : [index]
      });
    } else {
      handleQuestionChange(formData.currentQuestionIndex, { correctAnswer: [index] });
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-4">
        {/* Question Navigation */}
        {formData.multipleQuestions && (
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Frage {formData.currentQuestionIndex + 1} von {totalQuestions}
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
                onClick={() => handleChange({ currentQuestionIndex: Math.max(0, formData.currentQuestionIndex - 1) })}
                disabled={formData.currentQuestionIndex === 0}
                className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="flex-1 flex gap-2 overflow-x-auto">
                {formData.questions.map((q, index) => (
                  <button
                    key={q.id}
                    onClick={() => handleChange({ currentQuestionIndex: index })}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                      index === formData.currentQuestionIndex
                        ? 'bg-purple-500 text-white'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handleChange({ currentQuestionIndex: Math.min(totalQuestions - 1, formData.currentQuestionIndex + 1) })}
                disabled={formData.currentQuestionIndex === totalQuestions - 1}
                className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={20} />
              </button>

              {totalQuestions > 1 && (
                <button
                  onClick={() => removeQuestion(formData.currentQuestionIndex)}
                  className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Enable Multiple Questions Toggle */}
        {!formData.multipleQuestions && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <button
              onClick={() => handleChange({ multipleQuestions: true })}
              className="w-full px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              Mehrere Fragen aktivieren
            </button>
          </div>
        )}

        {/* Question Type Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Fragetyp
          </label>
          <select
            value={currentQuestion.questionType}
            onChange={(e) => handleQuestionChange(formData.currentQuestionIndex, { questionType: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="multiple-choice">Multiple Choice</option>
            <option value="short-answer">Kurzantwort (Text)</option>
            <option value="rating-scale">Bewertungsskala</option>
            <option value="matching">Zuordnung (Drag & Drop)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Frage
          </label>
          <textarea
            value={currentQuestion.question}
            onChange={(e) => handleQuestionChange(formData.currentQuestionIndex, { question: e.target.value })}
            className="w-full h-24 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            placeholder="Frage eingeben"
          />
        </div>

        {/* Multiple Choice Options */}
        {currentQuestion.questionType === 'multiple-choice' && (
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
            
            <label className="flex items-center gap-2 text-sm text-gray-300 mb-3">
              <input
                type="checkbox"
                checked={currentQuestion.allowMultipleCorrect}
                onChange={(e) => handleQuestionChange(formData.currentQuestionIndex, { 
                  allowMultipleCorrect: e.target.checked,
                  correctAnswer: e.target.checked ? currentQuestion.correctAnswer : [currentQuestion.correctAnswer[0] || 0]
                })}
                className="w-5 h-5 rounded border-white/20 bg-white/5 text-purple-500"
              />
              Mehrere richtige Antworten erlauben
            </label>

            <div className="space-y-2">
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type={currentQuestion.allowMultipleCorrect ? "checkbox" : "radio"}
                    name="correctAnswer"
                    checked={currentQuestion.correctAnswer.includes(index)}
                    onChange={() => toggleCorrectAnswer(index)}
                    className="w-5 h-5 text-purple-500 focus:ring-purple-500"
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
                      className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {currentQuestion.allowMultipleCorrect 
                ? 'Wählen Sie alle richtigen Antworten aus' 
                : 'Wählen Sie die richtige Antwort aus'}
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
              onChange={(e) => handleQuestionChange(formData.currentQuestionIndex, { correctText: e.target.value })}
              className="w-full h-20 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              placeholder="Beispiel einer korrekten Antwort (wird nicht zur Bewertung verwendet)"
            />
            <p className="text-xs text-gray-400 mt-1">
              Kurzantworten müssen manuell bewertet werden
            </p>
          </div>
        )}

        {/* Rating Scale */}
        {currentQuestion.questionType === 'rating-scale' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Skala
                </label>
                <select
                  value={currentQuestion.ratingScale}
                  onChange={(e) => handleQuestionChange(formData.currentQuestionIndex, { ratingScale: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="3">1-3</option>
                  <option value="5">1-5</option>
                  <option value="7">1-7</option>
                  <option value="10">1-10</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Stil
                </label>
                <select
                  value={currentQuestion.ratingStyle}
                  onChange={(e) => handleQuestionChange(formData.currentQuestionIndex, { ratingStyle: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="stars">Sterne ⭐</option>
                  <option value="numbers">Zahlen (1-{currentQuestion.ratingScale})</option>
                  <option value="emojis">Emojis 😊</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Matching Pairs */}
        {currentQuestion.questionType === 'matching' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-300">
                Zuordnungspaare
              </label>
              <button
                onClick={() => {
                  const newPair = { id: Date.now(), left: '', right: '' };
                  handleQuestionChange(formData.currentQuestionIndex, { matchingPairs: [...currentQuestion.matchingPairs, newPair] });
                }}
                className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                <Plus size={16} />
                Paar hinzufügen
              </button>
            </div>
            <div className="space-y-3">
              {currentQuestion.matchingPairs.map((pair, index) => (
                <div key={pair.id} className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      value={pair.left}
                      onChange={(e) => {
                        const newPairs = [...currentQuestion.matchingPairs];
                        newPairs[index].left = e.target.value;
                        handleQuestionChange(formData.currentQuestionIndex, { matchingPairs: newPairs });
                      }}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder={`Begriff ${index + 1}`}
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={pair.right}
                      onChange={(e) => {
                        const newPairs = [...currentQuestion.matchingPairs];
                        newPairs[index].right = e.target.value;
                        handleQuestionChange(formData.currentQuestionIndex, { matchingPairs: newPairs });
                      }}
                      className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder={`Zuordnung ${index + 1}`}
                    />
                    {currentQuestion.matchingPairs.length > 2 && (
                      <button
                        onClick={() => {
                          const newPairs = currentQuestion.matchingPairs.filter((_, i) => i !== index);
                          handleQuestionChange(formData.currentQuestionIndex, { matchingPairs: newPairs });
                        }}
                        className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Teilnehmer müssen die rechten Begriffe den linken zuordnen
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Erklärung (optional)
          </label>
          <textarea
            value={currentQuestion.explanation}
            onChange={(e) => handleQuestionChange(formData.currentQuestionIndex, { explanation: e.target.value })}
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
            value={currentQuestion.points}
            onChange={(e) => handleQuestionChange(formData.currentQuestionIndex, { points: parseInt(e.target.value) })}
            className="w-32 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            min="1"
          />
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

  // Client/Preview mode - Interactive quiz
  const [selectedAnswers, setSelectedAnswers] = useState([]); // Changed to array for multiple selection
  const [shortAnswer, setShortAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(formData.timeLimit);
  const [timerExpired, setTimerExpired] = useState(false);
  const [adminRevealAnswer, setAdminRevealAnswer] = useState(false);
  const [shuffledMatchingOptions, setShuffledMatchingOptions] = useState([]);
  
  // Multi-question session mode state
  const [sessionQuestionIndex, setSessionQuestionIndex] = useState(0);
  const [questionAnswers, setQuestionAnswers] = useState({}); // Track answers for all questions
  const [allQuestionsCompleted, setAllQuestionsCompleted] = useState(false);
  const [showFinalResults, setShowFinalResults] = useState(false);
  
  // In session mode, use sessionQuestionIndex; in editing mode, use formData.currentQuestionIndex
  const activeQuestionIndex = isSessionMode ? sessionQuestionIndex : formData.currentQuestionIndex;
  const activeQuestion = formData.questions[activeQuestionIndex] || formData.questions[0];
  
  // Shuffle matching options once when question changes
  useEffect(() => {
    if (activeQuestion.questionType === 'matching' && activeQuestion.matchingPairs) {
      const options = activeQuestion.matchingPairs.map(pair => pair.right);
      // Fisher-Yates shuffle
      const shuffled = [...options];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      setShuffledMatchingOptions(shuffled);
    }
  }, [activeQuestionIndex, activeQuestion.questionType]);

  // Timer countdown
  useEffect(() => {
    if (!isEditing && formData.timeLimit > 0 && !submitted && !timerExpired) {
      setTimeRemaining(formData.timeLimit);
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setTimerExpired(true);
            setSubmitted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isEditing, formData.timeLimit, submitted, timerExpired]);

  const handleSubmit = () => {
    // Check if question has multiple correct answers
    const hasMultipleCorrect = Array.isArray(activeQuestion.correctAnswer) && activeQuestion.correctAnswer.length > 1;
    
    // Calculate if answer is correct
    let isCorrect = null;
    if (activeQuestion.questionType === 'multiple-choice') {
      if (hasMultipleCorrect) {
        // For multiple correct answers: check if all selected match all correct
        const correctSet = new Set(activeQuestion.correctAnswer);
        const selectedSet = new Set(selectedAnswers);
        isCorrect = correctSet.size === selectedSet.size && 
                    [...correctSet].every(x => selectedSet.has(x));
      } else {
        // Single correct answer
        const correctAnswer = Array.isArray(activeQuestion.correctAnswer) 
          ? activeQuestion.correctAnswer[0] 
          : activeQuestion.correctAnswer;
        isCorrect = selectedAnswers.length === 1 && selectedAnswers[0] === correctAnswer;
      }
    } else if (activeQuestion.questionType === 'matching' && activeQuestion.matchingPairs) {
      // Check if all matching pairs are correct
      const allPairsMatched = activeQuestion.matchingPairs.length === Object.keys(matchingAnswers).length;
      const allCorrect = activeQuestion.matchingPairs.every(pair => 
        matchingAnswers[pair.left] === pair.right
      );
      isCorrect = allPairsMatched && allCorrect;
    } else if (activeQuestion.questionType === 'rating-scale') {
      // Rating scale is always "correct" as there's no wrong answer
      isCorrect = true;
    }
    
    // Save answer for this question
    const answer = {
      questionId: activeQuestion.id,
      questionIndex: activeQuestionIndex,
      selectedAnswers,
      shortAnswer,
      matchingAnswers,
      isCorrect
    };
    
    setQuestionAnswers(prev => ({
      ...prev,
      [activeQuestionIndex]: answer
    }));
    
    setSubmitted(true);
    
    // TODO: Send answer to backend via socket/API
    if (socket && sessionCode) {
      socket.emit('quiz:answer', {
        sessionCode,
        questionIndex: activeQuestionIndex,
        answer
      });
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderRatingScale = () => {
    const items = [];
    const emojis = ['😞', '😕', '😐', '🙂', '😊', '😄', '🤩'];
    const ratingScale = activeQuestion.ratingScale || formData.ratingScale || 5;
    const ratingStyle = activeQuestion.ratingStyle || formData.ratingStyle || 'numbers';
    
    for (let i = 1; i <= ratingScale; i++) {
      let content;
      if (ratingStyle === 'stars') {
        content = <Star size={24} className="fill-yellow-400 text-yellow-400" />;
      } else if (ratingStyle === 'emojis') {
        const emojiIndex = Math.floor((i - 1) / ratingScale * (emojis.length - 1));
        content = <span className="text-2xl">{emojis[emojiIndex]}</span>;
      } else {
        content = <span className="text-xl font-bold">{i}</span>;
      }

      items.push(
        <button
          key={i}
          onClick={() => setSelectedAnswers([i])}
          disabled={submitted}
          className={`flex flex-col items-center justify-center p-4 border rounded-lg transition-all ${
            selectedAnswers.includes(i)
              ? 'bg-purple-500/30 border-purple-500'
              : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-purple-500/50'
          } ${submitted ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {content}
          {ratingStyle === 'numbers' && (
            <span className="text-xs text-gray-400 mt-1">{i}</span>
          )}
        </button>
      );
    }
    return items;
  };

  // Touch drag-and-drop handlers
  const handleTouchStart = (e, type, value) => {
    if (submitted) return;
    const touch = e.touches[0];
    setTouchDragItem({ type, value });
    setTouchDragPosition({ x: touch.clientX, y: touch.clientY });
    setSelectedMatchItem(null);
  };

  const handleTouchMove = (e) => {
    if (!touchDragItem) return;
    e.preventDefault(); // Prevent scrolling while dragging
    const touch = e.touches[0];
    setTouchDragPosition({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (e) => {
    if (!touchDragItem) return;
    
    const touch = e.changedTouches[0];
    const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);
    
    // Find the drop target element with data attributes
    let targetElement = dropTarget;
    while (targetElement && !targetElement.dataset?.matchType) {
      targetElement = targetElement.parentElement;
    }
    
    if (targetElement && targetElement.dataset?.matchType) {
      const targetType = targetElement.dataset.matchType;
      const targetValue = targetElement.dataset.matchValue;
      
      // Check if we can make a match (opposite types)
      if (touchDragItem.type === 'left' && targetType === 'right') {
        const isTargetMatched = Object.values(matchingAnswers).includes(targetValue);
        if (!isTargetMatched) {
          setMatchingAnswers({ ...matchingAnswers, [touchDragItem.value]: targetValue });
        }
      } else if (touchDragItem.type === 'right' && targetType === 'left') {
        const isTargetMatched = matchingAnswers[targetValue];
        if (!isTargetMatched) {
          setMatchingAnswers({ ...matchingAnswers, [targetValue]: touchDragItem.value });
        }
      }
    }
    
    setTouchDragItem(null);
    setTouchDragPosition({ x: 0, y: 0 });
  };

  // Handle moving to next question in session mode
  const handleNextQuestion = () => {
    if (sessionQuestionIndex < totalQuestions - 1) {
      setSessionQuestionIndex(sessionQuestionIndex + 1);
      setSubmitted(false);
      setSelectedAnswers([]);
      setShortAnswer('');
      setMatchingAnswers({});
      setSelectedMatchItem(null); // Reset tap-to-match selection
      setTouchDragItem(null); // Reset touch drag
    } else {
      // All questions completed
      setAllQuestionsCompleted(true);
      setShowFinalResults(true);
      if (onComplete) {
        onComplete();
      }
    }
  };

  // Calculate total score
  const calculateScore = () => {
    let correct = 0;
    let total = 0;
    Object.values(questionAnswers).forEach(answer => {
      if (answer.isCorrect !== null) {
        total++;
        if (answer.isCorrect) correct++;
      }
    });
    return { correct, total };
  };

  // Show final results view after all questions completed
  if (showFinalResults && allQuestionsCompleted) {
    const score = calculateScore();
    return (
      <div className="bg-white/5 rounded-lg p-6">
        <div className="text-center mb-8">
          <h3 className="text-3xl font-bold text-white mb-4">Quiz Abgeschlossen!</h3>
          <div className="text-6xl mb-4">
            {score.correct === score.total ? '🎉' : score.correct >= score.total / 2 ? '👍' : '📚'}
          </div>
          <p className="text-2xl text-white">
            <span className="text-green-400 font-bold">{score.correct}</span> von <span className="font-bold">{score.total}</span> richtig
          </p>
          <p className="text-gray-400 mt-2">
            {Math.round((score.correct / score.total) * 100)}% korrekt
          </p>
        </div>
        
        {/* Question review */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white">Übersicht:</h4>
          {formData.questions.map((q, idx) => {
            const answer = questionAnswers[idx];
            return (
              <div key={q.id} className={`p-4 rounded-lg border ${
                answer?.isCorrect === true ? 'bg-green-500/10 border-green-500/30' :
                answer?.isCorrect === false ? 'bg-red-500/10 border-red-500/30' :
                'bg-blue-500/10 border-blue-500/30'
              }`}>
                <div className="flex items-center gap-2">
                  <span className={`text-lg ${
                    answer?.isCorrect === true ? 'text-green-400' :
                    answer?.isCorrect === false ? 'text-red-400' :
                    'text-blue-400'
                  }`}>
                    {answer?.isCorrect === true ? '✓' : answer?.isCorrect === false ? '✗' : '•'}
                  </span>
                  <span className="text-white font-medium">Frage {idx + 1}: {q.question}</span>
                </div>
                {q.explanation && (
                  <p className="text-sm text-gray-400 mt-2 ml-6">{q.explanation}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 rounded-lg p-6">
      {/* Multi-question progress indicator */}
      {totalQuestions > 1 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Frage {activeQuestionIndex + 1} von {totalQuestions}</span>
            <span className="text-sm text-gray-400">
              {Object.keys(questionAnswers).length} beantwortet
            </span>
          </div>
          <div className="flex gap-1">
            {formData.questions.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 flex-1 rounded-full transition-all ${
                  idx === activeQuestionIndex ? 'bg-purple-500' :
                  questionAnswers[idx] ? (questionAnswers[idx].isCorrect ? 'bg-green-500' : 'bg-red-500') :
                  'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold text-white">
          {activeQuestion.question || 'Frage'}
        </h3>
        <div className="flex items-center gap-3">
          {/* Timer Display */}
          {formData.timeLimit > 0 && formData.showTimer && !submitted && (
            <div className={`flex items-center gap-2 px-3 py-1 rounded ${
              timeRemaining <= 10 ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
            }`}>
              <Clock size={16} />
              <span className="font-mono font-bold">{formatTime(timeRemaining)}</span>
            </div>
          )}
          
          {/* Admin Reveal Answer Button (only show in preview/admin mode) */}
          {!isEditing && isAdmin && activeQuestion.questionType === 'multiple-choice' && (
            <button
              onClick={() => setAdminRevealAnswer(!adminRevealAnswer)}
              className="px-3 py-1 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded flex items-center gap-2 text-sm"
              title="Antwort aufdecken (Admin)"
            >
              {adminRevealAnswer ? <EyeOff size={16} /> : <Eye size={16} />}
              {adminRevealAnswer ? 'Verbergen' : 'Aufdecken'}
            </button>
          )}
          
          <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded">
            {activeQuestion.questionType === 'multiple-choice' && 'Multiple Choice'}
            {activeQuestion.questionType === 'short-answer' && 'Kurzantwort'}
            {activeQuestion.questionType === 'rating-scale' && 'Bewertung'}
          </span>
        </div>
      </div>

      {/* Multiple Choice - Interactive */}
      {activeQuestion.questionType === 'multiple-choice' && (() => {
        const correctAnswer = Array.isArray(activeQuestion.correctAnswer) 
          ? activeQuestion.correctAnswer 
          : [activeQuestion.correctAnswer];
        const hasMultipleCorrect = correctAnswer.length > 1;
        
        const handleOptionClick = (index) => {
          if (hasMultipleCorrect) {
            // Multiple selection allowed
            setSelectedAnswers(prev => 
              prev.includes(index) 
                ? prev.filter(i => i !== index)
                : [...prev, index]
            );
          } else {
            // Single selection
            setSelectedAnswers([index]);
          }
        };
        
        return (
          <div className="space-y-3">
            {hasMultipleCorrect && (
              <p className="text-sm text-purple-400 mb-2">
                ✓ Mehrere Antworten möglich ({correctAnswer.length} richtige Antworten)
              </p>
            )}
            {activeQuestion.options.map((option, index) => {
              const isCorrect = correctAnswer.includes(index);
              const isSelected = selectedAnswers.includes(index);
              
              return (
                <button
                  key={index}
                  onClick={() => handleOptionClick(index)}
                  disabled={submitted}
                  className={`w-full px-4 py-3 rounded-lg border transition-all text-left ${
                    (submitted || adminRevealAnswer) && isCorrect
                      ? 'bg-green-500/20 border-green-500 text-green-400'
                      : submitted && isSelected && !isCorrect
                      ? 'bg-red-500/20 border-red-500 text-red-400'
                      : isSelected
                      ? 'bg-purple-500/30 border-purple-500 text-white'
                      : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                  } ${submitted ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 ${hasMultipleCorrect ? 'rounded' : 'rounded-full'} border-2 flex items-center justify-center ${
                      isSelected ? 'border-purple-500' : 'border-white/30'
                    }`}>
                      {isSelected && (
                        <div className={`w-3 h-3 ${hasMultipleCorrect ? 'rounded' : 'rounded-full'} bg-purple-500`} />
                      )}
                    </div>
                    <span className="flex-1">{option || `Option ${index + 1}`}</span>
                    {(submitted || adminRevealAnswer) && isCorrect && <span className="text-green-400">✓</span>}
                    {submitted && isSelected && !isCorrect && <span className="text-red-400">✗</span>}
                    {adminRevealAnswer && !submitted && isCorrect && (
                      <span className="text-xs text-yellow-400">(Richtig)</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        );
      })()}

      {/* Short Answer - Interactive */}
      {activeQuestion.questionType === 'short-answer' && (
        <div>
          <textarea
            value={shortAnswer}
            onChange={(e) => setShortAnswer(e.target.value)}
            disabled={submitted}
            className="w-full h-32 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Ihre Antwort hier eingeben..."
          />
          {submitted && activeQuestion.correctText && (
            <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-sm text-blue-300">
                <strong>Musterantwort:</strong> {activeQuestion.correctText}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Matching Pairs - Interactive */}
      {activeQuestion.questionType === 'matching' && activeQuestion.matchingPairs && (
        <div className="space-y-4" onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
          <p className="text-sm text-purple-400 text-center mb-2">
            📱 Ziehen Sie per Touch oder tippen Sie auf einen Begriff und dann auf die Zuordnung. 
            💻 Drag & Drop funktioniert auch. Tippen Sie auf ein Paar, um es zu trennen.
          </p>
          
          {/* Touch drag ghost element */}
          {touchDragItem && (
            <div 
              className="fixed z-50 px-4 py-2 bg-purple-500 text-white rounded-lg shadow-xl pointer-events-none transform -translate-x-1/2 -translate-y-1/2 opacity-90"
              style={{ left: touchDragPosition.x, top: touchDragPosition.y }}
            >
              {touchDragItem.value}
            </div>
          )}
          
          {/* Selection indicator for tap-to-match */}
          {selectedMatchItem && !touchDragItem && (
            <div className="bg-purple-500/20 border border-purple-500 rounded-lg p-3 text-center">
              <span className="text-purple-300">
                Ausgewählt: <strong className="text-white">{selectedMatchItem.value}</strong>
                {' '}- Tippen Sie auf {selectedMatchItem.type === 'left' ? 'eine Zuordnung' : 'einen Begriff'}
              </span>
              <button
                onClick={() => setSelectedMatchItem(null)}
                className="ml-3 text-xs text-gray-400 hover:text-white underline"
              >
                Abbrechen
              </button>
            </div>
          )}
          
          {/* Two columns side by side - both draggable, both droppable */}
          <div className="grid grid-cols-2 gap-4 sm:gap-8">
            {/* Left column - Terms (draggable + drop zone for right items) */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-300 text-center">Begriffe</h4>
              {activeQuestion.matchingPairs.map((pair, index) => {
                const isMatched = matchingAnswers[pair.left];
                const isBeingDragged = draggedItem?.type === 'left' && draggedItem?.value === pair.left;
                const isSelected = selectedMatchItem?.type === 'left' && selectedMatchItem?.value === pair.left;
                
                const handleLeftItemClick = () => {
                  if (submitted) return;
                  
                  // If already matched, unmatch it
                  if (isMatched) {
                    const newAnswers = { ...matchingAnswers };
                    delete newAnswers[pair.left];
                    setMatchingAnswers(newAnswers);
                    setSelectedMatchItem(null);
                    return;
                  }
                  
                  // If a right item is selected, create match
                  if (selectedMatchItem?.type === 'right') {
                    const rightValue = selectedMatchItem.value;
                    const isRightMatched = Object.values(matchingAnswers).includes(rightValue);
                    if (!isRightMatched) {
                      setMatchingAnswers({ ...matchingAnswers, [pair.left]: rightValue });
                      setSelectedMatchItem(null);
                    }
                    return;
                  }
                  
                  // Select this left item for matching
                  setSelectedMatchItem({ type: 'left', value: pair.left });
                };
                
                return (
                  <div
                    key={`left-${pair.id}`}
                    data-match-type="left"
                    data-match-value={pair.left}
                    draggable={!submitted && !isMatched}
                    onDragStart={(e) => {
                      if (!submitted && !isMatched) {
                        e.dataTransfer.effectAllowed = 'move';
                        e.dataTransfer.setData('text/plain', pair.left);
                        setDraggedItem({ type: 'left', value: pair.left });
                        setSelectedMatchItem(null);
                      }
                    }}
                    onDragEnd={() => setDraggedItem(null)}
                    onDragOver={(e) => {
                      if (draggedItem?.type === 'right' && !isMatched) {
                        e.preventDefault();
                      }
                    }}
                    onDragEnter={(e) => {
                      if (draggedItem?.type === 'right' && !isMatched) {
                        e.currentTarget.classList.add('ring-2', 'ring-purple-500', 'bg-purple-500/20');
                      }
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.classList.remove('ring-2', 'ring-purple-500', 'bg-purple-500/20');
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('ring-2', 'ring-purple-500', 'bg-purple-500/20');
                      if (draggedItem?.type === 'right' && !submitted && !isMatched) {
                        setMatchingAnswers({ ...matchingAnswers, [pair.left]: draggedItem.value });
                        setDraggedItem(null);
                      }
                    }}
                    onTouchStart={(e) => {
                      if (!isMatched) {
                        handleTouchStart(e, 'left', pair.left);
                      }
                    }}
                    onClick={handleLeftItemClick}
                    className={`px-4 py-3 rounded-lg border-2 transition-all select-none touch-none ${
                      submitted && isMatched && matchingAnswers[pair.left] === pair.right
                        ? 'bg-green-500/20 border-green-500 text-green-400'
                        : submitted && isMatched
                        ? 'bg-red-500/20 border-red-500 text-red-400'
                        : isMatched
                        ? 'bg-blue-500/20 border-blue-500 text-white cursor-pointer hover:bg-blue-500/30'
                        : isSelected
                        ? 'bg-purple-500/40 border-purple-400 text-white ring-2 ring-purple-400'
                        : isBeingDragged
                        ? 'bg-purple-500/40 border-purple-400 text-white cursor-grabbing opacity-50'
                        : 'bg-white/5 border-white/20 text-white cursor-pointer hover:bg-white/10 hover:border-purple-500/50 active:bg-purple-500/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="break-words">{pair.left}</span>
                      {isMatched && (
                        <span className="text-xs text-blue-400 ml-2 flex-shrink-0">→ {matchingAnswers[pair.left]}</span>
                      )}
                      {submitted && isMatched && (
                        <span className={`ml-2 flex-shrink-0 ${matchingAnswers[pair.left] === pair.right ? 'text-green-400' : 'text-red-400'}`}>
                          {matchingAnswers[pair.left] === pair.right ? '✓' : '✗'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right column - Options (draggable + drop zone for left items) */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-300 text-center">Zuordnungen</h4>
              {shuffledMatchingOptions.map((rightItem, index) => {
                const isMatched = Object.values(matchingAnswers).includes(rightItem);
                const matchedLeft = Object.keys(matchingAnswers).find(k => matchingAnswers[k] === rightItem);
                const isBeingDragged = draggedItem?.type === 'right' && draggedItem?.value === rightItem;
                const isSelected = selectedMatchItem?.type === 'right' && selectedMatchItem?.value === rightItem;
                
                const handleRightItemClick = () => {
                  if (submitted) return;
                  
                  // If already matched, unmatch it
                  if (isMatched && matchedLeft) {
                    const newAnswers = { ...matchingAnswers };
                    delete newAnswers[matchedLeft];
                    setMatchingAnswers(newAnswers);
                    setSelectedMatchItem(null);
                    return;
                  }
                  
                  // If a left item is selected, create match
                  if (selectedMatchItem?.type === 'left') {
                    const leftValue = selectedMatchItem.value;
                    const isLeftMatched = matchingAnswers[leftValue];
                    if (!isLeftMatched) {
                      setMatchingAnswers({ ...matchingAnswers, [leftValue]: rightItem });
                      setSelectedMatchItem(null);
                    }
                    return;
                  }
                  
                  // Select this right item for matching
                  setSelectedMatchItem({ type: 'right', value: rightItem });
                };
                
                return (
                  <div
                    key={`right-${rightItem}-${index}`}
                    data-match-type="right"
                    data-match-value={rightItem}
                    draggable={!submitted && !isMatched}
                    onDragStart={(e) => {
                      if (!submitted && !isMatched) {
                        e.dataTransfer.effectAllowed = 'move';
                        e.dataTransfer.setData('text/plain', rightItem);
                        setDraggedItem({ type: 'right', value: rightItem });
                        setSelectedMatchItem(null);
                      }
                    }}
                    onDragEnd={() => setDraggedItem(null)}
                    onDragOver={(e) => {
                      if (draggedItem?.type === 'left' && !isMatched) {
                        e.preventDefault();
                      }
                    }}
                    onDragEnter={(e) => {
                      if (draggedItem?.type === 'left' && !isMatched) {
                        e.currentTarget.classList.add('ring-2', 'ring-purple-500', 'bg-purple-500/20');
                      }
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.classList.remove('ring-2', 'ring-purple-500', 'bg-purple-500/20');
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('ring-2', 'ring-purple-500', 'bg-purple-500/20');
                      if (draggedItem?.type === 'left' && !submitted && !isMatched) {
                        setMatchingAnswers({ ...matchingAnswers, [draggedItem.value]: rightItem });
                        setDraggedItem(null);
                      }
                    }}
                    onTouchStart={(e) => {
                      if (!isMatched) {
                        handleTouchStart(e, 'right', rightItem);
                      }
                    }}
                    onClick={handleRightItemClick}
                    className={`px-4 py-3 rounded-lg border-2 transition-all select-none touch-none ${
                      submitted && isMatched && matchedLeft && activeQuestion.matchingPairs.find(p => p.left === matchedLeft)?.right === rightItem
                        ? 'bg-green-500/20 border-green-500 text-green-400'
                        : submitted && isMatched
                        ? 'bg-red-500/20 border-red-500 text-red-400'
                        : isMatched
                        ? 'bg-blue-500/20 border-blue-500 text-white cursor-pointer hover:bg-blue-500/30'
                        : isSelected
                        ? 'bg-purple-500/40 border-purple-400 text-white ring-2 ring-purple-400'
                        : isBeingDragged
                        ? 'bg-purple-500/40 border-purple-400 text-white cursor-grabbing opacity-50'
                        : 'bg-purple-500/10 border-purple-500/30 text-white cursor-pointer hover:bg-purple-500/20 hover:border-purple-500 active:bg-purple-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      {isMatched && matchedLeft && (
                        <span className="text-xs text-blue-400 mr-2 flex-shrink-0">{matchedLeft} ←</span>
                      )}
                      <span className={`break-words ${isMatched ? '' : 'w-full'}`}>{rightItem || `Option ${index + 1}`}</span>
                      {submitted && isMatched && matchedLeft && (
                        <span className={`ml-2 flex-shrink-0 ${activeQuestion.matchingPairs.find(p => p.left === matchedLeft)?.right === rightItem ? 'text-green-400' : 'text-red-400'}`}>
                          {activeQuestion.matchingPairs.find(p => p.left === matchedLeft)?.right === rightItem ? '✓' : '✗'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Match count indicator */}
          <div className="text-center text-sm text-gray-400">
            {Object.keys(matchingAnswers).length} / {activeQuestion.matchingPairs.length} Paare zugeordnet
          </div>
        </div>
      )}

      {/* Rating Scale - Interactive */}
      {activeQuestion.questionType === 'rating-scale' && (
        <div className={`grid gap-3 ${
          activeQuestion.ratingScale <= 5 ? 'grid-cols-5' : 'grid-cols-5'
        }`}>
          {renderRatingScale()}
        </div>
      )}

      {/* Submit Button */}
      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={
            (activeQuestion.questionType === 'multiple-choice' && selectedAnswers.length === 0) ||
            (activeQuestion.questionType === 'short-answer' && !shortAnswer.trim()) ||
            (activeQuestion.questionType === 'rating-scale' && selectedAnswers.length === 0) ||
            (activeQuestion.questionType === 'matching' && activeQuestion.matchingPairs && Object.keys(matchingAnswers).length < activeQuestion.matchingPairs.length)
          }
          className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold text-white hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Antwort abgeben
        </button>
      )}

      {/* Result Message */}
      {submitted && (
        <div className={`mt-6 p-4 rounded-lg border ${
          activeQuestion.questionType === 'multiple-choice' && questionAnswers[activeQuestionIndex]?.isCorrect
            ? 'bg-green-500/10 border-green-500/30'
            : activeQuestion.questionType === 'multiple-choice'
            ? 'bg-red-500/10 border-red-500/30'
            : 'bg-blue-500/10 border-blue-500/30'
        }`}>
          <p className={`font-semibold ${
            activeQuestion.questionType === 'multiple-choice' && questionAnswers[activeQuestionIndex]?.isCorrect
              ? 'text-green-400'
              : activeQuestion.questionType === 'multiple-choice'
              ? 'text-red-400'
              : 'text-blue-400'
          }`}>
            {activeQuestion.questionType === 'multiple-choice' && questionAnswers[activeQuestionIndex]?.isCorrect && '✓ Richtig!'}
            {activeQuestion.questionType === 'multiple-choice' && !questionAnswers[activeQuestionIndex]?.isCorrect && '✗ Leider falsch'}
            {activeQuestion.questionType !== 'multiple-choice' && '✓ Antwort eingereicht'}
            {timerExpired && ' (Zeit abgelaufen)'}
          </p>
          {activeQuestion.explanation && (
            <p className="text-sm text-gray-300 mt-2">
              <strong>Erklärung:</strong> {activeQuestion.explanation}
            </p>
          )}
        </div>
      )}

      {/* Next Question Button (for multi-question quizzes) */}
      {submitted && totalQuestions > 1 && (
        <button
          onClick={handleNextQuestion}
          className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg font-semibold text-white hover:from-blue-600 hover:to-purple-600 transition-all flex items-center justify-center gap-2"
        >
          {activeQuestionIndex < totalQuestions - 1 ? (
            <>
              <span>Nächste Frage</span>
              <ChevronRight size={20} />
            </>
          ) : (
            <span>Ergebnisse anzeigen</span>
          )}
        </button>
      )}

      {/* Admin Reveal Explanation */}
      {adminRevealAnswer && !submitted && activeQuestion.explanation && (
        <div className="mt-6 p-4 rounded-lg border bg-yellow-500/10 border-yellow-500/30">
          <p className="text-sm text-gray-300">
            <strong className="text-yellow-400">Erklärung (Admin-Vorschau):</strong> {activeQuestion.explanation}
          </p>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-400">
        Punkte: {activeQuestion.points || 1}
      </div>
    </div>
  );
}

export default QuizTemplate;
