import { X, Keyboard } from 'lucide-react';

function KeyboardShortcutsHelp({ onClose }) {
  const shortcuts = [
    { key: '←', description: 'Vorheriges Submodul' },
    { key: '→', description: 'Nächstes Submodul' },
    { key: '1-9', description: 'Zu Submodul springen' },
    { key: 'Space', description: 'Auto-Play pausieren/fortsetzen' },
    { key: 'F', description: 'Vollbildmodus umschalten' },
    { key: 'P', description: 'Präsentator-Notizen anzeigen/verstecken' },
    { key: 'G', description: 'Übersicht anzeigen/verstecken' },
    { key: 'Ctrl+S', description: 'Alle Clients synchronisieren' },
    { key: 'Home', description: 'Zum ersten Submodul' },
    { key: 'End', description: 'Zum letzten Submodul' },
    { key: 'Esc', description: 'Modul verlassen' },
    { key: '?', description: 'Diese Hilfe anzeigen' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-white/20 max-w-2xl w-full">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Keyboard size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Tastaturkürzel</h2>
              <p className="text-sm text-gray-400">Schnelle Navigation und Steuerung</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-all text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shortcuts.map((shortcut, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
              >
                <span className="text-gray-300">{shortcut.description}</span>
                <kbd className="px-3 py-1.5 bg-white/10 border border-white/20 rounded text-white font-mono text-sm">
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-blue-400">
              💡 <strong>Tipp:</strong> Drücken Sie <kbd className="px-2 py-1 bg-white/10 rounded text-xs">?</kbd> jederzeit, um diese Hilfe anzuzeigen.
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-white/10">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold text-white hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            Verstanden
          </button>
        </div>
      </div>
    </div>
  );
}

export default KeyboardShortcutsHelp;
