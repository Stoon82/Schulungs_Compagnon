import { useState, useEffect } from 'react';
import { BookOpen, Lock, Unlock, ChevronRight, ArrowLeft } from 'lucide-react';
import ModuleViewer from './ModuleViewer';
import api from '../services/api';

/**
 * ClassViewer - Default view when opening a class
 * Shows list of modules assigned to the class
 * Allows opening individual modules
 */
function ClassViewer({ classId, onBack }) {
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [classInfo, setClassInfo] = useState(null);

  useEffect(() => {
    loadClassInfo();
    loadClassModules();
  }, [classId]);

  const loadClassInfo = async () => {
    try {
      const response = await fetch(`/api/session-management/classes/${classId}`, {
        headers: api.getAdminHeaders()
      });
      
      if (!response.ok) {
        console.error('Failed to load class info:', response.status);
        return;
      }
      
      const data = await response.json();
      if (data.success) {
        setClassInfo(data.data);
      }
    } catch (error) {
      console.error('Error loading class info:', error);
    }
  };

  const loadClassModules = async () => {
    try {
      const response = await fetch(`/api/module-creator/classes/${classId}/modules`, {
        headers: api.getAdminHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setModules(data.data);
      }
    } catch (error) {
      console.error('Error loading class modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModuleClick = (module) => {
    setSelectedModule(module);
  };

  const handleBackToModuleList = () => {
    setSelectedModule(null);
  };

  // If a module is selected, show the ModuleViewer
  if (selectedModule) {
    return (
      <ModuleViewer
        moduleId={selectedModule.id}
        onExit={handleBackToModuleList}
      />
    );
  }

  // Get styling from class theme override - handle both flat and nested structures
  const getThemeStyle = (themeData) => {
    if (!themeData) return {};
    
    // Handle both flat structure (built-in presets) and nested structure (saved themes)
    const background = themeData.background 
      || themeData.colors?.appBackgroundGradient 
      || themeData.colors?.appBackground 
      || themeData.colors?.cardBackground;
    
    const textColor = themeData.textColor 
      || themeData.colors?.textPrimary;
    
    const borderRadius = themeData.borderRadius 
      || themeData.borders?.defaultRadius;
    
    const boxShadow = themeData.boxShadow 
      || themeData.shadows?.glow;
    
    const borderColor = themeData.borderColor 
      || themeData.colors?.borderDefault;
    
    const borderWidth = themeData.borderWidth 
      || themeData.borders?.width?.default;
    
    return {
      background,
      color: textColor,
      borderRadius,
      boxShadow,
      border: borderColor && borderWidth ? `${borderWidth} solid ${borderColor}` : undefined,
    };
  };
  
  const themeStyle = getThemeStyle(classInfo?.theme_override);

  // Default view: Module list
  return (
    <div 
      className="min-h-screen p-6"
      style={{
        background: themeStyle.background || 'linear-gradient(to bottom right, #0f172a, #581c87, #0f172a)',
        color: themeStyle.color || undefined,
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          {onBack && (
            <button
              onClick={onBack}
              className="mb-4 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              Zurück
            </button>
          )}
          
          {classInfo && (
            <div 
              className="backdrop-blur-lg rounded-xl border border-white/10 p-6"
              style={{
                background: themeStyle.background ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.05)',
                borderRadius: themeStyle.borderRadius || '12px',
                boxShadow: themeStyle.boxShadow || undefined,
              }}
            >
              <h1 className="text-3xl font-bold mb-2" style={{ color: themeStyle.color || 'white' }}>
                {classInfo.name}
              </h1>
              {classInfo.description && (
                <p style={{ color: themeStyle.color ? `${themeStyle.color}99` : '#9ca3af' }}>
                  {classInfo.description}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Module List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : modules.length === 0 ? (
          <div className="bg-white/5 rounded-xl p-12 border border-white/10 text-center">
            <BookOpen size={48} className="mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400 mb-4">Dieser Klasse sind noch keine Module zugeordnet</p>
            <p className="text-sm text-gray-500">
              Module können von einem Administrator über die Klassenverwaltung hinzugefügt werden.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white mb-4">
              Module ({modules.length})
            </h2>
            
            <div className="grid gap-4">
              {modules.map((module, index) => (
                <button
                  key={module.class_module_id}
                  onClick={() => handleModuleClick(module)}
                  disabled={module.is_locked}
                  className={`bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6 text-left transition-all ${
                    module.is_locked
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:border-purple-500/50 hover:bg-white/10 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center justify-center w-12 h-12 bg-purple-500/20 rounded-lg">
                        <span className="text-xl font-bold text-purple-400">
                          {index + 1}
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {module.title}
                        </h3>
                        {module.description && (
                          <p className="text-sm text-gray-400 line-clamp-2">
                            {module.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          {module.category && (
                            <span className="px-2 py-1 bg-white/5 rounded">
                              {module.category}
                            </span>
                          )}
                          {module.estimated_duration && (
                            <span>⏱️ {module.estimated_duration} Min</span>
                          )}
                          {module.difficulty && (
                            <span className={`px-2 py-1 rounded ${
                              module.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400' :
                              module.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {module.difficulty === 'beginner' ? 'Anfänger' :
                               module.difficulty === 'intermediate' ? 'Fortgeschritten' : 'Experte'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {module.is_locked ? (
                        <div className="flex items-center gap-2 px-3 py-2 bg-red-500/20 text-red-400 rounded-lg">
                          <Lock size={16} />
                          <span className="text-sm">Gesperrt</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-3 py-2 bg-green-500/20 text-green-400 rounded-lg">
                          <Unlock size={16} />
                          <span className="text-sm">Verfügbar</span>
                        </div>
                      )}
                      
                      {!module.is_locked && (
                        <ChevronRight size={24} className="text-gray-400" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ClassViewer;
