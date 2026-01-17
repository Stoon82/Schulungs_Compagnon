import { useState, useEffect } from 'react';
import { LogIn, Hash, User } from 'lucide-react';

function SessionJoinScreen({ onJoinSuccess, initialSessionCode = '' }) {
  const [sessionCode, setSessionCode] = useState(initialSessionCode);
  const [participantName, setParticipantName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(initialSessionCode ? 2 : 1); // Skip to name if code provided
  const [sessionData, setSessionData] = useState(null);

  // Auto-check code if provided
  useEffect(() => {
    if (initialSessionCode && initialSessionCode.length === 6) {
      handleCheckCode(new Event('submit'));
    }
  }, [initialSessionCode]);

  const handleCheckCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`/api/session-management/sessions/code/${sessionCode}`);
      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Sitzung nicht gefunden');
        setLoading(false);
        return;
      }

      setSessionData(data.data);
      setStep(2);
      setLoading(false);
    } catch (err) {
      console.error('Error checking code:', err);
      setError('Netzwerkfehler. Bitte versuchen Sie es erneut.');
      setLoading(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`/api/session-management/sessions/${sessionData.id}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantName })
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Beitritt fehlgeschlagen');
        setLoading(false);
        return;
      }

      // Store participant info
      localStorage.setItem('sessionParticipant', JSON.stringify({
        ...data.data,
        sessionId: sessionData.id,
        sessionCode: sessionData.session_code
      }));

      if (onJoinSuccess) {
        onJoinSuccess(sessionData, data.data);
      }
    } catch (err) {
      console.error('Error joining session:', err);
      setError('Netzwerkfehler. Bitte versuchen Sie es erneut.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 max-w-md w-full p-8">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Schulung beitreten
          </h1>
          <p className="text-gray-400">
            {step === 1 ? 'Geben Sie den Sitzungscode ein' : 'Wie möchten Sie genannt werden?'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleCheckCode} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Sitzungscode
              </label>
              <div className="relative">
                <Hash size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={sessionCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setSessionCode(value);
                    setError('');
                  }}
                  required
                  maxLength={6}
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-lg text-white text-center text-2xl font-bold tracking-widest placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="000000"
                />
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">
                6-stelliger Code vom Trainer
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || sessionCode.length !== 6}
              className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold text-white hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  <span>Wird überprüft...</span>
                </>
              ) : (
                <>
                  <span>Weiter</span>
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            {/* Session Info */}
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-sm text-gray-400 mb-1">Schulung:</p>
              <p className="text-white font-semibold">{sessionData?.class_name}</p>
              {sessionData?.module_title && (
                <>
                  <p className="text-sm text-gray-400 mt-2 mb-1">Modul:</p>
                  <p className="text-white">{sessionData.module_title}</p>
                </>
              )}
            </div>

            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ihr Name
                </label>
                <div className="relative">
                  <User size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={participantName}
                    onChange={(e) => {
                      setParticipantName(e.target.value);
                      setError('');
                    }}
                    required
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Max Mustermann"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setSessionData(null);
                  }}
                  className="px-6 py-4 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
                >
                  Zurück
                </button>
                <button
                  type="submit"
                  disabled={loading || !participantName.trim()}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold text-white hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                      <span>Wird beigetreten...</span>
                    </>
                  ) : (
                    <>
                      <LogIn size={20} />
                      <span>Beitreten</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default SessionJoinScreen;
