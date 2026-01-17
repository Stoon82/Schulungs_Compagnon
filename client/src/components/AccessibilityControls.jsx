import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Pause, Play, SkipForward, SkipBack, Sun, Moon, Type, Minus, Plus } from 'lucide-react';

/**
 * AccessibilityControls Component
 * Text-to-speech, high contrast mode, and font size controls
 */
function AccessibilityControls({ content, onSettingsChange }) {
  const [isReading, setIsReading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [showControls, setShowControls] = useState(false);
  
  const utteranceRef = useRef(null);
  const synth = window.speechSynthesis;

  useEffect(() => {
    // Load saved settings
    const savedSettings = localStorage.getItem('accessibilitySettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setHighContrast(settings.highContrast || false);
      setFontSize(settings.fontSize || 16);
      setSpeechRate(settings.speechRate || 1.0);
      applySettings(settings);
    }

    return () => {
      if (synth.speaking) {
        synth.cancel();
      }
    };
  }, []);

  const applySettings = (settings) => {
    // Apply high contrast
    if (settings.highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }

    // Apply font size
    document.documentElement.style.setProperty('--base-font-size', `${settings.fontSize}px`);

    if (onSettingsChange) {
      onSettingsChange(settings);
    }
  };

  const saveSettings = (newSettings) => {
    const settings = {
      highContrast: newSettings.highContrast ?? highContrast,
      fontSize: newSettings.fontSize ?? fontSize,
      speechRate: newSettings.speechRate ?? speechRate
    };
    localStorage.setItem('accessibilitySettings', JSON.stringify(settings));
    applySettings(settings);
  };

  const startReading = () => {
    if (!content) return;

    // Cancel any ongoing speech
    synth.cancel();

    // Create new utterance
    const utterance = new SpeechSynthesisUtterance(content);
    utterance.rate = speechRate;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    utterance.lang = 'de-DE';

    utterance.onend = () => {
      setIsReading(false);
      setIsPaused(false);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsReading(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    synth.speak(utterance);
    setIsReading(true);
    setIsPaused(false);
  };

  const pauseReading = () => {
    if (synth.speaking && !synth.paused) {
      synth.pause();
      setIsPaused(true);
    }
  };

  const resumeReading = () => {
    if (synth.paused) {
      synth.resume();
      setIsPaused(false);
    }
  };

  const stopReading = () => {
    synth.cancel();
    setIsReading(false);
    setIsPaused(false);
  };

  const adjustSpeed = (delta) => {
    const newRate = Math.max(0.5, Math.min(2.0, speechRate + delta));
    setSpeechRate(newRate);
    saveSettings({ speechRate: newRate });

    // Restart reading with new speed if currently reading
    if (isReading && !isPaused) {
      stopReading();
      setTimeout(startReading, 100);
    }
  };

  const toggleHighContrast = () => {
    const newValue = !highContrast;
    setHighContrast(newValue);
    saveSettings({ highContrast: newValue });
  };

  const adjustFontSize = (delta) => {
    const newSize = Math.max(12, Math.min(24, fontSize + delta));
    setFontSize(newSize);
    saveSettings({ fontSize: newSize });
  };

  const resetSettings = () => {
    const defaultSettings = {
      highContrast: false,
      fontSize: 16,
      speechRate: 1.0
    };
    setHighContrast(false);
    setFontSize(16);
    setSpeechRate(1.0);
    saveSettings(defaultSettings);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setShowControls(!showControls)}
        className="bg-purple-500 hover:bg-purple-600 text-white rounded-full p-4 shadow-lg transition-all mb-4"
        title="Barrierefreiheit"
      >
        <Type size={24} />
      </button>

      {/* Controls Panel */}
      {showControls && (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 rounded-lg shadow-2xl p-6 w-80 mb-4">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Type size={20} />
            Barrierefreiheit
          </h3>

          {/* Text-to-Speech Controls */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-300 mb-3">Vorlesen</h4>
            
            <div className="flex items-center gap-2 mb-3">
              {!isReading ? (
                <button
                  onClick={startReading}
                  disabled={!content}
                  className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Volume2 size={18} />
                  Vorlesen
                </button>
              ) : (
                <>
                  {isPaused ? (
                    <button
                      onClick={resumeReading}
                      className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Play size={18} />
                      Fortsetzen
                    </button>
                  ) : (
                    <button
                      onClick={pauseReading}
                      className="flex-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Pause size={18} />
                      Pause
                    </button>
                  )}
                  <button
                    onClick={stopReading}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all"
                  >
                    <VolumeX size={18} />
                  </button>
                </>
              )}
            </div>

            {/* Speed Controls */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Geschwindigkeit:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => adjustSpeed(-0.25)}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                  disabled={speechRate <= 0.5}
                >
                  <SkipBack size={16} />
                </button>
                <span className="text-white font-semibold w-12 text-center">{speechRate.toFixed(2)}x</span>
                <button
                  onClick={() => adjustSpeed(0.25)}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                  disabled={speechRate >= 2.0}
                >
                  <SkipForward size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* High Contrast Mode */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-300 mb-3">Kontrast</h4>
            <button
              onClick={toggleHighContrast}
              className={`w-full px-4 py-2 rounded-lg transition-all flex items-center justify-between ${
                highContrast
                  ? 'bg-yellow-500 text-black'
                  : 'bg-white/5 hover:bg-white/10 text-white'
              }`}
            >
              <span className="flex items-center gap-2">
                {highContrast ? <Sun size={18} /> : <Moon size={18} />}
                Hoher Kontrast
              </span>
              <span className="text-sm">{highContrast ? 'An' : 'Aus'}</span>
            </button>
          </div>

          {/* Font Size Controls */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-300 mb-3">Schriftgröße</h4>
            <div className="flex items-center justify-between">
              <button
                onClick={() => adjustFontSize(-2)}
                disabled={fontSize <= 12}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all disabled:opacity-50"
              >
                <Minus size={18} />
              </button>
              <span className="text-white font-semibold">{fontSize}px</span>
              <button
                onClick={() => adjustFontSize(2)}
                disabled={fontSize >= 24}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all disabled:opacity-50"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          {/* Reset Button */}
          <button
            onClick={resetSettings}
            className="w-full px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all text-sm"
          >
            Zurücksetzen
          </button>
        </div>
      )}
    </div>
  );
}

export default AccessibilityControls;
