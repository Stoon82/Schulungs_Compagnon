import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';

/**
 * CountdownTimer - Visual countdown timer for auto-advance mode
 * Shows remaining time and provides controls for pause/resume
 */
function CountdownTimer({
  duration = 60, // Duration in seconds
  autoStart = false,
  onComplete,
  onTick,
  showControls = true,
  variant = 'circular', // 'circular', 'linear', 'minimal'
  size = 'medium' // 'small', 'medium', 'large'
}) {
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);

  // Size configurations
  const sizeConfig = {
    small: { circle: 60, stroke: 4, text: 'text-lg' },
    medium: { circle: 80, stroke: 6, text: 'text-2xl' },
    large: { circle: 120, stroke: 8, text: 'text-4xl' }
  };

  const config = sizeConfig[size];

  // Start/stop timer
  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          const newTime = prev - 1;
          
          if (onTick) {
            onTick(newTime);
          }

          if (newTime <= 0) {
            setIsRunning(false);
            if (onComplete) {
              onComplete();
            }
            return 0;
          }

          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, onComplete, onTick]);

  // Reset when duration changes
  useEffect(() => {
    setTimeRemaining(duration);
  }, [duration]);

  const handlePlayPause = () => {
    if (isRunning) {
      setIsPaused(!isPaused);
    } else {
      setIsRunning(true);
      setIsPaused(false);
    }
  };

  const handleReset = () => {
    setTimeRemaining(duration);
    setIsRunning(false);
    setIsPaused(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const percentage = ((duration - timeRemaining) / duration) * 100;
  const circumference = 2 * Math.PI * (config.circle / 2 - config.stroke);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Get color based on time remaining
  const getColor = () => {
    const percentRemaining = (timeRemaining / duration) * 100;
    if (percentRemaining > 50) return 'text-green-400 stroke-green-400';
    if (percentRemaining > 25) return 'text-yellow-400 stroke-yellow-400';
    return 'text-red-400 stroke-red-400';
  };

  if (variant === 'minimal') {
    return (
      <div className="flex items-center gap-3">
        <Clock size={16} className={getColor()} />
        <span className={`font-mono font-semibold ${getColor()}`}>
          {formatTime(timeRemaining)}
        </span>
        {showControls && (
          <div className="flex gap-1">
            <button
              onClick={handlePlayPause}
              className="p-1 hover:bg-white/10 rounded transition-all"
              title={isPaused ? 'Resume' : isRunning ? 'Pause' : 'Start'}
            >
              {isRunning && !isPaused ? <Pause size={14} /> : <Play size={14} />}
            </button>
            <button
              onClick={handleReset}
              className="p-1 hover:bg-white/10 rounded transition-all"
              title="Reset"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'linear') {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm font-semibold ${getColor()}`}>
            {formatTime(timeRemaining)}
          </span>
          {showControls && (
            <div className="flex gap-2">
              <button
                onClick={handlePlayPause}
                className="p-1.5 hover:bg-white/10 rounded transition-all"
                title={isPaused ? 'Resume' : isRunning ? 'Pause' : 'Start'}
              >
                {isRunning && !isPaused ? <Pause size={16} /> : <Play size={16} />}
              </button>
              <button
                onClick={handleReset}
                className="p-1.5 hover:bg-white/10 rounded transition-all"
                title="Reset"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          )}
        </div>
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${
              timeRemaining / duration > 0.5 ? 'bg-green-500' :
              timeRemaining / duration > 0.25 ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            style={{ width: `${(timeRemaining / duration) * 100}%` }}
          />
        </div>
      </div>
    );
  }

  // Default: circular variant
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: config.circle, height: config.circle }}>
        {/* Background circle */}
        <svg className="transform -rotate-90" width={config.circle} height={config.circle}>
          <circle
            cx={config.circle / 2}
            cy={config.circle / 2}
            r={config.circle / 2 - config.stroke}
            stroke="currentColor"
            strokeWidth={config.stroke}
            fill="none"
            className="text-white/10"
          />
          {/* Progress circle */}
          <circle
            cx={config.circle / 2}
            cy={config.circle / 2}
            r={config.circle / 2 - config.stroke}
            stroke="currentColor"
            strokeWidth={config.stroke}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={`transition-all duration-1000 ${getColor()}`}
            strokeLinecap="round"
          />
        </svg>

        {/* Time display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-mono font-bold ${config.text} ${getColor()}`}>
            {formatTime(timeRemaining)}
          </span>
        </div>

        {/* Pause indicator */}
        {isPaused && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
            <Pause size={config.circle / 3} className="text-white" />
          </div>
        )}
      </div>

      {/* Controls */}
      {showControls && (
        <div className="flex gap-2">
          <button
            onClick={handlePlayPause}
            className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-all flex items-center gap-2"
          >
            {isRunning && !isPaused ? (
              <>
                <Pause size={16} />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play size={16} />
                <span>{isPaused ? 'Resume' : 'Start'}</span>
              </>
            )}
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg transition-all flex items-center gap-2"
          >
            <RotateCcw size={16} />
            <span>Reset</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default CountdownTimer;
