import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Grid, Search, Play, Pause, SkipForward, Maximize2, Eye, EyeOff, Settings } from 'lucide-react';

function AdminNavigationBar({ 
  module, 
  submodules = [], 
  currentIndex = 0, 
  onNavigate,
  socket,
  presentationMode = 'manual' // 'manual', 'auto', 'self-paced', 'hybrid'
}) {
  const [showOverview, setShowOverview] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [autoPlayInterval, setAutoPlayInterval] = useState(null);
  const [showPresenterNotes, setShowPresenterNotes] = useState(false);
  const [selectedMode, setSelectedMode] = useState(presentationMode);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);

  useEffect(() => {
    // Cleanup auto-play on unmount
    return () => {
      if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
      }
    };
  }, [autoPlayInterval]);

  const handleNavigate = (index) => {
    if (index >= 0 && index < submodules.length) {
      onNavigate(index);
      
      // Emit Socket.io event to sync clients
      if (socket) {
        socket.emit('module:navigate', {
          moduleId: module?.id,
          submoduleIndex: index,
          submoduleId: submodules[index]?.id
        });
      }
    }
  };

  const goToNext = () => {
    if (currentIndex < submodules.length - 1) {
      handleNavigate(currentIndex + 1);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      handleNavigate(currentIndex - 1);
    }
  };

  const toggleAutoPlay = () => {
    if (isAutoPlaying) {
      // Stop auto-play
      if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        setAutoPlayInterval(null);
      }
      setIsAutoPlaying(false);
      setTimeRemaining(0);
      setTotalDuration(0);
    } else {
      // Start auto-play
      const currentSubmodule = submodules[currentIndex];
      const duration = (currentSubmodule?.duration_estimate || 3) * 60 * 1000; // Convert minutes to ms
      
      setTotalDuration(duration);
      setTimeRemaining(duration);
      
      // Update timer every 100ms for smooth animation
      const timerInterval = setInterval(() => {
        setTimeRemaining(prev => {
          const newTime = prev - 100;
          if (newTime <= 0) {
            return 0;
          }
          return newTime;
        });
      }, 100);
      
      const interval = setInterval(() => {
        if (currentIndex < submodules.length - 1) {
          handleNavigate(currentIndex + 1);
          // Reset timer for next slide
          const nextSubmodule = submodules[currentIndex + 1];
          const nextDuration = (nextSubmodule?.duration_estimate || 3) * 60 * 1000;
          setTotalDuration(nextDuration);
          setTimeRemaining(nextDuration);
        } else {
          // End of module, stop auto-play
          clearInterval(interval);
          clearInterval(timerInterval);
          setIsAutoPlaying(false);
          setAutoPlayInterval(null);
          setTimeRemaining(0);
          setTotalDuration(0);
        }
      }, duration);
      
      setAutoPlayInterval(interval);
      setIsAutoPlaying(true);
    }
  };

  const skipToNext = () => {
    goToNext();
    // If auto-playing, reset the timer
    if (isAutoPlaying && autoPlayInterval) {
      clearInterval(autoPlayInterval);
      toggleAutoPlay();
      toggleAutoPlay();
    }
  };

  const syncAllClients = () => {
    if (socket) {
      socket.emit('module:sync', {
        moduleId: module?.id,
        submoduleIndex: currentIndex,
        submoduleId: submodules[currentIndex]?.id
      });
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const filteredSubmodules = submodules.filter(sub =>
    sub.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentSubmodule = submodules[currentIndex];
  const progressPercentage = Math.round(((currentIndex + 1) / submodules.length) * 100);

  const presentationModes = [
    { value: 'manual', label: 'Manuell', description: 'Admin steuert alle Navigation' },
    { value: 'auto', label: 'Auto', description: 'Automatisches Fortschreiten' },
    { value: 'self-paced', label: 'Selbstständig', description: 'Teilnehmer navigieren selbst' },
    { value: 'hybrid', label: 'Hybrid', description: 'Mix aus beidem' }
  ];

  return (
    <div className="bg-black/30 backdrop-blur-lg border-b border-white/10">
      <div className="px-6 py-4">
        {/* Main Navigation Bar */}
        <div className="flex items-center justify-between gap-4">
          {/* Left: Navigation Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={goToPrevious}
              disabled={currentIndex === 0}
              className="p-2 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-lg transition-all"
              title="Vorheriges Submodul (←)"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              onClick={goToNext}
              disabled={currentIndex === submodules.length - 1}
              className="p-2 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-lg transition-all"
              title="Nächstes Submodul (→)"
            >
              <ChevronRight size={20} />
            </button>

            <div className="h-8 w-px bg-white/20 mx-2"></div>

            <button
              onClick={toggleAutoPlay}
              className={`p-2 rounded-lg transition-all ${
                isAutoPlaying
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                  : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
              }`}
              title={isAutoPlaying ? 'Auto-Play pausieren' : 'Auto-Play starten'}
            >
              {isAutoPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>

            {isAutoPlaying && (
              <>
                <button
                  onClick={skipToNext}
                  className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
                  title="Zum nächsten überspringen"
                >
                  <SkipForward size={20} />
                </button>
                
                {/* Circular Timer */}
                <div className="relative w-10 h-10">
                  <svg className="w-10 h-10 transform -rotate-90">
                    <circle
                      cx="20"
                      cy="20"
                      r="16"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      className="text-white/20"
                    />
                    <circle
                      cx="20"
                      cy="20"
                      r="16"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 16}`}
                      strokeDashoffset={`${2 * Math.PI * 16 * (1 - timeRemaining / totalDuration)}`}
                      className="text-green-400 transition-all duration-100"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs text-white font-bold">
                      {Math.ceil(timeRemaining / 1000)}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Center: Current Position & Progress */}
          <div className="flex-1 max-w-md">
            <div className="text-center mb-2">
              <p className="text-sm text-gray-400">
                {currentIndex + 1} / {submodules.length}
              </p>
              <p className="text-white font-medium truncate">
                {currentSubmodule?.title || 'Kein Submodul'}
              </p>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Right: View Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowOverview(!showOverview)}
              className={`p-2 rounded-lg transition-all ${
                showOverview
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              title="Übersicht anzeigen"
            >
              <Grid size={20} />
            </button>

            <button
              onClick={() => setShowPresenterNotes(!showPresenterNotes)}
              className={`p-2 rounded-lg transition-all ${
                showPresenterNotes
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              title="Präsentator-Notizen (P)"
            >
              {showPresenterNotes ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>

            <button
              onClick={syncAllClients}
              className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all"
              title="Alle Clients synchronisieren"
            >
              <Settings size={20} className="animate-spin-slow" />
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
              title="Vollbild (F)"
            >
              <Maximize2 size={20} />
            </button>
          </div>
        </div>

        {/* Presenter Notes */}
        {showPresenterNotes && currentSubmodule?.notes && (
          <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-sm font-semibold text-yellow-400 mb-2">📝 Präsentator-Notizen:</p>
            <p className="text-sm text-gray-300 whitespace-pre-wrap">{currentSubmodule.notes}</p>
          </div>
        )}

        {/* Overview Grid */}
        {showOverview && (
          <div className="mt-4 bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Submodule durchsuchen..."
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <select
                value={selectedMode}
                onChange={(e) => setSelectedMode(e.target.value)}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {presentationModes.map(mode => (
                  <option key={mode.value} value={mode.value}>
                    {mode.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-96 overflow-y-auto">
              {filteredSubmodules.map((sub, idx) => {
                const actualIndex = submodules.findIndex(s => s.id === sub.id);
                const isActive = actualIndex === currentIndex;
                
                return (
                  <button
                    key={sub.id}
                    onClick={() => handleNavigate(actualIndex)}
                    className={`p-3 rounded-lg border transition-all text-left ${
                      isActive
                        ? 'bg-purple-500/20 border-purple-500 ring-2 ring-purple-500'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className={`text-xs font-bold ${
                        isActive ? 'text-purple-400' : 'text-gray-400'
                      }`}>
                        #{actualIndex + 1}
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-white/10 rounded text-gray-400">
                        {sub.template_type}
                      </span>
                    </div>
                    <p className={`text-sm font-medium line-clamp-2 ${
                      isActive ? 'text-white' : 'text-gray-300'
                    }`}>
                      {sub.title}
                    </p>
                    {sub.duration_estimate && (
                      <p className="text-xs text-gray-500 mt-1">
                        ~{sub.duration_estimate} Min
                      </p>
                    )}
                  </button>
                );
              })}
            </div>

            {filteredSubmodules.length === 0 && (
              <p className="text-center text-gray-400 py-8">
                Keine Submodule gefunden
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminNavigationBar;
