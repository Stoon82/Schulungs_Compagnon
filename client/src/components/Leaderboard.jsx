import { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Crown, Eye, EyeOff, Filter, RefreshCw } from 'lucide-react';
import axios from 'axios';

/**
 * Leaderboard Component
 * Displays top participants with points, rankings, and filtering options
 */
function Leaderboard({ sessionId, moduleId }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anonymous, setAnonymous] = useState(false);
  const [filterType, setFilterType] = useState('global'); // 'global', 'session', 'module'
  const [limit, setLimit] = useState(10);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
    
    if (autoRefresh) {
      const interval = setInterval(fetchLeaderboard, 30000); // Refresh every 30s
      return () => clearInterval(interval);
    }
  }, [sessionId, moduleId, filterType, limit, anonymous, autoRefresh]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const params = {
        limit,
        anonymous: anonymous ? 'true' : 'false'
      };

      if (filterType === 'session' && sessionId) {
        params.sessionId = sessionId;
      } else if (filterType === 'module' && moduleId) {
        params.moduleId = moduleId;
      }

      const response = await axios.get('/api/gamification/leaderboard', { params });
      setLeaderboard(response.data.data || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="text-yellow-400" size={24} />;
      case 2:
        return <Medal className="text-gray-400" size={24} />;
      case 3:
        return <Medal className="text-orange-400" size={24} />;
      default:
        return <Award className="text-purple-400" size={20} />;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/50';
      case 2:
        return 'from-gray-400/20 to-gray-500/20 border-gray-400/50';
      case 3:
        return 'from-orange-500/20 to-orange-600/20 border-orange-500/50';
      default:
        return 'from-purple-500/10 to-purple-600/10 border-purple-500/30';
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-6 border border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Trophy className="text-yellow-400" size={28} />
          <div>
            <h2 className="text-2xl font-bold text-white">Bestenliste</h2>
            <p className="text-sm text-gray-400">
              {filterType === 'global' && 'Globale Rangliste'}
              {filterType === 'session' && 'Session Rangliste'}
              {filterType === 'module' && 'Modul Rangliste'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Auto-refresh toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`p-2 rounded-lg transition-all ${
              autoRefresh
                ? 'bg-green-500/20 text-green-400'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
            title={autoRefresh ? 'Auto-Refresh aktiv' : 'Auto-Refresh inaktiv'}
          >
            <RefreshCw size={18} className={autoRefresh ? 'animate-spin' : ''} />
          </button>

          {/* Manual refresh */}
          <button
            onClick={fetchLeaderboard}
            disabled={loading}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all disabled:opacity-50"
            title="Aktualisieren"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>

          {/* Anonymous toggle */}
          <button
            onClick={() => setAnonymous(!anonymous)}
            className={`p-2 rounded-lg transition-all ${
              anonymous
                ? 'bg-blue-500/20 text-blue-400'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
            title={anonymous ? 'Anonymer Modus' : 'Namen anzeigen'}
          >
            {anonymous ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilterType('global')}
          className={`px-4 py-2 rounded-lg transition-all ${
            filterType === 'global'
              ? 'bg-purple-500 text-white'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          <Filter size={16} className="inline mr-2" />
          Global
        </button>
        {sessionId && (
          <button
            onClick={() => setFilterType('session')}
            className={`px-4 py-2 rounded-lg transition-all ${
              filterType === 'session'
                ? 'bg-purple-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Session
          </button>
        )}
        {moduleId && (
          <button
            onClick={() => setFilterType('module')}
            className={`px-4 py-2 rounded-lg transition-all ${
              filterType === 'module'
                ? 'bg-purple-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Modul
          </button>
        )}

        <select
          value={limit}
          onChange={(e) => setLimit(parseInt(e.target.value))}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
        >
          <option value="10">Top 10</option>
          <option value="25">Top 25</option>
          <option value="50">Top 50</option>
          <option value="100">Top 100</option>
        </select>
      </div>

      {/* Leaderboard List */}
      {loading && leaderboard.length === 0 ? (
        <div className="text-center py-12">
          <RefreshCw className="animate-spin mx-auto mb-4 text-purple-400" size={32} />
          <p className="text-gray-400">Lade Bestenliste...</p>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="text-center py-12">
          <Trophy className="mx-auto mb-4 text-gray-600" size={48} />
          <p className="text-gray-400">Noch keine Einträge vorhanden</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leaderboard.map((entry, index) => (
            <div
              key={entry.userId}
              className={`bg-gradient-to-r ${getRankColor(
                entry.rank
              )} border rounded-lg p-4 transition-all hover:scale-[1.02]`}
            >
              <div className="flex items-center gap-4">
                {/* Rank Icon */}
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                  {getRankIcon(entry.rank)}
                </div>

                {/* Rank Number */}
                <div className="flex-shrink-0 w-8">
                  <span className="text-2xl font-bold text-white">#{entry.rank}</span>
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-semibold text-white truncate">
                    {entry.userName || entry.userId}
                  </p>
                  {entry.isAnonymous && (
                    <p className="text-xs text-gray-400">Anonymer Modus</p>
                  )}
                </div>

                {/* Points */}
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">{entry.totalPoints.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">Punkte</p>
                </div>
              </div>

              {/* Progress Bar for Top 3 */}
              {entry.rank <= 3 && leaderboard[0] && (
                <div className="mt-3">
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        entry.rank === 1
                          ? 'bg-yellow-400'
                          : entry.rank === 2
                          ? 'bg-gray-400'
                          : 'bg-orange-400'
                      }`}
                      style={{
                        width: `${(entry.totalPoints / leaderboard[0].totalPoints) * 100}%`
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Footer Stats */}
      {leaderboard.length > 0 && (
        <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-yellow-400">
              {leaderboard[0]?.totalPoints.toLocaleString() || 0}
            </p>
            <p className="text-xs text-gray-400">Höchste Punktzahl</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-400">{leaderboard.length}</p>
            <p className="text-xs text-gray-400">Teilnehmer</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-400">
              {Math.round(
                leaderboard.reduce((sum, e) => sum + e.totalPoints, 0) / leaderboard.length
              ).toLocaleString()}
            </p>
            <p className="text-xs text-gray-400">Durchschnitt</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Leaderboard;
