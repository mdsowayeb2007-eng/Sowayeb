import React, { useEffect, useState } from 'react';
import { Trophy, Crown, Medal, Flame, Sparkles } from 'lucide-react';
import { CountryStats } from '../types';

interface TopWinnersBarProps {
  onSelectCountry?: (countryId: string) => void;
  latestWinner?: { name: string; flag: string; code?: string } | null;
}

export const TopWinnersBar: React.FC<TopWinnersBarProps> = ({ onSelectCountry, latestWinner }) => {
  const [topWinners, setTopWinners] = useState<CountryStats[]>([]);
  const [recentWinners, setRecentWinners] = useState<Array<{ name: string; flag: string; id: string; timeAgo: string }>>([]);
  const [loading, setLoading] = useState(true);

  const fetchWinners = () => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        if (data.countryStats && Array.isArray(data.countryStats)) {
          // Sort by wins descending
          const sorted = [...data.countryStats].sort((a, b) => b.wins - a.wins);
          setTopWinners(sorted.slice(0, 6));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch('/api/history')
      .then(res => res.json())
      .then(data => {
        if (data.history && Array.isArray(data.history)) {
          const recents = data.history.slice(0, 5).map((h: any) => ({
            name: h.winnerCountry.name,
            flag: h.winnerCountry.flag,
            id: h.winnerCountry.id,
            timeAgo: 'Just now',
          }));
          setRecentWinners(recents);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchWinners();
    const interval = setInterval(fetchWinners, 8000);
    return () => clearInterval(interval);
  }, [latestWinner]);

  return (
    <div className="w-full bg-slate-900/90 border-b border-amber-500/20 py-2.5 px-4 text-white shadow-lg backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        
        {/* Left Badge Header */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 px-3 py-1 rounded-full font-black uppercase text-[11px] tracking-wider shadow-md shadow-amber-500/20 animate-pulse">
            <Crown className="w-3.5 h-3.5 fill-current" />
            TOP WINNERS (বিজয়ীদের তালিকা)
          </div>
          {latestWinner && (
            <div className="hidden lg:flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-2.5 py-0.5 rounded-full text-[11px] font-bold animate-bounce">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              New Champion: {latestWinner.flag} {latestWinner.name}
            </div>
          )}
        </div>

        {/* Top Winners List Cards */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none py-0.5">
          {loading && topWinners.length === 0 ? (
            <div className="text-slate-400 text-xs italic">Loading top winners...</div>
          ) : (
            topWinners.map((country, idx) => {
              const rankIcons = [<Crown key="1" className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />, <Medal key="2" className="w-3.5 h-3.5 text-slate-300" />, <Medal key="3" className="w-3.5 h-3.5 text-amber-600" />];
              const rankColor = idx === 0 ? 'border-amber-400/60 bg-amber-500/10 text-amber-200' : idx === 1 ? 'border-slate-400/50 bg-slate-800/80 text-slate-200' : idx === 2 ? 'border-amber-700/50 bg-amber-900/20 text-amber-300' : 'border-slate-800 bg-slate-950/60 text-slate-300';

              return (
                <div
                  key={country.id}
                  onClick={() => onSelectCountry?.(country.id)}
                  className={`flex items-center gap-2 px-3 py-1 rounded-xl border ${rankColor} shrink-0 cursor-pointer hover:scale-105 transition-all shadow-sm group`}
                >
                  <span className="font-black text-[11px] flex items-center gap-1">
                    {idx < 3 ? rankIcons[idx] : `#${idx + 1}`}
                  </span>
                  <span className="text-base group-hover:scale-110 transition-transform">{country.flag}</span>
                  <span className="font-extrabold text-[12px] tracking-tight">{country.name}</span>
                  <span className="bg-slate-900/90 text-amber-400 px-1.5 py-0.5 rounded-md font-black text-[10px] border border-amber-500/30">
                    {country.wins} Wins
                  </span>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
