import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Home, BookOpen, Clock, CheckCircle } from 'lucide-react';
import { 
  TitleTemplate, 
  ContentTemplate, 
  MediaTemplate, 
  QuizTemplate, 
  PollTemplate, 
  WordCloudTemplate, 
  AppGalleryTemplate,
  TableTemplate,
  TimelineTemplate,
  SplitScreenTemplate,
  EmbedTemplate,
  ResourceLibraryTemplate,
  BlankCanvasTemplate
} from './templates';

function ModuleViewer({ moduleId, socket, onExit, initialIndex = 0 }) {
  const [module, setModule] = useState(null);
  const [submodules, setSubmodules] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({});

  useEffect(() => {
    loadModule();
  }, [moduleId]);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    if (!socket) return;

    // Listen for navigation events from admin
    socket.on('module:navigate', (data) => {
      if (data.moduleId === moduleId) {
        setCurrentIndex(data.submoduleIndex);
      }
    });

    // Listen for sync events
    socket.on('module:sync', (data) => {
      if (data.moduleId === moduleId) {
        setCurrentIndex(data.submoduleIndex);
      }
    });

    return () => {
      socket.off('module:navigate');
      socket.off('module:sync');
    };
  }, [socket, moduleId]);

  const loadModule = async () => {
    setLoading(true);
    try {
      // Load module data from API
      const response = await fetch(`/api/module-creator/modules/${moduleId}`);
      const data = await response.json();
      
      if (data.success) {
        setModule(data.data);
        
        // Load submodules
        const subResponse = await fetch(`/api/module-creator/modules/${moduleId}/submodules`);
        const subData = await subResponse.json();
        
        if (subData.success) {
          setSubmodules(subData.data);
        }
      }
    } catch (error) {
      console.error('Error loading module:', error);
    } finally {
      setLoading(false);
    }
  };

  const goToNext = () => {
    if (currentIndex < submodules.length - 1) {
      setCurrentIndex(currentIndex + 1);
      markAsViewed(currentIndex);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToSubmodule = (index) => {
    if (index >= 0 && index < submodules.length) {
      setCurrentIndex(index);
    }
  };

  const markAsViewed = (index) => {
    setProgress(prev => ({
      ...prev,
      [index]: true
    }));
  };

  const getTemplateComponent = (templateType) => {
    switch (templateType) {
      case 'title':
        return TitleTemplate;
      case 'content':
        return ContentTemplate;
      case 'media':
        return MediaTemplate;
      case 'quiz':
        return QuizTemplate;
      case 'poll':
        return PollTemplate;
      case 'wordcloud':
        return WordCloudTemplate;
      case 'appgallery':
        return AppGalleryTemplate;
      case 'table':
        return TableTemplate;
      case 'timeline':
        return TimelineTemplate;
      case 'splitscreen':
        return SplitScreenTemplate;
      case 'embed':
        return EmbedTemplate;
      case 'resources':
        return ResourceLibraryTemplate;
      case 'canvas':
        return BlankCanvasTemplate;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center relative z-10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Modul wird geladen...</p>
        </div>
      </div>
    );
  }

  if (!module || submodules.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center relative z-10">
        <div className="text-center">
          <BookOpen size={64} className="mx-auto mb-4 text-gray-600" />
          <p className="text-white text-xl mb-2">Modul nicht gefunden</p>
          <button
            onClick={onExit}
            className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-all"
          >
            Zurück zur Übersicht
          </button>
        </div>
      </div>
    );
  }

  const currentSubmodule = submodules[currentIndex];
  const TemplateComponent = currentSubmodule ? getTemplateComponent(currentSubmodule.template_type) : null;
  const completedCount = Object.keys(progress).length;
  const progressPercentage = Math.round((completedCount / submodules.length) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-lg border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onExit}
              className="p-2 hover:bg-white/10 rounded-lg transition-all text-gray-400 hover:text-white"
              title="Zurück zur Übersicht"
            >
              <Home size={24} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">{module.title}</h1>
              <p className="text-sm text-gray-400">
                {currentIndex + 1} / {submodules.length} · {progressPercentage}% abgeschlossen
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="hidden md:flex items-center gap-2">
            <Clock size={16} className="text-gray-400" />
            <span className="text-sm text-gray-400">
              ~{module.estimated_duration || 0} Min
            </span>
          </div>
        </div>
      </div>

      {/* Progress Dots */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
          {submodules.map((sub, idx) => (
            <button
              key={sub.id}
              onClick={() => goToSubmodule(idx)}
              className={`w-3 h-3 rounded-full transition-all ${
                idx === currentIndex
                  ? 'bg-purple-500 scale-125'
                  : progress[idx]
                  ? 'bg-green-500'
                  : 'bg-white/20 hover:bg-white/40'
              }`}
              title={sub.title}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto">
          {/* Submodule Title */}
          {currentSubmodule && (
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-white mb-2">
                {currentSubmodule.title}
              </h2>
              {currentSubmodule.duration_estimate && (
                <div className="flex items-center gap-2 text-gray-400">
                  <Clock size={16} />
                  <span className="text-sm">~{currentSubmodule.duration_estimate} Minuten</span>
                </div>
              )}
            </div>
          )}

          {/* Template Content */}
          {TemplateComponent && currentSubmodule && (
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-8">
              <TemplateComponent
                content={currentSubmodule.content || {}}
                isEditing={false}
              />
            </div>
          )}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="bg-black/30 backdrop-blur-lg border-t border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-lg transition-all flex items-center gap-2"
          >
            <ChevronLeft size={20} />
            <span>Zurück</span>
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-400">
              {currentSubmodule?.template_type === 'quiz' && 'Interaktives Quiz'}
              {currentSubmodule?.template_type === 'poll' && 'Live-Umfrage'}
              {currentSubmodule?.template_type === 'wordcloud' && 'Wortwolke'}
            </p>
          </div>

          <button
            onClick={goToNext}
            disabled={currentIndex === submodules.length - 1}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-lg transition-all flex items-center gap-2"
          >
            <span>Weiter</span>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModuleViewer;
