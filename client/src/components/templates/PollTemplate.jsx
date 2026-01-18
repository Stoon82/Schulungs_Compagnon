import { useState, useEffect } from 'react';
import { BarChart3, Save, Plus, Trash2, Lock, Unlock, Eye, PieChart, ChevronLeft, ChevronRight, Star, Clock } from 'lucide-react';

function PollTemplate({ content, onChange, onSave, isEditing, isSessionMode = false, isAdmin = false, socket, sessionCode, onComplete }) {
  const [formData, setFormData] = useState({
    multipleQuestions: content?.multipleQuestions || false,
    questions: content?.questions || [{
      id: 1,
      question: '',
      questionType: 'single-choice',
      options: ['', ''],
      allowMultiple: false,
      showResults: 'after',
      anonymousVoting: true,
      visualizationType: 'bar',
      pollClosed: false,
      ratingScale: 5,
      ratingStyle: 'stars',
      textInputType: 'short'
    }],
    currentQuestionIndex: content?.currentQuestionIndex || 0
  });
  
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [votes, setVotes] = useState({});
  const [textAnswers, setTextAnswers] = useState({});
  const [ratingAnswers, setRatingAnswers] = useState({});
  
  // Multi-question session mode state
  const [sessionQuestionIndex, setSessionQuestionIndex] = useState(0);
  const [questionResponses, setQuestionResponses] = useState({}); // Track responses for all questions
  const [allQuestionsCompleted, setAllQuestionsCompleted] = useState(false);
  const [showFinalResults, setShowFinalResults] = useState(false);
  
  // Live results from server (per question)
  const [liveResults, setLiveResults] = useState({}); // { questionIndex: { optionVotes: [], ratingVotes: {}, textResponses: [], totalVotes: 0 } }
  
  // Computed values for questions
  const totalQuestions = formData.questions?.length || 1;
  const activeQuestionIndex = isSessionMode ? sessionQuestionIndex : formData.currentQuestionIndex;
  const currentQuestion = formData.questions?.[activeQuestionIndex] || formData.questions?.[0] || {
    question: '',
    questionType: 'single-choice',
    options: ['', ''],
    showResults: 'after',
    ratingScale: 5,
    ratingStyle: 'stars'
  };
  
  // Listen for live poll results from socket
  useEffect(() => {
    if (!socket || !isSessionMode) return;
    
    const handlePollResults = (data) => {
      // data: { questionIndex, optionVotes, ratingVotes, textResponses, totalVotes }
      setLiveResults(prev => ({
        ...prev,
        [data.questionIndex]: {
          optionVotes: data.optionVotes || [],
          ratingVotes: data.ratingVotes || {},
          textResponses: data.textResponses || [],
          totalVotes: data.totalVotes || 0
        }
      }));
    };
    
    socket.on('poll:results', handlePollResults);
    
    // Request current results when component mounts
    if (sessionCode) {
      socket.emit('poll:getResults', { sessionCode });
    }
    
    return () => {
      socket.off('poll:results', handlePollResults);
    };
  }, [socket, isSessionMode, sessionCode]);

  useEffect(() => {
    if (content && !isEditing) {
      setFormData({
        multipleQuestions: content?.multipleQuestions || false,
        questions: content?.questions || [{
          id: 1,
          question: '',
          questionType: 'single-choice',
          options: ['', ''],
          allowMultiple: false,
          showResults: 'after',
          anonymousVoting: true,
          visualizationType: 'bar',
          pollClosed: false,
          ratingScale: 5,
          ratingStyle: 'stars',
          textInputType: 'short'
        }],
        currentQuestionIndex: content?.currentQuestionIndex || 0
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
      questionType: 'single-choice',
      options: ['', ''],
      allowMultiple: false,
      showResults: 'after',
      anonymousVoting: true,
      visualizationType: 'bar',
      pollClosed: false,
      ratingScale: 5,
      ratingStyle: 'stars',
      textInputType: 'short'
    };
    const newQuestions = [...formData.questions, newQuestion];
    handleChange({ 
      questions: newQuestions, 
      multipleQuestions: true,
      currentQuestionIndex: newQuestions.length - 1
    });
  };

  const removeQuestion = (index) => {
    if (formData.questions.length <= 1) {
      alert('Eine Umfrage muss mindestens eine Frage haben.');
      return;
    }
    const newQuestions = formData.questions.filter((_, i) => i !== index);
    const newIndex = formData.currentQuestionIndex >= newQuestions.length 
      ? newQuestions.length - 1 
      : formData.currentQuestionIndex;
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

  const handleClosePoll = () => {
    handleChange({ pollClosed: !formData.pollClosed });
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
    handleQuestionChange(formData.currentQuestionIndex, { options: newOptions });
  };

  const updateOption = (index, value) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    handleQuestionChange(formData.currentQuestionIndex, { options: newOptions });
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
            <option value="single-choice">Einfachauswahl</option>
            <option value="multiple-choice">Mehrfachauswahl</option>
            <option value="rating-scale">Bewertungsskala</option>
            <option value="text-input">Texteingabe</option>
          </select>
        </div>

        {/* Question Text */}
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

        {/* Options for choice-based questions */}
        {(currentQuestion.questionType === 'single-choice' || currentQuestion.questionType === 'multiple-choice') && (
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
                <div key={index} className="flex gap-2">
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
          </div>
        )}

        {/* Rating Scale Settings */}
        {currentQuestion.questionType === 'rating-scale' && (
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
                <option value="numbers">Zahlen</option>
                <option value="emojis">Emojis 😊</option>
              </select>
            </div>
          </div>
        )}

        {/* Text Input Settings */}
        {currentQuestion.questionType === 'text-input' && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Eingabetyp
            </label>
            <select
              value={currentQuestion.textInputType}
              onChange={(e) => handleQuestionChange(formData.currentQuestionIndex, { textInputType: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="short">Kurze Antwort (1 Zeile)</option>
              <option value="long">Lange Antwort (Mehrere Zeilen)</option>
            </select>
          </div>
        )}

        {/* Poll Settings */}
        <div className="bg-white/5 rounded-lg p-4 border border-white/10 space-y-3">
          <h4 className="text-sm font-semibold text-white">Umfrage-Einstellungen</h4>
          
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={currentQuestion.anonymousVoting}
              onChange={(e) => handleQuestionChange(formData.currentQuestionIndex, { anonymousVoting: e.target.checked })}
              className="w-5 h-5 rounded border-white/20 bg-white/5 text-purple-500"
            />
            Anonyme Abstimmung
          </label>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Ergebnisse anzeigen
            </label>
            <select
              value={currentQuestion.showResults}
              onChange={(e) => handleQuestionChange(formData.currentQuestionIndex, { showResults: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="never">Nie (nur Admin)</option>
              <option value="after">Nach Abstimmung</option>
              <option value="live">Live (Echtzeit)</option>
            </select>
          </div>

          {(currentQuestion.questionType === 'single-choice' || currentQuestion.questionType === 'multiple-choice') && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Visualisierung
              </label>
              <select
                value={currentQuestion.visualizationType}
                onChange={(e) => handleQuestionChange(formData.currentQuestionIndex, { visualizationType: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="bar">Balkendiagramm</option>
                <option value="pie">Kreisdiagramm</option>
                <option value="emoji">Emoji-Anzeige</option>
              </select>
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

  // Client mode - Interactive voting
  const [selectedRating, setSelectedRating] = useState(null);
  const [textAnswer, setTextAnswer] = useState('');
  
  // Get live results for current question, or use empty array if not available
  const currentLiveResults = liveResults[activeQuestionIndex] || { optionVotes: [], ratingVotes: {}, textResponses: [], totalVotes: 0 };
  const pollResults = currentQuestion.options?.map((_, i) => currentLiveResults.optionVotes[i] || 0) || [];
  const total = pollResults.reduce((a, b) => a + b, 0);

  const handleVote = () => {
    const qType = currentQuestion.questionType;
    let response = null;
    
    if (qType === 'multiple-choice') {
      if (selectedOptions.length > 0) {
        response = { type: 'multiple-choice', selectedOptions };
        setHasVoted(true);
      }
    } else if (qType === 'single-choice') {
      if (selectedOptions.length === 1) {
        response = { type: 'single-choice', selectedOption: selectedOptions[0] };
        setHasVoted(true);
      }
    } else if (qType === 'rating-scale') {
      if (selectedRating !== null) {
        response = { type: 'rating-scale', rating: selectedRating };
        setHasVoted(true);
      }
    } else if (qType === 'text-input') {
      if (textAnswer.trim()) {
        response = { type: 'text-input', text: textAnswer };
        setHasVoted(true);
      }
    }
    
    // Save response for this question
    if (response) {
      setQuestionResponses(prev => ({
        ...prev,
        [activeQuestionIndex]: {
          questionId: currentQuestion.id,
          questionIndex: activeQuestionIndex,
          ...response
        }
      }));
      
      // Send to backend via socket
      if (socket && sessionCode) {
        socket.emit('poll:vote', {
          sessionCode,
          questionIndex: activeQuestionIndex,
          response
        });
      }
    }
  };
  
  // Handle moving to next question in session mode
  const handleNextQuestion = () => {
    if (sessionQuestionIndex < totalQuestions - 1) {
      setSessionQuestionIndex(sessionQuestionIndex + 1);
      setHasVoted(false);
      setSelectedOptions([]);
      setSelectedRating(null);
      setTextAnswer('');
    } else {
      // All questions completed
      setAllQuestionsCompleted(true);
      setShowFinalResults(true);
      if (onComplete) {
        onComplete();
      }
    }
  };

  const handleOptionClick = (index) => {
    if (currentQuestion.questionType === 'multiple-choice') {
      setSelectedOptions(prev => 
        prev.includes(index) 
          ? prev.filter(i => i !== index)
          : [...prev, index]
      );
    } else {
      setSelectedOptions([index]);
    }
  };

  const renderRatingScale = () => {
    const items = [];
    const emojis = ['😞', '😕', '😐', '🙂', '😊', '😄', '🤩'];
    
    for (let i = 1; i <= currentQuestion.ratingScale; i++) {
      let content;
      if (currentQuestion.ratingStyle === 'stars') {
        content = <Star size={24} className={selectedRating >= i ? 'fill-yellow-400 text-yellow-400' : 'text-gray-500'} />;
      } else if (currentQuestion.ratingStyle === 'emojis') {
        const emojiIndex = Math.floor((i - 1) / currentQuestion.ratingScale * (emojis.length - 1));
        content = <span className="text-2xl">{emojis[emojiIndex]}</span>;
      } else {
        content = <span className="text-xl font-bold">{i}</span>;
      }

      items.push(
        <button
          key={i}
          onClick={() => setSelectedRating(i)}
          disabled={hasVoted}
          className={`flex flex-col items-center justify-center p-4 border rounded-lg transition-all ${
            selectedRating === i
              ? 'bg-purple-500/30 border-purple-500'
              : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-purple-500/50'
          } ${hasVoted ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {content}
        </button>
      );
    }
    return items;
  };

  const renderVisualization = () => {
    if (currentQuestion.visualizationType === 'bar') {
      return (
        <div className="space-y-2">
          {currentQuestion.options.map((option, index) => {
            const percentage = total > 0 ? (pollResults[index] / total) * 100 : 0;
            return (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white">{option || `Option ${index + 1}`}</span>
                  <span className="text-gray-400">{pollResults[index]} ({percentage.toFixed(1)}%)</span>
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
    
    if (currentQuestion.visualizationType === 'pie') {
      const colors = ['#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
      let cumulativePercent = 0;
      
      return (
        <div className="flex items-center gap-8">
          <div className="relative w-32 h-32">
            <svg viewBox="0 0 32 32" className="w-full h-full -rotate-90">
              {currentQuestion.options.map((option, index) => {
                const percentage = total > 0 ? (pollResults[index] / total) * 100 : 0;
                const strokeDasharray = `${percentage} ${100 - percentage}`;
                const strokeDashoffset = -cumulativePercent;
                cumulativePercent += percentage;
                
                return (
                  <circle
                    key={index}
                    r="16"
                    cx="16"
                    cy="16"
                    fill="transparent"
                    stroke={colors[index % colors.length]}
                    strokeWidth="32"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    style={{ transformOrigin: 'center' }}
                  />
                );
              })}
            </svg>
          </div>
          <div className="space-y-2">
            {currentQuestion.options.map((option, index) => {
              const percentage = total > 0 ? (pollResults[index] / total) * 100 : 0;
              return (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
                  <span className="text-white text-sm">{option || `Option ${index + 1}`}</span>
                  <span className="text-gray-400 text-xs">({percentage.toFixed(1)}%)</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    
    if (currentQuestion.visualizationType === 'emoji') {
      return (
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className="text-white min-w-[120px]">{option || `Option ${index + 1}`}</span>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(pollResults[index] || 0, 20) }).map((_, i) => (
                  <span key={i}>👤</span>
                ))}
                {(pollResults[index] || 0) > 20 && <span className="text-gray-400 ml-2">+{pollResults[index] - 20}</span>}
              </div>
            </div>
          ))}
        </div>
      );
    }
    
    return null;
  };

  const renderVotingInterface = () => {
    const qType = currentQuestion.questionType;
    
    if (qType === 'rating-scale') {
      return (
        <div className="space-y-4">
          <div className={`grid gap-3 ${currentQuestion.ratingScale <= 5 ? 'grid-cols-5' : 'grid-cols-5'}`}>
            {renderRatingScale()}
          </div>
          <button
            onClick={handleVote}
            disabled={selectedRating === null || currentQuestion.pollClosed}
            className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold text-white hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Abstimmen
          </button>
        </div>
      );
    }
    
    if (qType === 'text-input') {
      return (
        <div className="space-y-4">
          {currentQuestion.textInputType === 'long' ? (
            <textarea
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              disabled={currentQuestion.pollClosed}
              className="w-full h-32 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Ihre Antwort eingeben..."
            />
          ) : (
            <input
              type="text"
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              disabled={currentQuestion.pollClosed}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Ihre Antwort eingeben..."
            />
          )}
          <button
            onClick={handleVote}
            disabled={!textAnswer.trim() || currentQuestion.pollClosed}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold text-white hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Absenden
          </button>
        </div>
      );
    }
    
    // Single/Multiple choice
    return (
      <div className="space-y-3">
        {currentQuestion.options.map((option, index) => {
          const isSelected = selectedOptions.includes(index);
          
          return (
            <button
              key={index}
              onClick={() => handleOptionClick(index)}
              disabled={currentQuestion.pollClosed}
              className={`w-full px-4 py-3 rounded-lg border transition-all text-left ${
                isSelected
                  ? 'bg-purple-500/30 border-purple-500 text-white'
                  : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
              } ${currentQuestion.pollClosed ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 ${qType === 'multiple-choice' ? 'rounded' : 'rounded-full'} border-2 flex items-center justify-center ${
                  isSelected ? 'border-purple-500' : 'border-white/30'
                }`}>
                  {isSelected && (
                    <div className={`w-3 h-3 ${qType === 'multiple-choice' ? 'rounded' : 'rounded-full'} bg-purple-500`} />
                  )}
                </div>
                <span>{option || `Option ${index + 1}`}</span>
              </div>
            </button>
          );
        })}
        
        <button
          onClick={handleVote}
          disabled={(qType === 'multiple-choice' ? selectedOptions.length === 0 : selectedOptions.length !== 1) || currentQuestion.pollClosed}
          className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold text-white hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Abstimmen
        </button>
      </div>
    );
  };

  // Render visualization for a specific question (used in final results)
  const renderVisualizationForQuestion = (question, questionIndex) => {
    // Get live results for this question from server data
    const questionLiveData = liveResults[questionIndex] || { optionVotes: [], ratingVotes: {}, textResponses: [], totalVotes: 0 };
    const questionResults = question.options?.map((_, i) => questionLiveData.optionVotes[i] || 0) || [];
    const questionTotal = questionResults.reduce((a, b) => a + b, 0);
    
    if (question.questionType === 'rating-scale') {
      // Get rating distribution from live data
      const ratingVotes = questionLiveData.ratingVotes || {};
      const ratingResults = Array.from({ length: question.ratingScale || 5 }, (_, idx) => ratingVotes[idx + 1] || 0);
      const ratingTotal = ratingResults.reduce((a, b) => a + b, 0);
      const avgRating = ratingTotal > 0 ? ratingResults.reduce((sum, count, idx) => sum + count * (idx + 1), 0) / ratingTotal : 0;
      
      return (
        <div className="space-y-2">
          <p className="text-sm text-gray-400">Durchschnitt: <span className="text-purple-400 font-bold">{avgRating.toFixed(1)}</span> / {question.ratingScale}</p>
          <div className="flex gap-2">
            {ratingResults.map((count, idx) => (
              <div key={idx} className="flex-1 text-center">
                <div className="h-16 bg-white/10 rounded relative">
                  <div 
                    className="absolute bottom-0 w-full bg-gradient-to-t from-purple-500 to-pink-500 rounded"
                    style={{ height: `${(count / Math.max(...ratingResults)) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400">{idx + 1}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    if (question.questionType === 'text-input') {
      return (
        <div className="p-3 bg-white/5 rounded-lg">
          <p className="text-sm text-gray-400">Textantworten werden separat angezeigt</p>
        </div>
      );
    }
    
    // Bar chart visualization for choice questions
    if (question.visualizationType === 'bar' || !question.visualizationType) {
      return (
        <div className="space-y-2">
          {question.options?.map((option, index) => {
            const percentage = questionTotal > 0 ? (questionResults[index] / questionTotal) * 100 : 0;
            return (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white">{option || `Option ${index + 1}`}</span>
                  <span className="text-gray-400">{questionResults[index]} ({percentage.toFixed(1)}%)</span>
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
    
    if (question.visualizationType === 'pie') {
      const colors = ['#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
      return (
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
          <div className="space-y-1">
            {question.options?.map((option, index) => {
              const percentage = questionTotal > 0 ? (questionResults[index] / questionTotal) * 100 : 0;
              return (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
                  <span className="text-white">{option}</span>
                  <span className="text-gray-400">({percentage.toFixed(0)}%)</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    
    return null;
  };

  // Show final results view after all questions completed
  if (showFinalResults && allQuestionsCompleted) {
    return (
      <div className="bg-white/5 rounded-lg p-6">
        <div className="text-center mb-8">
          <h3 className="text-3xl font-bold text-white mb-4">Umfrage Abgeschlossen!</h3>
          <div className="text-6xl mb-4">📊</div>
          <p className="text-xl text-white">
            Sie haben <span className="text-purple-400 font-bold">{Object.keys(questionResponses).length}</span> von <span className="font-bold">{totalQuestions}</span> Fragen beantwortet
          </p>
        </div>
        
        {/* All questions with visualizations */}
        <div className="space-y-6">
          <h4 className="text-lg font-semibold text-white">Ergebnisse aller Fragen:</h4>
          {formData.questions.map((q, idx) => {
            const response = questionResponses[idx];
            return (
              <div key={q.id} className="p-4 rounded-lg border bg-purple-500/10 border-purple-500/30">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg text-purple-400 font-bold">{idx + 1}.</span>
                  <span className="text-white font-medium">{q.question}</span>
                </div>
                
                {/* Your answer */}
                {response && (
                  <div className="mb-4 p-2 bg-blue-500/10 rounded border border-blue-500/30">
                    <p className="text-sm text-blue-400">
                      <strong>Ihre Antwort:</strong>{' '}
                      {response.type === 'single-choice' && (q.options[response.selectedOption] || 'Option ' + (response.selectedOption + 1))}
                      {response.type === 'multiple-choice' && response.selectedOptions.map(i => q.options[i] || 'Option ' + (i + 1)).join(', ')}
                      {response.type === 'rating-scale' && `${response.rating}/${q.ratingScale}`}
                      {response.type === 'text-input' && `"${response.text}"`}
                    </p>
                  </div>
                )}
                
                {/* Visualization for this question */}
                {(q.questionType === 'single-choice' || q.questionType === 'multiple-choice' || q.questionType === 'rating-scale') && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-400 mb-2">Live-Ergebnisse:</p>
                    {renderVisualizationForQuestion(q, idx)}
                  </div>
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
              {Object.keys(questionResponses).length} beantwortet
            </span>
          </div>
          <div className="flex gap-1">
            {formData.questions.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 flex-1 rounded-full transition-all ${
                  idx === activeQuestionIndex ? 'bg-purple-500' :
                  questionResponses[idx] ? 'bg-green-500' :
                  'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 size={24} className="text-purple-400" />
          <h3 className="text-2xl font-bold text-white">
            {currentQuestion.question || 'Umfrage-Frage'}
          </h3>
        </div>
        
        <div className="flex items-center gap-2">
          {currentQuestion.pollClosed && (
            <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded text-sm flex items-center gap-1">
              <Lock size={14} />
              Geschlossen
            </span>
          )}
          
          {!isEditing && (
            <button
              onClick={handleClosePoll}
              className={`px-3 py-1 rounded text-sm flex items-center gap-2 ${
                currentQuestion.pollClosed
                  ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
                  : 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
              }`}
              title={currentQuestion.pollClosed ? 'Umfrage öffnen' : 'Umfrage schließen'}
            >
              {currentQuestion.pollClosed ? <Unlock size={14} /> : <Lock size={14} />}
              {currentQuestion.pollClosed ? 'Öffnen' : 'Schließen'}
            </button>
          )}
          
          {currentQuestion.visualizationType === 'pie' && <PieChart size={16} className="text-gray-400" />}
        </div>
      </div>
      
      {currentQuestion.pollClosed && !hasVoted ? (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
          <Lock size={48} className="mx-auto mb-3 text-red-400" />
          <p className="text-red-400 font-semibold">Diese Umfrage wurde geschlossen</p>
          <p className="text-sm text-gray-400 mt-2">Abstimmungen sind nicht mehr möglich</p>
        </div>
      ) : !hasVoted ? (
        renderVotingInterface()
      ) : (
        <div className="space-y-4">
          <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
            <p className="text-green-400 font-semibold">✓ Ihre Stimme wurde gezählt!</p>
          </div>
          
          {/* For single-question polls with live mode: show results immediately after voting */}
          {totalQuestions === 1 && currentQuestion.showResults === 'live' && (currentQuestion.questionType === 'single-choice' || currentQuestion.questionType === 'multiple-choice') && renderVisualization()}
          
          {/* Message when results are hidden between questions (multi-question polls) */}
          {totalQuestions > 1 && (
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg text-center">
              <Eye size={32} className="mx-auto mb-2 text-blue-400" />
              <p className="text-blue-400">Ergebnisse werden nach allen Fragen angezeigt</p>
              <p className="text-xs text-gray-400 mt-1">Beantworten Sie zunächst alle Fragen</p>
            </div>
          )}
          
          {/* Message for single-question polls with results hidden */}
          {totalQuestions === 1 && currentQuestion.showResults === 'never' && (
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg text-center">
              <Eye size={32} className="mx-auto mb-2 text-blue-400" />
              <p className="text-blue-400">Ergebnisse werden nicht angezeigt</p>
              <p className="text-xs text-gray-400 mt-1">Nur Administratoren können die Ergebnisse sehen</p>
            </div>
          )}
          
          {/* Message for single-question polls with "after" mode - waiting for all to complete */}
          {totalQuestions === 1 && currentQuestion.showResults === 'after' && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-center">
              <Clock size={32} className="mx-auto mb-2 text-yellow-400" />
              <p className="text-yellow-400">Warten auf andere Teilnehmer...</p>
              <p className="text-xs text-gray-400 mt-1">Ergebnisse werden angezeigt, wenn alle abgestimmt haben</p>
            </div>
          )}
          
          {/* Next Question Button (for multi-question polls) */}
          {totalQuestions > 1 && (
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
        </div>
      )}

      {/* Live results shown while voting (only for single-question polls in live mode) */}
      {totalQuestions === 1 && currentQuestion.showResults === 'live' && !hasVoted && !currentQuestion.pollClosed && (currentQuestion.questionType === 'single-choice' || currentQuestion.questionType === 'multiple-choice') && (
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
            {currentQuestion.questionType === 'multiple-choice' && <span>✓ Mehrfachauswahl</span>}
            {currentQuestion.questionType === 'rating-scale' && <span>⭐ Bewertung</span>}
            {currentQuestion.questionType === 'text-input' && <span>📝 Texteingabe</span>}
            {currentQuestion.anonymousVoting && <span>🔒 Anonym</span>}
            <span>
              Ergebnisse: {currentQuestion.showResults === 'never' ? 'Verborgen' : currentQuestion.showResults === 'after' ? 'Nach Abstimmung' : 'Live'}
            </span>
          </div>
          {(currentQuestion.questionType === 'single-choice' || currentQuestion.questionType === 'multiple-choice') && (
            <div>
              <span className="font-semibold text-white">{total}</span> Stimmen gesamt
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PollTemplate;