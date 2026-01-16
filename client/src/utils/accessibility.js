// Accessibility utilities for The Compagnon

export const announceToScreenReader = (message, priority = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

export const trapFocus = (element) => {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];
  
  const handleTabKey = (e) => {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        lastFocusable.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        firstFocusable.focus();
        e.preventDefault();
      }
    }
  };
  
  element.addEventListener('keydown', handleTabKey);
  
  return () => {
    element.removeEventListener('keydown', handleTabKey);
  };
};

export const addKeyboardNavigation = (element, onEnter, onEscape) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && onEnter) {
      onEnter(e);
    } else if (e.key === 'Escape' && onEscape) {
      onEscape(e);
    }
  };
  
  element.addEventListener('keydown', handleKeyPress);
  
  return () => {
    element.removeEventListener('keydown', handleKeyPress);
  };
};

export const setFocusToFirstError = (formElement) => {
  const firstError = formElement.querySelector('[aria-invalid="true"]');
  if (firstError) {
    firstError.focus();
    announceToScreenReader('Bitte korrigieren Sie die Fehler im Formular', 'assertive');
  }
};

export const getAriaLabel = (mood) => {
  const labels = {
    confused: 'Verwirrt - Ich verstehe das nicht',
    thinking: 'Nachdenklich - Interessant, lass mich nachdenken',
    aha: 'Aha! - Jetzt habe ich es verstanden',
    wow: 'Wow! - Das ist großartig'
  };
  return labels[mood] || mood;
};

export const skipToContent = () => {
  const mainContent = document.querySelector('main') || document.querySelector('[role="main"]');
  if (mainContent) {
    mainContent.setAttribute('tabindex', '-1');
    mainContent.focus();
    mainContent.removeAttribute('tabindex');
  }
};
