import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import AdminAuthModal from './AdminAuthModal';
import SessionJoinScreen from './SessionJoinScreen';
import ClassManagement from './ClassManagement';
import ActiveSessionView from './ActiveSessionView';
import AdminDashboard from './AdminDashboard';
import { LogOut, Settings, BookOpen } from 'lucide-react';

function MainApp() {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  
  // Authentication state
  const [adminUser, setAdminUser] = useState(null);
  const [participantData, setParticipantData] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Session state
  const [activeSession, setActiveSession] = useState(null);
  const [view, setView] = useState('landing'); // 'landing', 'classes', 'session', 'dashboard'

  useEffect(() => {
    // Check URL for session code parameter
    const urlParams = new URLSearchParams(window.location.search);
    const sessionCodeFromUrl = urlParams.get('session');
    
    if (sessionCodeFromUrl) {
      // Auto-navigate to join screen with pre-filled code
      setView('join');
      // Store the code temporarily
      sessionStorage.setItem('pendingSessionCode', sessionCodeFromUrl);
      return;
    }

    // Check for stored admin user
    const storedAdmin = localStorage.getItem('adminUser');
    if (storedAdmin) {
      try {
        setAdminUser(JSON.parse(storedAdmin));
        setView('classes');
      } catch (error) {
        console.error('Error loading admin user:', error);
      }
    }

    // Check for stored participant
    const storedParticipant = localStorage.getItem('sessionParticipant');
    if (storedParticipant) {
      try {
        const participant = JSON.parse(storedParticipant);
        setParticipantData(participant);
        // Try to rejoin session
        loadSessionByCode(participant.sessionCode);
      } catch (error) {
        console.error('Error loading participant:', error);
      }
    }

    // Initialize Socket.io
    const newSocket = io(window.location.origin, {
      path: '/socket.io'
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
    });

    newSocket.on('session:ended', (data) => {
      if (activeSession && data.sessionId === activeSession.id) {
        handleSessionEnd();
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const loadSessionByCode = async (code) => {
    try {
      const response = await fetch(`/api/session-management/sessions/code/${code}`);
      const data = await response.json();
      
      if (data.success) {
        setActiveSession(data.data);
        setView('session');
      }
    } catch (error) {
      console.error('Error loading session:', error);
    }
  };

  const handleAdminAuth = (admin) => {
    setAdminUser(admin);
    setShowAuthModal(false);
    setView('classes');
  };

  const handleClientJoin = (session, participant) => {
    setActiveSession(session);
    setParticipantData(participant);
    setView('session');
  };

  const handleStartSession = (session) => {
    setActiveSession(session);
    setView('session');
  };

  const handleSessionEnd = () => {
    setActiveSession(null);
    localStorage.removeItem('sessionParticipant');
    
    if (adminUser) {
      setView('classes');
    } else {
      setView('landing');
      setParticipantData(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    localStorage.removeItem('sessionParticipant');
    setAdminUser(null);
    setParticipantData(null);
    setActiveSession(null);
    setView('landing');
  };

  // Landing Page
  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Compagnon</h1>
            <p className="text-gray-400">Modulares Schulungssystem</p>
          </div>

          <button
            onClick={() => setView('join')}
            className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold text-white hover:from-purple-600 hover:to-pink-600 transition-all text-lg"
          >
            Als Teilnehmer beitreten
          </button>

          <button
            onClick={() => setShowAuthModal(true)}
            className="w-full px-6 py-4 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all font-semibold text-lg"
          >
            Als Admin anmelden
          </button>

          {showAuthModal && (
            <AdminAuthModal
              onClose={() => setShowAuthModal(false)}
              onAuthSuccess={handleAdminAuth}
            />
          )}
        </div>
      </div>
    );
  }

  // Join Session Screen
  if (view === 'join') {
    return (
      <div>
        <SessionJoinScreen onJoinSuccess={handleClientJoin} />
        <button
          onClick={() => setView('landing')}
          className="absolute top-4 left-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
        >
          Zurück
        </button>
      </div>
    );
  }

  // Class Management (Admin)
  if (view === 'classes' && adminUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Header */}
        <div className="bg-black/30 backdrop-blur-lg border-b border-white/10 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-white">Compagnon</h1>
              <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                Admin: {adminUser.displayName || adminUser.username}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setView('dashboard')}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all flex items-center gap-2"
              >
                <Settings size={18} />
                <span>Dashboard</span>
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all flex items-center gap-2"
              >
                <LogOut size={18} />
                <span>Abmelden</span>
              </button>
            </div>
          </div>
        </div>

        {/* Class Management */}
        <div className="max-w-7xl mx-auto p-6">
          <ClassManagement
            adminUser={adminUser}
            onStartSession={handleStartSession}
          />
        </div>
      </div>
    );
  }

  // Admin Dashboard
  if (view === 'dashboard' && adminUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="bg-black/30 backdrop-blur-lg border-b border-white/10 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setView('classes')}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all flex items-center gap-2"
              >
                <BookOpen size={18} />
                <span>Klassen</span>
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all flex items-center gap-2"
              >
                <LogOut size={18} />
                <span>Abmelden</span>
              </button>
            </div>
          </div>
        </div>
        <AdminDashboard />
      </div>
    );
  }

  // Active Session View
  if (view === 'session' && activeSession) {
    return (
      <ActiveSessionView
        session={activeSession}
        adminUser={adminUser}
        participantData={participantData}
        socket={socket}
        onEndSession={handleSessionEnd}
      />
    );
  }

  // Fallback
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <p className="text-white text-lg">Wird geladen...</p>
      </div>
    </div>
  );
}

export default MainApp;
