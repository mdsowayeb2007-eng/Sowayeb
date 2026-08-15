import React from 'react';
import { Home, Play, Trophy, BarChart3, Settings, Smartphone } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: 'home' | 'setup' | 'battle' | 'leaderboard' | 'stats' | 'rules' | 'settings' | 'admin';
  setActiveTab: (tab: 'home' | 'setup' | 'battle' | 'leaderboard' | 'stats' | 'rules' | 'settings' | 'admin') => void;
  onOpenInstallApp?: () => void;
  isUIVisible?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenInstallApp,
  isUIVisible = true,
}) => {
  return (
    <div
      className={`md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800 backdrop-blur-md py-2 px-2 flex items-center justify-around text-xs transition-all duration-300 transform ${
        isUIVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      
      <button
        onClick={() => setActiveTab('home')}
        className={`flex flex-col items-center gap-1 cursor-pointer ${
          activeTab === 'home' ? 'text-rose-400 font-bold' : 'text-slate-400'
        }`}
      >
        <Home className="w-5 h-5" />
        <span>Home</span>
      </button>

      <button
        onClick={() => setActiveTab('setup')}
        className={`flex flex-col items-center gap-1 cursor-pointer ${
          activeTab === 'setup' || activeTab === 'battle' ? 'text-rose-400 font-bold' : 'text-slate-400'
        }`}
      >
        <Play className="w-5 h-5 fill-current" />
        <span>Battle</span>
      </button>

      {onOpenInstallApp && (
        <button
          onClick={onOpenInstallApp}
          className="flex flex-col items-center gap-1 cursor-pointer text-emerald-400 font-bold"
        >
          <Smartphone className="w-5 h-5" />
          <span>Install</span>
        </button>
      )}

      <button
        onClick={() => setActiveTab('leaderboard')}
        className={`flex flex-col items-center gap-1 cursor-pointer ${
          activeTab === 'leaderboard' ? 'text-rose-400 font-bold' : 'text-slate-400'
        }`}
      >
        <Trophy className="w-5 h-5" />
        <span>Rank</span>
      </button>

      <button
        onClick={() => setActiveTab('settings')}
        className={`flex flex-col items-center gap-1 cursor-pointer ${
          activeTab === 'settings' ? 'text-rose-400 font-bold' : 'text-slate-400'
        }`}
      >
        <Settings className="w-5 h-5" />
        <span>Settings</span>
      </button>

    </div>
  );
};
