import { useState, useEffect } from 'react';
import { TrendingUp, Target, Flame, Calendar, Award } from 'lucide-react';
import axios from 'axios';

/**
 * ProgressTracker Component
 * Visualizes module completion progress with milestones and streak tracking
 */
function ProgressTracker({ userId, moduleId }) {
  const [progress, setProgress] = useState(null);
  const [streak, setStreak] = useState({ currentStreak: 0, longestStreak: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
    fetchStreak();
  }, [userId, moduleId]);

  const fetchProgress = async () => {
    try {
      const response = await axios.get(`/api/analytics/participant/${userId}/progress`);
      setProgress(response.data.data);
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const fetchStreak = async () => {
    try {
      const response = await axios.get(`/api/gamification/streak/${userId}`);
      setStreak(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching streak:', error);
      setLoading(false);
    }
  };

  const getStreakColor = (days) => {
    if (days >= 30) return 'text-orange-500';
    if (days >= 7) return 'text-yellow-500';
    if (days >= 3) return 'text-blue-500';
    return 'text-gray-500';
  };

  const getStreakEmoji = (days) => {
    if (days >= 30) return '🔥🔥🔥';
    if (days >= 7) return '🔥🔥';
    if (days >= 3) return '🔥';
    return '💪';
  };

  const milestones = [
    { points: 0, label: 'Start', icon: '🎯' },
    { points: 25, label: 'Anfänger', icon: '🌱' },
    { points: 50, label: 'Fortgeschritten', icon: '⭐' },
    { points: 75, label: 'Experte', icon: '🏆' },
    { points: 100, label: 'Meister', icon: '👑' }
  ];

  const getCurrentMilestone = (percentage) => {
    for (let i = milestones.length - 1; i >= 0; i--) {
      if (percentage >= milestones[i].points) {
        return i;
      }
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-6 border border-white/10">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-400 mx-auto"></div>
          <p className="text-gray-400 mt-4">Lade Fortschritt...</p>
        </div>
      </div>
    );
  }

  const moduleProgress = progress?.moduleProgress?.[0] || {};
  const completionPercentage = moduleProgress.completionPercentage || 0;
  const currentMilestoneIndex = getCurrentMilestone(completionPercentage);

  return (
    <div className="space-y-6">
      {/* Streak Card */}
      <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-6xl">{getStreakEmoji(streak.currentStreak)}</div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">
                {streak.currentStreak} Tage Streak!
              </h3>
              <p className="text-sm text-gray-300">
                Längste Streak: {streak.longestStreak} Tage
              </p>
            </div>
          </div>
          <div className="text-right">
            <Flame className={`${getStreakColor(streak.currentStreak)} mb-2`} size={32} />
            <p className="text-xs text-gray-400">Bleib dran!</p>
          </div>
        </div>

        {/* Streak Progress */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>Nächstes Ziel: {streak.currentStreak < 7 ? '7 Tage' : streak.currentStreak < 30 ? '30 Tage' : '60 Tage'}</span>
            <span>{streak.currentStreak < 7 ? streak.currentStreak : streak.currentStreak < 30 ? streak.currentStreak - 7 : streak.currentStreak - 30} / {streak.currentStreak < 7 ? 7 : streak.currentStreak < 30 ? 30 : 60}</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
              style={{
                width: `${
                  streak.currentStreak < 7
                    ? (streak.currentStreak / 7) * 100
                    : streak.currentStreak < 30
                    ? ((streak.currentStreak - 7) / 23) * 100
                    : ((streak.currentStreak - 30) / 30) * 100
                }%`
              }}
            />
          </div>
        </div>
      </div>

      {/* Module Progress */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-6 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Target className="text-purple-400" size={24} />
            <div>
              <h3 className="text-xl font-bold text-white">Modul Fortschritt</h3>
              <p className="text-sm text-gray-400">{moduleProgress.title || 'Kein Modul'}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-purple-400">{completionPercentage}%</div>
            <div className="text-xs text-gray-400">Abgeschlossen</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="h-4 bg-white/10 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>{moduleProgress.completedSubmodules || 0} / {moduleProgress.totalSubmodules || 0} Submodule</span>
            <span>{Math.round((moduleProgress.timeSpent || 0) / 60)} Minuten</span>
          </div>
        </div>

        {/* Milestones */}
        <div className="relative">
          <div className="flex justify-between items-center mb-2">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex flex-col items-center relative z-10">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all ${
                    index <= currentMilestoneIndex
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500 scale-110 shadow-lg'
                      : 'bg-white/10 opacity-50'
                  }`}
                >
                  {milestone.icon}
                </div>
                <div className="text-center mt-2">
                  <p
                    className={`text-xs font-semibold ${
                      index <= currentMilestoneIndex ? 'text-white' : 'text-gray-500'
                    }`}
                  >
                    {milestone.label}
                  </p>
                  <p className="text-xs text-gray-500">{milestone.points}%</p>
                </div>
              </div>
            ))}
          </div>

          {/* Connecting Line */}
          <div className="absolute top-6 left-0 right-0 h-1 bg-white/10 -z-0">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-lg p-4">
          <TrendingUp className="text-blue-400 mb-2" size={20} />
          <p className="text-2xl font-bold text-white">{progress?.modulesCompleted || 0}</p>
          <p className="text-xs text-gray-400">Module</p>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-lg p-4">
          <Award className="text-green-400 mb-2" size={20} />
          <p className="text-2xl font-bold text-white">{progress?.avgQuizScore || 0}%</p>
          <p className="text-xs text-gray-400">Quiz Score</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-lg p-4">
          <Calendar className="text-purple-400 mb-2" size={20} />
          <p className="text-2xl font-bold text-white">{Math.round((progress?.totalTimeSpent || 0) / 3600)}h</p>
          <p className="text-xs text-gray-400">Zeit investiert</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-lg p-4">
          <Flame className="text-yellow-400 mb-2" size={20} />
          <p className="text-2xl font-bold text-white">{streak.longestStreak}</p>
          <p className="text-xs text-gray-400">Beste Streak</p>
        </div>
      </div>
    </div>
  );
}

export default ProgressTracker;
