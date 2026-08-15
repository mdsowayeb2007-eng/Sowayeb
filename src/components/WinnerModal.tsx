import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Share2, Play, Flame, BarChart2 } from 'lucide-react';
import { Country, GameMode, SeriesMode, ArenaTheme } from '../types';

interface WinnerModalProps {
  winner: Country;
  seriesScore: Record<string, number>;
  seriesMode: SeriesMode;
  gameMode: GameMode;
  arenaTheme: ArenaTheme;
  defeatedCount: number;
  durationSeconds: number;
  onPlayAgain: () => void;
  onWatchReplay: () => void;
  onShare: () => void;
}

export const WinnerModal: React.FC<WinnerModalProps> = ({
  winner,
  seriesScore,
  seriesMode,
  gameMode,
  arenaTheme,
  defeatedCount,
  durationSeconds,
  onPlayAgain,
  onWatchReplay,
  onShare,
}) => {
  // Fire celebratory confetti on launch
  useEffect(() => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      });

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 text-center text-white shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Glow Ring */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-rose-500/20 blur-3xl rounded-full pointer-events-none" />

        {/* Trophy Header */}
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold tracking-wider uppercase">
            <Trophy className="w-4 h-4" /> BATTLE CHAMPION
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-rose-400 tracking-tight">
            VICTORY ROYALE!
          </h2>
        </div>

        {/* Champion Country Flag & Name */}
        <div className="py-4 space-y-2 bg-slate-950/80 rounded-2xl border border-slate-800/80 p-4">
          <div className="text-7xl sm:text-8xl animate-bounce">{winner.flag}</div>
          <div className="text-3xl sm:text-4xl font-extrabold uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-400 to-indigo-300">
            {winner.name}
          </div>
          <div className="text-xs text-amber-400 font-bold uppercase tracking-widest">
            🏆 ARENA CHAMPION
          </div>
        </div>

        {/* Match Statistics Summary */}
        <div className="grid grid-cols-2 gap-3 text-left text-xs sm:text-sm">
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-0.5">
            <div className="text-slate-400">Defeated</div>
            <div className="font-extrabold text-white text-base">{defeatedCount} Countries</div>
          </div>

          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-0.5">
            <div className="text-slate-400">Battle Time</div>
            <div className="font-extrabold text-white text-base">{formatDuration(durationSeconds)}</div>
          </div>

          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-0.5">
            <div className="text-slate-400">Mode</div>
            <div className="font-extrabold text-rose-300 capitalize text-base">{gameMode}</div>
          </div>

          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-0.5">
            <div className="text-slate-400">Series Wins</div>
            <div className="font-extrabold text-amber-300 text-base">{seriesScore[winner.id] || seriesMode} Wins</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <button
            onClick={onPlayAgain}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 text-white font-extrabold text-base shadow-lg shadow-rose-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
            🔄 PLAY AGAIN
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onWatchReplay}
              className="py-3 rounded-2xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current text-indigo-400" />
              Watch Replay
            </button>

            <button
              onClick={onShare}
              className="py-3 rounded-2xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-emerald-400" />
              Share Result
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
