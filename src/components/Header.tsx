import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Shield, Trophy, BarChart3, Settings, HelpCircle, ShieldAlert, Play, Pause, Home, Zap, LogOut, Smartphone, Menu } from 'lucide-react';
import { SoundSettings } from '../types';

interface HeaderProps {
  activeTab: 'home' | 'setup' | 'battle' | 'leaderboard' | 'stats' | 'rules' | 'settings' | 'admin';
  setActiveTab: (tab: 'home' | 'setup' | 'battle' | 'leaderboard' | 'stats' | 'rules' | 'settings' | 'admin') => void;
  soundSettings: SoundSettings;
  toggleSound: () => void;
  isPaused?: boolean;
  onTogglePause?: () => void;
  onExitBattle?: () => void;
  onOpenInstallApp?: () => void;
  isUIVisible?: boolean;
  onToggleUIVisible?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  soundSettings,
  toggleSound,
  isPaused = false,
  onTogglePause,
  onExitBattle,
  onOpenInstallApp,
  isUIVisible = true,
  onToggleUIVisible,
}) => {
  const [isScrollVisible, setIsScrollVisible] = useState<boolean>(true);

  // Auto-hide header when scrolling down, show when scrolling up
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let touchStartY = 0;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // If close to top, always show
      if (currentScrollY <= 15) {
        setIsScrollVisible(true);
      } else if (currentScrollY > lastScrollY + 8) {
        // Scrolling down -> hide header
        setIsScrollVisible(false);
      } else if (currentScrollY < lastScrollY - 8) {
        // Scrolling up -> show header
        setIsScrollVisible(true);
      }
      lastScrollY = currentScrollY;
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const currentTouchY = e.touches[0].clientY;
      const deltaY = currentTouchY - touchStartY;

      // Swiping up (moving page down) -> hide header
      if (deltaY < -20 && window.scrollY > 20) {
        setIsScrollVisible(false);
      }
      // Swiping down (moving page up) -> show header
      else if (deltaY > 20) {
        setIsScrollVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  const showHeader = isUIVisible && isScrollVisible;

  return (
    <>
      <header
        className={`sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 text-white transition-all duration-300 overflow-hidden ${
          showHeader
            ? 'h-16 max-h-16 opacity-100 translate-y-0'
            : 'h-0 max-h-0 opacity-0 -translate-y-full border-b-0 pointer-events-none'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <div 
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 p-0.5 shadow-lg shadow-rose-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-bold text-xl">
                🏳️
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-black text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-300 to-indigo-300">
                FLAG ARENA
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-tight -mt-1 hidden sm:block">
                PHYSICS BATTLE ROYALE
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'home' 
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Home className="w-4 h-4" />
              Home
            </button>

            <button
              onClick={() => setActiveTab('setup')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'setup' || activeTab === 'battle'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              Play
            </button>

            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'leaderboard' 
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Trophy className="w-4 h-4" />
              Leaderboard
            </button>

            <button
              onClick={() => setActiveTab('stats')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'stats' 
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Statistics
            </button>

            <button
              onClick={() => setActiveTab('rules')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'rules' 
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              Rules
            </button>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2">
            {/* Battle Controls inside Header when playing */}
            {activeTab === 'battle' && (
              <div className="flex items-center gap-1.5 mr-1 sm:mr-2">
                <button
                  onClick={onTogglePause}
                  title={isPaused ? "Resume Battle" : "Pause Battle"}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-300 hover:text-white hover:bg-slate-800 cursor-pointer flex items-center gap-1.5 text-xs font-bold shadow-md shadow-amber-500/10 transition-all"
                >
                  {isPaused ? <Play className="w-3.5 h-3.5 fill-current text-amber-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
                  <span className="hidden sm:inline">{isPaused ? "Resume" : "Pause"}</span>
                </button>

                <button
                  onClick={onExitBattle}
                  title="Exit Battle"
                  className="px-2.5 py-1.5 rounded-xl bg-rose-600/20 border border-rose-500/40 text-rose-300 hover:bg-rose-600/30 cursor-pointer flex items-center gap-1 text-xs font-bold transition-all shadow-sm"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Exit Battle</span>
                </button>
              </div>
            )}

            {/* Install Mobile App Button */}
            {onOpenInstallApp && (
              <button
                onClick={onOpenInstallApp}
                title="Install Mobile App"
                className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600/30 to-teal-600/30 border border-emerald-500/50 text-emerald-300 hover:text-white hover:bg-emerald-600/40 cursor-pointer flex items-center gap-1.5 text-xs font-bold transition-all shadow-md shadow-emerald-500/10"
              >
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">এপ ইনস্টল</span>
              </button>
            )}

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              title={soundSettings.soundFx ? "Mute Audio" : "Unmute Audio"}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors relative"
            >
              {soundSettings.soundFx ? (
                <Volume2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <VolumeX className="w-5 h-5 text-slate-500" />
              )}
            </button>

            {/* Settings */}
            <button
              onClick={() => setActiveTab('settings')}
              title="Game Settings"
              className={`p-2 rounded-xl border transition-colors ${
                activeTab === 'settings' 
                  ? 'bg-rose-600/20 border-rose-500 text-rose-300' 
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* Admin Panel Link */}
            <button
              onClick={() => setActiveTab('admin')}
              title="Admin Controls"
              className={`p-2 rounded-xl border transition-colors ${
                activeTab === 'admin' 
                  ? 'bg-amber-600/20 border-amber-500 text-amber-300' 
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-amber-300 hover:bg-slate-800'
              }`}
            >
              <ShieldAlert className="w-5 h-5" />
            </button>
          </div>

        </div>
      </header>

      {/* Floating reveal handle when UI is hidden (small single-line handle on right side) */}
      {!showHeader && (
        <button
          onClick={() => {
            setIsScrollVisible(true);
            if (onToggleUIVisible) onToggleUIVisible();
          }}
          title="মেনু দেখুন (স্ক্রিনে ডাবল ট্যাপ করেও খোলা যাবে)"
          aria-label="Show Menu"
          className="fixed bottom-2.5 right-3 z-50 py-2 px-3 rounded-full bg-slate-900/70 hover:bg-slate-900/95 border border-slate-700/50 hover:border-rose-500/70 shadow-xl backdrop-blur-sm flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 group"
        >
          <div className="w-5 h-1 rounded-full bg-slate-400/90 group-hover:bg-rose-400 transition-colors shadow-sm" />
        </button>
      )}
    </>
  );
};
