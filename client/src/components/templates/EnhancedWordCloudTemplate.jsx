import { useState, useRef } from 'react';
import { Cloud, Download, Plus } from 'lucide-react';
import ReactWordcloud from 'react-wordcloud';

/**
 * EnhancedWordCloudTemplate - Complete word cloud with real-time aggregation and export
 */
function EnhancedWordCloudTemplate({ content = {}, onSave, isEditing = true }) {
  const [formData, setFormData] = useState({
    prompt: content.prompt || '',
    maxWords: content.maxWords || 100,
    minWordLength: content.minWordLength || 2,
    maxWordLength: content.maxWordLength || 50,
    allowDuplicates: content.allowDuplicates || false,
    profanityFilter: content.profanityFilter !== false,
    bannedWords: content.bannedWords || []
  });

  const [userWord, setUserWord] = useState('');
  const [submittedWords, setSubmittedWords] = useState([]);
  const [error, setError] = useState('');
  const wordCloudRef = useRef(null);

  const handleChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    if (onSave) onSave(updated);
  };

  const handleSubmitWord = async () => {
    const word = userWord.trim().toLowerCase();
    
    if (!word) {
      setError('Bitte geben Sie ein Wort ein');
      return;
    }
    
    if (word.length < formData.minWordLength || word.length > formData.maxWordLength) {
      setError(`Wort muss ${formData.minWordLength}-${formData.maxWordLength} Zeichen lang sein`);
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
    
    // TODO: Send to backend
    // await fetch('/api/wordcloud/submit', { method: 'POST', body: JSON.stringify({ word }) });
  };

  const handleExportImage = () => {
    if (!wordCloudRef.current) return;
    
    import('html2canvas').then(({ default: html2canvas }) => {
      html2canvas(wordCloudRef.current).then(canvas => {
        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `wortwolke-${Date.now()}.png`;
          link.click();
          URL.revokeObjectURL(url);
        });
      });
    });
  };

  // Calculate word frequency
  const wordFrequency = submittedWords.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {});

  const cloudWords = Object.entries(wordFrequency).map(([text, value]) => ({ text, value }));

  const wordCloudOptions = {
    colors: ['#a855f7', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
    enableTooltip: true,
    deterministic: false,
    fontFamily: 'system-ui',
    fontSizes: [20, 60],
    fontStyle: 'normal',
    fontWeight: 'bold',
    padding: 2,
    rotations: 2,
    rotationAngles: [0, 90],
    scale: 'sqrt',
    spiral: 'archimedean',
    transitionDuration: 1000
  };

  if (isEditing) {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Frage/Prompt</label>
          <textarea
            value={formData.prompt}
            onChange={(e) => handleChange('prompt', e.target.value)}
            className="w-full h-24 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            placeholder="z.B. 'Was bedeutet Innovation für Sie?'"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Min. Wortlänge</label>
            <input
              type="number"
              value={formData.minWordLength}
              onChange={(e) => handleChange('minWordLength', parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Max. Wortlänge</label>
            <input
              type="number"
              value={formData.maxWordLength}
              onChange={(e) => handleChange('maxWordLength', parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              min="1"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={formData.allowDuplicates}
              onChange={(e) => handleChange('allowDuplicates', e.target.checked)}
              className="w-5 h-5 rounded border-white/20 bg-white/5 text-purple-500"
            />
            Duplikate erlauben
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={formData.profanityFilter}
              onChange={(e) => handleChange('profanityFilter', e.target.checked)}
              className="w-5 h-5 rounded border-white/20 bg-white/5 text-purple-500"
            />
            Profanitätsfilter aktivieren
          </label>
        </div>
      </div>
    );
  }

  // Client mode
  return (
    <div className="space-y-6">
      {formData.prompt && (
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-6 border border-purple-500/30">
          <div className="flex items-center gap-3 mb-3">
            <Cloud className="text-purple-400" size={24} />
            <h3 className="text-xl font-bold text-white">Frage</h3>
          </div>
          <p className="text-lg text-gray-200">{formData.prompt}</p>
        </div>
      )}

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
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
      </div>

      {cloudWords.length > 0 && (
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white">Wortwolke ({submittedWords.length} Wörter)</h4>
            <button
              onClick={handleExportImage}
              className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg flex items-center gap-2"
            >
              <Download size={16} />
              Als Bild exportieren
            </button>
          </div>
          <div ref={wordCloudRef} className="bg-slate-800 rounded-lg p-8" style={{ height: 400 }}>
            <ReactWordcloud words={cloudWords} options={wordCloudOptions} />
          </div>
        </div>
      )}
    </div>
  );
}

export default EnhancedWordCloudTemplate;
