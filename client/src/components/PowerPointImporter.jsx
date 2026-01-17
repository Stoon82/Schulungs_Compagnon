import { useState } from 'react';
import { Upload, FileText, Image, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import mammoth from 'mammoth';
import axios from 'axios';

/**
 * PowerPointImporter Component
 * Import PowerPoint presentations and convert to modules
 */
function PowerPointImporter({ onImportComplete }) {
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.name.endsWith('.pptx') || selectedFile.name.endsWith('.docx')) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Bitte wählen Sie eine .pptx oder .docx Datei');
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (droppedFile.name.endsWith('.pptx') || droppedFile.name.endsWith('.docx')) {
        setFile(droppedFile);
        setError(null);
      } else {
        setError('Bitte wählen Sie eine .pptx oder .docx Datei');
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const importFile = async () => {
    if (!file) return;

    setImporting(true);
    setProgress(0);
    setError(null);

    try {
      // Read file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      setProgress(20);

      // Extract content using mammoth (works for .docx, limited for .pptx)
      const result = await mammoth.convertToHtml({ arrayBuffer });
      setProgress(40);

      // Parse HTML content
      const parser = new DOMParser();
      const doc = parser.parseFromString(result.value, 'text/html');
      setProgress(60);

      // Extract slides/sections
      const slides = [];
      const headings = doc.querySelectorAll('h1, h2, h3');
      const paragraphs = doc.querySelectorAll('p');
      const images = doc.querySelectorAll('img');

      // Create slides from headings
      headings.forEach((heading, index) => {
        const slideContent = [];
        let nextHeading = headings[index + 1];
        
        // Get content between this heading and next
        let currentElement = heading.nextElementSibling;
        while (currentElement && currentElement !== nextHeading) {
          if (currentElement.tagName === 'P') {
            slideContent.push(currentElement.textContent);
          }
          currentElement = currentElement.nextElementSibling;
        }

        slides.push({
          title: heading.textContent,
          content: slideContent.join('\n\n'),
          type: 'content'
        });
      });

      // If no headings, create slides from paragraphs
      if (slides.length === 0) {
        let currentSlide = { title: 'Slide 1', content: '', type: 'content' };
        let slideCount = 1;

        paragraphs.forEach((p, index) => {
          const text = p.textContent.trim();
          if (text) {
            if (currentSlide.content.length > 500) {
              slides.push(currentSlide);
              slideCount++;
              currentSlide = { title: `Slide ${slideCount}`, content: text, type: 'content' };
            } else {
              currentSlide.content += (currentSlide.content ? '\n\n' : '') + text;
            }
          }
        });

        if (currentSlide.content) {
          slides.push(currentSlide);
        }
      }

      setProgress(80);

      // Create module structure
      const moduleData = {
        title: file.name.replace(/\.(pptx|docx)$/, ''),
        description: `Importiert von ${file.name}`,
        submodules: slides.map((slide, index) => ({
          title: slide.title,
          template_type: slide.type,
          content: {
            text: slide.content
          },
          order_index: index
        }))
      };

      setProgress(100);
      setResult({
        success: true,
        slidesCount: slides.length,
        moduleData
      });

      if (onImportComplete) {
        onImportComplete(moduleData);
      }

    } catch (err) {
      console.error('Import error:', err);
      setError(`Fehler beim Importieren: ${err.message}`);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-6 border border-white/10">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="text-blue-400" size={28} />
        <div>
          <h2 className="text-2xl font-bold text-white">PowerPoint/Word Import</h2>
          <p className="text-sm text-gray-400">
            Importieren Sie .pptx oder .docx Dateien als Module
          </p>
        </div>
      </div>

      {/* Upload Area */}
      {!file && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-white/20 rounded-lg p-12 text-center hover:border-blue-400/50 transition-all cursor-pointer"
        >
          <input
            type="file"
            accept=".pptx,.docx"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <Upload className="mx-auto mb-4 text-blue-400" size={48} />
            <p className="text-white font-semibold mb-2">
              Datei hier ablegen oder klicken zum Auswählen
            </p>
            <p className="text-sm text-gray-400">
              Unterstützt: .pptx, .docx (max. 50MB)
            </p>
          </label>
        </div>
      )}

      {/* Selected File */}
      {file && !result && (
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <FileText className="text-blue-400" size={24} />
              <div>
                <p className="text-white font-semibold">{file.name}</p>
                <p className="text-sm text-gray-400">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={() => setFile(null)}
              className="text-red-400 hover:text-red-300 text-sm"
            >
              Entfernen
            </button>
          </div>

          {importing && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Importiere...</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <button
            onClick={importFile}
            disabled={importing}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg font-semibold text-white hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
      )}

      {/* Result */}
      {result && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="text-green-400" size={24} />
            <div>
              <p className="text-white font-semibold">Import erfolgreich!</p>
              <p className="text-sm text-gray-400">
                {result.slidesCount} Slides importiert
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
              setProgress(0);
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
          <strong>Hinweis:</strong> Der Import extrahiert Text und Überschriften aus der Datei.
          Formatierungen, Animationen und eingebettete Medien werden möglicherweise nicht
          vollständig übernommen. Überprüfen Sie das importierte Modul und passen Sie es bei
          Bedarf an.
        </p>
      </div>
    </div>
  );
}

export default PowerPointImporter;
