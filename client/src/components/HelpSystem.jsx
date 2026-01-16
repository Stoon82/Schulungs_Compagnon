import { useState } from 'react';
import { HelpCircle, X, ChevronRight } from 'lucide-react';

function HelpSystem() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);

  const helpTopics = {
    'getting-started': {
      title: 'Erste Schritte',
      icon: '🚀',
      items: [
        {
          question: 'Wie trete ich der Schulung bei?',
          answer: 'Gib einfach deinen Nickname ein und klicke auf "Loslegen". Du erhältst automatisch einen einzigartigen Avatar.'
        },
        {
          question: 'Was sind Module?',
          answer: 'Module sind Lerneinheiten, die nacheinander freigeschaltet werden. Folge der Reihenfolge für die beste Lernerfahrung.'
        }
      ]
    },
    'mood-bar': {
      title: 'Mood Bar',
      icon: '😊',
      items: [
        {
          question: 'Wofür ist die Mood Bar?',
          answer: 'Die Mood Bar ermöglicht es dir, deine Reaktionen in Echtzeit zu teilen. Der Trainer sieht deine Stimmung und kann das Tempo anpassen.'
        },
        {
          question: 'Wann sollte ich "Pause" drücken?',
          answer: 'Drücke "Pause bitte", wenn du eine kurze Unterbrechung brauchst. Der Trainer wird benachrichtigt.'
        },
        {
          question: 'Was bedeutet "Überfordert"?',
          answer: 'Wenn du dich überfordert fühlst, drücke diesen Button. Es ist völlig okay, um Hilfe zu bitten!'
        }
      ]
    },
    'sandbox': {
      title: 'Sandbox',
      icon: '💻',
      items: [
        {
          question: 'Was kann ich im Sandbox erstellen?',
          answer: 'Du kannst HTML, CSS und JavaScript Code schreiben und Mini-Apps erstellen. Experimentiere frei!'
        },
        {
          question: 'Wie teile ich meine App?',
          answer: 'Klicke auf "Veröffentlichen" um deine App in der Gallery zu teilen. Andere können sie sehen und bewerten.'
        }
      ]
    },
    'chat': {
      title: 'KI-Chat',
      icon: '🤖',
      items: [
        {
          question: 'Wie nutze ich den KI-Assistenten?',
          answer: 'Stelle einfach deine Frage im Chat. Der KI-Assistent ist speziell für ABW-Kontext trainiert.'
        },
        {
          question: 'Gibt es ein Limit?',
          answer: 'Ja, du kannst 10 Nachrichten pro Minute senden. Das verhindert Überlastung.'
        }
      ]
    },
    'troubleshooting': {
      title: 'Probleme lösen',
      icon: '🔧',
      items: [
        {
          question: 'Verbindung verloren?',
          answer: 'Prüfe dein WLAN und aktualisiere die Seite (F5). Melde dich ggf. neu an.'
        },
        {
          question: 'Mood Bar reagiert nicht?',
          answer: 'Schließe und öffne die Mood Bar neu. Wenn das nicht hilft, aktualisiere die Seite.'
        },
        {
          question: 'App lädt nicht?',
          answer: 'Versuche einen Hard Refresh (Ctrl + Shift + R) oder lösche den Browser-Cache.'
        }
      ]
    }
  };

  const toggleHelp = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setActiveCategory(null);
    }
  };

  return (
    <>
      {/* Help Button */}
      <button
        onClick={toggleHelp}
        className="fixed bottom-6 left-6 w-14 h-14 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-40 group"
        aria-label="Hilfe öffnen"
      >
        <HelpCircle size={28} className="text-white group-hover:scale-110 transition-transform" />
      </button>

      {/* Help Panel */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-white/10 shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <HelpCircle size={24} className="text-white" />
                <h2 className="text-2xl font-bold text-white">Hilfe & Support</h2>
              </div>
              <button
                onClick={toggleHelp}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-all"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
              {!activeCategory ? (
                // Category List
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(helpTopics).map(([key, category]) => (
                    <button
                      key={key}
                      onClick={() => setActiveCategory(key)}
                      className="bg-white/5 hover:bg-white/10 rounded-xl p-6 border border-white/10 transition-all text-left group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-4xl">{category.icon}</span>
                          <div>
                            <h3 className="text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors">
                              {category.title}
                            </h3>
                            <p className="text-sm text-gray-400">
                              {category.items.length} Themen
                            </p>
                          </div>
                        </div>
                        <ChevronRight size={24} className="text-gray-400 group-hover:text-cyan-400 transition-colors" />
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                // Topic Details
                <div>
                  <button
                    onClick={() => setActiveCategory(null)}
                    className="text-cyan-400 hover:text-cyan-300 mb-6 flex items-center gap-2"
                  >
                    <ChevronRight size={20} className="rotate-180" />
                    <span>Zurück</span>
                  </button>

                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-5xl">{helpTopics[activeCategory].icon}</span>
                    <h3 className="text-2xl font-bold text-white">
                      {helpTopics[activeCategory].title}
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {helpTopics[activeCategory].items.map((item, index) => (
                      <div
                        key={index}
                        className="bg-white/5 rounded-xl p-5 border border-white/10"
                      >
                        <h4 className="text-lg font-semibold text-white mb-2">
                          {item.question}
                        </h4>
                        <p className="text-gray-300 leading-relaxed">
                          {item.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <p className="text-center text-gray-400 text-sm">
                  Brauchst du weitere Hilfe? Frage den Trainer oder nutze den KI-Chat! 💬
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default HelpSystem;
