import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { ChevronLeft, ChevronRight, Home, BookOpen, Clock, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  BlankCanvasTemplate,
  DiscussionBoardTemplate
} from './templates';
import BranchingScenario from './BranchingScenario';
import CodePlayground from './CodePlayground';
import VirtualWhiteboard from './VirtualWhiteboard';
import DiscussionForum from './DiscussionForum';
import api from '../services/api';

// Lazy load Model3DViewer to avoid React reconciler errors from @react-three/fiber
const Model3DViewer = lazy(() => import('./Model3DViewer'));

function ModuleViewer({ moduleId, socket, onExit, initialIndex = 0, sessionCode = null, isAdmin = false }) {
  const [module, setModule] = useState(null);
  const [submodules, setSubmodules] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({});
  const [transitionMode, setTransitionMode] = useState('fade'); // 'fade', 'slide', 'zoom'
  const [submoduleCompleted, setSubmoduleCompleted] = useState(false); // Track if current submodule is completed
  const [adminAllowedIndex, setAdminAllowedIndex] = useState(0); // Admin-controlled max index participants can access

  // Animation variants
  const transitions = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.3 }
    },
    slide: {
      initial: { x: 300, opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: -300, opacity: 0 },
      transition: { type: 'spring', stiffness: 300, damping: 30 }
    },
    zoom: {
      initial: { scale: 0.8, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      exit: { scale: 1.2, opacity: 0 },
      transition: { duration: 0.4 }
    }
  };

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

    // Listen for admin allowing next submodule
    socket.on('submodule:advance', (data) => {
      if (data.moduleId === moduleId) {
        setAdminAllowedIndex(data.allowedIndex);
        // Auto-navigate participants to the new submodule
        if (!isAdmin) {
          setCurrentIndex(data.allowedIndex);
          setSubmoduleCompleted(false);
        }
      }
    });

    return () => {
      socket.off('module:navigate');
      socket.off('module:sync');
      socket.off('submodule:advance');
    };
  }, [socket, moduleId]);

  const loadModule = async () => {
    setLoading(true);
    try {
      let data, subData;
      
      // Use public endpoints if sessionCode provided and not admin
      if (sessionCode && !isAdmin) {
        console.log('[ModuleViewer] Using PUBLIC endpoints');
        data = await api.getPublicModule(moduleId, sessionCode);
        
        if (data.success) {
          setModule(data.data);
          subData = await api.getPublicSubmodules(moduleId, sessionCode);
        }
      } else {
        console.log('[ModuleViewer] Using ADMIN endpoints');
        // Admin or standalone mode: use authenticated endpoints
        data = await api.getCreatorModule(moduleId);
        
        if (data.success) {
          setModule(data.data);
          subData = await api.getModuleSubmodules(moduleId);
        }
      }
      
      if (subData && subData.success) {
        setSubmodules(subData.data);
      }
    } catch (error) {
      console.error('[ModuleViewer] Error loading module:', error);
    } finally {
      setLoading(false);
    }
  };

  const goToNext = () => {
    // In session mode, participants can only advance if admin allows
    if (sessionCode && !isAdmin) {
      // Participants can't advance beyond admin-allowed index
      if (currentIndex >= adminAllowedIndex) {
        return; // Can't go further than admin allows
      }
    }
    
    if (currentIndex < submodules.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      markAsViewed(currentIndex);
      setSubmoduleCompleted(false);
      
      // Admin broadcasts navigation to all participants
      if (isAdmin && socket && sessionCode) {
        socket.emit('submodule:advance', {
          sessionCode,
          moduleId,
          allowedIndex: nextIndex
        });
        setAdminAllowedIndex(nextIndex);
      }
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
      case 'discussion':
        return DiscussionBoardTemplate;
      case 'branching':
        return BranchingScenario;
      case 'codeplayground':
        return CodePlayground;
      case 'model3d':
        return Model3DViewer;
      case 'whiteboard':
        return VirtualWhiteboard;
      case 'forum':
        return DiscussionForum;
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
          <AnimatePresence mode="wait">
            {TemplateComponent && currentSubmodule && (
              <motion.div
                key={currentSubmodule.id}
                initial={transitions[transitionMode].initial}
                animate={transitions[transitionMode].animate}
                exit={transitions[transitionMode].exit}
                transition={transitions[transitionMode].transition}
                className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-8"
              >
                <Suspense fallback={
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                  </div>
                }>
                  <TemplateComponent
                    content={currentSubmodule.content || {}}
                    isEditing={false}
                    isSessionMode={!!sessionCode}
                    isAdmin={isAdmin}
                    socket={socket}
                    sessionCode={sessionCode}
                    onComplete={() => setSubmoduleCompleted(true)}
                  />
                </Suspense>
              </motion.div>
            )}
          </AnimatePresence>
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

          {/* Next button - different behavior for admin vs participants in session */}
          {sessionCode && !isAdmin ? (
            // Participants: show waiting message if can't advance
            currentIndex >= adminAllowedIndex ? (
              <div className="px-6 py-3 bg-yellow-500/20 text-yellow-400 rounded-lg flex items-center gap-2">
                <Clock size={20} />
                <span>Warten auf Kursleiter...</span>
              </div>
            ) : (
              <button
                onClick={goToNext}
                disabled={currentIndex === submodules.length - 1}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-lg transition-all flex items-center gap-2"
              >
                <span>Weiter</span>
                <ChevronRight size={20} />
              </button>
            )
          ) : (
            // Admin or non-session: normal next button
            <button
              onClick={goToNext}
              disabled={currentIndex === submodules.length - 1}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-lg transition-all flex items-center gap-2"
            >
              <span>{isAdmin && sessionCode ? 'Alle weiter' : 'Weiter'}</span>
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ModuleViewer;
