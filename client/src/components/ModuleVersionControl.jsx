import { useState, useEffect } from 'react';
import { History, Save, RotateCcw, Eye, GitBranch, Clock, User } from 'lucide-react';

/**
 * ModuleVersionControl - Version history and restore functionality
 * Allows saving versions, viewing history, and restoring previous versions
 */
function ModuleVersionControl({ moduleId, currentModuleData, onRestore }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [changeSummary, setChangeSummary] = useState('');

  useEffect(() => {
    if (moduleId) {
      loadVersions();
    }
  }, [moduleId]);

  const loadVersions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/module-creator/modules/${moduleId}/versions`);
      const data = await response.json();
      
      if (data.success) {
        setVersions(data.data);
      }
    } catch (error) {
      console.error('Error loading versions:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveNewVersion = async () => {
    if (!changeSummary.trim()) {
      alert('Bitte geben Sie eine Änderungszusammenfassung ein');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/module-creator/modules/${moduleId}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleData: currentModuleData,
          changeSummary
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setChangeSummary('');
        loadVersions();
        alert('Version gespeichert!');
      }
    } catch (error) {
      console.error('Error saving version:', error);
      alert('Fehler beim Speichern der Version');
    } finally {
      setSaving(false);
    }
  };

  const restoreVersion = async (versionId) => {
    if (!confirm('Möchten Sie diese Version wirklich wiederherstellen?')) return;

    try {
      const response = await fetch(`/api/module-creator/modules/${moduleId}/versions/${versionId}/restore`, {
        method: 'POST'
      });

      const data = await response.json();
      
      if (data.success && onRestore) {
        onRestore(data.data);
        alert('Version wiederhergestellt!');
      }
    } catch (error) {
      console.error('Error restoring version:', error);
      alert('Fehler beim Wiederherstellen der Version');
    }
  };

  const viewVersionDetails = (version) => {
    setSelectedVersion(version);
  };

  return (
    <div className="space-y-6">
      {/* Save New Version */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Save size={20} />
          Neue Version speichern
        </h3>
        
        <div className="space-y-3">
          <textarea
            value={changeSummary}
            onChange={(e) => setChangeSummary(e.target.value)}
            placeholder="Beschreiben Sie die Änderungen in dieser Version..."
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[80px]"
          />
          
          <button
            onClick={saveNewVersion}
            disabled={saving || !changeSummary.trim()}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold text-white hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Save size={20} />
            {saving ? 'Speichert...' : 'Version speichern'}
          </button>
        </div>
      </div>

      {/* Version History */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <History size={20} />
          Versionshistorie
        </h3>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : versions.length === 0 ? (
          <p className="text-gray-400 text-center py-8">
            Noch keine Versionen gespeichert
          </p>
        ) : (
          <div className="space-y-3">
            {versions.map((version, index) => (
              <div
                key={version.id}
                className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-purple-500/50 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs font-semibold">
                        v{version.version_number}
                      </span>
                      {version.is_published === 1 && (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                          Veröffentlicht
                        </span>
                      )}
                      {index === 0 && (
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                          Aktuell
                        </span>
                      )}
                    </div>

                    <p className="text-white font-medium mb-2">{version.change_summary}</p>

                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <User size={12} />
                        {version.created_by}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(version.created_at).toLocaleString('de-DE')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => viewVersionDetails(version)}
                      className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg transition-all"
                      title="Details anzeigen"
                    >
                      <Eye size={18} />
                    </button>
                    {index !== 0 && (
                      <button
                        onClick={() => restoreVersion(version.id)}
                        className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all"
                        title="Wiederherstellen"
                      >
                        <RotateCcw size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Version Details Modal */}
      {selectedVersion && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-white/10 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-black/30 border-b border-white/10 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">
                Version {selectedVersion.version_number} Details
              </h3>
              <button
                onClick={() => setSelectedVersion(null)}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all"
              >
                Schließen
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Änderungszusammenfassung</p>
                  <p className="text-white">{selectedVersion.change_summary}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Erstellt von</p>
                    <p className="text-white">{selectedVersion.created_by}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Erstellt am</p>
                    <p className="text-white">{new Date(selectedVersion.created_at).toLocaleString('de-DE')}</p>
                  </div>
                </div>

                <div>
                  <p className="text-gray-400 text-sm mb-2">Modul-Snapshot</p>
                  <pre className="bg-black/20 border border-white/10 rounded-lg p-4 text-xs text-gray-300 overflow-x-auto max-h-96">
                    {JSON.stringify(JSON.parse(selectedVersion.content), null, 2)}
                  </pre>
                </div>
              </div>
            </div>

            <div className="bg-black/30 border-t border-white/10 px-6 py-4">
              <button
                onClick={() => {
                  restoreVersion(selectedVersion.id);
                  setSelectedVersion(null);
                }}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg font-semibold text-white hover:from-blue-600 hover:to-cyan-600 transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw size={20} />
                Diese Version wiederherstellen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ModuleVersionControl;
