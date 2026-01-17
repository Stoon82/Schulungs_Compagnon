import { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

/**
 * MarkdownImporter Component
 * Import Markdown files and convert to modules
 */
function MarkdownImporter({ onImportComplete }) {
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState('');

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.name.endsWith('.md') || selectedFile.name.endsWith('.markdown')) {
        setFile(selectedFile);
        setError(null);
        previewFile(selectedFile);
      } else {
        setError('Bitte wählen Sie eine .md oder .markdown Datei');
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith('.md') || droppedFile.name.endsWith('.markdown'))) {
      setFile(droppedFile);
      setError(null);
      previewFile(droppedFile);
    } else {
      setError('Bitte wählen Sie eine .md oder .markdown Datei');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const previewFile = async (file) => {
    const text = await file.text();
    setPreview(text);
  };

  const importMarkdown = async () => {
    if (!file) return;

    setImporting(true);
    setError(null);

    try {
      const text = await file.text();
      
      // Parse markdown into sections based on headers
      const lines = text.split('\n');
      const sections = [];
      let currentSection = null;

      lines.forEach((line) => {
        // Check for headers (# ## ###)
        const headerMatch = line.match(/^(#{1,3})\s+(.+)$/);
        
        if (headerMatch) {
          // Save previous section
          if (currentSection) {
            sections.push(currentSection);
          }
          
          // Start new section
          const level = headerMatch[1].length;
          const title = headerMatch[2].trim();
          
          currentSection = {
            title,
            level,
            content: [],
            type: 'content'
          };
        } else if (currentSection) {
          // Add content to current section
          currentSection.content.push(line);
        } else if (line.trim()) {
          // Content before first header
          if (!currentSection) {
            currentSection = {
              title: 'Einleitung',
              level: 1,
              content: [line],
              type: 'content'
            };
          }
        }
      });

      // Add last section
      if (currentSection) {
        sections.push(currentSection);
      }

      // Create module structure
      const moduleData = {
        title: file.name.replace(/\.(md|markdown)$/, ''),
        description: `Importiert von ${file.name}`,
        submodules: sections.map((section, index) => ({
          title: section.title,
          template_type: 'content',
          content: {
            text: section.content.join('\n').trim(),
            markdown: true
          },
          order_index: index
        }))
      };

      setResult({
        success: true,
        sectionsCount: sections.length,
        moduleData
      });

      if (onImportComplete) {
        onImportComplete(moduleData);
      }

    } catch (err) {
      console.error('Markdown import error:', err);
      setError(`Fehler beim Importieren: ${err.message}`);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-6 border border-white/10">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="text-purple-400" size={28} />
        <div>
          <h2 className="text-2xl font-bold text-white">Markdown Import</h2>
          <p className="text-sm text-gray-400">
            Importieren Sie .md Dateien als strukturierte Module
          </p>
        </div>
      </div>

      {/* Upload Area */}
      {!file && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-white/20 rounded-lg p-12 text-center hover:border-purple-400/50 transition-all cursor-pointer"
        >
          <input
            type="file"
            accept=".md,.markdown"
            onChange={handleFileSelect}
            className="hidden"
            id="md-upload"
          />
          <label htmlFor="md-upload" className="cursor-pointer">
            <Upload className="mx-auto mb-4 text-purple-400" size={48} />
            <p className="text-white font-semibold mb-2">
              Markdown-Datei hier ablegen oder klicken zum Auswählen
            </p>
            <p className="text-sm text-gray-400">
              Unterstützt: .md, .markdown
            </p>
          </label>
        </div>
      )}

      {/* Selected File */}
      {file && !result && (
        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <FileText className="text-purple-400" size={24} />
                <div>
                  <p className="text-white font-semibold">{file.name}</p>
                  <p className="text-sm text-gray-400">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setFile(null);
                  setPreview('');
                }}
                className="text-red-400 hover:text-red-300 text-sm"
              >
                Entfernen
              </button>
            </div>

            <button
              onClick={importMarkdown}
              disabled={importing}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold text-white hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {importing ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Importiere...
                </>
              ) : (
                <>
                  <Upload size={20} />
                  Importieren
                </>
              )}
            </button>
          </div>

          {/* Preview */}
          {preview && (
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="text-white font-semibold mb-3">Vorschau:</h3>
              <div className="max-h-96 overflow-y-auto prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{preview}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="text-green-400" size={24} />
            <div>
              <p className="text-white font-semibold">Import erfolgreich!</p>
              <p className="text-sm text-gray-400">
                {result.sectionsCount} Abschnitte importiert
              </p>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <p className="text-sm text-gray-300">
              <strong>Modul:</strong> {result.moduleData.title}
            </p>
            <p className="text-sm text-gray-300">
              <strong>Submodule:</strong> {result.moduleData.submodules.length}
            </p>
          </div>

          <button
            onClick={() => {
              setFile(null);
              setResult(null);
              setPreview('');
            }}
            className="w-full px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-semibold text-white transition-all"
          >
            Weitere Datei importieren
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="text-red-400" size={20} />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Info */}
      <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <p className="text-sm text-blue-300">
          <strong>💡 Tipp:</strong> Strukturieren Sie Ihre Markdown-Datei mit Überschriften (#, ##, ###).
          Jede Überschrift wird zu einem eigenen Submodul. Formatierungen wie **fett**, *kursiv*, Listen
          und Links werden unterstützt.
        </p>
      </div>
    </div>
  );
}

export default MarkdownImporter;
