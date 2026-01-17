import { useState, useRef, useEffect } from 'react';
import { Cloud, Download, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import html2canvas from 'html2canvas';

function WordCloudTemplate({ content = {}, onSave, isEditing = true }) {
  const [formData, setFormData] = useState({
    prompt: content.prompt || '',
    maxWords: content.maxWords || 100,
    minWordLength: content.minWordLength || 2,
    maxWordLength: content.maxWordLength || 50,
    allowDuplicates: content.allowDuplicates || false,
    profanityFilter: content.profanityFilter !== false,
    displayMode: content.displayMode || 'cloud', // 'cloud', 'list', 'both'
    colorScheme: content.colorScheme || 'rainbow', // 'rainbow', 'monochrome', 'custom'
    customColors: content.customColors || ['#667eea', '#764ba2', '#f093fb', '#4facfe'],
    fontSizes: content.fontSizes || { min: 12, max: 60 },
    bannedWords: content.bannedWords || []
  });

  const [newBannedWord, setNewBannedWord] = useState('');

  const handleChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    if (onSave) onSave(updated);
  };

  const addBannedWord = () => {
    if (newBannedWord.trim() && !formData.bannedWords.includes(newBannedWord.trim().toLowerCase())) {
      const updated = {
        ...formData,
        bannedWords: [...formData.bannedWords, newBannedWord.trim().toLowerCase()]
      };
      setFormData(updated);
      setNewBannedWord('');
      if (onSave) onSave(updated);
    }
  };

  const removeBannedWord = (word) => {
    const updated = {
      ...formData,
      bannedWords: formData.bannedWords.filter(w => w !== word)
    };
    setFormData(updated);
    if (onSave) onSave(updated);
  };

  const colorSchemes = [
    { value: 'rainbow', label: 'Regenbogen' },
    { value: 'monochrome', label: 'Monochrom' },
    { value: 'warm', label: 'Warm' },
    { value: 'cool', label: 'Kühl' },
    { value: 'custom', label: 'Benutzerdefiniert' }
  ];

  const displayModes = [
    { value: 'cloud', label: 'Nur Wortwolke' },
    { value: 'list', label: 'Nur Liste' },
    { value: 'both', label: 'Beides' }
  ];

  // Mock word data for preview
  const mockWords = [
    { text: 'Innovation', value: 45 },
    { text: 'Teamwork', value: 38 },
    { text: 'Kreativität', value: 35 },
    { text: 'Erfolg', value: 30 },
    { text: 'Zusammenarbeit', value: 28 },
    { text: 'Qualität', value: 25 },
    { text: 'Effizienz', value: 22 },
    { text: 'Motivation', value: 20 },
    { text: 'Kommunikation', value: 18 },
    { text: 'Verantwortung', value: 15 }
  ];

  // Client mode - Interactive word submission
  const [userWord, setUserWord] = useState('');
  const [submittedWords, setSubmittedWords] = useState([]);
  const [error, setError] = useState('');
  const wordCloudRef = useRef(null);

  const handleSubmitWord = () => {
    const word = userWord.trim().toLowerCase();
    
    if (!word) {
      setError('Bitte geben Sie ein Wort ein');
      return;
    }
    
    if (word.length < formData.minWordLength) {
      setError(`Wort muss mindestens ${formData.minWordLength} Zeichen lang sein`);
      return;
    }
    
    if (word.length > formData.maxWordLength) {
      setError(`Wort darf maximal ${formData.maxWordLength} Zeichen lang sein`);
      return;
    }
    
    if (!formData.allowDuplicates && submittedWords.includes(word)) {
      setError('Sie haben dieses Wort bereits eingereicht');
      return;
    }
    
    if (formData.bannedWords.includes(word)) {
      setError('Dieses Wort ist nicht erlaubt');
      return;
    }
    
    setSubmittedWords([...submittedWords, word]);
    setUserWord('');
    setError('');
    // TODO: Send word to backend via socket/API
  };

  const handleExportImage = () => {
    if (!wordCloudRef.current) return;
    
    // Create a canvas from the word cloud element
    const element = wordCloudRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = element.offsetWidth;
    canvas.height = element.offsetHeight;
    
    // Fill background
    ctx.fillStyle = '#1e293b'; // Match bg color
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Get all word elements and draw them
    const words = element.querySelectorAll('span');
    words.forEach((wordEl) => {
      const rect = wordEl.getBoundingClientRect();
      const parentRect = element.getBoundingClientRect();
      const x = rect.left - parentRect.left;
      const y = rect.top - parentRect.top;
      
      ctx.font = window.getComputedStyle(wordEl).font;
      ctx.fillStyle = window.getComputedStyle(wordEl).color;
      ctx.fillText(wordEl.textContent, x, y + rect.height * 0.75);
    });
    
    // Download image
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `wortwolke-${Date.now()}.png`;
      link.click();
      URL.revokeObjectURL(url);
    });
  };

  if (!isEditing) {
    return (
      <div className="space-y-6">
        {/* Prompt Display */}
        {formData.prompt && (
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-6 border border-purple-500/30">
            <div className="flex items-center gap-3 mb-3">
              <Cloud className="text-purple-400" size={24} />
              <h3 className="text-xl font-bold text-white">Frage</h3>
            </div>
            <p className="text-lg text-gray-200">{formData.prompt}</p>
          </div>
        )}

        {/* Word Submission Form */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h4 className="text-lg font-semibold text-white mb-4">Ihr Wort eingeben</h4>
          <div className="flex gap-3">
            <input
              type="text"
              value={userWord}
              onChange={(e) => setUserWord(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmitWord()}
              placeholder="Wort eingeben..."
              maxLength={formData.maxWordLength}
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={handleSubmitWord}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold text-white hover:from-purple-600 hover:to-pink-600 transition-all flex items-center gap-2"
            >
              <Plus size={20} />
              Hinzufügen
            </button>
          </div>
          {error && (
            <p className="text-red-400 text-sm mt-2">{error}</p>
          )}
          <p className="text-xs text-gray-400 mt-2">
            {formData.minWordLength}-{formData.maxWordLength} Zeichen
            {!formData.allowDuplicates && ' • Keine Duplikate'}
          </p>
        </div>

        {/* Submitted Words */}
        {submittedWords.length > 0 && (
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h4 className="text-sm font-medium text-gray-400 mb-3">Ihre eingereichten Wörter ({submittedWords.length})</h4>
            <div className="flex flex-wrap gap-2">
              {submittedWords.map((word, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm"
                >
                  {word}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Word Cloud Display */}
        <div className="bg-white/5 rounded-xl p-8 border border-white/10 min-h-[400px] relative">
          {submittedWords.length > 0 && (
            <button
              onClick={handleExportImage}
              className="absolute top-4 right-4 px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-all flex items-center gap-2 text-sm"
              title="Als Bild exportieren"
            >
              <Download size={16} />
              Export
            </button>
          )}
          {submittedWords.length > 0 ? (
            <div ref={wordCloudRef} className="flex flex-wrap items-center justify-center gap-3">
              {submittedWords.map((word, index) => {
                // Calculate font size based on frequency (for now, random variation)
                const fontSize = Math.floor(Math.random() * 32) + 16; // 16-48px
                const colors = [
                  'text-purple-400',
                  'text-pink-400',
                  'text-blue-400',
                  'text-green-400',
                  'text-yellow-400',
                  'text-red-400',
                  'text-indigo-400',
                  'text-cyan-400'
                ];
                const color = colors[index % colors.length];
                
                return (
                  <span
                    key={index}
                    className={`${color} font-bold transition-all duration-300 hover:scale-110 cursor-default`}
                    style={{ fontSize: `${fontSize}px` }}
                  >
                    {word}
                  </span>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <Cloud size={64} className="mx-auto text-purple-400" />
                <p className="text-gray-400">
                  Geben Sie Wörter ein, um die Wortwolke zu erstellen
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Word List Preview */}
        {(formData.displayMode === 'list' || formData.displayMode === 'both') && (
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h4 className="text-lg font-semibold text-white mb-4">Eingereichte Wörter</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {mockWords.map((word, idx) => (
                <div
                  key={idx}
                  className="bg-white/5 rounded-lg px-4 py-2 border border-white/10 flex items-center justify-between"
                >
                  <span className="text-white">{word.text}</span>
                  <span className="text-sm text-gray-400">{word.value}x</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <p className="text-gray-400">Max. Wörter</p>
            <p className="text-white font-semibold">{formData.maxWords}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <p className="text-gray-400">Duplikate</p>
            <p className="text-white font-semibold">{formData.allowDuplicates ? 'Erlaubt' : 'Nicht erlaubt'}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <p className="text-gray-400">Filter</p>
            <p className="text-white font-semibold">{formData.profanityFilter ? 'Aktiv' : 'Inaktiv'}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <p className="text-gray-400">Farbschema</p>
            <p className="text-white font-semibold capitalize">{formData.colorScheme}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Prompt Input */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Frage/Aufforderung *
        </label>
        <textarea
          value={formData.prompt}
          onChange={(e) => handleChange('prompt', e.target.value)}
          placeholder="z.B. 'Was bedeutet Innovation für Sie?'"
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[100px]"
        />
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Max Words */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Maximale Anzahl Wörter
          </label>
          <input
            type="number"
            value={formData.maxWords}
            onChange={(e) => handleChange('maxWords', parseInt(e.target.value) || 100)}
            min="10"
            max="500"
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Display Mode */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Anzeigemodus
          </label>
          <select
            value={formData.displayMode}
            onChange={(e) => handleChange('displayMode', e.target.value)}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {displayModes.map(mode => (
              <option key={mode.value} value={mode.value}>{mode.label}</option>
            ))}
          </select>
        </div>

        {/* Min Word Length */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Minimale Wortlänge
          </label>
          <input
            type="number"
            value={formData.minWordLength}
            onChange={(e) => handleChange('minWordLength', parseInt(e.target.value) || 2)}
            min="1"
            max="10"
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Max Word Length */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Maximale Wortlänge
          </label>
          <input
            type="number"
            value={formData.maxWordLength}
            onChange={(e) => handleChange('maxWordLength', parseInt(e.target.value) || 50)}
            min="5"
            max="100"
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Color Scheme */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Farbschema
        </label>
        <select
          value={formData.colorScheme}
          onChange={(e) => handleChange('colorScheme', e.target.value)}
          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          {colorSchemes.map(scheme => (
            <option key={scheme.value} value={scheme.value}>{scheme.label}</option>
          ))}
        </select>
      </div>

      {/* Font Size Range */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Schriftgröße (Min - Max)
        </label>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="number"
            value={formData.fontSizes.min}
            onChange={(e) => handleChange('fontSizes', { ...formData.fontSizes, min: parseInt(e.target.value) || 12 })}
            min="8"
            max="30"
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="number"
            value={formData.fontSizes.max}
            onChange={(e) => handleChange('fontSizes', { ...formData.fontSizes, max: parseInt(e.target.value) || 60 })}
            min="30"
            max="120"
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.allowDuplicates}
            onChange={(e) => handleChange('allowDuplicates', e.target.checked)}
            className="w-5 h-5 text-purple-500 rounded focus:ring-purple-500"
          />
          <span className="text-white">Duplikate erlauben (gleiche Wörter mehrfach)</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.profanityFilter}
            onChange={(e) => handleChange('profanityFilter', e.target.checked)}
            className="w-5 h-5 text-purple-500 rounded focus:ring-purple-500"
          />
          <span className="text-white">Profanitätsfilter aktivieren</span>
        </label>
      </div>

      {/* Banned Words */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Gesperrte Wörter
        </label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newBannedWord}
            onChange={(e) => setNewBannedWord(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addBannedWord()}
            placeholder="Wort eingeben..."
            className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={addBannedWord}
            className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-all flex items-center gap-2"
          >
            <Plus size={18} />
            Hinzufügen
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.bannedWords.map((word, idx) => (
            <div
              key={idx}
              className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm flex items-center gap-2"
            >
              <span>{word}</span>
              <button
                onClick={() => removeBannedWord(word)}
                className="hover:text-red-300 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {formData.bannedWords.length === 0 && (
            <p className="text-sm text-gray-400">Keine gesperrten Wörter</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default WordCloudTemplate;
