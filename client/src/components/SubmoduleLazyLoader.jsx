import { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { Loader } from 'lucide-react';

/**
 * SubmoduleLazyLoader - Lazy loads submodule content to improve performance
 * Only loads submodules when they're about to be viewed or are in the viewport
 */
function SubmoduleLazyLoader({ 
  submodule, 
  isActive = false,
  preloadNext = true,
  children,
  fallback = null
}) {
  const [shouldLoad, setShouldLoad] = useState(isActive);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);

  // Load immediately if active
  useEffect(() => {
    if (isActive && !shouldLoad) {
      setShouldLoad(true);
    }
  }, [isActive, shouldLoad]);

  // Intersection Observer for viewport-based loading
  useEffect(() => {
    if (shouldLoad || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
          }
        });
      },
      {
        root: null,
        rootMargin: '200px', // Start loading 200px before entering viewport
        threshold: 0.1
      }
    );

    observer.observe(containerRef.current);

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [shouldLoad]);

  // Preload next submodule
  useEffect(() => {
    if (isActive && preloadNext) {
      // Trigger preload of next submodule (implementation depends on parent)
      const timer = setTimeout(() => {
        // Signal to parent that next submodule should be preloaded
        if (window.preloadNextSubmodule) {
          window.preloadNextSubmodule();
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isActive, preloadNext]);

  // Handle content loading
  useEffect(() => {
    if (shouldLoad && !isLoaded) {
      try {
        setIsLoaded(true);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error loading submodule:', err);
      }
    }
  }, [shouldLoad, isLoaded]);

  // Loading fallback
  const defaultFallback = (
    <div className="flex items-center justify-center min-h-[400px] bg-white/5 rounded-lg">
      <div className="text-center">
        <Loader className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-3" />
        <p className="text-gray-400 text-sm">Lade Inhalt...</p>
      </div>
    </div>
  );

  // Error state
  if (error) {
    return (
      <div ref={containerRef} className="flex items-center justify-center min-h-[400px] bg-red-500/10 border border-red-500/30 rounded-lg">
        <div className="text-center p-6">
          <p className="text-red-400 font-semibold mb-2">Fehler beim Laden</p>
          <p className="text-gray-400 text-sm">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setIsLoaded(false);
              setShouldLoad(true);
            }}
            className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all"
          >
            Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  // Not loaded yet - show placeholder
  if (!shouldLoad) {
    return (
      <div ref={containerRef} className="min-h-[400px] bg-white/5 rounded-lg">
        {fallback || defaultFallback}
      </div>
    );
  }

  // Loaded - render children
  return (
    <div ref={containerRef} className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <Suspense fallback={fallback || defaultFallback}>
        {children}
      </Suspense>
    </div>
  );
}

export default SubmoduleLazyLoader;
