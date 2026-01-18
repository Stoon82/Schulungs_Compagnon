import { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Lock, Unlock, Play, CheckCircle, Clock, Users } from 'lucide-react';
import ModuleViewer from './ModuleViewer';
import api from '../services/api';

function ClassSessionView({ session, isAdmin, socket, onExit, participantData }) {
  const [modules, setModules] = useState(session.modules || []);
  const [selectedModule, setSelectedModule] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Refresh modules periodically to get updated lock status
    const interval = setInterval(loadModules, 5000);
    return () => clearInterval(interval);
  }, [session.session_code]);

  useEffect(() => {
    // Listen for module unlock events via socket
    if (socket) {
      socket.on('module:unlocked', (data) => {
        if (data.sessionCode === session.session_code) {
          loadModules();
        }
      });

      return () => {
        socket.off('module:unlocked');
      };
    }
  }, [socket, session.session_code]);

  const loadModules = async () => {
    try {
      const response = await fetch(`/api/public-session/session/${session.session_code}/modules`);
      const data = await response.json();
      if (data.success) {
        setModules(data.data.modules);
      }
    } catch (error) {
      console.error('Error loading modules:', error);
    }
  };

  const handleModuleClick = (module) => {
    if (module.is_locked && !isAdmin) {
      return; // Can't open locked modules as participant
    }
    setSelectedModule(module);
  };

  const handleBackToModuleList = () => {
    setSelectedModule(null);
    loadModules(); // Refresh to check for any updates
  };

  const handleUnlockModule = async (classModuleId) => {
    try {
      const response = await fetch(`/api/public-session/session/${session.session_code}/modules/${classModuleId}/unlock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        loadModules();
        
        // Emit socket event to notify other participants
        if (socket) {
          socket.emit('module:unlocked', {
            sessionCode: session.session_code,
            classModuleId
          });
        }
      }
    } catch (error) {
      console.error('Error unlocking module:', error);
    }
  };

  // Get theme styling from session
  const themeStyle = session.theme_override || {};

  // If a module is selected, show the ModuleViewer
  if (selectedModule) {
    return (
      <ModuleViewer
        moduleId={selectedModule.id}
        socket={socket}
        onExit={handleBackToModuleList}
        sessionCode={session.session_code}
        isAdmin={isAdmin}
      />
    );
  }

  // Module list view
  return (
    <div 
      className="min-h-screen p-6"
      style={{
        background: themeStyle.background || 'linear-gradient(to bottom right, #0f172a, #581c87, #0f172a)',
        color: themeStyle.textColor || undefined,
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          {onExit && (
            <button
              onClick={onExit}
              className="mb-4 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              Sitzung verlassen
            </button>
          )}
          
          <div 
            className="backdrop-blur-lg rounded-xl border border-white/10 p-6"
            style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: themeStyle.borderRadius || '12px',
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {session.class_name}
                </h1>
                {session.class_description && (
                  <p className="text-gray-400">{session.class_description}</p>
                )}
              </div>
              
              <div className="bg-green-500/20 text-green-400 px-4 py-2 rounded-lg flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Live Session
              </div>
            </div>
            
            <div className="mt-4 flex items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <BookOpen size={16} />
                {modules.length} Module
              </span>
              <span className="flex items-center gap-1">
                <Unlock size={16} />
                {modules.filter(m => !m.is_locked).length} freigeschaltet
              </span>
            </div>
          </div>
        </div>

        {/* Module List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white mb-4">
            Kursmodule
          </h2>
          
          {modules.length === 0 ? (
            <div className="bg-white/5 rounded-xl p-12 border border-white/10 text-center">
              <BookOpen size={48} className="mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400">Keine Module in diesem Kurs</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {modules.map((module, index) => {
                const isLocked = module.is_locked && !isAdmin;
                const canOpen = !module.is_locked || isAdmin;
                
                return (
                  <div
                    key={module.class_module_id}
                    className={`group bg-white/5 backdrop-blur-lg rounded-xl border transition-all ${
                      canOpen 
                        ? 'border-white/10 hover:border-purple-500/50 hover:bg-white/10 cursor-pointer' 
                        : 'border-white/5 opacity-60'
                    }`}
                  >
                    <div className="p-6 flex items-center gap-4">
                      {/* Order Number */}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                        module.is_locked 
                          ? 'bg-gray-700 text-gray-400' 
                          : 'bg-purple-500/20 text-purple-400'
                      }`}>
                        {index + 1}
                      </div>
                      
                      {/* Module Info */}
                      <div 
                        className="flex-1"
                        onClick={() => canOpen && handleModuleClick(module)}
                      >
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-white">
                            {module.title}
                          </h3>
                          {module.is_locked ? (
                            <Lock size={16} className="text-gray-500" />
                          ) : (
                            <Unlock size={16} className="text-green-400" />
                          )}
                        </div>
                        
                        {module.description && (
                          <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                            {module.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          {module.estimated_duration && (
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              ~{module.estimated_duration} Min
                            </span>
                          )}
                          {module.difficulty && (
                            <span className="capitalize">{module.difficulty}</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {/* Admin Unlock Button */}
                        {isAdmin && module.is_locked && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUnlockModule(module.class_module_id);
                            }}
                            className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-all flex items-center gap-2"
                          >
                            <Unlock size={16} />
                            Freischalten
                          </button>
                        )}
                        
                        {/* Open Button */}
                        {canOpen && (
                          <button
                            onClick={() => handleModuleClick(module)}
                            className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-all flex items-center gap-2"
                          >
                            <Play size={16} />
                            {isAdmin ? 'Öffnen' : 'Starten'}
                          </button>
                        )}
                        
                        {/* Locked indicator for participants */}
                        {!canOpen && (
                          <div className="px-4 py-2 bg-gray-700/50 text-gray-500 rounded-lg flex items-center gap-2">
                            <Lock size={16} />
                            Gesperrt
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Admin Controls */}
        {isAdmin && (
          <div className="mt-8 p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl">
            <div className="flex items-center gap-2 text-orange-400 mb-2">
              <Users size={20} />
              <span className="font-semibold">Admin-Hinweis</span>
            </div>
            <p className="text-sm text-gray-400">
              Als Admin können Sie Module freischalten, auch wenn sie gesperrt sind. 
              Klicken Sie auf "Freischalten", um ein Modul für alle Teilnehmer zugänglich zu machen.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ClassSessionView;
