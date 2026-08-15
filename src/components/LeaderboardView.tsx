import React, { useState, useEffect } from 'react';
import { Trophy, Search, Filter, TrendingUp, Award, ArrowUpRight } from 'lucide-react';
import { CountryStats } from '../types';

interface LeaderboardViewProps {
  onSelectCountry: (countryId: string) => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ onSelectCountry }) => {
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [leaderboardData, setLeaderboardData] = useState<CountryStats[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        if (data.countryStats) {
          setLeaderboardData(data.countryStats);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [timeFilter]);

  const filteredData = leaderboardData.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 text-white">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
          <Trophy className="w-3.5 h-3.5" /> GLOBAL RANKINGS
        </div>
        <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight">
          COUNTRY <span className="text-amber-400">LEADERBOARD</span>
        </h1>
        <p className="text-slate-400 text-sm">
          Top performing countries across battle arena simulations.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Time Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 w-full sm:w-auto">
          {[
            { id: 'today', label: 'Today' },
            { id: 'week', label: 'This Week' },
            { id: 'month', label: 'This Month' },
            { id: 'all', label: 'All Time' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setTimeFilter(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex-1 sm:flex-initial cursor-pointer ${
                timeFilter === tab.id
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search country..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
          />
        </div>

      </div>

      {/* Leaderboard Table */}
      <div className="bg-slate-900/80 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6">Rank</th>
                <th className="py-4 px-6">Country</th>
                <th className="py-4 px-6 text-center">Wins</th>
                <th className="py-4 px-6 text-center">Total Battles</th>
                <th className="py-4 px-6">Win Rate %</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {filteredData.map((item, idx) => {
                const rank = idx + 1;
                const isTop3 = rank <= 3;
                const badge = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;

                return (
                  <tr
                    key={item.id}
                    onClick={() => onSelectCountry(item.id)}
                    className="hover:bg-slate-800/50 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 px-6 font-extrabold text-base">
                      <span className={isTop3 ? 'text-2xl' : 'text-slate-400'}>{badge}</span>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{item.flag}</span>
                        <div>
                          <div className="font-bold text-white group-hover:text-amber-300 transition-colors">
                            {item.name}
                          </div>
                          <div className="text-[11px] text-slate-400">Streak: {item.bestStreak} Wins</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-center font-extrabold text-amber-400 text-base">
                      {item.wins}
                    </td>

                    <td className="py-4 px-6 text-center text-slate-300 font-semibold">
                      {item.totalBattles}
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3 min-w-[120px]">
                        <div className="flex-1 bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full"
                            style={{ width: `${Math.min(100, item.winRate)}%` }}
                          />
                        </div>
                        <span className="font-extrabold text-xs text-slate-200">{item.winRate}%</span>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <button className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 ml-auto">
                        View Stats
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
