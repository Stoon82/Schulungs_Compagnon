import { useState, useEffect } from 'react';
import { Download, Package, HardDrive, Image, Video, FileText, CheckSquare, AlertCircle } from 'lucide-react';
import JSZip from 'jszip';

/**
 * OfflinePackageExport - Create standalone offline packages
 * Generates ZIP files with modules, media, and standalone HTML
 */
function OfflinePackageExport({ modules = [], onClose }) {
  const [selectedModules, setSelectedModules] = useState([]);
  const [includeMedia, setIncludeMedia] = useState(true);
  const [inlineSmallMedia, setInlineSmallMedia] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [packageSize, setPackageSize] = useState(0);

  useEffect(() => {
    calculatePackageSize();
  }, [selectedModules, includeMedia]);

  const calculatePackageSize = async () => {
    let totalSize = 0;

    for (const moduleId of selectedModules) {
      try {
        const response = await fetch(`/api/module-creator/modules/${moduleId}/export?includeMedia=${includeMedia}`);
        const data = await response.json();

        if (data.success) {
          // Estimate module data size
          totalSize += JSON.stringify(data.data).length;

          // Estimate media size
          if (includeMedia && data.data.mediaReferences) {
            for (const mediaUrl of data.data.mediaReferences) {
              try {
                const mediaResponse = await fetch(mediaUrl, { method: 'HEAD' });
                const contentLength = mediaResponse.headers.get('content-length');
                if (contentLength) {
                  totalSize += parseInt(contentLength);
                }
              } catch (error) {
                // Estimate 1MB for media we can't check
                totalSize += 1024 * 1024;
              }
            }
          }
        }
      } catch (error) {
        console.error('Error calculating size:', error);
      }
    }

    setPackageSize(totalSize);
  };

  const generateOfflinePackage = async () => {
    if (selectedModules.length === 0) {
      alert('Bitte wählen Sie mindestens ein Modul aus');
      return;
    }

    setGenerating(true);
    setProgress(0);

    try {
      const zip = new JSZip();
      const modulesData = [];

      // Fetch all selected modules
      for (let i = 0; i < selectedModules.length; i++) {
        const moduleId = selectedModules[i];
        setProgress(((i + 1) / selectedModules.length) * 30);

        const response = await fetch(`/api/module-creator/modules/${moduleId}/export?includeMedia=${includeMedia}`);
        const data = await response.json();

        if (data.success) {
          modulesData.push(data.data);
        }
      }

      // Add modules JSON
      zip.file('modules.json', JSON.stringify(modulesData, null, 2));
      setProgress(40);

      // Download and add media files
      if (includeMedia) {
        const mediaFolder = zip.folder('media');
        const mediaUrls = new Set();

        // Collect all media URLs
        modulesData.forEach(moduleData => {
          if (moduleData.mediaReferences) {
            moduleData.mediaReferences.forEach(url => mediaUrls.add(url));
          }
        });

        let mediaIndex = 0;
        for (const mediaUrl of mediaUrls) {
          try {
            const response = await fetch(mediaUrl);
            const blob = await response.blob();
            const filename = mediaUrl.split('/').pop();

            // Inline small files as base64, include large files
            if (inlineSmallMedia && blob.size < 100 * 1024) { // < 100KB
              // Will be inlined in HTML
            } else {
              mediaFolder.file(filename, blob);
            }

            mediaIndex++;
            setProgress(40 + (mediaIndex / mediaUrls.size) * 30);
          } catch (error) {
            console.error('Error downloading media:', error);
          }
        }
      }

      setProgress(70);

      // Generate standalone HTML
      const html = generateStandaloneHTML(modulesData, includeMedia && inlineSmallMedia);
      zip.file('index.html', html);

      // Add CSS
      const css = generateStandaloneCSS();
      zip.file('styles.css', css);

      // Add JavaScript
      const js = generateStandaloneJS();
      zip.file('app.js', js);

      setProgress(90);

      // Generate ZIP file
      const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 9 }
      }, (metadata) => {
        setProgress(90 + (metadata.percent / 100) * 10);
      });

      // Download ZIP
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `schulungs-compagnon-offline-${Date.now()}.zip`;
      link.click();
      URL.revokeObjectURL(url);

      setProgress(100);
      alert('Offline-Paket erfolgreich erstellt!');
      
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error generating package:', error);
      alert('Fehler beim Erstellen des Offline-Pakets');
    } finally {
      setGenerating(false);
      setProgress(0);
    }
  };

  const generateStandaloneHTML = (modulesData, inlineMedia) => {
    return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Schulungs Compagnon - Offline</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div id="app">
    <div class="header">
      <h1>📚 Schulungs Compagnon</h1>
      <p class="offline-badge">Offline-Modus</p>
    </div>
    <div id="content"></div>
  </div>
  
  <script>
    window.MODULES_DATA = ${JSON.stringify(modulesData)};
  </script>
  <script src="app.js"></script>
</body>
</html>`;
  };

  const generateStandaloneCSS = () => {
    return `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
  min-height: 100vh;
  color: white;
}

.header {
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px;
  text-align: center;
}

