import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { 
  defaultTheme, 
  applyThemeToDocument, 
  loadStoredTheme,
  mergeThemes 
} from '../utils/themeSchema';

const ThemeContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const stored = loadStoredTheme();
    return stored || defaultTheme;
  });
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [themeHistory, setThemeHistory] = useState([]);
  const [savedThemes, setSavedThemes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize socket connection
  useEffect(() => {
    let isUnloading = false;
    
    // Suppress errors during page unload
    const handleBeforeUnload = () => {
      isUnloading = true;
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('🎨 Theme socket connected');
      setIsConnected(true);
      // Request current global theme on connect
      newSocket.emit('theme:getCurrent');
    });

    newSocket.on('disconnect', (reason) => {
      if (!isUnloading) {
        console.log('🎨 Theme socket disconnected:', reason);
      }
      setIsConnected(false);
    });
    
    newSocket.on('connect_error', (error) => {
      if (!isUnloading) {
        console.warn('🎨 Theme socket connection error:', error.message);
      }
    });

    // Listen for theme updates from server
    newSocket.on('theme:update', (data) => {
      console.log('🎨 Received theme update:', data);
      if (data.theme) {
        const mergedTheme = mergeThemes(defaultTheme, data.theme);
        setTheme(mergedTheme);
        applyThemeToDocument(mergedTheme);
      }
    });

    // Receive current global theme
    newSocket.on('theme:current', (data) => {
      console.log('🎨 Received current theme:', data);
      if (data.theme) {
        const mergedTheme = mergeThemes(defaultTheme, data.theme);
        setTheme(mergedTheme);
        applyThemeToDocument(mergedTheme);
      }
      setIsLoading(false);
    });

    setSocket(newSocket);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      newSocket.close();
    };
  }, []);

  // Apply theme on mount
  useEffect(() => {
    applyThemeToDocument(theme);
  }, []);

  // Fetch saved themes from server
  useEffect(() => {
    fetchSavedThemes();
    fetchCurrentGlobalTheme();
  }, []);

  const fetchSavedThemes = async () => {
    try {
      const response = await fetch(`${SOCKET_URL}/api/themes`);
      const data = await response.json();
      if (data.success) {
        setSavedThemes(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching themes:', error);
    }
  };

  const fetchCurrentGlobalTheme = async () => {
    try {
      const response = await fetch(`${SOCKET_URL}/api/themes/global/current`);
      const data = await response.json();
      if (data.success && data.data) {
        const serverTheme = data.data.theme_data || data.data;
        const mergedTheme = mergeThemes(defaultTheme, serverTheme);
        setTheme(mergedTheme);
        applyThemeToDocument(mergedTheme);
      }
    } catch (error) {
      console.error('Error fetching global theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update theme locally and broadcast to all clients
  const updateTheme = useCallback((updates, broadcast = true) => {
    const newTheme = mergeThemes(theme, updates);
    
    // Save to history for undo
    setThemeHistory(prev => [...prev.slice(-9), theme]);
    
    setTheme(newTheme);
    applyThemeToDocument(newTheme);

    // Broadcast to all connected clients
    if (broadcast && socket && isConnected) {
      socket.emit('theme:update', { 
        theme: newTheme,
        timestamp: Date.now()
      });
    }

    return newTheme;
  }, [theme, socket, isConnected]);

  // Update a specific color
  const updateColor = useCallback((colorKey, value) => {
    updateTheme({
      colors: {
        ...theme.colors,
        [colorKey]: value
      }
    });
  }, [theme, updateTheme]);

  // Update card styling
  const updateCards = useCallback((updates) => {
    updateTheme({
      cards: {
        ...theme.cards,
        ...updates
      }
    });
  }, [theme, updateTheme]);

  // Update typography
  const updateTypography = useCallback((updates) => {
    updateTheme({
      typography: {
        ...theme.typography,
        ...updates
      }
    });
  }, [theme, updateTheme]);

  // Update borders
  const updateBorders = useCallback((updates) => {
    updateTheme({
      borders: {
        ...theme.borders,
        ...updates
      }
    });
  }, [theme, updateTheme]);

  // Undo last change
  const undoThemeChange = useCallback(() => {
    if (themeHistory.length > 0) {
      const previousTheme = themeHistory[themeHistory.length - 1];
      setThemeHistory(prev => prev.slice(0, -1));
      setTheme(previousTheme);
      applyThemeToDocument(previousTheme);
      
      if (socket && isConnected) {
        socket.emit('theme:update', { 
          theme: previousTheme,
          timestamp: Date.now()
        });
      }
    }
  }, [themeHistory, socket, isConnected]);

  // Reset to default theme
  const resetTheme = useCallback(() => {
    setThemeHistory(prev => [...prev.slice(-9), theme]);
    setTheme(defaultTheme);
    applyThemeToDocument(defaultTheme);
    
    if (socket && isConnected) {
      socket.emit('theme:update', { 
        theme: defaultTheme,
        timestamp: Date.now()
      });
    }
  }, [theme, socket, isConnected]);

  // Apply a preset theme
  const applyPreset = useCallback((preset) => {
    const newTheme = mergeThemes(defaultTheme, preset);
    setThemeHistory(prev => [...prev.slice(-9), theme]);
    setTheme(newTheme);
    applyThemeToDocument(newTheme);
    
    if (socket && isConnected) {
      socket.emit('theme:update', { 
        theme: newTheme,
        timestamp: Date.now()
      });
    }
  }, [theme, socket, isConnected]);

  // Save theme to server
  const saveTheme = useCallback(async (name) => {
    const themeToSave = {
      ...theme,
      name,
      id: theme.id || `theme-${Date.now()}`,
      updatedAt: new Date().toISOString()
    };

    try {
      const response = await fetch(`${SOCKET_URL}/api/themes/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(themeToSave)
      });
      
      const data = await response.json();
      if (data.success) {
        fetchSavedThemes();
        return { success: true, id: data.data.id };
      }
      return { success: false, error: data.error };
    } catch (error) {
      console.error('Error saving theme:', error);
      return { success: false, error: error.message };
    }
  }, [theme]);

  // Load a saved theme
  const loadTheme = useCallback((savedTheme) => {
    const themeData = savedTheme.theme_data || savedTheme;
    const mergedTheme = mergeThemes(defaultTheme, themeData);
    
    setThemeHistory(prev => [...prev.slice(-9), theme]);
    setTheme(mergedTheme);
    applyThemeToDocument(mergedTheme);
    
    if (socket && isConnected) {
      socket.emit('theme:update', { 
        theme: mergedTheme,
        timestamp: Date.now()
      });
    }
  }, [theme, socket, isConnected]);

  // Delete a saved theme
  const deleteTheme = useCallback(async (themeId) => {
    try {
      const response = await fetch(`${SOCKET_URL}/api/themes/${themeId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      if (data.success) {
        fetchSavedThemes();
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (error) {
      console.error('Error deleting theme:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Set as global theme (applies to all new clients)
  const setAsGlobalTheme = useCallback(async () => {
    const themeToSave = {
      ...theme,
      name: theme.name || 'Global Theme',
      id: 'global-theme',
      is_global: true,
      updatedAt: new Date().toISOString()
    };

    try {
      const response = await fetch(`${SOCKET_URL}/api/themes/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(themeToSave)
      });
      
      const data = await response.json();
      
      // Broadcast to all clients
      if (socket && isConnected) {
        socket.emit('theme:setGlobal', { 
          theme: theme,
          timestamp: Date.now()
        });
      }
      
      return { success: data.success };
    } catch (error) {
      console.error('Error setting global theme:', error);
      return { success: false, error: error.message };
    }
  }, [theme, socket, isConnected]);

  const value = {
    theme,
    setTheme: updateTheme,
    updateTheme,
    updateColor,
    updateCards,
    updateTypography,
    updateBorders,
    undoThemeChange,
    resetTheme,
    applyPreset,
    saveTheme,
    loadTheme,
    deleteTheme,
    setAsGlobalTheme,
    savedThemes,
    refreshSavedThemes: fetchSavedThemes,
    canUndo: themeHistory.length > 0,
    isConnected,
    isLoading,
    socket,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export default ThemeContext;
