import { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import axios from 'axios';

// Set worker path
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * PDFImporter Component
 * Import PDF documents and convert to modules
 */
function PDFImporter({ onImportComplete }) {
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Bitte wählen Sie eine PDF-Datei');
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
      setError(null);
    } else {
      setError('Bitte wählen Sie eine PDF-Datei');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const importPDF = async () => {
    if (!file) return;

    setImporting(true);
    setProgress(0);
    setError(null);

    try {
      // Read PDF file
      const arrayBuffer = await file.arrayBuffer();
      setProgress(10);

      // Load PDF document
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      setProgress(20);

      const slides = [];
      const progressPerPage = 60 / numPages;

      // Extract text from each page
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Combine text items
        const pageText = textContent.items
          .map(item => item.str)
          .join(' ')
          .trim();

        if (pageText) {
          // Try to detect title (first line or largest text)
          const lines = pageText.split('\n').filter(l => l.trim());
          const title = lines[0] || `Seite ${pageNum}`;
          const content = lines.slice(1).join('\n\n') || pageText;

          slides.push({
            title: title.substring(0, 100), // Limit title length
            content: content,
            type: 'content',
            pageNumber: pageNum
          });
        }

        setProgress(20 + (pageNum * progressPerPage));
      }

      setProgress(90);

      // Create module structure
      const moduleData = {
        title: file.name.replace('.pdf', ''),
        description: `Importiert von ${file.name} (${numPages} Seiten)`,
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
        pagesCount: numPages,
        slidesCount: slides.length,
        moduleData
      });

      if (onImportComplete) {
        onImportComplete(moduleData);
      }

    } catch (err) {
      console.error('PDF import error:', err);
      setError(`Fehler beim Importieren: ${err.message}`);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-6 border border-white/10">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="text-red-400" size={28} />
        <div>
          <h2 className="text-2xl font-bold text-white">PDF Import</h2>
          <p className="text-sm text-gray-400">
            Importieren Sie PDF-Dokumente als Module
          </p>
        </div>
      </div>

      {/* Upload Area */}
      {!file && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-white/20 rounded-lg p-12 text-center hover:border-red-400/50 transition-all cursor-pointer"
        >
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
            id="pdf-upload"
          />
          <label htmlFor="pdf-upload" className="cursor-pointer">
            <Upload className="mx-auto mb-4 text-red-400" size={48} />
            <p className="text-white font-semibold mb-2">
              PDF hier ablegen oder klicken zum Auswählen
            </p>
            <p className="text-sm text-gray-400">
              Unterstützt: .pdf (max. 100MB)
            </p>
          </label>
        </div>
      )}

      {/* Selected File */}
      {file && !result && (
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <FileText className="text-red-400" size={24} />
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
                <span>Importiere PDF...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <button
            onClick={importPDF}
            disabled={importing}
            className="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg font-semibold text-white hover:from-red-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {importing ? (
              <>
                <Loader className="animate-spin" size={20} />
                Importiere...
              </>
            ) : (
              <>
                <Upload size={20} />
                PDF Importieren
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
                {result.pagesCount} Seiten, {result.slidesCount} Submodule erstellt
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
            Weitere PDF importieren
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
          <strong>Hinweis:</strong> Der PDF-Import extrahiert nur Text. Bilder, Grafiken und
          spezielle Formatierungen werden nicht übernommen. Für beste Ergebnisse verwenden Sie
          PDFs mit klarer Textstruktur.
        </p>
      </div>
    </div>
  );
}

export default PDFImporter;
