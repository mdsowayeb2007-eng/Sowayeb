import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, FastForward, Film } from 'lucide-react';
import { Country } from '../types';

interface ReplayViewerModalProps {
  winner: Country;
  onClose: () => void;
}

export const ReplayViewerModal: React.FC<ReplayViewerModalProps> = ({ winner, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState<number>(1);
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setIsPlaying(false);
          return 100;
        }
        return prev + 1 * speed;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, speed]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 text-white shadow-2xl space-y-6 relative">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
          <Film className="w-4 h-4" />
          BATTLE REPLAY PLAYER
        </div>

        {/* Simulated Replay Canvas Display */}
        <div className="relative aspect-video bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center justify-center space-y-3 overflow-hidden">
          <div className="text-6xl animate-pulse">{winner.flag}</div>
          <div className="text-xl font-extrabold text-slate-200">
            REPLAYING BATTLE HIGHLIGHTS ({progress}%)
          </div>

          <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white cursor-pointer"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
            </button>

            <button
              onClick={() => { setProgress(0); setIsPlaying(true); }}
              className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          {/* Speed Selector */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {[0.5, 1, 2, 4].map(s => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  speed === s ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
