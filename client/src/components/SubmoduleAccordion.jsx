import { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, Eye } from 'lucide-react';

/**
 * SubmoduleAccordion - Displays previous/next submodules as minimized previews
 * Allows expanding to view content without navigating away
 */
function SubmoduleAccordion({
  submodules = [],
  currentIndex = 0,
  onNavigate,
  showPrevious = 1,
  showNext = 1,
  autoExpand = false,
  renderPreview // Function to render submodule preview
}) {
  const [expandedIndices, setExpandedIndices] = useState(new Set());
  const contentRefs = useRef({});

  // Auto-expand current when admin navigates
  useEffect(() => {
    if (autoExpand) {
      setExpandedIndices(new Set([currentIndex]));
    }
  }, [currentIndex, autoExpand]);

  const toggleExpand = (index) => {
    const newExpanded = new Set(expandedIndices);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedIndices(newExpanded);
  };

  const getVisibleSubmodules = () => {
    const visible = [];
    
    // Previous submodules
    for (let i = Math.max(0, currentIndex - showPrevious); i < currentIndex; i++) {
      visible.push({ index: i, position: 'previous' });
    }
    
    // Current submodule
    visible.push({ index: currentIndex, position: 'current' });
    
    // Next submodules
    for (let i = currentIndex + 1; i <= Math.min(submodules.length - 1, currentIndex + showNext); i++) {
      visible.push({ index: i, position: 'next' });
    }
    
    return visible;
  };

  const visibleSubmodules = getVisibleSubmodules();

  const getPositionStyles = (position) => {
    switch (position) {
      case 'previous':
        return 'opacity-60 scale-95';
      case 'current':
        return 'opacity-100 scale-100 ring-2 ring-purple-500';
      case 'next':
        return 'opacity-60 scale-95';
      default:
        return '';
    }
  };

  const getPositionLabel = (position) => {
    switch (position) {
      case 'previous':
        return '← Vorherige';
      case 'current':
        return '● Aktuell';
      case 'next':
        return 'Nächste →';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-3">
      {visibleSubmodules.map(({ index, position }) => {
        const submodule = submodules[index];
        if (!submodule) return null;

        const isExpanded = expandedIndices.has(index);
        const isCurrent = position === 'current';

        return (
          <div
            key={index}
            className={`bg-white/5 border border-white/10 rounded-lg overflow-hidden transition-all duration-300 ${getPositionStyles(position)}`}
          >
            {/* Header - Always visible */}
            <div
              className={`p-4 cursor-pointer hover:bg-white/5 transition-all ${
                isCurrent ? 'bg-purple-500/10' : ''
              }`}
              onClick={() => toggleExpand(index)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs px-2 py-1 bg-white/10 rounded text-gray-400">
                      {getPositionLabel(position)}
                    </span>
                    <span className="text-xs text-gray-500">
                      #{index + 1}
                    </span>
                  </div>
                  <h3 className={`font-semibold ${isCurrent ? 'text-purple-400' : 'text-white'}`}>
                    {submodule.title || `Submodul ${index + 1}`}
                  </h3>
                  {submodule.template_type && (
                    <p className="text-xs text-gray-400 mt-1">
                      {submodule.template_type}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {onNavigate && !isCurrent && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate(index);
                      }}
                      className="p-2 hover:bg-white/10 rounded-lg transition-all"
                      title="Zu diesem Submodul springen"
                    >
                      <Eye size={18} className="text-gray-400" />
                    </button>
                  )}
                  <button
                    className="p-2 hover:bg-white/10 rounded-lg transition-all"
                    title={isExpanded ? 'Minimieren' : 'Erweitern'}
                  >
                    {isExpanded ? (
                      <ChevronUp size={20} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={20} className="text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Expandable Content */}
            <div
              ref={(el) => (contentRefs.current[index] = el)}
              className="overflow-hidden transition-all duration-300"
              style={{
                maxHeight: isExpanded
                  ? contentRefs.current[index]?.scrollHeight || 'auto'
                  : 0
              }}
            >
              <div className="p-4 pt-0 border-t border-white/10">
                {/* Preview Thumbnail or Content */}
                {renderPreview ? (
                  renderPreview(submodule, index)
                ) : (
                  <div className="bg-white/5 rounded-lg p-4 min-h-[200px] flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <p className="text-sm">Vorschau nicht verfügbar</p>
                      {submodule.notes && (
                        <p className="text-xs mt-2 text-gray-500">{submodule.notes}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Metadata */}
                <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                  {submodule.duration_estimate && (
                    <span>⏱️ {submodule.duration_estimate} Min.</span>
                  )}
                  {submodule.order_index !== undefined && (
                    <span>📍 Position {submodule.order_index + 1}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Navigation hint */}
      {visibleSubmodules.length > 1 && (
        <div className="text-center text-xs text-gray-500 mt-4">
          Zeige {visibleSubmodules.length} von {submodules.length} Submodulen
        </div>
      )}
    </div>
  );
}

export default SubmoduleAccordion;
