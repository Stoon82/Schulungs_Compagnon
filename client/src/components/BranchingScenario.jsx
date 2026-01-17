import { useState, useEffect } from 'react';
import { GitBranch, ArrowRight, CheckCircle, XCircle, RotateCcw } from 'lucide-react';

/**
 * BranchingScenario Component
 * Interactive decision-based learning paths
 */
function BranchingScenario({ scenario, onComplete }) {
  const [currentNode, setCurrentNode] = useState(null);
  const [history, setHistory] = useState([]);
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (scenario && scenario.nodes) {
      const startNode = scenario.nodes.find(n => n.isStart) || scenario.nodes[0];
      setCurrentNode(startNode);
      setHistory([startNode.id]);
    }
  }, [scenario]);

  const handleChoice = (choice) => {
    if (!choice || !choice.nextNodeId) return;

    const nextNode = scenario.nodes.find(n => n.id === choice.nextNodeId);
    
    if (nextNode) {
      // Update score if choice has points
      if (choice.points) {
        setScore(prev => prev + choice.points);
      }

      // Add to history
      setHistory(prev => [...prev, nextNode.id]);

      // Check if this is an end node
      if (nextNode.isEnd) {
        setCompleted(true);
        if (onComplete) {
          onComplete({
            score,
            path: history,
            endNode: nextNode.id
          });
        }
      }

      setCurrentNode(nextNode);
    }
  };

  const restart = () => {
    const startNode = scenario.nodes.find(n => n.isStart) || scenario.nodes[0];
    setCurrentNode(startNode);
    setHistory([startNode.id]);
    setCompleted(false);
    setScore(0);
  };

  const getChoiceColor = (choice) => {
    if (choice.isCorrect) return 'from-green-500 to-green-600 border-green-500/50';
    if (choice.isIncorrect) return 'from-red-500 to-red-600 border-red-500/50';
    return 'from-purple-500 to-pink-500 border-purple-500/50';
  };

  if (!scenario || !currentNode) {
    return (
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-6 border border-white/10">
        <p className="text-gray-400 text-center">Kein Szenario geladen</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-6 border border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <GitBranch className="text-purple-400" size={28} />
          <div>
            <h2 className="text-2xl font-bold text-white">{scenario.title}</h2>
            <p className="text-sm text-gray-400">{scenario.description}</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-purple-400">{score}</div>
          <div className="text-xs text-gray-400">Punkte</div>
        </div>
      </div>

      {/* Progress Path */}
      <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2">
        {history.map((nodeId, index) => (
          <div key={index} className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/50 flex items-center justify-center">
              <span className="text-xs text-purple-400">{index + 1}</span>
            </div>
            {index < history.length - 1 && (
              <ArrowRight className="text-purple-400" size={16} />
            )}
          </div>
        ))}
      </div>

      {/* Current Node */}
      {!completed ? (
        <div className="space-y-6">
          {/* Node Content */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            {currentNode.image && (
              <img
                src={currentNode.image}
                alt={currentNode.title}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}
            
            <h3 className="text-xl font-bold text-white mb-3">{currentNode.title}</h3>
            
            <div className="text-gray-300 whitespace-pre-wrap mb-4">
              {currentNode.content}
            </div>

            {currentNode.hint && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-300">
                  <strong>💡 Hinweis:</strong> {currentNode.hint}
                </p>
              </div>
            )}
          </div>

          {/* Choices */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-400 mb-3">
              Was möchten Sie tun?
            </p>
            
            {currentNode.choices && currentNode.choices.map((choice, index) => (
              <button
                key={index}
                onClick={() => handleChoice(choice)}
                className={`w-full p-4 bg-gradient-to-r ${getChoiceColor(choice)} border rounded-lg text-left hover:scale-[1.02] transition-all group`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-white font-semibold mb-1">{choice.text}</p>
                    {choice.description && (
                      <p className="text-sm text-white/80">{choice.description}</p>
                    )}
                  </div>
                  <ArrowRight className="text-white group-hover:translate-x-1 transition-transform" size={20} />
                </div>
                
                {choice.points && (
                  <div className="mt-2 text-xs text-white/60">
                    +{choice.points} Punkte
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Completion Screen */
        <div className="text-center py-12">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${
            currentNode.isSuccess
              ? 'bg-green-500/20 border-2 border-green-500'
              : 'bg-red-500/20 border-2 border-red-500'
          }`}>
            {currentNode.isSuccess ? (
              <CheckCircle className="text-green-400" size={40} />
            ) : (
              <XCircle className="text-red-400" size={40} />
            )}
          </div>

          <h3 className="text-2xl font-bold text-white mb-3">{currentNode.title}</h3>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">{currentNode.content}</p>

          <div className="bg-white/5 border border-white/10 rounded-lg p-6 max-w-md mx-auto mb-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-purple-400">{score}</div>
                <div className="text-sm text-gray-400">Punkte</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-400">{history.length}</div>
                <div className="text-sm text-gray-400">Schritte</div>
              </div>
            </div>
          </div>

          {currentNode.feedback && (
            <div className={`max-w-2xl mx-auto mb-6 p-4 rounded-lg ${
              currentNode.isSuccess
                ? 'bg-green-500/10 border border-green-500/30'
                : 'bg-blue-500/10 border border-blue-500/30'
            }`}>
              <p className="text-sm text-gray-300">{currentNode.feedback}</p>
            </div>
          )}

          <button
            onClick={restart}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold text-white hover:from-purple-600 hover:to-pink-600 transition-all flex items-center gap-2 mx-auto"
          >
            <RotateCcw size={20} />
            Neu starten
          </button>
        </div>
      )}
    </div>
  );
}

export default BranchingScenario;
