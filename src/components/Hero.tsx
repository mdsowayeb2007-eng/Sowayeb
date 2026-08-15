import React from 'react';
import { Play, Trophy, BarChart3, Zap, Shield, Globe2, Flame, Vote, Smartphone } from 'lucide-react';
import { motion } from 'motion/react';

interface HeroProps {
  onStartBattle: () => void;
  onViewLeaderboard: () => void;
  onViewStats: () => void;
  onOpenInstallApp?: () => void;
}

const FEATURED_FLAGS = ['🇧🇩', '🇺🇸', '🇮🇳', '🇧🇷', '🇯🇵', '🇬🇧', '🇩🇪', '🇫🇷', '🇦🇷', '🇪🇸', '🇨🇦', '🇦🇺'];

export const Hero: React.FC<HeroProps> = ({
  onStartBattle,
  onViewLeaderboard,
  onViewStats,
  onOpenInstallApp,
}) => {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center px-4 py-12 overflow-hidden bg-slate-950 text-white">
      
      {/* Background Animated Gradient Circles */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-rose-600/20 via-indigo-600/20 to-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Animated Flags */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        {FEATURED_FLAGS.map((flag, idx) => (
          <motion.div
            key={idx}
            className="absolute text-3xl sm:text-4xl"
            initial={{
              x: `${(idx * 8.5) % 90 + 5}%`,
              y: `${(idx * 15) % 80 + 10}%`,
            }}
            animate={{
              y: [`${(idx * 15) % 80 + 10}%`, `${((idx * 15) % 80) + 20}%`, `${(idx * 15) % 80 + 10}%`],
              x: [`${(idx * 8.5) % 90 + 5}%`, `${((idx * 8.5) % 90) + 12}%`, `${(idx * 8.5) % 90 + 5}%`],
              rotate: [0, 15, -15, 0],
            }}
            transition={{
              duration: 6 + (idx % 4) * 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {flag}
          </motion.div>
        ))}
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-4xl text-center space-y-8 my-auto">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-indigo-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm font-semibold tracking-wide">
          <Flame className="w-4 h-4 text-rose-400 animate-pulse" />
          <span>NO REGISTRATION REQUIRED • INSTANT FREE-TO-PLAY</span>
        </div>

        {/* Main Title */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight uppercase">
            WORLD <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-500 to-indigo-400">FLAG BATTLE</span>
          </h1>
          <p className="text-lg sm:text-2xl text-slate-300 max-w-2xl mx-auto font-medium">
            Choose your flags and watch them fight in real-time physics arenas! Last flag standing wins the championship.
          </p>
        </div>

        {/* Action CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={onStartBattle}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 text-white font-extrabold text-lg shadow-xl shadow-rose-600/30 hover:shadow-rose-600/50 hover:scale-105 transition-all flex items-center justify-center gap-3 cursor-pointer"
          >
            <Flame className="w-6 h-6 fill-amber-300 text-amber-300" />
            🔥 START BATTLE
          </button>

          {onOpenInstallApp && (
            <button
              onClick={onOpenInstallApp}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-base shadow-lg shadow-emerald-600/20 hover:scale-105 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Smartphone className="w-5 h-5 text-emerald-200" />
              📱 ফোনে ইনস্টল করুন
            </button>
          )}

          <button
            onClick={onViewLeaderboard}
            className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-white font-bold text-base hover:bg-slate-800 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Trophy className="w-5 h-5 text-amber-400" />
            🏆 LEADERBOARD
          </button>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-12 max-w-3xl mx-auto">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur text-center space-y-1">
            <Globe2 className="w-6 h-6 text-indigo-400 mx-auto" />
            <div className="font-bold text-sm text-slate-200">100+ Countries</div>
            <div className="text-xs text-slate-400">Authentic flags & colors</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur text-center space-y-1">
            <Zap className="w-6 h-6 text-amber-400 mx-auto" />
            <div className="font-bold text-sm text-slate-200">3 Battle Modes</div>
            <div className="text-xs text-slate-400">Normal, Lightning, Chaos</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur text-center space-y-1">
            <Shield className="w-6 h-6 text-rose-400 mx-auto" />
            <div className="font-bold text-sm text-slate-200">Power-Ups</div>
            <div className="text-xs text-slate-400">Shields, Speed, Magnets</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur text-center space-y-1">
            <Vote className="w-6 h-6 text-emerald-400 mx-auto" />
            <div className="font-bold text-sm text-slate-200">Spectator Voting</div>
            <div className="text-xs text-slate-400">Vote live for your country</div>
          </div>
        </div>

      </div>
    </div>
  );
};
