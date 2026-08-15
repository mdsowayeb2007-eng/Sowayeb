import React, { useState, useEffect } from 'react';
import { BarChart3, Globe, Flame, Shield, Trophy, Zap, Clock, Users } from 'lucide-react';
import { BattleRecord } from '../types';

export const StatisticsView: React.FC = () => {
  const [statsData, setStatsData] = useState<{
    globalStats: any;
    recentBattles: BattleRecord[];
  }>({
    globalStats: {
      totalGames: 125492,
      totalRounds: 382104,
      totalWins: 125492,
      totalEliminations: 3842201,
      mostWinningCountry: 'Bangladesh 🇧🇩',
      mostEliminatedCountry: 'USA 🇺🇸',
      highestWinStreak: 14,
    },
    recentBattles: [],
  });

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        if (data.globalStats) {
          setStatsData({
            globalStats: data.globalStats,
            recentBattles: data.recentBattles || [],
          });
        }
      })
      .catch(() => {});
  }, []);

  const { globalStats, recentBattles } = statsData;

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 text-white">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
          <BarChart3 className="w-3.5 h-3.5" /> ARENA TELEMETRY
        </div>
        <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight">
          GLOBAL <span className="text-indigo-400">STATISTICS</span>
        </h1>
        <p className="text-slate-400 text-sm">
          Comprehensive real-time statistics and historical match outcomes.
        </p>
      </div>

      {/* Global Stat Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-slate-400 text-xs font-bold flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-400" />
            Total Battles
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {globalStats.totalGames?.toLocaleString()}
          </div>
        </div>

        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-slate-400 text-xs font-bold flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-rose-400" />
            Total Eliminations
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-400">
            {globalStats.totalEliminations?.toLocaleString()}
          </div>
        </div>

        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-slate-400 text-xs font-bold flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-emerald-400" />
            Most Winning Country
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-emerald-300 truncate">
            {globalStats.mostWinningCountry}
          </div>
        </div>

        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-slate-400 text-xs font-bold flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-400" />
            Highest Win Streak
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-300">
            {globalStats.highestWinStreak} Wins
          </div>
        </div>

      </div>

      {/* Battle History Log */}
      <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            RECENT BATTLE HISTORY
          </h2>
          <span className="text-xs text-slate-400">Last 20 Matches</span>
        </div>

        <div className="space-y-3">
          {recentBattles.map(battle => (
            <div
              key={battle.id}
              className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-2xl shrink-0">
                  {battle.winnerCountry.flag}
                </div>
                <div>
                  <div className="font-extrabold text-sm text-white flex items-center gap-2">
                    <span>{battle.winnerCountry.name} WON</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {battle.mode}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>Defeated {battle.defeatedCount} Countries</span>
                    <span>•</span>
                    <span>{formatDuration(battle.durationSeconds)}</span>
                  </div>
                </div>
              </div>

              <div className="text-right text-xs text-slate-400 self-end sm:self-center">
                {new Date(battle.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
