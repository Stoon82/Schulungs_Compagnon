import { useState } from 'react';
import { Clock, CheckCircle, Circle } from 'lucide-react';

function ProgressIndicator({ 
  currentIndex = 0, 
  totalSubmodules = 0, 
  submodules = [],
  onJumpTo,
  estimatedTimePerSubmodule = 5,
  showTimeEstimate = true,
  variant = 'dots' // 'dots', 'bar', 'numbers'
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const completedCount = currentIndex;
  const remainingCount = totalSubmodules - currentIndex - 1;
  const percentComplete = totalSubmodules > 0 ? (currentIndex / totalSubmodules) * 100 : 0;
  const estimatedTimeRemaining = remainingCount * estimatedTimePerSubmodule;

  const formatTime = (minutes) => {
    if (minutes < 60) {
      return `${minutes} Min.`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getSubmoduleState = (index) => {
    if (index < currentIndex) return 'completed';
    if (index === currentIndex) return 'current';
    return 'upcoming';
  };

  if (variant === 'bar') {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white">
              Fortschritt: {currentIndex + 1} / {totalSubmodules}
            </span>
            <span className="text-xs text-gray-400">
              ({Math.round(percentComplete)}%)
            </span>
          </div>
          {showTimeEstimate && estimatedTimeRemaining > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Clock size={12} />
              <span>~{formatTime(estimatedTimeRemaining)} verbleibend</span>
            </div>
          )}
        </div>
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
            style={{ width: `${percentComplete}%` }}
          />
        </div>
      </div>
    );
  }

  if (variant === 'numbers') {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <CheckCircle size={16} className="text-green-400" />
          <span className="text-sm text-white">{completedCount} abgeschlossen</span>
        </div>
        <div className="flex items-center gap-2">
          <Circle size={16} className="text-purple-400 fill-purple-400" />
          <span className="text-sm text-white">1 aktuell</span>
        </div>
        <div className="flex items-center gap-2">
          <Circle size={16} className="text-gray-500" />
          <span className="text-sm text-white">{remainingCount} ausstehend</span>
        </div>
        {showTimeEstimate && estimatedTimeRemaining > 0 && (
          <div className="flex items-center gap-1 text-xs text-gray-400 ml-auto">
            <Clock size={12} />
            <span>~{formatTime(estimatedTimeRemaining)}</span>
          </div>
        )}
      </div>
    );
  }

  // Default: dots variant
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {Array.from({ length: totalSubmodules }).map((_, index) => {
          const state = getSubmoduleState(index);
          const submodule = submodules[index];
          const isHovered = hoveredIndex === index;

          return (
            <div key={index} className="relative">
              <button
                onClick={() => onJumpTo && onJumpTo(index)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                disabled={!onJumpTo}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  state === 'completed'
                    ? 'bg-green-500 hover:scale-125'
                    : state === 'current'
                    ? 'bg-purple-500 scale-125 ring-2 ring-purple-400 ring-offset-2 ring-offset-gray-900'
                    : 'bg-gray-600 hover:bg-gray-500 hover:scale-110'
                } ${onJumpTo ? 'cursor-pointer' : 'cursor-default'}`}
                title={submodule?.title || `Submodul ${index + 1}`}
              />
              
              {/* Tooltip on hover */}
              {isHovered && submodule && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 border border-white/10 rounded-lg shadow-xl whitespace-nowrap z-10">
                  <div className="text-xs font-medium text-white mb-1">
                    {submodule.title || `Submodul ${index + 1}`}
                  </div>
                  <div className="text-xs text-gray-400">
                    {state === 'completed' && '✓ Abgeschlossen'}
                    {state === 'current' && '▶ Aktuell'}
                    {state === 'upcoming' && '○ Ausstehend'}
                  </div>
                  {submodule.duration_estimate && (
                    <div className="text-xs text-gray-500 mt-1">
                      ~{submodule.duration_estimate} Min.
                    </div>
                  )}
                  {/* Arrow */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>
          {currentIndex + 1} / {totalSubmodules}
        </span>
        {showTimeEstimate && estimatedTimeRemaining > 0 && (
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>~{formatTime(estimatedTimeRemaining)} verbleibend</span>
          </div>
        )}
        <span>{Math.round(percentComplete)}% abgeschlossen</span>
      </div>
    </div>
  );
}

export default ProgressIndicator;
