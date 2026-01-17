import { useState, useEffect } from 'react';
import { Award, Lock, Star, Sparkles } from 'lucide-react';
import axios from 'axios';

/**
 * BadgeDisplay Component
 * Shows earned and available badges with progress tracking
 */
function BadgeDisplay({ userId }) {
  const [badges, setBadges] = useState({ earned: [], total: 0, earnedCount: 0 });
  const [allBadges, setAllBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'earned', 'locked'
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    fetchBadges();
  }, [userId]);

  const fetchBadges = async () => {
    try {
      setLoading(true);
      const [userBadgesRes, allBadgesRes] = await Promise.all([
        axios.get(`/api/gamification/badges/${userId}`),
        axios.get('/api/gamification/badges')
      ]);

      setBadges(userBadgesRes.data.data);
      setAllBadges(allBadgesRes.data.data);
    } catch (error) {
      console.error('Error fetching badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common':
        return 'from-gray-500 to-gray-600';
      case 'rare':
        return 'from-blue-500 to-blue-600';
      case 'epic':
        return 'from-purple-500 to-purple-600';
      case 'legendary':
        return 'from-yellow-500 to-orange-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getRarityBorder = (rarity) => {
    switch (rarity) {
      case 'common':
        return 'border-gray-500/50';
      case 'rare':
        return 'border-blue-500/50';
      case 'epic':
        return 'border-purple-500/50';
      case 'legendary':
        return 'border-yellow-500/50 shadow-lg shadow-yellow-500/20';
      default:
        return 'border-gray-500/50';
    }
  };

  const isEarned = (badgeId) => {
    return badges.earned.some(b => b.badge_id === badgeId);
  };

  const getEarnedBadge = (badgeId) => {
    return badges.earned.find(b => b.badge_id === badgeId);
  };

  const filteredBadges = allBadges.filter(badge => {
    const earned = isEarned(badge.id);
    
    if (filter === 'earned' && !earned) return false;
    if (filter === 'locked' && earned) return false;
    if (categoryFilter !== 'all' && badge.category !== categoryFilter) return false;
    
    return true;
  });

  const categories = [...new Set(allBadges.map(b => b.category))];

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-6 border border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Award className="text-purple-400" size={28} />
          <div>
            <h2 className="text-2xl font-bold text-white">Abzeichen</h2>
            <p className="text-sm text-gray-400">
              {badges.earnedCount} von {badges.total} freigeschaltet
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-3xl font-bold text-purple-400">
            {Math.round((badges.earnedCount / badges.total) * 100) || 0}%
          </div>
          <div className="text-xs text-gray-400">Fortschritt</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
            style={{ width: `${(badges.earnedCount / badges.total) * 100}%` }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg transition-all ${
            filter === 'all'
              ? 'bg-purple-500 text-white'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          Alle ({allBadges.length})
        </button>
        <button
          onClick={() => setFilter('earned')}
          className={`px-4 py-2 rounded-lg transition-all ${
            filter === 'earned'
              ? 'bg-green-500 text-white'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          Freigeschaltet ({badges.earnedCount})
        </button>
        <button
          onClick={() => setFilter('locked')}
          className={`px-4 py-2 rounded-lg transition-all ${
            filter === 'locked'
              ? 'bg-red-500 text-white'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          Gesperrt ({badges.total - badges.earnedCount})
        </button>

        <div className="w-px bg-white/10 mx-2" />

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
        >
          <option value="all">Alle Kategorien</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Badges Grid */}
      {loading ? (
        <div className="text-center py-12">
          <Sparkles className="animate-spin mx-auto mb-4 text-purple-400" size={32} />
          <p className="text-gray-400">Lade Abzeichen...</p>
        </div>
      ) : filteredBadges.length === 0 ? (
        <div className="text-center py-12">
          <Award className="mx-auto mb-4 text-gray-600" size={48} />
          <p className="text-gray-400">Keine Abzeichen gefunden</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredBadges.map((badge) => {
            const earned = isEarned(badge.id);
            const earnedBadge = getEarnedBadge(badge.id);

            return (
              <div
                key={badge.id}
                className={`relative rounded-lg p-4 border-2 transition-all ${
                  earned
                    ? `bg-gradient-to-br ${getRarityColor(badge.rarity)}/20 ${getRarityBorder(
                        badge.rarity
                      )} hover:scale-105`
                    : 'bg-white/5 border-white/10 opacity-60'
                }`}
              >
                {/* Badge Icon */}
                <div className="text-center mb-3">
                  <div
                    className={`text-5xl mb-2 ${
                      earned ? '' : 'filter grayscale opacity-50'
                    }`}
                  >
                    {badge.icon}
                  </div>
                  {!earned && (
                    <Lock className="absolute top-2 right-2 text-gray-500" size={16} />
                  )}
                  {earned && badge.rarity === 'legendary' && (
                    <Sparkles className="absolute top-2 right-2 text-yellow-400 animate-pulse" size={16} />
                  )}
                </div>

                {/* Badge Info */}
                <div className="text-center">
                  <h3 className="font-bold text-white text-sm mb-1">{badge.name}</h3>
                  <p className="text-xs text-gray-400 mb-2 line-clamp-2">
                    {badge.description}
                  </p>

                  {/* Rarity Badge */}
                  <div
                    className={`inline-block px-2 py-1 rounded text-xs font-semibold bg-gradient-to-r ${getRarityColor(
                      badge.rarity
                    )} text-white`}
                  >
                    {badge.rarity.toUpperCase()}
                  </div>

                  {/* Points */}
                  {badge.points_required && (
                    <div className="mt-2 text-xs text-gray-400">
                      <Star size={12} className="inline mr-1" />
                      {badge.points_required} Punkte
                    </div>
                  )}

                  {/* Earned Date */}
                  {earned && earnedBadge && (
                    <div className="mt-2 text-xs text-green-400">
                      Freigeschaltet: {new Date(earnedBadge.earned_at).toLocaleDateString('de-DE')}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Stats Footer */}
      <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-4 gap-4 text-center">
        <div>
          <p className="text-xl font-bold text-gray-400">
            {allBadges.filter(b => b.rarity === 'common').length}
          </p>
          <p className="text-xs text-gray-500">Common</p>
        </div>
        <div>
          <p className="text-xl font-bold text-blue-400">
            {allBadges.filter(b => b.rarity === 'rare').length}
          </p>
          <p className="text-xs text-gray-500">Rare</p>
        </div>
        <div>
          <p className="text-xl font-bold text-purple-400">
            {allBadges.filter(b => b.rarity === 'epic').length}
          </p>
          <p className="text-xs text-gray-500">Epic</p>
        </div>
        <div>
          <p className="text-xl font-bold text-yellow-400">
            {allBadges.filter(b => b.rarity === 'legendary').length}
          </p>
          <p className="text-xs text-gray-500">Legendary</p>
        </div>
      </div>
    </div>
  );
}

export default BadgeDisplay;