.header h1 {
  font-size: 32px;
  margin-bottom: 10px;
}

.offline-badge {
  display: inline-block;
  padding: 6px 16px;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 20px;
  color: #fca5a5;
  font-size: 14px;
}

#content {
  max-width: 1200px;
  margin: 40px auto;
  padding: 20px;
}

.module-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.module-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(139, 92, 246, 0.5);
  transform: translateY(-2px);
}

.module-title {
  font-size: 24px;
  margin-bottom: 12px;
  background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.module-description {
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
}

.submodule {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 20px;
  margin-top: 16px;
}

.submodule-title {
  font-size: 18px;
  margin-bottom: 12px;
  color: #a78bfa;
}`;
  };

  const generateStandaloneJS = () => {
    return `// Standalone Module Viewer
document.addEventListener('DOMContentLoaded', () => {
  const content = document.getElementById('content');
  const modulesData = window.MODULES_DATA;

  // Render module list
  modulesData.forEach((moduleData, index) => {
    const module = moduleData.module;
    const submodules = moduleData.submodules;

    const card = document.createElement('div');
    card.className = 'module-card';
    card.innerHTML = \`
      <h2 class="module-title">\${module.title}</h2>
      <p class="module-description">\${module.description || ''}</p>
      <div class="submodules" id="submodules-\${index}" style="display: none;"></div>
    \`;

    card.addEventListener('click', () => {
      const submodulesDiv = document.getElementById(\`submodules-\${index}\`);
      if (submodulesDiv.style.display === 'none') {
        submodulesDiv.style.display = 'block';
        renderSubmodules(submodules, submodulesDiv);
      } else {
        submodulesDiv.style.display = 'none';
      }
    });

    content.appendChild(card);
  });
});

function renderSubmodules(submodules, container) {
  container.innerHTML = '';
  submodules.forEach(sub => {
    const subDiv = document.createElement('div');
    subDiv.className = 'submodule';
    subDiv.innerHTML = \`
      <h3 class="submodule-title">\${sub.title}</h3>
      <div class="submodule-content">\${renderContent(sub.content, sub.template_type)}</div>
    \`;
    container.appendChild(subDiv);
  });
}

function renderContent(content, type) {
  if (!content) return '<p>Kein Inhalt verfügbar</p>';
  
  switch(type) {
    case 'title':
      return \`<h1>\${content.title || ''}</h1><p>\${content.subtitle || ''}</p>\`;
    case 'content':
      return \`<div>\${content.text || ''}</div>\`;
    case 'media':
      if (content.mediaType === 'image') {
        return \`<img src="\${content.mediaUrl}" alt="\${content.caption || ''}" style="max-width: 100%; border-radius: 8px;">\`;
      }
      return \`<p>Media: \${content.mediaUrl}</p>\`;
    default:
      return \`<pre>\${JSON.stringify(content, null, 2)}</pre>\`;
  }
}`;
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

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-black/30 backdrop-blur-lg border-b border-white/10 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Package size={24} />
                Offline-Paket erstellen
              </h2>
              <p className="text-sm text-gray-400">
                Erstellen Sie ein eigenständiges Offline-Paket zum Download
              </p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all"
              >
                Schließen
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Options */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Optionen</h3>
              
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeMedia}
                    onChange={(e) => setIncludeMedia(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-500"
                  />
                  <Image size={16} />
                  Medien einschließen (Bilder, Videos)
                </label>

                {includeMedia && (
                  <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer ml-6">
                    <input
                      type="checkbox"
                      checked={inlineSmallMedia}
                      onChange={(e) => setInlineSmallMedia(e.target.checked)}
                      className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-500"
                    />
                    Kleine Dateien als Base64 einbetten (&lt; 100KB)
                  </label>
                )}
              </div>
            </div>

            {/* Package Size Estimate */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <HardDrive size={24} className="text-blue-400" />
                <div>
                  <p className="text-sm text-blue-400 font-medium">Geschätzte Paketgröße</p>
                  <p className="text-2xl font-bold text-white">{formatSize(packageSize)}</p>
                </div>
              </div>
            </div>

            {/* Module Selection */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-white">Module auswählen</h3>
                <button
                  onClick={selectAll}
                  className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                >
                  {selectedModules.length === modules.length ? 'Alle abwählen' : 'Alle auswählen'}
                </button>
              </div>

              <p className="text-sm text-gray-400 mb-3">
                {selectedModules.length} von {modules.length} ausgewählt
              </p>

              <div className="max-h-64 overflow-y-auto space-y-2">
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
                    {selectedModules.includes(module.id) && (
                      <CheckSquare size={18} className="text-green-400" />
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-400">
                  <p className="font-medium mb-1">Hinweis:</p>
                  <p>Das Offline-Paket enthält eine eigenständige HTML-Datei mit allen ausgewählten Modulen. Es kann ohne Internetverbindung im Browser geöffnet werden.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-black/30 border-t border-white/10 px-6 py-4">
          {generating ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>Paket wird erstellt...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <button
              onClick={generateOfflinePackage}
              disabled={selectedModules.length === 0}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold text-white hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Download size={20} />
              Offline-Paket herunterladen
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default OfflinePackageExport;
