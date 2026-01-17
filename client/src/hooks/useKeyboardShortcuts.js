import { useEffect } from 'react';

/**
 * Custom hook for keyboard shortcuts in module navigation
 * @param {Object} handlers - Object containing handler functions for different shortcuts
 * @param {boolean} enabled - Whether shortcuts are enabled
 */
function useKeyboardShortcuts(handlers = {}, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event) => {
      // Don't trigger shortcuts when typing in input fields
      const isInputField = ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName);
      if (isInputField && !event.ctrlKey && !event.metaKey) return;

      const key = event.key.toLowerCase();
      const ctrl = event.ctrlKey || event.metaKey;
      const shift = event.shiftKey;

      // Arrow keys for navigation
      if (key === 'arrowleft' && handlers.onPrevious) {
        event.preventDefault();
        handlers.onPrevious();
      } else if (key === 'arrowright' && handlers.onNext) {
        event.preventDefault();
        handlers.onNext();
      }

      // Number keys (1-9) for jumping to specific submodules
      else if (/^[1-9]$/.test(key) && handlers.onJumpTo) {
        event.preventDefault();
        const index = parseInt(key) - 1;
        handlers.onJumpTo(index);
      }

      // Space for pause/resume auto-advance
      else if (key === ' ' && handlers.onToggleAutoPlay) {
        event.preventDefault();
        handlers.onToggleAutoPlay();
      }

      // F for fullscreen
      else if (key === 'f' && handlers.onToggleFullscreen) {
        event.preventDefault();
        handlers.onToggleFullscreen();
      }

      // P for presenter notes
      else if (key === 'p' && handlers.onToggleNotes) {
        event.preventDefault();
        handlers.onToggleNotes();
      }

      // Escape to exit
      else if (key === 'escape' && handlers.onExit) {
        event.preventDefault();
        handlers.onExit();
      }

      // G for grid/overview
      else if (key === 'g' && handlers.onToggleOverview) {
        event.preventDefault();
        handlers.onToggleOverview();
      }

      // S for sync (Ctrl+S or Cmd+S)
      else if (key === 's' && ctrl && handlers.onSync) {
        event.preventDefault();
        handlers.onSync();
      }

      // ? for help
      else if ((key === '?' || (shift && key === '/')) && handlers.onShowHelp) {
        event.preventDefault();
        handlers.onShowHelp();
      }

      // Home key - go to first
      else if (key === 'home' && handlers.onGoToFirst) {
        event.preventDefault();
        handlers.onGoToFirst();
      }

      // End key - go to last
      else if (key === 'end' && handlers.onGoToLast) {
        event.preventDefault();
        handlers.onGoToLast();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handlers, enabled]);
}

export default useKeyboardShortcuts;
