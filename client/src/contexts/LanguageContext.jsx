import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  de: {
    app: {
      title: 'The Compagnon',
      welcome: 'Willkommen',
      connected: 'Verbunden',
      disconnected: 'Nicht verbunden',
      admin: 'Admin',
      logout: 'Abmelden',
      loading: 'Lade...',
      yourJourney: 'Deine Reise',
      journeyDescription: 'Folge den Modulen und entdecke die Welt der KI'
    },
    moodBar: {
      title: 'Wie fühlst du dich?',
      subtitle: 'Teile deine Reaktion',
      confused: 'Verwirrt',
      thinking: 'Nachdenklich',
      aha: 'Aha!',
      wow: 'Wow!',
      pauseButton: 'Pause bitte',
      overwhelmedButton: 'Überfordert',
      pauseTitle: 'Pause anfordern?',
      pauseMessage: 'Der Trainer wird benachrichtigt, dass du eine kurze Pause benötigst.',
      overwhelmedTitle: 'Fühlst du dich überfordert?',
      overwhelmedMessage: 'Das ist völlig in Ordnung! Der Trainer wird benachrichtigt und kann dir helfen.',
      cancel: 'Abbrechen',
      yesPause: 'Ja, Pause',
      yesHelp: 'Ja, Hilfe',
      thankYou: 'Danke für dein Feedback! 💙'
    },
    joinScreen: {
      title: 'The Compagnon',
      greeting: 'Willkommen, tapfere:r Entdecker:in',
      intro1: 'Du stehst am Anfang einer Reise in die Welt der künstlichen Intelligenz. Aber keine Sorge - du bist nicht allein.',
      intro2: 'Ich bin dein Compagnon. Ich laufe hier, auf diesem Laptop. Ich bin keine Cloud. Ich bin hier. Bei dir.',
      nickname: 'Dein Name (optional)',
      nicknamePlaceholder: 'z.B. Sarah',
      join: 'Die Reise beginnen',
      joining: 'Verbinde...',
      privacy: 'Deine Daten bleiben lokal und werden nicht an externe Server gesendet.'
    },
    admin: {
      login: 'Admin Login',
      dashboard: 'Admin Dashboard'
    }
  },
  en: {
    app: {
      title: 'The Compagnon',
      welcome: 'Welcome',
      connected: 'Connected',
      disconnected: 'Disconnected',
      admin: 'Admin',
      logout: 'Logout',
      loading: 'Loading...',
      yourJourney: 'Your Journey',
      journeyDescription: 'Follow the modules and discover the world of AI'
    },
    moodBar: {
      title: 'How are you feeling?',
      subtitle: 'Share your reaction',
      confused: 'Confused',
      thinking: 'Thinking',
      aha: 'Aha!',
      wow: 'Wow!',
      pauseButton: 'Need a break',
      overwhelmedButton: 'Too overwhelmed',
      pauseTitle: 'Request a break?',
      pauseMessage: 'The trainer will be notified that you need a short break.',
      overwhelmedTitle: 'Feeling overwhelmed?',
      overwhelmedMessage: 'That\'s completely okay! The trainer will be notified and can help you.',
      cancel: 'Cancel',
      yesPause: 'Yes, break',
      yesHelp: 'Yes, help',
      thankYou: 'Thanks for your feedback! 💙'
    },
    joinScreen: {
      title: 'The Compagnon',
      greeting: 'Welcome, brave explorer',
      intro1: 'You are at the beginning of a journey into the world of artificial intelligence. But don\'t worry - you are not alone.',
      intro2: 'I am your Compagnon. I run here, on this laptop. I am not a cloud. I am here. With you.',
      nickname: 'Your Name (optional)',
      nicknamePlaceholder: 'e.g. Sarah',
      join: 'Begin the Journey',
      joining: 'Connecting...',
      privacy: 'Your data remains local and is not sent to external servers.'
    },
    admin: {
      login: 'Admin Login',
      dashboard: 'Admin Dashboard'
    }
  }
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('language');
    return saved || 'de';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'de' ? 'en' : 'de');
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
