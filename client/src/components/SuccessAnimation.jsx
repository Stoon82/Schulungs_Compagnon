import { useEffect } from 'react';
import { Check } from 'lucide-react';
import { createConfetti } from '../utils/animations';

function SuccessAnimation({ message = 'Erfolg!', onComplete }) {
  useEffect(() => {
    createConfetti(window.innerWidth / 2, window.innerHeight / 3);
    
    if (onComplete) {
      const timer = setTimeout(onComplete, 3000);
      return () => clearTimeout(timer);
    }
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-gradient-to-br from-green-500/20 to-cyan-500/20 rounded-2xl p-12 border border-green-500/30 animate-slideInUp">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Check size={48} className="text-white" strokeWidth={3} />
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-2">
            {message}
          </h2>
          <p className="text-gray-300">
            Großartig gemacht! 🎉
          </p>
        </div>
      </div>
    </div>
  );
}

export default SuccessAnimation;
