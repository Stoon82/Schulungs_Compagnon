import { useState, useEffect } from 'react';
import { Settings, Users, Activity, TrendingUp, Unlock, LogOut, LayoutDashboard, Languages } from 'lucide-react';
import { io } from 'socket.io-client';
import api from '../services/api';
import ModuleList from './ModuleList';
import FloatingMoodBar from './FloatingMoodBar';
import QRCodeButton from './QRCodeButton';
import { useLanguage } from '../contexts/LanguageContext';

function AdminProjectorView({ participant, modules, onLogout, onDashboard }) {
  const { t } = useLanguage();
  const [showSidebar, setShowSidebar] = useState(true);
  const [participants, setParticipants] = useState([]);
  const [stats, setStats] = useState(null);
  const [moodData, setMoodData] = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    loadAdminData();
    const interval = setInterval(loadAdminData, 5000);
    
    // Setup socket for real-time updates
    const newSocket = io(window.location.origin, {
      path: '/socket.io'
    });
    
    newSocket.on('mood:update', (data) => {
      console.log('Mood update received:', data);
      loadAdminData();
    });
    
    newSocket.on('feedback:pause', (data) => {
      console.log('🔔 Pause request received in admin sidebar:', data);
      setRecentAlerts(prev => [{
        type: 'pause',
        participant: data.nickname || 'Anonymous',
        timestamp: Date.now(),
        id: Math.random()
      }, ...prev].slice(0, 5));
    });
    
    newSocket.on('feedback:overwhelmed', (data) => {
      console.log('🔔 Overwhelmed alert received in admin sidebar:', data);
      setRecentAlerts(prev => [{
        type: 'overwhelmed',
        participant: data.nickname || 'Anonymous',
        timestamp: Date.now(),
        id: Math.random()
      }, ...prev].slice(0, 5));
    });
    
    setSocket(newSocket);
    
    return () => {
      clearInterval(interval);
      newSocket.close();
    };
  }, []);

  const loadAdminData = async () => {
    try {
      const [statsRes, participantsRes, moodRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminParticipants(),
        api.getAdminMoodAnalytics('1 hour')
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (participantsRes.success) setParticipants(participantsRes.data);
      if (moodRes.success) setMoodData(moodRes.data);
    } catch (error) {
      console.error('Failed to load admin data:', error);
    }
  };

  const handleUnlockModule = async (moduleId) => {
    try {
      const response = await api.unlockModule(moduleId, null, true);
      if (response.success) {
        loadAdminData();
      }
    } catch (error) {
      console.error('Failed to unlock module:', error);
    }
  };

  const moodCounts = moodData.reduce((acc, item) => {
    acc[item.mood] = (acc[item.mood] || 0) + item.count;
    return acc;
  }, {});

  const moodEmojis = {
    confused: '😕',
    thinking: '🤔',
    aha: '💡',
    wow: '🤩'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex">
      {/* Main Content - Client App View */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-8">
          {/* Header matching client app */}
          <header className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  {t('app.title')}
                </h1>
                <p className="text-gray-300 mt-1">
                  {t('app.welcome')}, Admin
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <QRCodeButton isAdmin={true} />
                
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 text-green-400">
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  {t('app.connected')}
                </div>
              </div>
            </div>
          </header>

          <main>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2">{t('app.yourJourney')}</h2>
              <p className="text-gray-400">
                {t('app.journeyDescription')}
              </p>
            </div>

            <ModuleList modules={modules} onModuleClick={() => {}} />
          </main>
        </div>
        
        <FloatingMoodBar onMoodSelect={() => {}} currentModuleId={null} />
      </div>

      {/* Admin Sidebar */}
      <div className={`${showSidebar ? 'w-96' : 'w-0'} transition-all duration-300 bg-black/40 backdrop-blur-lg border-l border-white/10 overflow-hidden`}>
        {showSidebar && (
          <div className="h-full overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Settings size={20} />
                Admin Controls
              </h3>
              <button
                onClick={() => setShowSidebar(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-all"
              >
                ×
              </button>
            </div>

            {/* QR Code Section */}
            <div className="mb-6">
              <QRCodeButton isAdmin={true} />
            </div>

            {/* Quick Actions */}
            <div className="space-y-3 mb-6">
              <button
                onClick={onDashboard}
                className="w-full px-4 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-all flex items-center gap-2"
              >
                <LayoutDashboard size={18} />
                <span>Full Dashboard</span>
              </button>
              
              <button
                onClick={onLogout}
                className="w-full px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all flex items-center gap-2"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>

            {/* Recent Alerts */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-400 mb-3">Recent Alerts</h4>
              {recentAlerts.length > 0 ? (
                <div className="space-y-2">
                  {recentAlerts.slice(0, 3).map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-3 rounded-lg border ${
                        alert.type === 'pause'
                          ? 'bg-yellow-500/10 border-yellow-500/30'
                          : 'bg-red-500/10 border-red-500/30'
                      }`}
                    >
                      <div className="text-sm font-medium text-white">
                        {alert.type === 'pause' ? '⏸️ Break Request' : '🚨 Overwhelmed'}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {alert.participant} • {Math.floor((Date.now() - alert.timestamp) / 1000)}s ago
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-xs text-gray-500 text-center">
                    No alerts yet. Pause and overwhelmed requests will appear here.
                  </div>
                </div>
              )}
            </div>

            {/* Live Stats */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-400 mb-3">Live Stats</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-2xl font-bold text-cyan-400">
                    {participants.filter(p => p.is_online).length}
                  </div>
                  <div className="text-xs text-gray-400">Online</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-2xl font-bold text-purple-400">
                    {stats?.totalMoodUpdates || 0}
                  </div>
                  <div className="text-xs text-gray-400">Reactions</div>
                </div>
              </div>
            </div>

            {/* Mood Distribution */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-400 mb-3">Current Mood</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(moodCounts).map(([mood, count]) => (
                  <div key={mood} className="bg-white/5 rounded-lg p-2 flex items-center gap-2">
                    <span className="text-2xl">{moodEmojis[mood]}</span>
                    <span className="text-lg font-bold text-white">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Module Controls */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-400 mb-3">Module Access</h4>
              <div className="space-y-2">
                {modules.map((module) => (
                  <div
                    key={module.id}
                    className={`p-3 rounded-lg border ${
                      module.is_unlocked
                        ? 'bg-green-500/10 border-green-500/30'
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white">{module.title}</div>
                      </div>
                      {!module.is_unlocked && (
                        <button
                          onClick={() => handleUnlockModule(module.id)}
                          className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded transition-all"
                        >
                          <Unlock size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Participants */}
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-3">
                Participants ({participants.filter(p => p.is_online).length})
              </h4>
              <div className="space-y-2">
                {participants.filter(p => p.is_online).map((p) => (
                  <div key={p.id} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                    <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center text-sm font-bold">
                      {p.nickname?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-white">{p.nickname}</div>
                    </div>
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar Toggle Button */}
      {!showSidebar && (
        <button
          onClick={() => setShowSidebar(true)}
          className="fixed right-4 top-4 p-3 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-all z-50"
        >
          <Settings size={20} />
        </button>
      )}
    </div>
  );
}

export default AdminProjectorView;
