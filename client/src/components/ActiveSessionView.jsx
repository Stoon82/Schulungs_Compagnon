import { useState, useEffect } from 'react';
import { Users, Crown, Shield, UserCheck, X, Copy, Check, LogOut, User, Trophy, Bell, Download } from 'lucide-react';
import ModuleViewer from './ModuleViewer';
import AdminNavigationBar from './AdminNavigationBar';
import QRCodeButton from './QRCodeButton';
import PersonalDashboard from './PersonalDashboard';
import Leaderboard from './Leaderboard';
import StudyReminders from './StudyReminders';
import OfflinePackageExport from './OfflinePackageExport';
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

  const isAdmin = !!adminUser;

  useEffect(() => {
    loadSessionData();
    loadParticipants();

    const interval = setInterval(loadParticipants, 5000);
    return () => clearInterval(interval);
  }, [session.id]);

  useEffect(() => {
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

    return () => {
      socket.off('participant:joined');
      socket.off('participant:left');
      socket.off('session:navigate');
    };
  }, [socket, session.id]);

  const loadSessionData = async () => {
    try {
      console.log('Loading session data, module_id:', session.module_id);
      
      if (!session.module_id) {
        console.error('No module_id in session:', session);
        return;
      }
      
      // Use public endpoints if not admin (participants don't need authentication)
      let data, subData;
      
      if (isAdmin) {
        // Admin: use authenticated endpoints
        data = await api.getCreatorModule(session.module_id);
        console.log('Module data response (admin):', data);
        
        if (data.success) {
          setModule(data.data);
          subData = await api.getModuleSubmodules(session.module_id);
        }
      } else {
        // Participant: use public endpoints with session code
        data = await api.getPublicModule(session.module_id, session.session_code);
        console.log('Module data response (public):', data);
        
        if (data.success) {
          setModule(data.data);
          subData = await api.getPublicSubmodules(session.module_id, session.session_code);
        }
      }
      
      console.log('Submodules response:', subData);
      
      if (subData && subData.success) {
        setSubmodules(subData.data);
      }
    } catch (error) {
      console.error('Error loading session data:', error);
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
                {module?.title || 'Lädt...'}
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
        {module && submodules.length > 0 ? (
          <ModuleViewer
            moduleId={session.module_id}
            socket={socket}
            initialIndex={currentSubmoduleIndex}
            onExit={isAdmin ? handleEndSession : null}
          />
        ) : (
          <div className="flex items-center justify-center h-full relative z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-white text-lg">Modul wird geladen...</p>
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
    </div>
  );
}

export default ActiveSessionView;
