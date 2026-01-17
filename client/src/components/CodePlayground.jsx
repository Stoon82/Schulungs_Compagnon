import { useState, useRef, useEffect } from 'react';
import { Play, RotateCcw, Download, Copy, Check, AlertCircle } from 'lucide-react';
import Editor from '@monaco-editor/react';

/**
 * CodePlayground Component
 * Interactive code editor with live execution
 */
function CodePlayground({ initialCode = '', language = 'javascript', readOnly = false }) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState('');
  const [error, setError] = useState(null);
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const editorRef = useRef(null);

  const languageConfig = {
    javascript: {
      name: 'JavaScript',
      runner: runJavaScript,
      template: '// Schreiben Sie Ihren JavaScript-Code hier\nconsole.log("Hello World!");'
    },
    python: {
      name: 'Python',
      runner: runPython,
      template: '# Schreiben Sie Ihren Python-Code hier\nprint("Hello World!")'
    },
    html: {
      name: 'HTML/CSS/JS',
      runner: runHTML,
      template: '<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    body { font-family: Arial; }\n  </style>\n</head>\n<body>\n  <h1>Hello World!</h1>\n</body>\n</html>'
    }
  };

  useEffect(() => {
    if (!initialCode && languageConfig[language]) {
      setCode(languageConfig[language].template);
    }
  }, [language]);

  function runJavaScript(code) {
    const logs = [];
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    // Override console methods
    console.log = (...args) => logs.push(args.join(' '));
    console.error = (...args) => logs.push('ERROR: ' + args.join(' '));
    console.warn = (...args) => logs.push('WARNING: ' + args.join(' '));

    try {
      // Create a safe execution context
      const result = eval(code);
      if (result !== undefined) {
        logs.push('→ ' + String(result));
      }
      return { output: logs.join('\n'), error: null };
    } catch (err) {
      return { output: logs.join('\n'), error: err.message };
    } finally {
      // Restore console methods
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    }
  }

  function runPython(code) {
    // Note: This is a placeholder. Real Python execution would require a backend service
    // or a library like Pyodide for client-side execution
    return {
      output: 'Python-Ausführung erfordert Backend-Integration.\nVerwenden Sie einen Python-Interpreter-Service.',
      error: null
    };
  }

  function runHTML(code) {
    // Create an iframe to render HTML
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      iframeDoc.open();
      iframeDoc.write(code);
      iframeDoc.close();

      // Return the rendered HTML
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 100);

      return {
        output: 'HTML erfolgreich gerendert. Siehe Vorschau unten.',
        error: null,
        html: code
      };
    } catch (err) {
      document.body.removeChild(iframe);
      return { output: '', error: err.message };
    }
  }

  const runCode = () => {
    setRunning(true);
    setOutput('');
    setError(null);

    setTimeout(() => {
      const config = languageConfig[language];
      if (config && config.runner) {
        const result = config.runner(code);
        setOutput(result.output);
        setError(result.error);
      } else {
        setError('Sprache nicht unterstützt');
      }
      setRunning(false);
    }, 100);
  };

  const resetCode = () => {
    const config = languageConfig[language];
    if (config) {
      setCode(config.template);
      setOutput('');
      setError(null);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCode = () => {
    const extensions = { javascript: 'js', python: 'py', html: 'html' };
    const ext = extensions[language] || 'txt';
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-sm text-gray-400 ml-4">
            {languageConfig[language]?.name || language}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyCode}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
            title="Code kopieren"
          >
            {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
          </button>
          <button
            onClick={downloadCode}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
            title="Code herunterladen"
          >
            <Download size={18} />
          </button>
          <button
            onClick={resetCode}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
            title="Zurücksetzen"
          >
            <RotateCcw size={18} />
          </button>
          <button
            onClick={runCode}
            disabled={running || readOnly}
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg font-semibold text-white hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <Play size={18} />
            Ausführen
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="h-96">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={(value) => setCode(value || '')}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            readOnly: readOnly,
            automaticLayout: true
          }}
        />
      </div>

      {/* Output */}
      {(output || error) && (
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-gray-400">Ausgabe:</span>
          </div>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-3 flex items-start gap-3">
              <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-sm font-semibold text-red-400 mb-1">Fehler</p>
                <pre className="text-sm text-red-300 font-mono whitespace-pre-wrap">{error}</pre>
              </div>
            </div>
          )}

          {output && (
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">{output}</pre>
            </div>
          )}

          {/* HTML Preview */}
          {language === 'html' && !error && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-gray-400 mb-2">Vorschau:</p>
              <div className="bg-white rounded-lg p-4 border border-white/10">
                <iframe
                  srcDoc={code}
                  className="w-full h-64 border-0"
                  title="HTML Preview"
                  sandbox="allow-scripts"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info */}
      <div className="border-t border-white/10 p-4 bg-blue-500/5">
        <p className="text-xs text-blue-300">
          <strong>💡 Tipp:</strong> Drücken Sie Strg+Enter (Cmd+Enter auf Mac) um den Code auszuführen.
          {language === 'javascript' && ' Verwenden Sie console.log() für Ausgaben.'}
        </p>
      </div>
    </div>
  );
}

export default CodePlayground;
