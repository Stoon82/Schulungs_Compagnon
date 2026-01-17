import { useState, useEffect } from 'react';
import { Users, Plus, Shuffle, Clock, Play, X, UserPlus } from 'lucide-react';

/**
 * BreakoutRooms Component
 * Create and manage breakout rooms for group work
 */
function BreakoutRooms({ socket, sessionId, participants = [] }) {
  const [rooms, setRooms] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [roomCount, setRoomCount] = useState(3);
  const [duration, setDuration] = useState(10);
  const [assignmentMode, setAssignmentMode] = useState('auto');
  const [activeRooms, setActiveRooms] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    if (socket) {
      socket.on('breakout:created', handleRoomsCreated);
      socket.on('breakout:started', handleRoomsStarted);
      socket.on('breakout:ended', handleRoomsEnded);
      socket.on('breakout:timer', handleTimerUpdate);
    }

    return () => {
      if (socket) {
        socket.off('breakout:created', handleRoomsCreated);
        socket.off('breakout:started', handleRoomsStarted);
        socket.off('breakout:ended', handleRoomsEnded);
        socket.off('breakout:timer', handleTimerUpdate);
      }
    };
  }, [socket]);

  const handleRoomsCreated = (data) => {
    setRooms(data.rooms);
  };

  const handleRoomsStarted = (data) => {
    setActiveRooms(true);
    setTimeRemaining(data.duration * 60);
  };

  const handleRoomsEnded = () => {
    setActiveRooms(false);
    setTimeRemaining(0);
  };

  const handleTimerUpdate = (data) => {
    setTimeRemaining(data.timeRemaining);
  };

  const createRooms = () => {
    const newRooms = [];
    
    if (assignmentMode === 'auto') {
      // Automatically distribute participants
      const shuffled = [...participants].sort(() => Math.random() - 0.5);
      const perRoom = Math.ceil(shuffled.length / roomCount);
      
      for (let i = 0; i < roomCount; i++) {
        newRooms.push({
          id: `room-${i + 1}`,
          name: `Raum ${i + 1}`,
          participants: shuffled.slice(i * perRoom, (i + 1) * perRoom),
          topic: ''
        });
      }
    } else {
      // Create empty rooms for manual assignment
      for (let i = 0; i < roomCount; i++) {
        newRooms.push({
          id: `room-${i + 1}`,
          name: `Raum ${i + 1}`,
          participants: [],
          topic: ''
        });
      }
    }

    setRooms(newRooms);
    setIsCreating(false);

    if (socket && sessionId) {
      socket.emit('breakout:create', {
        sessionId,
        rooms: newRooms
      });
    }
  };

  const startRooms = () => {
    if (socket && sessionId) {
      socket.emit('breakout:start', {
        sessionId,
        duration
      });
    }
  };

  const endRooms = () => {
    if (socket && sessionId) {
      socket.emit('breakout:end', { sessionId });
    }
  };

  const moveParticipant = (participantId, fromRoomId, toRoomId) => {
    const updatedRooms = rooms.map(room => {
      if (room.id === fromRoomId) {
        return {
          ...room,
          participants: room.participants.filter(p => p.id !== participantId)
        };
      }
      if (room.id === toRoomId) {
        const participant = rooms
          .find(r => r.id === fromRoomId)
          ?.participants.find(p => p.id === participantId);
        return {
          ...room,
          participants: participant ? [...room.participants, participant] : room.participants
        };
      }
      return room;
    });

    setRooms(updatedRooms);

    if (socket && sessionId) {
      socket.emit('breakout:move', {
        sessionId,
        participantId,
        toRoomId
      });
    }
  };

  const updateRoomTopic = (roomId, topic) => {
    const updatedRooms = rooms.map(room =>
      room.id === roomId ? { ...room, topic } : room
    );
    setRooms(updatedRooms);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-6 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="text-purple-400" size={28} />
          <div>
            <h2 className="text-2xl font-bold text-white">Breakout Räume</h2>
            <p className="text-sm text-gray-400">
              Teilen Sie Teilnehmer in Gruppenräume auf
            </p>
          </div>
        </div>

        {activeRooms && (
          <div className="text-right">
            <div className="text-3xl font-bold text-purple-400">
              {formatTime(timeRemaining)}
            </div>
            <div className="text-xs text-gray-400">verbleibend</div>
          </div>
        )}
      </div>

      {/* Setup */}
      {!rooms.length && !isCreating && (
        <div className="text-center py-12">
          <Users className="mx-auto mb-4 text-gray-500" size={64} />
          <p className="text-gray-400 mb-6">Keine Breakout Räume erstellt</p>
          <button
            onClick={() => setIsCreating(true)}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold text-white hover:from-purple-600 hover:to-pink-600 transition-all flex items-center gap-2 mx-auto"
          >
            <Plus size={20} />
            Räume erstellen
          </button>
        </div>
      )}

      {/* Creation Form */}
      {isCreating && (
        <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Anzahl der Räume
            </label>
            <input
              type="number"
              min="2"
              max="10"
              value={roomCount}
              onChange={(e) => setRoomCount(parseInt(e.target.value))}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Dauer (Minuten)
            </label>
            <input
              type="number"
              min="1"
              max="60"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Zuweisung
            </label>
            <select
              value={assignmentMode}
              onChange={(e) => setAssignmentMode(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              <option value="auto">Automatisch verteilen</option>
              <option value="manual">Manuell zuweisen</option>
            </select>
          </div>

          <div className="flex gap-3">
            <button
              onClick={createRooms}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold text-white hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              Räume erstellen
            </button>
            <button
              onClick={() => setIsCreating(false)}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-semibold text-white transition-all"
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}

      {/* Rooms List */}
      {rooms.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="bg-white/5 border border-white/10 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-white">{room.name}</h3>
                  <span className="text-sm text-gray-400">
                    {room.participants.length} <Users size={16} className="inline" />
                  </span>
                </div>

                <input
                  type="text"
                  placeholder="Thema (optional)"
                  value={room.topic}
                  onChange={(e) => updateRoomTopic(room.id, e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm mb-3 focus:outline-none focus:border-purple-500"
                />

                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {room.participants.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between p-2 bg-white/5 rounded-lg"
                    >
                      <span className="text-sm text-white">{participant.name}</span>
                      {!activeRooms && (
                        <button
                          onClick={() => {
                            const otherRooms = rooms.filter(r => r.id !== room.id);
                            if (otherRooms.length > 0) {
                              moveParticipant(participant.id, room.id, otherRooms[0].id);
                            }
                          }}
                          className="text-xs text-purple-400 hover:text-purple-300"
                        >
                          Verschieben
                        </button>
                      )}
                    </div>
                  ))}
                  {room.participants.length === 0 && (
                    <p className="text-xs text-gray-500 text-center py-4">
                      Keine Teilnehmer
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="flex gap-3">
            {!activeRooms ? (
              <>
                <button
                  onClick={startRooms}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg font-semibold text-white hover:from-green-600 hover:to-emerald-600 transition-all flex items-center justify-center gap-2"
                >
                  <Play size={20} />
                  Räume starten
                </button>
                <button
                  onClick={() => setRooms([])}
                  className="px-6 py-3 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg font-semibold transition-all flex items-center gap-2"
                >
                  <X size={20} />
                  Verwerfen
                </button>
              </>
            ) : (
              <button
                onClick={endRooms}
                className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 rounded-lg font-semibold text-white transition-all"
              >
                Räume beenden
              </button>
            )}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <p className="text-sm text-blue-300">
          <strong>💡 Tipp:</strong> Breakout Räume ermöglichen Gruppenarbeit. Teilnehmer können
          in ihren Räumen chatten und zusammenarbeiten. Sie können jederzeit zwischen Räumen
          wechseln oder alle zurück in den Hauptraum holen.
        </p>
      </div>
    </div>
  );
}

export default BreakoutRooms;
