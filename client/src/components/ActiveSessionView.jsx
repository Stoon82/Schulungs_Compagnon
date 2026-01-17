import { useState, useEffect } from 'react';
import { Users, Crown, Shield, UserCheck, X, Copy, Check, LogOut } from 'lucide-react';
import ModuleViewer from './ModuleViewer';
import AdminNavigationBar from './AdminNavigationBar';

function ActiveSessionView({ session, adminUser, participantData, socket, onEndSession }) {
  const [participants, setParticipants] = useState([]);
  const [currentSubmoduleIndex, setCurrentSubmoduleIndex] = useState(session.current_submodule_index || 0);
  const [submodules, setSubmodules] = useState([]);
  const [module, setModule] = useState(null);
  const [showParticipants, setShowParticipants] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

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
      // Load module data
      const response = await fetch(`/api/module-creator/modules/${session.module_id}`);
      const data = await response.json();
      
      if (data.success) {
        setModule(data.data);
        
        // Load submodules
        const subResponse = await fetch(`/api/module-creator/modules/${session.module_id}/submodules`);
        const subData = await subResponse.json();
        
        if (subData.success) {
          setSubmodules(subData.data);
        }
      }
    } catch (error) {
      console.error('Error loading session data:', error);
    }
  };

  const loadParticipants = async () => {
    try {
      const response = await fetch(`/api/session-management/sessions/${session.id}/participants`);
      const data = await response.json();
      
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
      <div className="bg-black/30 backdrop-blur-lg border-b border-white/10 px-6 py-4">
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

            {/* Participants Button */}
            <button
              onClick={() => setShowParticipants(!showParticipants)}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
            >
              <Users size={20} className="text-white" />
              <span className="text-white font-semibold">{participants.length}</span>
            </button>

            {/* End Session (Admin only) */}
            {isAdmin && (
              <button
                onClick={handleEndSession}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all flex items-center gap-2"
              >
                <LogOut size={18} />
                <span>Beenden</span>
              </button>
            )}
          </div>
        </div>
      </div>

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
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-white text-lg">Modul wird geladen...</p>
            </div>
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
