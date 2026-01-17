import { useState, useEffect } from 'react';
import { MapPin, CheckCircle, Lock, Play, Award, TrendingUp } from 'lucide-react';
import axios from 'axios';

/**
 * LearningPaths Component
 * Structured learning journeys with prerequisites and milestones
 */
function LearningPaths({ userId }) {
  const [paths, setPaths] = useState([]);
  const [selectedPath, setSelectedPath] = useState(null);
  const [userProgress, setUserProgress] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLearningPaths();
    if (userId) {
      fetchUserProgress();
    }
  }, [userId]);

  const fetchLearningPaths = async () => {
    try {
      // Mock data - replace with actual API call
      const mockPaths = [
        {
          id: '1',
          title: 'Grundlagen der Pflege',
          description: 'Lernen Sie die Basics der professionellen Pflege',
          difficulty: 'Anfänger',
          duration: '4 Wochen',
          modules: [
            { id: 'm1', title: 'Einführung', order: 1, required: true, unlocked: true },
            { id: 'm2', title: 'Hygiene', order: 2, required: true, unlocked: false, prerequisite: 'm1' },
            { id: 'm3', title: 'Kommunikation', order: 3, required: true, unlocked: false, prerequisite: 'm2' },
            { id: 'm4', title: 'Dokumentation', order: 4, required: false, unlocked: false, prerequisite: 'm3' }
          ],
          milestones: [
            { id: 'ms1', title: 'Erste Schritte', moduleId: 'm1', reward: 100 },
            { id: 'ms2', title: 'Hygiene-Experte', moduleId: 'm2', reward: 200 },
            { id: 'ms3', title: 'Kommunikations-Profi', moduleId: 'm3', reward: 300 }
          ]
        },
        {
          id: '2',
          title: 'Fortgeschrittene Techniken',
          description: 'Vertiefen Sie Ihr Wissen mit spezialisierten Modulen',
          difficulty: 'Fortgeschritten',
          duration: '6 Wochen',
          modules: [
            { id: 'm5', title: 'Wundversorgung', order: 1, required: true, unlocked: false },
            { id: 'm6', title: 'Medikamentengabe', order: 2, required: true, unlocked: false, prerequisite: 'm5' },
            { id: 'm7', title: 'Notfallmanagement', order: 3, required: true, unlocked: false, prerequisite: 'm6' }
          ],
          milestones: [
            { id: 'ms4', title: 'Wundexperte', moduleId: 'm5', reward: 400 },
            { id: 'ms5', title: 'Medikations-Meister', moduleId: 'm6', reward: 500 }
          ]
        }
      ];

      setPaths(mockPaths);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching learning paths:', error);
      setLoading(false);
    }
  };

  const fetchUserProgress = async () => {
    try {
      // Mock progress - replace with actual API call
      const mockProgress = {
        'm1': { completed: true, score: 95, completedAt: '2024-01-10' },
        'm2': { completed: false, score: 0, progress: 60 }
      };
      setUserProgress(mockProgress);
    } catch (error) {
      console.error('Error fetching user progress:', error);
    }
  };

  const isModuleUnlocked = (module, path) => {
    if (module.unlocked) return true;
    if (!module.prerequisite) return true;
    
    const prereqModule = path.modules.find(m => m.id === module.prerequisite);
    return userProgress[module.prerequisite]?.completed || false;
  };

  const getPathProgress = (path) => {
    const completedModules = path.modules.filter(m => userProgress[m.id]?.completed).length;
    return Math.round((completedModules / path.modules.length) * 100);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Anfänger': return 'text-green-400 bg-green-500/20';
      case 'Fortgeschritten': return 'text-yellow-400 bg-yellow-500/20';
      case 'Experte': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-6 border border-white/10">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-400 mx-auto"></div>
          <p className="text-gray-400 mt-4">Lade Lernpfade...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Path List */}
      {!selectedPath && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {paths.map((path) => {
            const progress = getPathProgress(path);
            
            return (
              <div
                key={path.id}
                onClick={() => setSelectedPath(path)}
                className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-6 border border-white/10 hover:border-purple-500/50 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                      {path.title}
                    </h3>
                    <p className="text-sm text-gray-400 mb-3">{path.description}</p>
                  </div>
                  <MapPin className="text-purple-400" size={24} />
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(path.difficulty)}`}>
                    {path.difficulty}
                  </span>
                  <span className="text-xs text-gray-400">⏱️ {path.duration}</span>
                  <span className="text-xs text-gray-400">📚 {path.modules.length} Module</span>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-400 mb-2">
                    <span>Fortschritt</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <button className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold text-white hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2">
                  <Play size={18} />
                  {progress > 0 ? 'Fortsetzen' : 'Starten'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Path Detail */}
      {selectedPath && (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg border border-white/10 overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <button
              onClick={() => setSelectedPath(null)}
              className="text-purple-400 hover:text-purple-300 text-sm mb-4"
            >
              ← Zurück zu allen Pfaden
            </button>
            
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">{selectedPath.title}</h2>
                <p className="text-gray-400 mb-4">{selectedPath.description}</p>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(selectedPath.difficulty)}`}>
                    {selectedPath.difficulty}
                  </span>
                  <span className="text-sm text-gray-400">⏱️ {selectedPath.duration}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-purple-400">{getPathProgress(selectedPath)}%</div>
                <div className="text-sm text-gray-400">Abgeschlossen</div>
              </div>
            </div>
          </div>

          {/* Modules */}
          <div className="p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-purple-400" />
              Lernmodule
            </h3>
            
            <div className="space-y-4">
              {selectedPath.modules.map((module, index) => {
                const unlocked = isModuleUnlocked(module, selectedPath);
                const progress = userProgress[module.id];
                const completed = progress?.completed || false;

                return (
                  <div
                    key={module.id}
                    className={`relative p-4 rounded-lg border transition-all ${
                      unlocked
                        ? 'bg-white/5 border-white/10 hover:border-purple-500/50'
                        : 'bg-white/5 border-white/5 opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Status Icon */}
                      <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                        completed
                          ? 'bg-green-500/20 border-2 border-green-500'
                          : unlocked
                          ? 'bg-purple-500/20 border-2 border-purple-500'
                          : 'bg-gray-500/20 border-2 border-gray-500'
                      }`}>
                        {completed ? (
                          <CheckCircle className="text-green-400" size={24} />
                        ) : unlocked ? (
                          <span className="text-purple-400 font-bold">{index + 1}</span>
                        ) : (
                          <Lock className="text-gray-500" size={24} />
                        )}
                      </div>

                      {/* Module Info */}
                      <div className="flex-1">
                        <h4 className="text-white font-semibold mb-1">{module.title}</h4>
                        {module.required && (
                          <span className="text-xs text-orange-400">Pflichtmodul</span>
                        )}
                        {progress && !completed && (
                          <div className="mt-2">
                            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-purple-500"
                                style={{ width: `${progress.progress || 0}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action */}
                      {unlocked && (
                        <button className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg font-semibold text-white transition-all">
                          {completed ? 'Wiederholen' : progress ? 'Fortsetzen' : 'Starten'}
                        </button>
                      )}
                    </div>

                    {/* Prerequisite Info */}
                    {!unlocked && module.prerequisite && (
                      <div className="mt-3 text-xs text-gray-400">
                        🔒 Schließen Sie zuerst das vorherige Modul ab
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Milestones */}
          {selectedPath.milestones && selectedPath.milestones.length > 0 && (
            <div className="p-6 border-t border-white/10 bg-white/5">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Award size={20} className="text-yellow-400" />
                Meilensteine
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {selectedPath.milestones.map((milestone) => {
                  const achieved = userProgress[milestone.moduleId]?.completed || false;
                  
                  return (
                    <div
                      key={milestone.id}
                      className={`p-4 rounded-lg border ${
                        achieved
                          ? 'bg-yellow-500/10 border-yellow-500/30'
                          : 'bg-white/5 border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Award className={achieved ? 'text-yellow-400' : 'text-gray-500'} size={20} />
                        <span className={`font-semibold ${achieved ? 'text-yellow-400' : 'text-gray-400'}`}>
                          {milestone.title}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">+{milestone.reward} Punkte</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default LearningPaths;
