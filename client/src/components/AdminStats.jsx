import { Activity, TrendingUp, Users, Zap } from 'lucide-react';

function AdminStats({ stats }) {
  if (!stats) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">System Overview</h2>
          <p className="text-gray-400">Loading statistics...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 animate-pulse">
              <div className="h-12 bg-white/10 rounded mb-4"></div>
              <div className="h-6 bg-white/10 rounded mb-2"></div>
              <div className="h-4 bg-white/10 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">System Overview</h2>
        <p className="text-gray-400">Real-time statistics and system health</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Users size={24} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-white">{stats.totalParticipants || 0}</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">Total Participants</h3>
          <p className="text-sm text-gray-400">All registered users</p>
        </div>

        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <Activity size={24} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-green-400">{stats.activeSessions || 0}</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">Active Sessions</h3>
          <p className="text-sm text-gray-400">Online in last 5 minutes</p>
        </div>

        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <TrendingUp size={24} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-purple-400">{stats.totalMoodUpdates || 0}</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">Mood Updates</h3>
          <p className="text-sm text-gray-400">Total engagement signals</p>
        </div>

        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <Zap size={24} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-orange-400">{stats.totalApps || 0}</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">Created Apps</h3>
          <p className="text-sm text-gray-400">Sandbox submissions</p>
        </div>
      </div>

      <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <Activity size={24} className="text-cyan-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">
              System Status: Operational
            </h3>
            <p className="text-gray-300 text-sm">
              All services are running normally. Real-time updates are active.
              {stats.activeSessions > 0 && ` ${stats.activeSessions} participant${stats.activeSessions > 1 ? 's are' : ' is'} currently online.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminStats;
