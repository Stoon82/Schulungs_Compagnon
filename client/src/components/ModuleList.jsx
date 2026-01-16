import { Lock, CheckCircle, Circle } from 'lucide-react';

function ModuleList({ modules, onModuleClick }) {
  return (
    <div className="space-y-4">
      {modules.map((module) => (
        <div
          key={module.id}
          onClick={() => module.unlocked && onModuleClick(module)}
          className={`
            p-6 rounded-xl border-2 transition-all cursor-pointer
            ${module.unlocked 
              ? 'bg-white/5 border-cyan-500/30 hover:border-cyan-500/60 hover:bg-white/10' 
              : 'bg-white/5 border-white/10 opacity-50 cursor-not-allowed'
            }
            ${module.completed ? 'border-green-500/50' : ''}
          `}
        >
          <div className="flex items-start gap-4">
            <div className={`
              flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center
              ${module.unlocked 
                ? module.completed 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-cyan-500/20 text-cyan-400'
                : 'bg-white/5 text-gray-500'
              }
            `}>
              {!module.unlocked && <Lock size={24} />}
              {module.unlocked && module.completed && <CheckCircle size={24} />}
              {module.unlocked && !module.completed && <Circle size={24} />}
            </div>

            <div className="flex-1">
              <h3 className={`text-xl font-semibold mb-1 ${module.unlocked ? 'text-white' : 'text-gray-500'}`}>
                {module.title}
              </h3>
              <p className={`text-sm ${module.unlocked ? 'text-gray-300' : 'text-gray-600'}`}>
                {module.description}
              </p>
              
              {module.unlocked && !module.completed && (
                <div className="mt-3">
                  <span className="inline-block px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs font-medium rounded-full">
                    Verfügbar
                  </span>
                </div>
              )}
              
              {module.completed && (
                <div className="mt-3">
                  <span className="inline-block px-3 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
                    Abgeschlossen
                  </span>
                </div>
              )}
              
              {!module.unlocked && (
                <div className="mt-3">
                  <span className="inline-block px-3 py-1 bg-white/5 text-gray-500 text-xs font-medium rounded-full">
                    Gesperrt
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ModuleList;
