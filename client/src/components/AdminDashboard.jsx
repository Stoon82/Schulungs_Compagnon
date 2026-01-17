import { useState, useEffect } from 'react';
import { 
  Users, Activity, MessageSquare, Code, TrendingUp, 
  Settings, LogOut, Unlock, Radio, Pause, Play,
  Key, Download, AlertCircle, Presentation, Edit, Palette
} from 'lucide-react';
import api from '../services/api';
import AdminStats from './AdminStats';
import AdminParticipants from './AdminParticipants';
import AdminAnalytics from './AdminAnalytics';
import AdminControls from './AdminControls';
import ProjectorMode from './ProjectorMode';
import ModuleEditor from './ModuleEditor';
import ModuleCreatorV2 from './ModuleCreatorV2';
import DesignEditor from './DesignEditor';

function AdminDashboard({ onLogout, onBackToProjector }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProjector, setShowProjector] = useState(false);
  const [showModuleEditor, setShowModuleEditor] = useState(false);
  const [showModuleCreator, setShowModuleCreator] = useState(false);
  const [showDesignEditor, setShowDesignEditor] = useState(false);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const result = await api.getAdminStats();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.adminLogout();
      onLogout();
    } catch (error) {
      console.error('Logout error:', error);
      onLogout();
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'participants', label: 'Participants', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'controls', label: 'Controls', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                <Settings size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-sm text-gray-400">The Compagnon Control Center</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {onBackToProjector && (
                <button
                  onClick={onBackToProjector}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-all"
                  title="Back to Projector View"
                >
                  <Presentation size={18} />
                  <span>Back to Projector</span>
                </button>
              )}
              
              <button
                onClick={() => setShowProjector(true)}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-all"
                title="Open Projector Mode"
              >
                <Presentation size={18} />
                <span>Projector</span>
              </button>
              
              <button
                onClick={() => setShowModuleCreator(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-all"
                title="Module Creator"
              >
                <Edit size={18} />
                <span>Module Creator</span>
              </button>
              
              <button
                onClick={() => setShowDesignEditor(true)}
                className="flex items-center gap-2 px-4 py-2 bg-pink-500/20 hover:bg-pink-500/30 text-pink-400 rounded-lg transition-all"
                title="Design Editor"
              >
                <Palette size={18} />
                <span>Design</span>
              </button>
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white transition-all"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      {stats && (
        <div className="bg-black/20 backdrop-blur-lg border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white/5 rounded-lg p-3">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                  <Users size={16} />
                  <span>Participants</span>
                </div>
                <div className="text-2xl font-bold text-white">{stats.totalParticipants}</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                  <Activity size={16} />
                  <span>Active Now</span>
                </div>
                <div className="text-2xl font-bold text-green-400">{stats.activeSessions}</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                  <MessageSquare size={16} />
                  <span>Moods</span>
                </div>
                <div className="text-2xl font-bold text-cyan-400">{stats.totalMoodUpdates}</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                  <Code size={16} />
                  <span>Apps</span>
                </div>
                <div className="text-2xl font-bold text-purple-400">{stats.totalApps}</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                  <MessageSquare size={16} />
                  <span>Chat Messages</span>
                </div>
                <div className="text-2xl font-bold text-yellow-400">{stats.totalChatMessages}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all ${
                    activeTab === tab.id
                      ? 'border-red-500 text-white'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center text-white py-12">Loading...</div>
        ) : (
          <>
            {activeTab === 'overview' && <AdminStats stats={stats} />}
            {activeTab === 'participants' && <AdminParticipants />}
            {activeTab === 'analytics' && <AdminAnalytics />}
            {activeTab === 'controls' && <AdminControls />}
          </>
        )}
      </div>

      {/* Projector Mode Modal */}
      {showProjector && (
        <ProjectorMode onClose={() => setShowProjector(false)} />
      )}

      {/* Module Editor Modal */}
      {showModuleEditor && (
        <ModuleEditor onClose={() => setShowModuleEditor(false)} />
      )}

      {/* Module Creator V2 Modal */}
      {showModuleCreator && (
        <ModuleCreatorV2 onClose={() => setShowModuleCreator(false)} />
      )}

      {/* Design Editor Modal */}
      {showDesignEditor && (
        <DesignEditor onClose={() => setShowDesignEditor(false)} />
      )}
    </div>
  );
}

export default AdminDashboard;
