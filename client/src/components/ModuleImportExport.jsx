import { useState } from 'react';
import { Download, Upload, Package, FileJson, AlertCircle, CheckCircle } from 'lucide-react';

/**
 * ModuleImportExport - Import and export modules as JSON packages
 * Supports single module export and bulk operations
 */
function ModuleImportExport({ modules = [], onImportComplete }) {
  const [selectedModules, setSelectedModules] = useState([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [includeMedia, setIncludeMedia] = useState(true);

  const handleExportSingle = async (moduleId) => {
    try {
      const response = await fetch(`/api/module-creator/modules/${moduleId}/export?includeMedia=${includeMedia}`);
      const data = await response.json();

      if (data.success) {
        // Create and download JSON file
        const dataStr = JSON.stringify(data.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `module-${data.data.module.title.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Fehler beim Exportieren des Moduls');
    }
  };

  const handleExportBulk = async () => {
    if (selectedModules.length === 0) {
      alert('Bitte wählen Sie mindestens ein Modul aus');
      return;
    }

    try {
      const response = await fetch('/api/module-creator/modules/export-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleIds: selectedModules,
          includeMedia
        })
      });

      const data = await response.json();

      if (data.success) {
        // Create and download JSON file
        const dataStr = JSON.stringify(data.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `modules-export-${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url);

        setSelectedModules([]);
      }
    } catch (error) {
      console.error('Bulk export error:', error);
      alert('Fehler beim Exportieren der Module');
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImporting(true);
    setImportResult(null);

    try {
      const fileContent = await file.text();
      const importData = JSON.parse(fileContent);

      // Validate import data
      if (!importData.modules && !importData.module) {
        throw new Error('Ungültiges Importformat');
      }

      const response = await fetch('/api/module-creator/modules/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(importData)
      });

      const data = await response.json();

      if (data.success) {
        setImportResult({
          success: true,
          message: `${data.data.imported} Modul(e) erfolgreich importiert`,
          details: data.data
        });

        if (onImportComplete) {
          onImportComplete();
        }
      } else {
        setImportResult({
          success: false,
          message: data.error || 'Import fehlgeschlagen',
          details: data.details
        });
      }
    } catch (error) {
      console.error('Import error:', error);
      setImportResult({
        success: false,
        message: error.message || 'Fehler beim Importieren',
        details: null
      });
    } finally {
      setImporting(false);
      event.target.value = ''; // Reset file input
    }
  };

  const toggleModuleSelection = (moduleId) => {
    if (selectedModules.includes(moduleId)) {
      setSelectedModules(selectedModules.filter(id => id !== moduleId));
    } else {
      setSelectedModules([...selectedModules, moduleId]);
    }
  };

  const selectAll = () => {
    if (selectedModules.length === modules.length) {
      setSelectedModules([]);
    } else {
      setSelectedModules(modules.map(m => m.id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Import Section */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Upload size={20} />
          Module importieren
        </h3>

        <div className="space-y-4">
          <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
            <FileJson size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-white font-medium mb-2">
              JSON-Datei auswählen
            </p>
            <p className="text-sm text-gray-400 mb-4">
              Importieren Sie Module aus einer zuvor exportierten JSON-Datei
            </p>
            
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
              id="import-file"
              disabled={importing}
            />
            <label
              htmlFor="import-file"
              className={`inline-block px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all cursor-pointer ${
                importing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {importing ? 'Importiere...' : 'Datei auswählen'}
            </label>
          </div>

          {/* Import Result */}
          {importResult && (
            <div className={`p-4 rounded-lg border ${
              importResult.success
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-red-500/10 border-red-500/30'
            }`}>
              <div className="flex items-start gap-3">
                {importResult.success ? (
                  <CheckCircle size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className={`font-medium ${
                    importResult.success ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {importResult.message}
                  </p>
                  {importResult.details && (
                    <pre className="mt-2 text-xs text-gray-400 overflow-x-auto">
                      {JSON.stringify(importResult.details, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Download size={20} />
          Module exportieren
        </h3>

        <div className="space-y-4">
          {/* Options */}
          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={includeMedia}
              onChange={(e) => setIncludeMedia(e.target.checked)}
              className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-500"
            />
            Medien-Referenzen einschließen
          </label>

          {/* Bulk Selection */}
          {modules.length > 0 && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">
                  {selectedModules.length} von {modules.length} ausgewählt
                </p>
                <button
                  onClick={selectAll}
                  className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                >
                  {selectedModules.length === modules.length ? 'Alle abwählen' : 'Alle auswählen'}
                </button>
              </div>

              {/* Module List */}
              <div className="max-h-64 overflow-y-auto space-y-2 bg-black/20 rounded-lg p-3">
                {modules.map(module => (
                  <label
                    key={module.id}
                    className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition-all"
                  >
                    <input
                      type="checkbox"
                      checked={selectedModules.includes(module.id)}
                      onChange={() => toggleModuleSelection(module.id)}
                      className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-500"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{module.title}</p>
                      <p className="text-xs text-gray-400 truncate">{module.description}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleExportSingle(module.id);
                      }}
                      className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded text-xs transition-all"
                    >
                      Einzeln
                    </button>
                  </label>
                ))}
              </div>

              {/* Bulk Export Button */}
              <button
                onClick={handleExportBulk}
                disabled={selectedModules.length === 0}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold text-white hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Package size={20} />
                {selectedModules.length} Modul(e) exportieren
              </button>
            </>
          )}

          {modules.length === 0 && (
            <p className="text-center text-gray-400 py-8">
              Keine Module zum Exportieren verfügbar
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ModuleImportExport;
