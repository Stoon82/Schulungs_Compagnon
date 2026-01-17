import { useState, useEffect } from 'react';
import { Download, RefreshCw, X, AlertCircle } from 'lucide-react';

/**
 * UpdateNotification - Notifies users of app updates
 * Implements version checking and update mechanism
 */
function UpdateNotification() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [currentVersion, setCurrentVersion] = useState('1.0.0');
  const [latestVersion, setLatestVersion] = useState('1.0.0');
  const [updating, setUpdating] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    checkForUpdates();
    
    // Check for updates every 30 minutes
    const interval = setInterval(checkForUpdates, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const checkForUpdates = async () => {
    try {
      // Get current version from package.json or manifest
      const manifestResponse = await fetch('/manifest.json');
      const manifest = await manifestResponse.json();
      const current = manifest.version || '1.0.0';
      setCurrentVersion(current);

      // Check server for latest version
      const versionResponse = await fetch('/api/version');
      const versionData = await versionResponse.json();
      
      if (versionData.success) {
        const latest = versionData.version;
        setLatestVersion(latest);

        // Compare versions
        if (isNewerVersion(latest, current)) {
          setUpdateAvailable(true);
          setShowNotification(true);
        }
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
    }
  };

  const isNewerVersion = (latest, current) => {
    const latestParts = latest.split('.').map(Number);
    const currentParts = current.split('.').map(Number);

    for (let i = 0; i < 3; i++) {
      if (latestParts[i] > currentParts[i]) return true;
      if (latestParts[i] < currentParts[i]) return false;
    }
    return false;
  };

  const handleUpdate = async () => {
    setUpdating(true);

    try {
      // Clear service worker cache
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      }

      // Clear browser cache
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }

      // Reload the page to get the latest version
      window.location.reload(true);
    } catch (error) {
      console.error('Error updating:', error);
      setUpdating(false);
      alert('Fehler beim Aktualisieren. Bitte laden Sie die Seite manuell neu.');
    }
  };

  const handleDismiss = () => {
    setShowNotification(false);
  };

  if (!showNotification || !updateAvailable) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Download size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Update verfügbar</h3>
              <p className="text-white/80 text-sm">
                Version {latestVersion}
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-2 hover:bg-white/20 rounded-lg transition-all"
          >
            <X size={18} className="text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-300">
              <p className="mb-2">
                Eine neue Version der Anwendung ist verfügbar. Aktualisieren Sie jetzt, um die neuesten Funktionen und Verbesserungen zu erhalten.
              </p>
              <p className="text-xs text-gray-400">
                Aktuelle Version: {currentVersion}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleUpdate}
              disabled={updating}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold text-white hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {updating ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  Aktualisiere...
                </>
              ) : (
                <>
                  <Download size={18} />
                  Jetzt aktualisieren
                </>
              )}
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg font-semibold text-gray-300 transition-all"
            >
              Später
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UpdateNotification;
