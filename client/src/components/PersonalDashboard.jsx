import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Award, BookOpen, Clock, Star, Bookmark, FileText, TrendingUp } from 'lucide-react';

/**
 * PersonalDashboard - Individual learner progress tracking
 * Shows completed modules, quiz scores, time invested, bookmarks, and notes
 */
function PersonalDashboard({ userId }) {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, [userId]);

  const loadProgress = async () => {
    try {
      const response = await fetch(`/api/analytics/participant/${userId}/progress`);
      const data = await response.json();
      
      if (data.success) {
        setProgress(data.data);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const COLORS = ['#8b5cf6', '#ec4899', '#06b6d4', '#f59e0b'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="text-center py-12 text-gray-400">
        <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
        <p>Keine Fortschrittsdaten verfügbar</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Mein Fortschritt</h2>
        <p className="text-gray-400">Übersicht über Ihre Lernaktivitäten</p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <BookOpen size={24} className="text-purple-400" />
          </div>
          <p className="text-3xl font-bold text-white">{progress.modulesCompleted || 0}</p>
          <p className="text-sm text-gray-400">Module abgeschlossen</p>
        </div>

        <div className="bg-gradient-to-br from-pink-500/20 to-pink-500/5 border border-pink-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <Award size={24} className="text-pink-400" />
          </div>
          <p className="text-3xl font-bold text-white">{progress.avgQuizScore || 0}%</p>
          <p className="text-sm text-gray-400">Durchschn. Quiz-Score</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <Clock size={24} className="text-blue-400" />
          </div>
          <p className="text-3xl font-bold text-white">{formatTime(progress.totalTimeSpent || 0)}</p>
          <p className="text-sm text-gray-400">Zeit investiert</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 border border-yellow-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <Star size={24} className="text-yellow-400" />
          </div>
          <p className="text-3xl font-bold text-white">{progress.totalPoints || 0}</p>
          <p className="text-sm text-gray-400">Punkte gesammelt</p>
        </div>
      </div>

      {/* Module Completion Progress */}
      {progress.moduleProgress && progress.moduleProgress.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Modul-Fortschritt</h3>
          <div className="space-y-4">
            {progress.moduleProgress.map((module, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{module.title}</span>
                  <span className="text-gray-400 text-sm">{module.completionPercentage}%</span>
                </div>
                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                    style={{ width: `${module.completionPercentage}%` }}
                  />
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                  <span>{module.completedSubmodules} / {module.totalSubmodules} Submodule</span>
                  <span>•</span>
                  <span>{formatTime(module.timeSpent)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quiz History */}
      {progress.quizHistory && progress.quizHistory.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Quiz-Verlauf</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={progress.quizHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="title" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                labelStyle={{ color: '#f1f5f9' }}
              />
              <Bar dataKey="score" fill="#8b5cf6" name="Score (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Bookmarks & Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bookmarks */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Bookmark size={20} className="text-blue-400" />
            Lesezeichen ({progress.bookmarks?.length || 0})
          </h3>
          {progress.bookmarks && progress.bookmarks.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {progress.bookmarks.map((bookmark, index) => (
                <div key={index} className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all cursor-pointer">
                  <p className="text-white text-sm font-medium">{bookmark.title}</p>
                  <p className="text-xs text-gray-400 mt-1">{bookmark.moduleName}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Keine Lesezeichen gesetzt</p>
          )}
        </div>

        {/* Notes */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FileText size={20} className="text-green-400" />
            Notizen ({progress.notesCount || 0})
          </h3>
          {progress.recentNotes && progress.recentNotes.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {progress.recentNotes.map((note, index) => (
                <div key={index} className="p-3 bg-white/5 rounded-lg">
                  <p className="text-white text-sm line-clamp-2">{note.content}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {note.moduleName} • {new Date(note.timestamp).toLocaleDateString('de-DE')}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Keine Notizen vorhanden</p>
          )}
        </div>
      </div>

      {/* Achievements */}
      {progress.achievements && progress.achievements.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-yellow-400" />
            Erfolge
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {progress.achievements.map((achievement, index) => (
              <div
                key={index}
                className="p-4 bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 border border-yellow-500/30 rounded-lg text-center"
              >
                <div className="text-4xl mb-2">{achievement.icon}</div>
                <p className="text-white font-medium text-sm">{achievement.name}</p>
                <p className="text-xs text-gray-400 mt-1">{achievement.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certificates */}
      {progress.certificates && progress.certificates.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Award size={20} className="text-purple-400" />
            Zertifikate ({progress.certificates.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {progress.certificates.map((cert, index) => (
              <div key={index} className="p-4 bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/30 rounded-lg">
                <p className="text-white font-semibold">{cert.moduleTitle}</p>
                <p className="text-sm text-gray-400 mt-1">
                  Ausgestellt am {new Date(cert.issuedAt).toLocaleDateString('de-DE')}
                </p>
                <button className="mt-3 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-all text-sm w-full">
                  Zertifikat herunterladen
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default PersonalDashboard;
