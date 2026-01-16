import { useState, useEffect } from 'react';
import { Users, Circle, Eye, UserX } from 'lucide-react';
import api from '../services/api';

function AdminParticipants() {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedParticipant, setSelectedParticipant] = useState(null);

  useEffect(() => {
    loadParticipants();
    const interval = setInterval(loadParticipants, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadParticipants = async () => {
    try {
      const result = await api.getAdminParticipants();
      if (result.success) {
        setParticipants(result.data);
      }
    } catch (error) {
      console.error('Failed to load participants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKick = async (participantId) => {
    if (!confirm('Are you sure you want to kick this participant?')) return;

    try {
      await api.adminKickParticipant(participantId);
      loadParticipants();
    } catch (error) {
      console.error('Failed to kick participant:', error);
    }
  };

  if (loading) {
    return <div className="text-white text-center py-12">Loading participants...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Participants</h2>
          <p className="text-gray-400">Manage and monitor all participants</p>
        </div>
        <div className="text-sm text-gray-400">
          Total: {participants.length}
        </div>
      </div>

      <div className="grid gap-4">
        {participants.map((participant) => (
          <div
            key={participant.id}
            className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                  style={{ 
                    background: `linear-gradient(135deg, hsl(${parseInt(participant.avatar_seed, 16) % 360}, 70%, 50%), hsl(${(parseInt(participant.avatar_seed, 16) + 60) % 360}, 70%, 60%))`
                  }}
                >
                  {participant.nickname ? participant.nickname.charAt(0).toUpperCase() : '?'}
                </div>
                
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-white">
                      {participant.nickname || 'Anonymous'}
                    </h3>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                      participant.is_online 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      <Circle size={8} fill="currentColor" />
                      {participant.is_online ? 'Online' : 'Offline'}
                    </div>
                  </div>
                  <p className="text-sm text-gray-400">
                    ID: {participant.id} • Joined: {new Date(participant.created_at).toLocaleDateString()}
                  </p>
                  {participant.last_seen && (
                    <p className="text-xs text-gray-500">
                      Last seen: {new Date(participant.last_seen).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedParticipant(participant)}
                  className="px-3 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-all flex items-center gap-2"
                >
                  <Eye size={16} />
                  <span className="text-sm">Details</span>
                </button>
                <button
                  onClick={() => handleKick(participant.id)}
                  className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all flex items-center gap-2"
                >
                  <UserX size={16} />
                  <span className="text-sm">Kick</span>
                </button>
              </div>
            </div>
          </div>
        ))}

        {participants.length === 0 && (
          <div className="text-center text-gray-400 py-12">
            <Users size={48} className="mx-auto mb-4 opacity-50" />
            <p>No participants yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminParticipants;
