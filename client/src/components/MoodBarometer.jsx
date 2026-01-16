import { useState } from 'react';
import { HelpCircle, Lightbulb, Zap, Sparkles } from 'lucide-react';

const moods = [
  {
    id: 'confused',
    label: 'Verwirrt',
    icon: HelpCircle,
    color: 'from-red-500 to-orange-500',
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-500',
    emoji: '😕'
  },
  {
    id: 'thinking',
    label: 'Nachdenklich',
    icon: Lightbulb,
    color: 'from-yellow-500 to-orange-500',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500',
    emoji: '🤔'
  },
  {
    id: 'aha',
    label: 'Aha!',
    icon: Zap,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500',
    emoji: '💡'
  },
  {
    id: 'wow',
    label: 'Wow!',
    icon: Sparkles,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500',
    emoji: '🤩'
  }
];

function MoodBarometer({ onMoodSelect, currentModuleId, compact = false }) {
  const [selectedMood, setSelectedMood] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleMoodClick = (moodId) => {
    setSelectedMood(moodId);
    setIsAnimating(true);

    onMoodSelect(moodId, currentModuleId);

    setTimeout(() => {
      setIsAnimating(false);
      setSelectedMood(null);
    }, 2000);
  };

  if (compact) {
    return (
      <div className="flex gap-2">
        {moods.map((mood) => {
          const Icon = mood.icon;
          const isSelected = selectedMood === mood.id;

          return (
            <button
              key={mood.id}
              onClick={() => handleMoodClick(mood.id)}
              disabled={isAnimating}
              className={`
                p-2 rounded-lg border-2 transition-all
                ${isSelected 
                  ? `${mood.bgColor} ${mood.borderColor} scale-110` 
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
              title={mood.label}
            >
              <Icon size={20} className={isSelected ? `text-${mood.color.split('-')[1]}-400` : 'text-gray-400'} />
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-white mb-1">
          Wie fühlst du dich gerade?
        </h3>
        <p className="text-sm text-gray-400">
          Dein Feedback hilft uns, das Training zu verbessern
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {moods.map((mood) => {
          const Icon = mood.icon;
          const isSelected = selectedMood === mood.id;

          return (
            <button
              key={mood.id}
              onClick={() => handleMoodClick(mood.id)}
              disabled={isAnimating}
              className={`
                relative p-6 rounded-xl border-2 transition-all transform
                ${isSelected 
                  ? `${mood.bgColor} ${mood.borderColor} scale-105 shadow-lg` 
                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:scale-105'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
                flex flex-col items-center gap-3
              `}
            >
              {isSelected && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r opacity-20 animate-pulse" 
                     style={{ backgroundImage: `linear-gradient(to right, ${mood.color})` }} />
              )}
              
              <div className="relative">
                <Icon size={32} className={isSelected ? 'text-white' : 'text-gray-400'} />
              </div>
              
              <div className="text-center relative">
                <div className="text-2xl mb-1">{mood.emoji}</div>
                <div className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                  {mood.label}
                </div>
              </div>

              {isSelected && (
                <div className="absolute -top-2 -right-2">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {isAnimating && (
        <div className="mt-4 text-center">
          <p className="text-sm text-cyan-400 animate-pulse">
            Danke für dein Feedback! 💙
          </p>
        </div>
      )}
    </div>
  );
}

export default MoodBarometer;
