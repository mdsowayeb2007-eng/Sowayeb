import React, { useEffect, useState } from 'react';
import { X, Trophy, Flame, BarChart2, Shield, Globe } from 'lucide-react';
import { CountryStats, BattleRecord } from '../types';

interface CountryProfileModalProps {
  countryId: string;
  onClose: () => void;
}

export const CountryProfileModal: React.FC<CountryProfileModalProps> = ({ countryId, onClose }) => {
  const [profileData, setProfileData] = useState<{
    country: CountryStats;
    history: BattleRecord[];
  } | null>(null);

  useEffect(() => {
    fetch(`/api/country/${countryId}`)
      .then(res => res.json())
      .then(data => {
        if (data.country) {
          setProfileData(data);
        }
      })
      .catch(() => {});
  }, [countryId]);

  if (!profileData) return null;

  const { country, history } = profileData;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl space-y-6 relative">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Country Header */}
        <div className="flex items-center gap-4 pt-2">
          <div className="text-6xl p-3 bg-slate-950 rounded-2xl border border-slate-800">
            {country.flag}
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">{country.name}</h2>
            <p className="text-xs text-slate-400">Country Code: {country.code}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-0.5">
            <div className="text-slate-400">Total Battles</div>
            <div className="font-extrabold text-white text-base">{country.totalBattles}</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-0.5">
            <div className="text-slate-400">Wins</div>
            <div className="font-extrabold text-amber-400 text-base">{country.wins}</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-0.5">
            <div className="text-slate-400">Win Rate</div>
            <div className="font-extrabold text-rose-400 text-base">{country.winRate}%</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-0.5">
            <div className="text-slate-400">Best Streak</div>
            <div className="font-extrabold text-emerald-400 text-base">{country.bestStreak} Wins</div>
          </div>
        </div>

        {/* Recent Match Badges */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            RECENT OUTCOMES
          </div>
          <div className="flex gap-2">
            {[true, true, false, true, true].map((isWin, idx) => (
              <div
                key={idx}
                className={`px-3 py-1.5 rounded-xl text-xs font-black border ${
                  isWin
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                }`}
              >
                {isWin ? '🏆 WIN' : '❌ LOSS'}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
