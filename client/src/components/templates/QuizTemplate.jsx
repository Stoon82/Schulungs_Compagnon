import { useState, useEffect } from 'react';
import { CheckSquare, Save, Plus, Trash2, Star } from 'lucide-react';

function QuizTemplate({ content, onChange, onSave, isEditing }) {
  const [formData, setFormData] = useState({
    questionType: content?.questionType || 'multiple-choice',
    question: content?.question || '',
    options: content?.options || ['', '', '', ''],
    correctAnswer: content?.correctAnswer || 0,
    correctText: content?.correctText || '',
    ratingScale: content?.ratingScale || 5,
    ratingStyle: content?.ratingStyle || 'stars',
    explanation: content?.explanation || '',
    points: content?.points || 1
  });

  useEffect(() => {
    if (content && !isEditing) {
      setFormData({
        questionType: content?.questionType || 'multiple-choice',
        question: content?.question || '',
        options: content?.options || ['', '', '', ''],
        correctAnswer: content?.correctAnswer || 0,
        correctText: content?.correctText || '',
        ratingScale: content?.ratingScale || 5,
        ratingStyle: content?.ratingStyle || 'stars',
        explanation: content?.explanation || '',
        points: content?.points || 1
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
    handleChange({
      options: newOptions,
      correctAnswer: formData.correctAnswer >= newOptions.length ? 0 : formData.correctAnswer
    });
  };

  const updateOption = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    handleChange({ options: newOptions });
  };

  if (isEditing) {
    return (
      <div className="space-y-4">
        {/* Question Type Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Fragetyp
          </label>
          <select
            value={formData.questionType}
            onChange={(e) => handleChange({ questionType: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="multiple-choice">Multiple Choice</option>
            <option value="short-answer">Kurzantwort (Text)</option>
            <option value="rating-scale">Bewertungsskala</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Frage
          </label>
          <textarea
            value={formData.question}
            onChange={(e) => handleChange({ question: e.target.value })}
            className="w-full h-24 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            placeholder="Frage eingeben"
          />
        </div>

        {/* Multiple Choice Options */}
        {formData.questionType === 'multiple-choice' && (
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
                  onChange={() => handleChange({ correctAnswer: index })}
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
        )}

        {/* Short Answer */}
        {formData.questionType === 'short-answer' && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Musterantwort (optional)
            </label>
            <textarea
              value={formData.correctText}
              onChange={(e) => handleChange({ correctText: e.target.value })}
              className="w-full h-20 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              placeholder="Beispiel einer korrekten Antwort (wird nicht zur Bewertung verwendet)"
            />
            <p className="text-xs text-gray-400 mt-1">
              Kurzantworten müssen manuell bewertet werden
            </p>
          </div>
        )}

        {/* Rating Scale */}
        {formData.questionType === 'rating-scale' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Skala
                </label>
                <select
                  value={formData.ratingScale}
                  onChange={(e) => handleChange({ ratingScale: parseInt(e.target.value) })}
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
                  value={formData.ratingStyle}
                  onChange={(e) => handleChange({ ratingStyle: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="stars">Sterne </option>
                  <option value="numbers">Zahlen (1-{formData.ratingScale})</option>
                  <option value="emojis">Emojis </option>
                </select>
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Erklärung (optional)
          </label>
          <textarea
            value={formData.explanation}
            onChange={(e) => handleChange({ explanation: e.target.value })}
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
            onChange={(e) => handleChange({ points: parseInt(e.target.value) })}
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
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [shortAnswer, setShortAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    // TODO: Send answer to backend via socket/API
  };

  const renderRatingScale = () => {
    const items = [];
    const emojis = ['😞', '😕', '😐', '🙂', '😊', '😄', '🤩'];
    
    for (let i = 1; i <= formData.ratingScale; i++) {
      let content;
      if (formData.ratingStyle === 'stars') {
        content = <Star size={24} className="fill-yellow-400 text-yellow-400" />;
      } else if (formData.ratingStyle === 'emojis') {
        const emojiIndex = Math.floor((i - 1) / formData.ratingScale * (emojis.length - 1));
        content = <span className="text-2xl">{emojis[emojiIndex]}</span>;
      } else {
        content = <span className="text-xl font-bold">{i}</span>;
      }

      items.push(
        <button
          key={i}
          onClick={() => setSelectedAnswer(i)}
          disabled={submitted}
          className={`flex flex-col items-center justify-center p-4 border rounded-lg transition-all ${
            selectedAnswer === i
              ? 'bg-purple-500/30 border-purple-500'
              : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-purple-500/50'
          } ${submitted ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {content}
          {formData.ratingStyle === 'numbers' && (
            <span className="text-xs text-gray-400 mt-1">{i}</span>
          )}
        </button>
      );
    }
    return items;
  };

  return (
    <div className="bg-white/5 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold text-white">
          {formData.question || 'Frage'}
        </h3>
        <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded">
          {formData.questionType === 'multiple-choice' && 'Multiple Choice'}
          {formData.questionType === 'short-answer' && 'Kurzantwort'}
          {formData.questionType === 'rating-scale' && 'Bewertung'}
        </span>
      </div>

      {/* Multiple Choice - Interactive */}
      {formData.questionType === 'multiple-choice' && (
        <div className="space-y-3">
          {formData.options.map((option, index) => (
            <button
              key={index}
              onClick={() => setSelectedAnswer(index)}
              disabled={submitted}
              className={`w-full px-4 py-3 rounded-lg border transition-all text-left ${
                submitted && index === formData.correctAnswer
                  ? 'bg-green-500/20 border-green-500 text-green-400'
                  : submitted && selectedAnswer === index && index !== formData.correctAnswer
                  ? 'bg-red-500/20 border-red-500 text-red-400'
                  : selectedAnswer === index
                  ? 'bg-purple-500/30 border-purple-500 text-white'
                  : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
              } ${submitted ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-center justify-between">
                <span>{option || `Option ${index + 1}`}</span>
                {submitted && index === formData.correctAnswer && <span className="text-green-400">✓</span>}
                {submitted && selectedAnswer === index && index !== formData.correctAnswer && <span className="text-red-400">✗</span>}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Short Answer - Interactive */}
      {formData.questionType === 'short-answer' && (
        <div>
          <textarea
            value={shortAnswer}
            onChange={(e) => setShortAnswer(e.target.value)}
            disabled={submitted}
            className="w-full h-32 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Ihre Antwort hier eingeben..."
          />
          {submitted && formData.correctText && (
            <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-sm text-blue-300">
                <strong>Musterantwort:</strong> {formData.correctText}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Rating Scale - Interactive */}
      {formData.questionType === 'rating-scale' && (
        <div className={`grid gap-3 ${
          formData.ratingScale <= 5 ? 'grid-cols-5' : 'grid-cols-5'
        }`}>
          {renderRatingScale()}
        </div>
      )}

      {/* Submit Button */}
      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={
            (formData.questionType === 'multiple-choice' && selectedAnswer === null) ||
            (formData.questionType === 'short-answer' && !shortAnswer.trim()) ||
            (formData.questionType === 'rating-scale' && selectedAnswer === null)
          }
          className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold text-white hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Antwort abschicken
        </button>
      )}

      {/* Result Message */}
      {submitted && (
        <div className={`mt-6 p-4 rounded-lg border ${
          formData.questionType === 'multiple-choice' && selectedAnswer === formData.correctAnswer
            ? 'bg-green-500/10 border-green-500/30'
            : formData.questionType === 'multiple-choice'
            ? 'bg-red-500/10 border-red-500/30'
            : 'bg-blue-500/10 border-blue-500/30'
        }`}>
          <p className={`font-semibold ${
            formData.questionType === 'multiple-choice' && selectedAnswer === formData.correctAnswer
              ? 'text-green-400'
              : formData.questionType === 'multiple-choice'
              ? 'text-red-400'
              : 'text-blue-400'
          }`}>
            {formData.questionType === 'multiple-choice' && selectedAnswer === formData.correctAnswer && '✓ Richtig!'}
            {formData.questionType === 'multiple-choice' && selectedAnswer !== formData.correctAnswer && '✗ Leider falsch'}
            {formData.questionType !== 'multiple-choice' && '✓ Antwort eingereicht'}
          </p>
          {formData.explanation && (
            <p className="text-sm text-gray-300 mt-2">
              <strong>Erklärung:</strong> {formData.explanation}
            </p>
          )}
        </div>
      )}

      <div className="mt-4 text-sm text-gray-400">
        Punkte: {formData.points}
      </div>
    </div>
  );
}

export default QuizTemplate;
