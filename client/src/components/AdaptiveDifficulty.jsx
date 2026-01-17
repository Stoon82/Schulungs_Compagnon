import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, Target, Brain } from 'lucide-react';
import axios from 'axios';

/**
 * AdaptiveDifficulty Component
 * Automatically adjusts content difficulty based on user performance
 */
function AdaptiveDifficulty({ userId, moduleId }) {
  const [difficulty, setDifficulty] = useState('medium');
  const [performance, setPerformance] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [history, setHistory] = useState([]);
  const [autoAdjust, setAutoAdjust] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchPerformance();
      fetchDifficultyHistory();
    }
  }, [userId, moduleId]);

  const fetchPerformance = async () => {
    try {
      // Mock data - replace with actual API call
      const mockPerformance = {
        quizAccuracy: 75,
        averageTime: 120,
        completionRate: 80,
        strugglingTopics: ['Medikamentengabe', 'Notfallmanagement'],
        strengths: ['Hygiene', 'Kommunikation']
      };
      
      setPerformance(mockPerformance);
      calculateRecommendations(mockPerformance);
    } catch (error) {
      console.error('Error fetching performance:', error);
    }
  };

  const fetchDifficultyHistory = async () => {
    try {
      // Mock history
      const mockHistory = [
        { date: '2024-01-15', difficulty: 'easy', score: 90 },
        { date: '2024-01-16', difficulty: 'medium', score: 75 },
        { date: '2024-01-17', difficulty: 'medium', score: 80 }
      ];
      setHistory(mockHistory);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const calculateRecommendations = (perf) => {
    const recs = [];

    if (perf.quizAccuracy < 60) {
      recs.push({
        type: 'decrease',
        reason: 'Quiz-Genauigkeit unter 60%',
        suggestion: 'Schwierigkeit verringern für besseres Verständnis'
      });
    } else if (perf.quizAccuracy > 85) {
      recs.push({
        type: 'increase',
        reason: 'Sehr gute Quiz-Leistung (>85%)',
        suggestion: 'Schwierigkeit erhöhen für mehr Herausforderung'
      });
    }

    if (perf.completionRate < 70) {
      recs.push({
        type: 'decrease',
        reason: 'Niedrige Abschlussrate',
        suggestion: 'Inhalte vereinfachen'
      });
    }

    if (perf.strugglingTopics.length > 2) {
      recs.push({
        type: 'support',
        reason: `Schwierigkeiten bei ${perf.strugglingTopics.length} Themen`,
        suggestion: 'Zusätzliche Übungen und Erklärungen anbieten'
      });
    }

    setRecommendations(recs);

    // Auto-adjust if enabled
    if (autoAdjust) {
      if (perf.quizAccuracy < 60 && difficulty !== 'easy') {
        adjustDifficulty('easy');
      } else if (perf.quizAccuracy > 85 && difficulty !== 'hard') {
        adjustDifficulty('hard');
      }
    }
  };

  const adjustDifficulty = async (newDifficulty) => {
    setDifficulty(newDifficulty);

    try {
      await axios.post('/api/adaptive-difficulty/adjust', {
        userId,
        moduleId,
        difficulty: newDifficulty,
        reason: 'Performance-based adjustment'
      });
    } catch (error) {
      console.error('Error adjusting difficulty:', error);
    }
  };

  const getDifficultyColor = (level) => {
    switch (level) {
      case 'easy': return 'text-green-400 bg-green-500/20 border-green-500/50';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50';
      case 'hard': return 'text-red-400 bg-red-500/20 border-red-500/50';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/50';
    }
  };

  const getDifficultyIcon = (level) => {
    switch (level) {
      case 'easy': return <TrendingDown size={24} />;
      case 'medium': return <Minus size={24} />;
      case 'hard': return <TrendingUp size={24} />;
      default: return <Target size={24} />;
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-6 border border-white/10">
      <div className="flex items-center gap-3 mb-6">
        <Brain className="text-purple-400" size={28} />
        <div>
          <h2 className="text-2xl font-bold text-white">Adaptive Schwierigkeit</h2>
          <p className="text-sm text-gray-400">
            Automatische Anpassung basierend auf Ihrer Leistung
          </p>
        </div>
      </div>

      {/* Current Difficulty */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Aktuelle Schwierigkeit</h3>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoAdjust}
              onChange={(e) => setAutoAdjust(e.target.checked)}
              className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-500"
            />
            <span className="text-sm text-gray-400">Auto-Anpassung</span>
          </label>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {['easy', 'medium', 'hard'].map((level) => (
            <button
              key={level}
              onClick={() => adjustDifficulty(level)}
              className={`p-4 rounded-lg border-2 transition-all ${
                difficulty === level
                  ? getDifficultyColor(level)
                  : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                {getDifficultyIcon(level)}
                <span className="font-semibold capitalize">
                  {level === 'easy' ? 'Einfach' : level === 'medium' ? 'Mittel' : 'Schwer'}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      {performance && (
        <div className="mb-6">
          <h3 className="text-lg font-bold text-white mb-4">Leistungsübersicht</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-2">Quiz-Genauigkeit</p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-white">{performance.quizAccuracy}%</span>
                {performance.quizAccuracy >= 85 ? (
                  <TrendingUp className="text-green-400 mb-1" size={20} />
                ) : performance.quizAccuracy < 60 ? (
                  <TrendingDown className="text-red-400 mb-1" size={20} />
                ) : (
                  <Minus className="text-yellow-400 mb-1" size={20} />
                )}
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-2">Durchschn. Zeit</p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-white">{performance.averageTime}s</span>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-2">Abschlussrate</p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-white">{performance.completionRate}%</span>
              </div>
            </div>
          </div>

          {/* Strengths and Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-green-400 mb-2">Stärken</h4>
              <ul className="space-y-1">
                {performance.strengths.map((topic, index) => (
                  <li key={index} className="text-sm text-green-300">✓ {topic}</li>
                ))}
              </ul>
            </div>

            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-red-400 mb-2">Verbesserungsbereiche</h4>
              <ul className="space-y-1">
                {performance.strugglingTopics.map((topic, index) => (
                  <li key={index} className="text-sm text-red-300">⚠ {topic}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-bold text-white mb-4">Empfehlungen</h3>
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  rec.type === 'increase'
                    ? 'bg-blue-500/10 border-blue-500/30'
                    : rec.type === 'decrease'
                    ? 'bg-orange-500/10 border-orange-500/30'
                    : 'bg-purple-500/10 border-purple-500/30'
                }`}
              >
                <p className="text-sm font-semibold text-white mb-1">{rec.reason}</p>
                <p className="text-xs text-gray-400">{rec.suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-white mb-4">Verlauf</h3>
          <div className="space-y-2">
            {history.map((entry, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-400">{entry.date}</span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getDifficultyColor(entry.difficulty)}`}>
                    {entry.difficulty === 'easy' ? 'Einfach' : entry.difficulty === 'medium' ? 'Mittel' : 'Schwer'}
                  </span>
                </div>
                <span className="text-sm text-white font-semibold">{entry.score}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <p className="text-sm text-blue-300">
          <strong>💡 Wie es funktioniert:</strong> Das System analysiert Ihre Quiz-Ergebnisse,
          Abschlussraten und Lerngeschwindigkeit. Bei aktivierter Auto-Anpassung wird die
          Schwierigkeit automatisch angepasst, um optimales Lernen zu gewährleisten.
        </p>
      </div>
    </div>
  );
}

export default AdaptiveDifficulty;
