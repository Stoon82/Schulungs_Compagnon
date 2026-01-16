import { useState, useEffect } from 'react';
import { QrCode, Users, Activity, TrendingUp, Settings, X, Maximize2, Minimize2, Unlock, Pause, AlertTriangle, CheckCircle } from 'lucide-react';
import { io } from 'socket.io-client';
import api from '../services/api';
import QRCode from 'qrcode';

function ProjectorMode({ onClose }) {
  const [participants, setParticipants] = useState([]);
  const [stats, setStats] = useState(null);
  const [moodData, setMoodData] = useState([]);
  const [modules, setModules] = useState([]);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [accessUrl, setAccessUrl] = useState('');
  const [tunnelUrl, setTunnelUrl] = useState('');
  const [detectingNgrok, setDetectingNgrok] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [socket, setSocket] = useState(null);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [liveMoodReactions, setLiveMoodReactions] = useState([]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    
    // Setup socket for real-time updates
    const newSocket = io(window.location.origin, {
      path: '/socket.io'
    });
    
    newSocket.on('mood:update', (data) => {
      // Add to live reactions feed
      setLiveMoodReactions(prev => [{
        ...data,
        timestamp: Date.now(),
        id: Math.random()
      }, ...prev].slice(0, 10));
    });
    
    newSocket.on('feedback:pause', (data) => {
      setRecentAlerts(prev => [{
        type: 'pause',
        participant: data.nickname || 'Anonymous',
        timestamp: Date.now(),
        id: Math.random()
      }, ...prev].slice(0, 5));
    });
    
    newSocket.on('feedback:overwhelmed', (data) => {
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

  useEffect(() => {
    generateQRCode();
    fetchNgrokUrl();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, participantsRes, moodRes, modulesRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminParticipants(),
        api.getAdminMoodAnalytics('1 hour'),
        api.getModules()
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (participantsRes.success) setParticipants(participantsRes.data);
      if (moodRes.success) setMoodData(moodRes.data);
      if (modulesRes.success) setModules(modulesRes.data);
    } catch (error) {
      console.error('Failed to load projector data:', error);
    }
  };

  const fetchNgrokUrl = async () => {
    setDetectingNgrok(true);
    try {
      console.log('🔍 Attempting to detect ngrok tunnel...');
      // Use server-side proxy to bypass CORS
      const response = await fetch('http://localhost:3000/api/ngrok/tunnel');
      console.log('📡 Ngrok proxy response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Ngrok API data:', data);
        
        if (data.tunnels && data.tunnels.length > 0) {
          const httpsTunnel = data.tunnels.find(t => t.proto === 'https');
          if (httpsTunnel) {
            const ngrokUrl = httpsTunnel.public_url;
            console.log('✅ Ngrok tunnel detected:', ngrokUrl);
            updateTunnelUrl(ngrokUrl);
          } else {
            console.log('⚠️ No HTTPS tunnel found, available tunnels:', data.tunnels.map(t => t.proto));
            // Try HTTP tunnel as fallback
            const httpTunnel = data.tunnels.find(t => t.proto === 'http');
            if (httpTunnel) {
              console.log('⚠️ Using HTTP tunnel (HTTPS preferred):', httpTunnel.public_url);
              updateTunnelUrl(httpTunnel.public_url);
            }
          }
        } else {
          console.log('⚠️ No tunnels found in ngrok API response');
        }
      } else {
        const errorData = await response.json();
        console.log('❌ Ngrok not available:', errorData.message);
      }
    } catch (error) {
      console.log('❌ Ngrok detection failed:', error.message);
      console.log('💡 Make sure ngrok is running and server is accessible');
    } finally {
      setDetectingNgrok(false);
    }
  };

  const generateQRCode = async () => {
    // Check for tunnel URL in localStorage or use origin
    const savedTunnelUrl = localStorage.getItem('tunnel_url');
    const url = savedTunnelUrl || window.location.origin;
    setAccessUrl(url);
    setTunnelUrl(savedTunnelUrl || '');
    
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
  
  const updateTunnelUrl = (url) => {
    setTunnelUrl(url);
    if (url) {
      localStorage.setItem('tunnel_url', url);
      setAccessUrl(url);
    } else {
      localStorage.removeItem('tunnel_url');
      setAccessUrl(window.location.origin);
    }
    generateQRCode();
  };
  
  const handleUnlockModule = async (moduleId) => {
    try {
      const response = await api.unlockModule(moduleId);
      if (response.success) {
        loadData();
      }
    } catch (error) {
      console.error('Failed to unlock module:', error);
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
        {/* Left: Client Experience View */}
        <div className="flex-1 p-3 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {/* Compact Header */}
            <div className="flex items-center justify-between mb-3 bg-white/5 rounded-lg p-3 border border-white/10">
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  The Compagnon
                </h2>
                <p className="text-sm text-gray-400">Immersive AI Training for ABW</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-400">{participants.filter(p => p.is_online).length}</div>
                  <div className="text-xs text-gray-400">Online</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{stats?.totalMoodUpdates || 0}</div>
                  <div className="text-xs text-gray-400">Reactions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{modules.filter(m => m.is_unlocked).length}/{modules.length}</div>
                  <div className="text-xs text-gray-400">Modules</div>
                </div>
              </div>
            </div>

            {/* Alert Banner - Compact */}
            {recentAlerts.length > 0 && (
              <div className="mb-2 space-y-1">
                {recentAlerts.slice(0, 1).map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-2 rounded-lg border flex items-center gap-2 animate-pulse ${
                      alert.type === 'pause'
                        ? 'bg-yellow-500/20 border-yellow-500/50'
                        : 'bg-red-500/20 border-red-500/50'
                    }`}
                  >
                    {alert.type === 'pause' ? (
                      <Pause size={18} className="text-yellow-400" />
                    ) : (
                      <AlertTriangle size={18} className="text-red-400" />
                    )}
                    <div className="flex-1">
                      <span className="text-sm font-semibold text-white">
                        {alert.type === 'pause' ? '⏸️ Break Request' : '🚨 Overwhelmed'}
                      </span>
                      <span className="text-xs text-gray-300 ml-2">
                        {alert.participant}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {Math.floor((Date.now() - alert.timestamp) / 1000)}s ago
                    </div>
                  </div>
                ))}
              </div>
            )}


            {/* Compact Mood Reactions */}
            <div className="bg-white/5 rounded-lg p-3 border border-white/10 mb-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <TrendingUp size={16} />
                  Mood Reactions
                </h3>
                <div className="flex items-center gap-4">
                  {Object.entries(moodCounts).map(([mood, count]) => (
                    <div key={mood} className="flex items-center gap-2">
                      <span className="text-2xl">{moodEmojis[mood]}</span>
                      <span className={`text-xl font-bold ${moodColors[mood]}`}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Live Reaction Feed - Compact */}
            {liveMoodReactions.length > 0 && (
              <div className="bg-white/5 rounded-lg p-2 border border-white/10 mb-2">
                <h3 className="text-xs font-semibold text-gray-400 mb-2">Recent Reactions</h3>
                <div className="flex gap-2 overflow-x-auto">
                  {liveMoodReactions.slice(0, 5).map((reaction) => (
                    <div key={reaction.id} className="flex items-center gap-2 bg-white/5 rounded px-2 py-1 whitespace-nowrap">
                      <span className="text-xl">{moodEmojis[reaction.mood]}</span>
                      <span className="text-xs text-white">{reaction.nickname || 'Anonymous'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Module Content Area - This is where modules will be displayed */}
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-3">Training Modules</h3>
              <div className="space-y-2">
                {modules.map((module) => (
                  <div
                    key={module.id}
                    className={`p-3 rounded-lg border transition-all ${
                      module.is_unlocked
                        ? 'bg-green-500/10 border-green-500/30'
                        : 'bg-white/5 border-white/10 opacity-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{module.icon || '📚'}</div>
                        <div>
                          <div className="text-white font-medium">{module.title}</div>
                          <div className="text-xs text-gray-400">{module.description}</div>
                        </div>
                      </div>
                      {module.is_unlocked ? (
                        <div className="flex items-center gap-1 text-green-400 text-sm">
                          <CheckCircle size={16} />
                          <span>Unlocked</span>
                        </div>
                      ) : (
                        <div className="text-gray-500 text-sm">Locked</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Admin Control Sidebar */}
        <div className="w-80 bg-black/40 backdrop-blur-lg border-l border-white/10 p-4 overflow-y-auto">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Settings size={20} />
            Admin Controls
          </h3>

          {/* Module Controls */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-400 mb-3">Module Access</h4>
            <div className="space-y-2">
              {modules.map((module) => (
                <div
                  key={module.id}
                  className="bg-white/5 rounded-lg p-3 border border-white/10"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-white font-medium text-sm">{module.title}</div>
                    {module.is_unlocked ? (
                      <div className="flex items-center gap-1 text-xs text-green-400">
                        <CheckCircle size={14} />
                        Unlocked
                      </div>
                    ) : (
                      <button
                        onClick={() => handleUnlockModule(module.id)}
                        className="px-2 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded text-xs flex items-center gap-1 transition-all"
                      >
                        <Unlock size={12} />
                        Unlock
                      </button>
                    )}
                  </div>
                  <div className="text-xs text-gray-400">
                    Order: {module.order_index}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Participants List */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-400 mb-3">Active Participants ({participants.filter(p => p.is_online).length})</h4>
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
                      <div className="text-white font-medium truncate text-sm">
                        {participant.nickname || 'Anonymous'}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-green-400">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        Online
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {participants.filter(p => p.is_online).length === 0 && (
                <div className="text-center text-gray-500 py-4 text-sm">
                  No participants online
                </div>
              )}
            </div>
          </div>

          {/* Session Stats */}
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
              <div className="flex justify-between">
                <span className="text-gray-400">Mood Updates:</span>
                <span className="text-white font-medium">{stats?.totalMoodUpdates || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full mx-4">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Join the Session
              </h3>
              <p className="text-gray-600 mb-6">
                Scan this QR code with your mobile device
              </p>
              
              {qrCodeUrl && (
                <div className="bg-white p-4 rounded-xl inline-block mb-4 shadow-lg">
                  <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64" />
                </div>
              )}
              
              <div className="bg-gray-100 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-600 mb-1">Or visit:</p>
                <p className="text-lg font-mono font-bold text-gray-900 break-all">
                  {accessUrl}
                </p>
              </div>
              
              {/* Tunnel URL Configuration */}
              <div className="bg-blue-50 rounded-lg p-4 mb-4 text-left">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Tunnel URL (for mobile access):
                  </label>
                  <button
                    onClick={fetchNgrokUrl}
                    disabled={detectingNgrok}
                    className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {detectingNgrok ? '🔄 Detecting...' : '🔄 Auto-Detect'}
                  </button>
                </div>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tunnelUrl}
                    onChange={(e) => updateTunnelUrl(e.target.value)}
                    placeholder="Auto-detected or enter manually"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                  />
                  <button
                    onClick={() => window.open('https://ngrok.com/download', '_blank')}
                    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-sm font-medium transition-all whitespace-nowrap"
                  >
                    Get Ngrok
                  </button>
                </div>
                {tunnelUrl ? (
                  <div className="bg-green-50 border border-green-200 rounded p-2 mb-2">
                    <p className="text-xs text-green-700 font-medium">✅ Tunnel active! QR code updated.</p>
                    <p className="text-xs text-green-600 mt-1 font-mono break-all">{tunnelUrl}</p>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mb-2">
                    <p className="text-xs text-yellow-700 font-medium">⚠️ Using localhost</p>
                    <p className="text-xs text-yellow-600 mt-1">Click "Auto-Detect" if ngrok is running, or paste URL manually</p>
                  </div>
                )}
                <details className="text-xs text-gray-500 mt-2">
                  <summary className="cursor-pointer hover:text-gray-700">Troubleshooting</summary>
                  <div className="mt-2 space-y-1 pl-2">
                    <p>• Make sure ngrok is running (check for ngrok window)</p>
                    <p>• Ngrok API should be at http://127.0.0.1:4040</p>
                    <p>• Check browser console (F12) for error messages</p>
                    <p>• If auto-detect fails, copy URL from ngrok window manually</p>
                  </div>
                </details>
              </div>

              <button
                onClick={() => setShowQR(false)}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-purple-600 transition-all w-full"
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
