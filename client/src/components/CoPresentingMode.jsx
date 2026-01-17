import { useState, useEffect } from 'react';
import { UserPlus, UserMinus, Crown, Hand, Check, X } from 'lucide-react';

/**
 * CoPresentingMode Component
 * Allow multiple presenters to control the session
 */
function CoPresentingMode({ socket, sessionId, currentUser, participants = [] }) {
  const [coPresenters, setCoPresenters] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [isPresenter, setIsPresenter] = useState(false);

  useEffect(() => {
    if (socket) {
      socket.on('copresent:updated', handleCoPresentersUpdated);
      socket.on('copresent:request', handlePresentRequest);
      socket.on('copresent:granted', handleRequestGranted);
      socket.on('copresent:revoked', handleRequestRevoked);
    }

    return () => {
      if (socket) {
        socket.off('copresent:updated', handleCoPresentersUpdated);
        socket.off('copresent:request', handlePresentRequest);
        socket.off('copresent:granted', handleRequestGranted);
        socket.off('copresent:revoked', handleRequestRevoked);
      }
    };
  }, [socket]);

  const handleCoPresentersUpdated = (data) => {
    setCoPresenters(data.coPresenters);
    setIsPresenter(data.coPresenters.some(p => p.id === currentUser?.id));
  };

  const handlePresentRequest = (data) => {
    setPendingRequests(prev => [...prev, data.participant]);
  };

  const handleRequestGranted = (data) => {
    if (data.participantId === currentUser?.id) {
      setIsPresenter(true);
    }
  };

  const handleRequestRevoked = (data) => {
    if (data.participantId === currentUser?.id) {
      setIsPresenter(false);
    }
  };

  const requestPresenterAccess = () => {
    if (socket && sessionId && currentUser) {
      socket.emit('copresent:request', {
        sessionId,
        participant: currentUser
      });
    }
  };

  const grantPresenterAccess = (participantId) => {
    if (socket && sessionId) {
      socket.emit('copresent:grant', {
        sessionId,
        participantId
      });
      
      setPendingRequests(prev => prev.filter(p => p.id !== participantId));
    }
  };

  const revokePresenterAccess = (participantId) => {
    if (socket && sessionId) {
      socket.emit('copresent:revoke', {
        sessionId,
        participantId
      });
    }
  };

  const denyRequest = (participantId) => {
    setPendingRequests(prev => prev.filter(p => p.id !== participantId));
  };

  const addCoPresenter = (participant) => {
    if (socket && sessionId) {
      socket.emit('copresent:add', {
        sessionId,
        participant
      });
    }
  };

  const removeCoPresenter = (participantId) => {
    if (socket && sessionId) {
      socket.emit('copresent:remove', {
        sessionId,
        participantId
      });
    }
  };

  const availableParticipants = participants.filter(
    p => !coPresenters.some(cp => cp.id === p.id) && p.id !== currentUser?.id
  );

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-6 border border-white/10">
      <div className="flex items-center gap-3 mb-6">
        <Crown className="text-yellow-400" size={28} />
        <div>
          <h2 className="text-2xl font-bold text-white">Co-Präsentation</h2>
          <p className="text-sm text-gray-400">
            Mehrere Präsentatoren gleichzeitig
          </p>
        </div>
      </div>

      {/* Current Status */}
      <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 mb-1">Ihr Status:</p>
            <p className={`font-semibold ${isPresenter ? 'text-green-400' : 'text-gray-400'}`}>
              {isPresenter ? '✓ Präsentator' : 'Teilnehmer'}
            </p>
          </div>
          
          {!isPresenter && (
            <button
              onClick={requestPresenterAccess}
              className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg font-semibold text-white hover:from-yellow-600 hover:to-orange-600 transition-all flex items-center gap-2"
            >
              <Hand size={18} />
              Zugriff anfragen
            </button>
          )}
        </div>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-bold text-white mb-3">Anfragen</h3>
          <div className="space-y-2">
            {pendingRequests.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center justify-between p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Hand className="text-yellow-400" size={20} />
                  <div>
                    <p className="text-white font-semibold">{participant.name}</p>
                    <p className="text-xs text-gray-400">möchte präsentieren</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => grantPresenterAccess(participant.id)}
                    className="p-2 bg-green-500 hover:bg-green-600 rounded-lg transition-all"
                    title="Erlauben"
                  >
                    <Check size={18} className="text-white" />
                  </button>
                  <button
                    onClick={() => denyRequest(participant.id)}
                    className="p-2 bg-red-500 hover:bg-red-600 rounded-lg transition-all"
                    title="Ablehnen"
                  >
                    <X size={18} className="text-white" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Co-Presenters */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white mb-3">
          Aktive Präsentatoren ({coPresenters.length})
        </h3>
        
        {coPresenters.length > 0 ? (
          <div className="space-y-2">
            {coPresenters.map((presenter) => (
              <div
                key={presenter.id}
                className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/30 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Crown className="text-yellow-400" size={20} />
                  <div>
                    <p className="text-white font-semibold">{presenter.name}</p>
                    <p className="text-xs text-green-400">Kann präsentieren</p>
                  </div>
                </div>
                
                <button
                  onClick={() => removeCoPresenter(presenter.id)}
                  className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-all"
                  title="Entfernen"
                >
                  <UserMinus size={18} className="text-red-400" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-white/5 border border-white/10 rounded-lg">
            <Crown className="mx-auto mb-3 text-gray-500" size={48} />
            <p className="text-gray-400 text-sm">Keine Co-Präsentatoren</p>
          </div>
        )}
      </div>

      {/* Add Co-Presenter */}
      {availableParticipants.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-white mb-3">Teilnehmer hinzufügen</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {availableParticipants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg hover:border-purple-500/50 transition-all"
              >
                <div>
                  <p className="text-white font-semibold">{participant.name}</p>
                  <p className="text-xs text-gray-400">{participant.role || 'Teilnehmer'}</p>
                </div>
                
                <button
                  onClick={() => addCoPresenter(participant)}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg font-semibold text-white transition-all flex items-center gap-2"
                >
                  <UserPlus size={16} />
                  Hinzufügen
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Permissions Info */}
      <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-300 mb-2">Präsentatoren-Rechte:</h4>
        <ul className="text-xs text-blue-300 space-y-1">
          <li>✓ Submodule wechseln</li>
          <li>✓ Whiteboard bearbeiten</li>
          <li>✓ Bildschirm teilen</li>
          <li>✓ Umfragen starten</li>
          <li>✓ Quiz verwalten</li>
        </ul>
      </div>

      {/* Info */}
      <div className="mt-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
        <p className="text-sm text-yellow-300">
          <strong>⚠️ Hinweis:</strong> Co-Präsentatoren haben die gleichen Rechte wie der
          Hauptpräsentator. Fügen Sie nur vertrauenswürdige Personen hinzu.
        </p>
      </div>
    </div>
  );
}

export default CoPresentingMode;
