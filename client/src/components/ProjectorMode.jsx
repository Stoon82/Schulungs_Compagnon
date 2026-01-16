import { useState, useEffect } from 'react';
import { QrCode, Users, Activity, TrendingUp, Settings, X, Maximize2, Minimize2 } from 'lucide-react';
import api from '../services/api';
import QRCode from 'qrcode';

function ProjectorMode({ onClose }) {
  const [participants, setParticipants] = useState([]);
  const [stats, setStats] = useState(null);
  const [moodData, setMoodData] = useState([]);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [accessUrl, setAccessUrl] = useState('');

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    generateQRCode();
  }, []);

  const loadData = async () => {
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
      console.error('Failed to load projector data:', error);
    }
  };

  const generateQRCode = async () => {
    const url = window.location.origin;
    setAccessUrl(url);
    
    try {
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
      setQrCodeUrl(qrDataUrl);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
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

  const moodColors = {
    confused: 'text-red-400',
    thinking: 'text-yellow-400',
    aha: 'text-cyan-400',
    wow: 'text-purple-400'
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 z-50 overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-black/30 backdrop-blur-lg border-b border-white/10 px-6 py-4 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center">
              <Activity size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Projector Mode</h1>
              <p className="text-sm text-gray-400">Live Training Session</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowQR(!showQR)}
              className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-all flex items-center gap-2"
            >
              <QrCode size={18} />
              <span>QR Code</span>
            </button>
            
            <button
              onClick={toggleFullscreen}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-all"
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all flex items-center gap-2"
            >
              <X size={18} />
              <span>Close</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-full pt-20">
        {/* Left: Participant View Simulation */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-8 h-full">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
                The Compagnon
              </h2>
              <p className="text-xl text-gray-300">
                Immersive AI Training for ABW
              </p>
            </div>

            {/* Live Stats Display */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl p-6 border border-cyan-500/30">
                <div className="flex items-center gap-3 mb-2">
                  <Users size={24} className="text-cyan-400" />
                  <span className="text-gray-300">Participants</span>
                </div>
                <div className="text-4xl font-bold text-white">
                  {stats?.activeSessions || 0}
                </div>
                <div className="text-sm text-gray-400 mt-1">currently online</div>
              </div>

              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-6 border border-purple-500/30">
                <div className="flex items-center gap-3 mb-2">
                  <Activity size={24} className="text-purple-400" />
                  <span className="text-gray-300">Engagement</span>
                </div>
                <div className="text-4xl font-bold text-white">
                  {stats?.totalMoodUpdates || 0}
                </div>
                <div className="text-sm text-gray-400 mt-1">mood reactions</div>
              </div>
            </div>

            {/* Live Mood Display */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp size={20} />
                Live Mood Reactions
              </h3>
              <div className="grid grid-cols-4 gap-4">
                {Object.entries(moodCounts).map(([mood, count]) => (
                  <div key={mood} className="text-center">
                    <div className="text-5xl mb-2">{moodEmojis[mood]}</div>
                    <div className={`text-3xl font-bold ${moodColors[mood]}`}>
                      {count}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Admin Control Sidebar */}
        <div className="w-96 bg-black/40 backdrop-blur-lg border-l border-white/10 p-6 overflow-y-auto">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Settings size={20} />
            Live Controls
          </h3>

          {/* Participants List */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-400 mb-3">Active Participants</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {participants.filter(p => p.is_online).map((participant) => (
                <div
                  key={participant.id}
                  className="bg-white/5 rounded-lg p-3 border border-white/10"
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                      style={{ 
                        background: `linear-gradient(135deg, hsl(${parseInt(participant.avatar_seed, 16) % 360}, 70%, 50%), hsl(${(parseInt(participant.avatar_seed, 16) + 60) % 360}, 70%, 60%))`
                      }}
                    >
                      {participant.nickname?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium truncate">
                        {participant.nickname || 'Anonymous'}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-green-400">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        Online
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {participants.filter(p => p.is_online).length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  No participants online
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h4 className="text-sm font-medium text-gray-400 mb-3">Session Stats</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Participants:</span>
                <span className="text-white font-medium">{stats?.totalParticipants || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Apps Created:</span>
                <span className="text-white font-medium">{stats?.totalApps || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Chat Messages:</span>
                <span className="text-white font-medium">{stats?.totalChatMessages || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Join the Session
              </h3>
              <p className="text-gray-600 mb-6">
                Scan this QR code to join
              </p>
              
              {qrCodeUrl && (
                <div className="bg-white p-4 rounded-xl inline-block mb-4">
                  <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64" />
                </div>
              )}
              
              <div className="bg-gray-100 rounded-lg p-3 mb-6">
                <p className="text-sm text-gray-600 mb-1">Or visit:</p>
                <p className="text-lg font-mono font-bold text-gray-900 break-all">
                  {accessUrl}
                </p>
              </div>

              <button
                onClick={() => setShowQR(false)}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-purple-600 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectorMode;
