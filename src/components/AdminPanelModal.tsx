import React, { useState } from 'react';
import { ShieldAlert, Play, Square, RotateCcw, BarChart2, Flame, Layers } from 'lucide-react';
import { GameMode, SeriesMode, ArenaTheme } from '../types';

interface AdminPanelModalProps {
  onStartBattleWithConfig: (config: {
    flagCount: number;
    mode: GameMode;
    series: SeriesMode;
    theme: ArenaTheme;
  }) => void;
  onResetStats: () => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  onStartBattleWithConfig,
  onResetStats,
}) => {
  const [adminFlagCount, setAdminFlagCount] = useState<number>(32);
  const [adminMode, setAdminMode] = useState<GameMode>('chaos');
  const [adminSeries, setAdminSeries] = useState<SeriesMode>(3);
  const [adminTheme, setAdminTheme] = useState<ArenaTheme>('cyber');

  const handleAdminStart = () => {
    onStartBattleWithConfig({
      flagCount: adminFlagCount,
      mode: adminMode,
      series: adminSeries,
      theme: adminTheme,
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 text-white">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
          <ShieldAlert className="w-3.5 h-3.5" /> ADMIN DASHBOARD
        </div>
        <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight">
          ARENA <span className="text-amber-400">MANAGEMENT</span>
        </h1>
        <p className="text-slate-400 text-sm">
          Administrative battle triggers, game parameters, and database controls.
        </p>
      </div>

      {/* Admin Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 font-bold">Total Games</div>
          <div className="text-2xl font-black text-amber-300">125,492</div>
        </div>
        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 font-bold">Online Spectators</div>
          <div className="text-2xl font-black text-emerald-400">2,841</div>
        </div>
        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 font-bold">Today's Votes</div>
          <div className="text-2xl font-black text-indigo-400">14,920</div>
        </div>
        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 font-bold">Server Status</div>
          <div className="text-xs font-extrabold text-emerald-400 mt-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Active 60 FPS
          </div>
        </div>
      </div>

      {/* Admin Battle Trigger Form */}
      <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 space-y-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Flame className="w-5 h-5 text-amber-400" />
          FORCE INSTANT BATTLE LAUNCH
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Flag Count */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">Flags Count</label>
            <select
              value={adminFlagCount}
              onChange={(e) => setAdminFlagCount(parseInt(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
            >
              {[2, 4, 8, 16, 32, 64, 100].map(c => (
                <option key={c} value={c}>{c} Flags</option>
              ))}
            </select>
          </div>

          {/* Mode */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">Game Mode</label>
            <select
              value={adminMode}
              onChange={(e) => setAdminMode(e.target.value as GameMode)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
            >
              <option value="normal">🔵 Normal Mode</option>
              <option value="lightning">⚡ Lightning Mode</option>
              <option value="chaos">🌪️ Chaos Mode</option>
            </select>
          </div>

          {/* Series */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">Series Mode</label>
            <select
              value={adminSeries}
              onChange={(e) => setAdminSeries(parseInt(e.target.value) || 3)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
            >
              <option value={1}>First to 1</option>
              <option value={3}>First to 3</option>
              <option value={5}>First to 5</option>
              <option value={10}>First to 10</option>
              <option value={15}>First to 15</option>
              <option value={20}>First to 20</option>
              <option value={25}>First to 25</option>
              <option value={50}>First to 50</option>
              <option value={100}>First to 100</option>
            </select>
          </div>

          {/* Theme */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">Arena Theme</label>
            <select
              value={adminTheme}
              onChange={(e) => setAdminTheme(e.target.value as ArenaTheme)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
            >
              <option value="cyber">⚡ Cyber</option>
              <option value="space">🌌 Space</option>
              <option value="lava">🌋 Lava</option>
              <option value="ocean">🌊 Ocean</option>
            </select>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleAdminStart}
            className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-500 text-slate-950 font-extrabold text-sm shadow-lg hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            LAUNCH OVERRIDE BATTLE
          </button>

          <button
            onClick={onResetStats}
            className="px-6 py-3.5 rounded-2xl bg-rose-600/20 border border-rose-500/30 text-rose-300 font-bold text-sm hover:bg-rose-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            RESET DATABASE STATS
          </button>
        </div>

      </div>

    </div>
  );
};
