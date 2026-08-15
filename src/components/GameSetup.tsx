import React, { useState } from 'react';
import { Search, Shuffle, Check, Play, Zap, Flame, Compass, Globe2, Shield, Layers } from 'lucide-react';
import { Country, GameMode, SeriesMode, ArenaTheme } from '../types';
import { COUNTRIES, REGIONS } from '../data/countries';

interface GameSetupProps {
  onLaunchBattle: (config: {
    selectedCountries: Country[];
    gameMode: GameMode;
    seriesMode: SeriesMode;
    arenaTheme: ArenaTheme;
  }) => void;
}

export const GameSetup: React.FC<GameSetupProps> = ({ onLaunchBattle }) => {
  const [flagCount, setFlagCount] = useState<number>(32);
  const [selectedCountryIds, setSelectedCountryIds] = useState<string[]>(
    COUNTRIES.slice(0, 32).map(c => c.id)
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [gameMode, setGameMode] = useState<GameMode>('normal');
  const [seriesMode, setSeriesMode] = useState<SeriesMode>(3);
  const [arenaTheme, setArenaTheme] = useState<ArenaTheme>('cyber');

  // Randomize N selection
  const handleRandomSelect = (count: number = flagCount) => {
    const shuffled = [...COUNTRIES].sort(() => 0.5 - Math.random());
    const picked = shuffled.slice(0, Math.min(count, COUNTRIES.length));
    setSelectedCountryIds(picked.map(c => c.id));
    setFlagCount(count);
  };

  // Toggle country selection
  const toggleCountry = (id: string) => {
    if (selectedCountryIds.includes(id)) {
      if (selectedCountryIds.length > 2) {
        setSelectedCountryIds(selectedCountryIds.filter(cId => cId !== id));
      }
    } else {
      setSelectedCountryIds([...selectedCountryIds, id]);
    }
  };

  // Filtered countries list
  const filteredCountries = COUNTRIES.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = selectedRegion === 'All' || c.region === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  const handleLaunch = () => {
    const selected = COUNTRIES.filter(c => selectedCountryIds.includes(c.id));
    onLaunchBattle({
      selectedCountries: selected,
      gameMode,
      seriesMode,
      arenaTheme,
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 text-white">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-tight">
          BATTLE <span className="text-rose-500">SETUP</span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base">
          Configure participants, battle series length, game mode, and arena environment.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Flag & Country Selection */}
        <div className="lg:col-span-2 space-y-6 bg-slate-900/80 p-6 rounded-3xl border border-slate-800 shadow-xl">
          
          {/* Flag Count Selector */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-sm text-slate-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-rose-400" />
                NUMBER OF FLAGS ({selectedCountryIds.length} Selected)
              </label>

              <button
                onClick={() => handleRandomSelect(flagCount)}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-rose-600/20 text-rose-300 border border-rose-500/30 hover:bg-rose-600/30 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Shuffle className="w-3.5 h-3.5" />
                Random {flagCount}
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {[2, 4, 8, 16, 32, 64, 100].map(count => (
                <button
                  key={count}
                  onClick={() => handleRandomSelect(count)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                    flagCount === count
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 ring-2 ring-rose-400'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {count} Flags
                </button>
              ))}
            </div>
          </div>

          {/* Search & Region Filters */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search Box */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search country..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Quick Select Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedCountryIds(COUNTRIES.map(c => c.id))}
                  className="px-3 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300"
                >
                  Select All
                </button>
                <button
                  onClick={() => setSelectedCountryIds(COUNTRIES.slice(0, 16).map(c => c.id))}
                  className="px-3 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300"
                >
                  Top 16
                </button>
              </div>
            </div>

            {/* Region Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {REGIONS.map(region => (
                <button
                  key={region}
                  onClick={() => setSelectedRegion(region)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedRegion === region
                      ? 'bg-slate-700 text-rose-300 border border-rose-500/40'
                      : 'bg-slate-950/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>

          {/* Country Selection Grid */}
          <div className="max-h-[340px] overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 scrollbar-thin scrollbar-thumb-slate-700">
            {filteredCountries.map(country => {
              const isSelected = selectedCountryIds.includes(country.id);
              return (
                <button
                  key={country.id}
                  onClick={() => toggleCountry(country.id)}
                  className={`flex items-center justify-between p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-rose-950/50 border-rose-500 text-white shadow-sm'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-xl">{country.flag}</span>
                    <span className="text-xs font-medium truncate">{country.name}</span>
                  </div>

                  {isSelected && (
                    <div className="w-4 h-4 rounded-full bg-rose-500 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

        </div>

        {/* Right Column: Game Modes, Series, & Theme */}
        <div className="space-y-6">
          
          {/* Series Mode Selector */}
          <div className="bg-slate-900/80 p-5 rounded-3xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-sm text-slate-200 flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" />
                SERIES MODE (First to {seriesMode} Wins)
              </label>
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-slate-400 font-bold">Custom:</span>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={seriesMode}
                  onChange={(e) => setSeriesMode(Math.max(1, Math.min(500, parseInt(e.target.value) || 1)))}
                  className="w-16 bg-slate-950 border border-amber-500/50 rounded-lg px-2 py-0.5 text-xs text-amber-300 font-black text-center focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { mode: 1, label: '1 Win', desc: 'Quick Match' },
                { mode: 3, label: '3 Wins', desc: 'Default' },
                { mode: 5, label: '5 Wins', desc: 'Championship' },
                { mode: 10, label: '10 Wins', desc: 'Marathon' },
                { mode: 15, label: '15 Wins', desc: 'Ultra' },
                { mode: 20, label: '20 Wins', desc: 'Mega Battle' },
                { mode: 25, label: '25 Wins', desc: 'Grand Tour' },
                { mode: 50, label: '50 Wins', desc: 'Epic League' },
                { mode: 100, label: '100 Wins', desc: 'Endless Legend' },
              ].map(s => (
                <button
                  key={s.mode}
                  onClick={() => setSeriesMode(s.mode)}
                  className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    seriesMode === s.mode
                      ? 'bg-amber-950/40 border-amber-500 text-white shadow-md'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <div className="font-bold text-xs sm:text-sm">{s.label}</div>
                  <div className="text-[10px] text-slate-400">{s.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Game Mode Selector */}
          <div className="bg-slate-900/80 p-5 rounded-3xl border border-slate-800 space-y-3">
            <label className="font-bold text-sm text-slate-200 flex items-center gap-2">
              <Zap className="w-4 h-4 text-rose-400" />
              GAME MODE
            </label>
            <div className="space-y-2">
              {[
                {
                  id: 'normal',
                  title: '🔵 Normal Mode',
                  desc: 'Standard physics. Arena slowly opens gap for eliminations.',
                },
                {
                  id: 'lightning',
                  title: '⚡ Lightning Mode',
                  desc: 'Closed arena with random thunderbolts striking flags.',
                },
                {
                  id: 'chaos',
                  title: '🌪️ Chaos Mode',
                  desc: 'Unpredictable wind, vortex, black hole & gravity boosts!',
                },
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => setGameMode(m.id as GameMode)}
                  className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    gameMode === m.id
                      ? 'bg-rose-950/40 border-rose-500 text-white shadow-md'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <div className="font-bold text-sm">{m.title}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{m.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Arena Theme Selector */}
          <div className="bg-slate-900/80 p-5 rounded-3xl border border-slate-800 space-y-3">
            <label className="font-bold text-sm text-slate-200 flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-400" />
              ARENA THEME
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'space', name: '🌌 Space', color: 'from-purple-900 to-indigo-950' },
                { id: 'cyber', name: '⚡ Cyber', color: 'from-cyan-950 to-slate-950' },
                { id: 'lava', name: '🌋 Lava', color: 'from-red-950 to-amber-950' },
                { id: 'ocean', name: '🌊 Ocean', color: 'from-blue-950 to-teal-950' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setArenaTheme(t.id as ArenaTheme)}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer bg-gradient-to-r ${t.color} ${
                    arenaTheme === t.id
                      ? 'border-indigo-400 ring-2 ring-indigo-400/50 text-white font-bold'
                      : 'border-slate-800 text-slate-300 opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="text-sm font-semibold">{t.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* LAUNCH BUTTON */}
          <button
            onClick={handleLaunch}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 text-white font-black text-lg shadow-xl shadow-rose-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer"
          >
            <Flame className="w-6 h-6 fill-amber-300 text-amber-300" />
            🔥 LAUNCH BATTLE ARENA ({selectedCountryIds.length} FLAGS)
          </button>

        </div>

      </div>
    </div>
  );
};
