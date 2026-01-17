import { useState, useEffect } from 'react';
import { Users, ArrowLeft, Radio } from 'lucide-react';

/**
 * PresentationModeHelper - Helper components for Self-paced and Hybrid modes
 * Shows admin location indicator and "Return to Live" functionality
 */

// Admin Location Indicator - Shows where the admin currently is
export function AdminLocationIndicator({ 
  adminPosition = 0,
  currentPosition = 0,
  totalSlides = 0,
  onReturnToLive
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show indicator when user is not on the same slide as admin
    setIsVisible(adminPosition !== currentPosition);
  }, [adminPosition, currentPosition]);

  if (!isVisible) return null;

  const distance = Math.abs(adminPosition - currentPosition);
  const direction = adminPosition > currentPosition ? 'voraus' : 'zurück';

  return (
    <div className="fixed top-4 right-4 z-50 animate-fade-in">
      <div className="bg-purple-500/20 border border-purple-500/50 rounded-lg p-4 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="relative">
            <Users size={20} className="text-purple-400" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-purple-900 animate-pulse" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Admin ist hier</p>
            <p className="text-xs text-purple-300">
              {distance} Folie{distance !== 1 ? 'n' : ''} {direction}
            </p>
          </div>
        </div>
        
        {onReturnToLive && (
          <button
            onClick={onReturnToLive}
            className="w-full px-3 py-2 bg-purple-500/30 hover:bg-purple-500/40 text-purple-300 rounded-lg transition-all text-sm flex items-center justify-center gap-2"
          >
            <Radio size={14} />
            Zu Live zurückkehren
          </button>
        )}
      </div>
    </div>
  );
}

// Return to Live Button - Standalone button for returning to admin's position
export function ReturnToLiveButton({ 
  onClick,
  adminPosition = 0,
  currentPosition = 0,
  variant = 'floating' // 'floating', 'inline', 'minimal'
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(adminPosition !== currentPosition);
  }, [adminPosition, currentPosition]);

  if (!show) return null;

  if (variant === 'minimal') {
    return (
      <button
        onClick={onClick}
        className="px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-all text-xs flex items-center gap-1"
      >
        <Radio size={12} />
        Live
      </button>
    );
  }

  if (variant === 'inline') {
    return (
      <button
        onClick={onClick}
        className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-all text-sm flex items-center gap-2 border border-purple-500/30"
      >
        <Radio size={16} />
        Zu Live zurückkehren
      </button>
    );
  }

  // Default: floating
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full shadow-lg transition-all flex items-center gap-2 z-50 animate-bounce-subtle"
    >
      <Radio size={18} />
      <span className="font-semibold">Zu Live zurückkehren</span>
    </button>
  );
}

// Self-Paced Mode Controls - Navigation controls for self-paced mode
export function SelfPacedControls({
  currentSlide = 0,
  totalSlides = 0,
  onPrevious,
  onNext,
  onJumpTo,
  adminPosition = 0,
  onReturnToLive
}) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full p-2 flex items-center gap-2 shadow-xl">
        {/* Previous Button */}
        <button
          onClick={onPrevious}
          disabled={currentSlide === 0}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-full transition-all flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          <span className="text-sm font-medium">Zurück</span>
        </button>

        {/* Slide Counter */}
        <div className="px-4 py-2 bg-white/5 rounded-full">
          <span className="text-white text-sm font-mono">
            {currentSlide + 1} / {totalSlides}
          </span>
        </div>

        {/* Next Button */}
        <button
          onClick={onNext}
          disabled={currentSlide === totalSlides - 1}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-full transition-all flex items-center gap-2"
        >
          <span className="text-sm font-medium">Weiter</span>
          <ArrowLeft size={16} className="rotate-180" />
        </button>

        {/* Return to Live (if not at admin position) */}
        {adminPosition !== currentSlide && onReturnToLive && (
          <>
            <div className="w-px h-6 bg-white/20" />
            <button
              onClick={onReturnToLive}
              className="px-4 py-2 bg-purple-500/30 hover:bg-purple-500/40 text-purple-300 rounded-full transition-all flex items-center gap-2"
            >
              <Radio size={14} />
              <span className="text-sm font-medium">Live</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// Hybrid Mode Indicator - Shows sync status in hybrid mode
export function HybridModeIndicator({
  isSynced = true,
  adminPosition = 0,
  onSync
}) {
  if (isSynced) {
    return (
      <div className="fixed top-4 left-4 z-50">
        <div className="bg-green-500/20 border border-green-500/50 rounded-lg px-3 py-2 backdrop-blur-sm flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-green-300 font-medium">Live synchronisiert</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-4 left-4 z-50">
      <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-yellow-500 rounded-full" />
          <span className="text-xs text-yellow-300 font-medium">Nicht synchronisiert</span>
        </div>
        {onSync && (
          <button
            onClick={onSync}
            className="w-full px-3 py-1.5 bg-yellow-500/30 hover:bg-yellow-500/40 text-yellow-300 rounded text-xs transition-all"
          >
            Jetzt synchronisieren
          </button>
        )}
      </div>
    </div>
  );
}

export default {
  AdminLocationIndicator,
  ReturnToLiveButton,
  SelfPacedControls,
  HybridModeIndicator
};
