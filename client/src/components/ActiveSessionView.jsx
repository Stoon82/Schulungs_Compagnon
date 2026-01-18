import { useState, useEffect } from 'react';
import { Users, Crown, Shield, UserCheck, X, Copy, Check, LogOut, User, Trophy, Bell, Download, Pause, AlertTriangle } from 'lucide-react';
import ModuleViewer from './ModuleViewer';
import ClassSessionView from './ClassSessionView';
import AdminNavigationBar from './AdminNavigationBar';
import QRCodeButton from './QRCodeButton';
import PersonalDashboard from './PersonalDashboard';
import Leaderboard from './Leaderboard';
import StudyReminders from './StudyReminders';
import OfflinePackageExport from './OfflinePackageExport';
import FloatingMoodBar from './FloatingMoodBar';
import api from '../services/api';

function ActiveSessionView({ session, adminUser, participantData, socket, onEndSession }) {
  const [participants, setParticipants] = useState([]);
  const [currentSubmoduleIndex, setCurrentSubmoduleIndex] = useState(session.current_submodule_index || 0);
  const [submodules, setSubmodules] = useState([]);
  const [module, setModule] = useState(null);
  const [showParticipants, setShowParticipants] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [showPersonalDashboard, setShowPersonalDashboard] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showStudyReminders, setShowStudyReminders] = useState(false);
  const [showOfflineExport, setShowOfflineExport] = useState(false);
  
  // Live feedback state
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [liveMoodReactions, setLiveMoodReactions] = useState([]);

  const isAdmin = !!adminUser;

  useEffect(() => {
    console.log('[ActiveSessionView] Component mounted');
    console.log('[ActiveSessionView] adminUser:', adminUser);
    console.log('[ActiveSessionView] isAdmin:', isAdmin);
    console.log('[ActiveSessionView] session:', session);
    console.log('[ActiveSessionView] socket prop:', socket ? 'available' : 'null/undefined');
    
    loadSessionData();
    loadParticipants();

    const interval = setInterval(loadParticipants, 5000);
    return () => clearInterval(interval);
  }, [session.id]);

  useEffect(() => {
    console.log('[ActiveSessionView] Socket useEffect running, socket:', socket ? 'connected' : 'null');
    if (!socket) return;

    socket.on('participant:joined', () => {
      loadParticipants();
    });

    socket.on('participant:left', () => {
      loadParticipants();
    });

    socket.on('session:navigate', (data) => {
      if (data.sessionId === session.id) {
        setCurrentSubmoduleIndex(data.submoduleIndex);
      }
    });

    // Live mood feedback listeners (for admin display)
    console.log('[ActiveSessionView] Setting up mood:update listener, isAdmin:', isAdmin);
    socket.on('mood:update', (data) => {
      console.log('[ActiveSessionView] 😊 Mood update received:', data);
      const moodEmoji = {
        confused: '😕',
        thinking: '🤔',
        aha: '💡',
        wow: '🤩',
        pause_request: '⏸️',
        overwhelmed: '🚨'
      };
      setLiveMoodReactions(prev => [{
        ...data,
        emoji: moodEmoji[data.mood] || '❓',
        timestamp: Date.now(),
        id: Math.random()
      }, ...prev].slice(0, 10));
    });

    socket.on('feedback:pause', (data) => {
      console.log('[ActiveSessionView] 🔔 Pause request received:', data);
      setRecentAlerts(prev => [{
        type: 'pause',
        participant: data.nickname || 'Teilnehmer',
        timestamp: Date.now(),
        id: Math.random()
      }, ...prev].slice(0, 5));
    });

    socket.on('feedback:overwhelmed', (data) => {
      console.log('[ActiveSessionView] 🔔 Overwhelmed alert received:', data);
      setRecentAlerts(prev => [{
        type: 'overwhelmed',
        participant: data.nickname || 'Teilnehmer',
        timestamp: Date.now(),
        id: Math.random()
      }, ...prev].slice(0, 5));
    });

    return () => {
      socket.off('participant:joined');
      socket.off('participant:left');
      socket.off('session:navigate');
      socket.off('mood:update');
      socket.off('feedback:pause');
      socket.off('feedback:overwhelmed');
    };
  }, [socket, session.id]);

  // Auto-clear old mood reactions after 10 seconds
  useEffect(() => {
    if (liveMoodReactions.length === 0) return;
    
    const interval = setInterval(() => {
      const now = Date.now();
      setLiveMoodReactions(prev => prev.filter(r => now - r.timestamp < 10000));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [liveMoodReactions.length]);

  // Auto-clear old alerts after 15 seconds
  useEffect(() => {
    if (recentAlerts.length === 0) return;
    
    const interval = setInterval(() => {
      const now = Date.now();
      setRecentAlerts(prev => prev.filter(a => now - a.timestamp < 15000));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [recentAlerts.length]);

  const loadSessionData = async () => {
    try {
      console.log('[ActiveSessionView] Loading session data, module_id:', session.module_id);
      console.log('[ActiveSessionView] isAdmin:', isAdmin);
      console.log('[ActiveSessionView] session_code:', session.session_code);
      console.log('[ActiveSessionView] session.modules:', session.modules);
      
      // For multi-module class sessions, we don't need a specific module_id
      // The ClassSessionView component will handle showing all modules
      if (!session.module_id) {
        if (session.modules && session.modules.length > 0) {
          console.log('[ActiveSessionView] Multi-module class session - no single module_id needed');
          return; // ClassSessionView will handle this
        }
        console.warn('[ActiveSessionView] No module_id and no modules in session:', session);
        return;
      }
      
      let data, subData;
      let usedPublicEndpoint = false;
      
      // Always use public endpoints for non-admin users
      if (!isAdmin) {
        console.log('[ActiveSessionView] Using PUBLIC endpoints (not admin)');
        data = await api.getPublicModule(session.module_id, session.session_code);
        console.log('[ActiveSessionView] Module data response (public):', data);
        
        if (data.success) {
          setModule(data.data);
          subData = await api.getPublicSubmodules(session.module_id, session.session_code);
        }
        usedPublicEndpoint = true;
      } else {
        // Admin: try authenticated endpoints, fallback to public if 401
        console.log('[ActiveSessionView] Using ADMIN endpoints');
        try {
          data = await api.getCreatorModule(session.module_id);
          console.log('[ActiveSessionView] Module data response (admin):', data);
          
          if (data.success) {
            setModule(data.data);
            subData = await api.getModuleSubmodules(session.module_id);
          } else if (data.error && data.error.includes('401')) {
            throw new Error('Authentication failed');
          }
        } catch (adminError) {
          console.warn('[ActiveSessionView] Admin endpoints failed, falling back to public:', adminError);
          data = await api.getPublicModule(session.module_id, session.session_code);
          console.log('[ActiveSessionView] Module data response (public fallback):', data);
          
          if (data.success) {
            setModule(data.data);
            subData = await api.getPublicSubmodules(session.module_id, session.session_code);
          }
          usedPublicEndpoint = true;
        }
      }
      
      console.log('[ActiveSessionView] Submodules response:', subData);
      console.log('[ActiveSessionView] Used public endpoint:', usedPublicEndpoint);
      
      if (subData && subData.success) {
        setSubmodules(subData.data);
      }
    } catch (error) {
      console.error('[ActiveSessionView] Error loading session data:', error);
    }
  };

  const loadParticipants = async () => {
    try {
      console.log('Loading participants for session:', session.id);
      const response = await fetch(`/api/session-management/sessions/${session.id}/participants`);
      
      if (!response.ok) {
        console.error('Participants fetch failed:', response.status, response.statusText);
        return;
      }
      
      const data = await response.json();
      console.log('Participants data:', data);
      
      if (data.success) {
        setParticipants(data.data.filter(p => p.is_online));
      }
    } catch (error) {
      console.error('Error loading participants:', error);
    }
  };

  const handleNavigate = async (index) => {
    setCurrentSubmoduleIndex(index);
    
    // Update session navigation
    try {
      await fetch(`/api/session-management/sessions/${session.id}/navigate`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submoduleId: submodules[index]?.id,
          submoduleIndex: index
        })
      });

      // Emit Socket.io event
      if (socket) {
        socket.emit('session:navigate', {
          sessionId: session.id,
          submoduleIndex: index,
          submoduleId: submodules[index]?.id
        });
      }
    } catch (error) {
      console.error('Error updating navigation:', error);
    }
  };

  const handleRoleChange = async (participantId, newRole) => {
    try {
      await fetch(`/api/session-management/sessions/${session.id}/participants/${participantId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      
      loadParticipants();
    } catch (error) {
      console.error('Error changing role:', error);
    }
  };

  const handleEndSession = async () => {
    if (!confirm('Sitzung wirklich beenden?')) return;

    try {
      await fetch(`/api/session-management/sessions/${session.id}/end`, {
        method: 'POST'
      });

      if (socket) {
        socket.emit('session:ended', { sessionId: session.id });
      }

      onEndSession();
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  const copySessionCode = () => {
    navigator.clipboard.writeText(session.session_code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'co-admin':
        return <Crown size={16} className="text-yellow-400" />;
      case 'moderator':
      case 'co-moderator':
        return <Shield size={16} className="text-blue-400" />;
      default:
        return <UserCheck size={16} className="text-gray-400" />;
    }
  };

  const getRoleLabel = (role) => {
    const labels = {
      'participant': 'Teilnehmer',
      'moderator': 'Moderator',
      'co-moderator': 'Co-Moderator',
      'co-admin': 'Co-Admin'
    };
    return labels[role] || role;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      {/* Session Header */}
      <div className="fixed top-0 left-0 right-0 bg-black/30 backdrop-blur-lg border-b border-white/10 px-6 py-4 z-[100]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-bold text-white">{session.class_name}</h1>
              <p className="text-sm text-gray-400">
                {module?.title || (session.modules?.length > 0 ? `${session.modules.length} Module verfügbar` : 'Lädt...')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* QR Code Button - visible to all */}
            <QRCodeButton sessionCode={session.session_code} isAdmin={isAdmin} />

            {/* Session Code */}
            <button
              onClick={copySessionCode}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
            >
              <span className="text-sm text-gray-400">Code:</span>
              <span className="text-lg font-bold text-white tracking-wider">{session.session_code}</span>
              {codeCopied ? (
                <Check size={16} className="text-green-400" />
              ) : (
                <Copy size={16} className="text-gray-400" />
              )}
            </button>

            {/* Client-only buttons */}
            {!isAdmin && (
              <>
                <button
                  onClick={() => setShowPersonalDashboard(true)}
                  className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all flex items-center gap-2"
                  title="Personal Dashboard"
                >
                  <User size={18} />
                </button>
                
                <button
                  onClick={() => setShowLeaderboard(true)}
                  className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg transition-all flex items-center gap-2"
                  title="Leaderboard"
                >
                  <Trophy size={18} />
                </button>
                
                <button
                  onClick={() => setShowStudyReminders(true)}
                  className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-all flex items-center gap-2"
                  title="Study Reminders"
                >
                  <Bell size={18} />
                </button>
                
                <button
                  onClick={() => setShowOfflineExport(true)}
                  className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-all flex items-center gap-2"
                  title="Offline Download"
                >
                  <Download size={18} />
                </button>
              </>
            )}

            {/* Participants Button */}
            <button
              onClick={() => setShowParticipants(!showParticipants)}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
            >
              <Users size={20} className="text-white" />
              <span className="text-white font-semibold">{participants.length}</span>
            </button>

            {/* Logout/End Session Button */}
            {isAdmin ? (
              <button
                onClick={handleEndSession}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all flex items-center gap-2"
              >
                <LogOut size={18} />
                <span>Beenden</span>
              </button>
            ) : (
              <button
                onClick={handleEndSession}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all flex items-center gap-2"
              >
                <LogOut size={18} />
                <span>Verlassen</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Spacer for fixed header */}
      <div className="h-[76px]"></div>

      {/* Admin Navigation Bar */}
      {isAdmin && module && submodules.length > 0 && (
        <AdminNavigationBar
          module={module}
          submodules={submodules}
          currentIndex={currentSubmoduleIndex}
          onNavigate={handleNavigate}
          socket={socket}
          presentationMode={session.presentation_mode}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 relative">
        {/* Multi-module class session - show ClassSessionView */}
        {session.modules && session.modules.length > 0 ? (
          <ClassSessionView
            session={session}
            isAdmin={isAdmin}
            socket={socket}
            onExit={onEndSession}
            participantData={participantData}
          />
        ) : session.module_id && module && submodules.length > 0 ? (
          /* Single module session - show ModuleViewer directly (legacy) */
          <ModuleViewer
            moduleId={session.module_id}
            socket={socket}
            initialIndex={currentSubmoduleIndex}
            onExit={onEndSession}
            sessionCode={session.session_code}
            isAdmin={isAdmin}
          />
        ) : session.module_id ? (
          /* Single module session but still loading */
          <div className="flex items-center justify-center h-full relative z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-white text-lg">Modul wird geladen...</p>
            </div>
          </div>
        ) : (
          /* No module_id and no modules - show error state */
          <div className="flex items-center justify-center h-full relative z-10">
            <div className="text-center p-8 bg-white/5 rounded-xl border border-white/10">
              <p className="text-white text-lg mb-2">Keine Module in dieser Sitzung</p>
              <p className="text-gray-400 text-sm">Diese Sitzung hat keine verfügbaren Module.</p>
            </div>
          </div>
        )}

        {/* Personal Dashboard Modal */}
        {showPersonalDashboard && (
          <div className="absolute inset-0 z-50">
            <PersonalDashboard 
              participantId={participantData?.id}
              onClose={() => setShowPersonalDashboard(false)} 
            />
          </div>
        )}

        {/* Leaderboard Modal */}
        {showLeaderboard && (
          <div className="absolute inset-0 z-50">
            <Leaderboard onClose={() => setShowLeaderboard(false)} />
          </div>
        )}

        {/* Study Reminders Modal */}
        {showStudyReminders && (
          <div className="absolute inset-0 z-50">
            <StudyReminders 
              participantId={participantData?.id}
              onClose={() => setShowStudyReminders(false)} 
            />
          </div>
        )}

        {/* Offline Package Export Modal */}
        {showOfflineExport && module && (
          <div className="absolute inset-0 z-50">
            <OfflinePackageExport 
              moduleId={module.id}
              onClose={() => setShowOfflineExport(false)} 
            />
          </div>
        )}

        {/* Participants Panel */}
        {showParticipants && (
          <div className="absolute top-0 right-0 h-full w-80 bg-black/50 backdrop-blur-lg border-l border-white/10 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">
                  Teilnehmer ({participants.length})
                </h3>
                <button
                  onClick={() => setShowParticipants(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-2">
                {participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="p-3 bg-white/5 rounded-lg border border-white/10"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getRoleIcon(participant.role)}
                        <span className="text-white font-medium">
                          {participant.participant_name}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {getRoleLabel(participant.role)}
                      </span>
                    </div>

                    {/* Role Management (Admin only) */}
                    {isAdmin && participant.role !== 'co-admin' && (
                      <select
                        value={participant.role}
                        onChange={(e) => handleRoleChange(participant.id, e.target.value)}
                        className="w-full px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                      >
                        <option value="participant">Teilnehmer</option>
                        <option value="moderator">Moderator</option>
                        <option value="co-moderator">Co-Moderator</option>
                        <option value="co-admin">Co-Admin</option>
                      </select>
                    )}
                  </div>
                ))}

                {participants.length === 0 && (
                  <p className="text-center text-gray-400 py-8">
                    Noch keine Teilnehmer
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Live Reactions Display (Admin view - shows on beamer) */}
      {isAdmin && (
        <div className="fixed bottom-6 left-6 z-40 space-y-2 max-w-sm">
          {/* Urgent Alerts */}
          {recentAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`animate-pulse p-4 rounded-xl border backdrop-blur-lg shadow-2xl ${
                alert.type === 'pause'
                  ? 'bg-yellow-500/20 border-yellow-500/50'
                  : 'bg-red-500/20 border-red-500/50'
              }`}
              style={{ animation: 'slideIn 0.3s ease-out' }}
            >
              <div className="flex items-center gap-3">
                {alert.type === 'pause' ? (
                  <Pause size={24} className="text-yellow-400" />
                ) : (
                  <AlertTriangle size={24} className="text-red-400" />
                )}
                <div>
                  <p className={`font-semibold ${alert.type === 'pause' ? 'text-yellow-300' : 'text-red-300'}`}>
                    {alert.type === 'pause' ? 'Pause erbeten' : 'Hilfe benötigt'}
                  </p>
                  <p className="text-sm text-gray-300">{alert.participant}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Live Mood Reactions (filter out pause/overwhelmed as they have their own alerts) */}
          <div className="flex flex-wrap gap-2">
            {liveMoodReactions.filter(r => !['pause_request', 'overwhelmed'].includes(r.mood)).slice(0, 8).map((reaction) => (
              <div
                key={reaction.id}
                className="bg-black/40 backdrop-blur-lg rounded-full px-3 py-2 border border-white/20 animate-bounce"
                style={{ 
                  animation: 'popIn 0.5s ease-out',
                  animationDelay: `${Math.random() * 0.2}s`
                }}
              >
                <span className="text-2xl">{reaction.emoji}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Floating Mood Bar (Client view - for sending feedback) */}
      {!isAdmin && participantData && (
        <FloatingMoodBar 
          currentModuleId={module?.id || null}
          onMoodSelect={async (mood, moduleId) => {
            try {
              console.log('[ActiveSessionView] Sending mood with participantId:', participantData.id, 'name:', participantData.participant_name);
              // Use session-specific mood endpoint for session participants
              const response = await fetch(`/api/public-session/session/${session.session_code}/mood`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  participantId: participantData.id,
                  mood,
                  moduleId
                })
              });
              const result = await response.json();
              if (result.success) {
                console.log('[ActiveSessionView] Mood sent via session API:', mood);
              } else {
                console.error('[ActiveSessionView] Mood API error:', result.error);
              }
            } catch (error) {
              console.error('[ActiveSessionView] Failed to send mood:', error);
            }
          }}
        />
      )}

      {/* CSS for animations */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes popIn {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default ActiveSessionView;
