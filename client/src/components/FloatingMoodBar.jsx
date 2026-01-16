import { useState } from 'react';
import { Pause, AlertTriangle, X, ChevronUp, ChevronDown } from 'lucide-react';
import api from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';

function FloatingMoodBar({ currentModuleId, onMoodSelect }) {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedMood, setSelectedMood] = useState(null);
  const [showPauseConfirm, setShowPauseConfirm] = useState(false);
  const [showOverwhelmedConfirm, setShowOverwhelmedConfirm] = useState(false);

  const moods = [
    { id: 'confused', emoji: '😕', label: t('moodBar.confused'), color: 'from-red-500 to-orange-500' },
    { id: 'thinking', emoji: '🤔', label: t('moodBar.thinking'), color: 'from-yellow-500 to-orange-500' },
    { id: 'aha', emoji: '💡', label: t('moodBar.aha'), color: 'from-blue-500 to-cyan-500' },
    { id: 'wow', emoji: '🤩', label: t('moodBar.wow'), color: 'from-purple-500 to-pink-500' }
  ];

  const handleMoodClick = async (mood) => {
    setSelectedMood(mood.id);
    
    if (onMoodSelect) {
      await onMoodSelect(mood.id, currentModuleId);
    }

    setTimeout(() => {
      setSelectedMood(null);
    }, 2000);
  };

  const handlePauseRequest = async () => {
    try {
      console.log('⏸️ Client sending pause request...');
      const result = await api.sendMood('pause_request', currentModuleId);
      console.log('⏸️ Pause request sent successfully:', result);
      setShowPauseConfirm(false);
    } catch (error) {
      console.error('❌ Failed to send pause request:', error);
    }
  };

  const handleOverwhelmedAlert = async () => {
    try {
      console.log('🚨 Client sending overwhelmed alert...');
      const result = await api.sendMood('overwhelmed', currentModuleId);
      console.log('🚨 Overwhelmed alert sent successfully:', result);
      setShowOverwhelmedConfirm(false);
    } catch (error) {
      console.error('❌ Failed to send overwhelmed alert:', error);
    }
  };

  return (
    <>
      {/* Floating Bar */}
      <div className="fixed bottom-6 right-6 z-40">
        <div className={`bg-black/40 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl transition-all duration-300 ${
          isExpanded ? 'w-80' : 'w-16'
        }`}>
          {/* Toggle Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full p-4 flex items-center justify-center text-white hover:bg-white/10 rounded-t-2xl transition-all"
          >
            {isExpanded ? <ChevronDown size={24} /> : <ChevronUp size={24} />}
          </button>

          {/* Expanded Content */}
          {isExpanded && (
            <div className="p-4 space-y-4">
              {/* Title */}
              <div className="text-center">
                <h3 className="text-white font-semibold mb-1">{t('moodBar.title')}</h3>
                <p className="text-xs text-gray-400">{t('moodBar.subtitle')}</p>
              </div>

              {/* Mood Buttons */}
              <div className="grid grid-cols-2 gap-2">
                {moods.map((mood) => (
                  <button
                    key={mood.id}
                    onClick={() => handleMoodClick(mood)}
                    className={`relative p-3 rounded-xl transition-all transform hover:scale-105 ${
                      selectedMood === mood.id
                        ? `bg-gradient-to-r ${mood.color} scale-105`
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-3xl mb-1">{mood.emoji}</div>
                    <div className="text-xs text-white font-medium">{mood.label}</div>
                    
                    {selectedMood === mood.id && (
                      <div className="absolute inset-0 bg-white/20 rounded-xl animate-ping"></div>
                    )}
                  </button>
                ))}
              </div>

              {/* Divider */}
              <div className="border-t border-white/10"></div>

              {/* Alert Buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => setShowPauseConfirm(true)}
                  className="w-full px-4 py-3 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/50 rounded-lg text-yellow-300 font-medium transition-all flex items-center justify-center gap-2"
                >
                  <Pause size={18} />
                  <span>{t('moodBar.pauseButton')}</span>
                </button>

                <button
                  onClick={() => setShowOverwhelmedConfirm(true)}
                  className="w-full px-4 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-red-300 font-medium transition-all flex items-center justify-center gap-2"
                >
                  <AlertTriangle size={18} />
                  <span>{t('moodBar.overwhelmedButton')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pause Confirmation Modal */}
      {showPauseConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 max-w-md w-full mx-4 border border-yellow-500/30">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Pause size={32} className="text-yellow-400" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-2">
                {t('moodBar.pauseTitle')}
              </h3>
              <p className="text-gray-300 mb-6">
                {t('moodBar.pauseMessage')}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPauseConfirm(false)}
                  className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 font-semibold transition-all"
                >
                  {t('moodBar.cancel')}
                </button>
                <button
                  onClick={handlePauseRequest}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg text-white font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all"
                >
                  {t('moodBar.yesPause')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overwhelmed Confirmation Modal */}
      {showOverwhelmedConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 max-w-md w-full mx-4 border border-red-500/30">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} className="text-red-400" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-2">
                {t('moodBar.overwhelmedTitle')}
              </h3>
              <p className="text-gray-300 mb-6">
                {t('moodBar.overwhelmedMessage')}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowOverwhelmedConfirm(false)}
                  className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 font-semibold transition-all"
                >
                  {t('moodBar.cancel')}
                </button>
                <button
                  onClick={handleOverwhelmedAlert}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg text-white font-semibold hover:from-red-600 hover:to-pink-600 transition-all"
                >
                  {t('moodBar.yesHelp')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default FloatingMoodBar;
