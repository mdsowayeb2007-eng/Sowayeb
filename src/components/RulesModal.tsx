import React from 'react';
import { HelpCircle, Zap, Shield, Flame, Globe2, Trophy } from 'lucide-react';

export const RulesModal: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 text-white">
      
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold uppercase tracking-wider">
          <HelpCircle className="w-3.5 h-3.5" /> GAME RULES & MECHANICS
        </div>
        <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight">
          HOW TO <span className="text-rose-400">PLAY</span>
        </h1>
        <p className="text-slate-400 text-sm">
          Everything you need to know about Flag Arena physics battles.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-3">
            <Flame className="w-6 h-6 text-rose-400" />
            <h2 className="text-lg font-bold text-white">1. Core Arena Objective</h2>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">
            All selected country flags enter a circular physics arena. Flags bounce off walls and collide with each other. Collision impact reduces health. When a flag's HP hits zero OR it falls out through an open arena perimeter gap, it is ELIMINATED.
          </p>
        </div>

        <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-amber-400" />
            <h2 className="text-lg font-bold text-white">2. Game Modes</h2>
          </div>
          <ul className="text-slate-300 text-sm space-y-2 list-disc list-inside">
            <li><strong>🔵 Normal Mode:</strong> Standard collisions; arena gap opens after 12 seconds.</li>
            <li><strong>⚡ Lightning Mode:</strong> Periodic thunderbolts strike random flags.</li>
            <li><strong>🌪️ Chaos Mode:</strong> Sudden winds, vortexes, black holes & speed boosts.</li>
          </ul>
        </div>

        <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">3. Power-Up System</h2>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">
            Floating power-up orbs spawn randomly during battle:
          </p>
          <ul className="text-slate-300 text-xs space-y-1">
            <li>🛡️ <strong>Shield:</strong> Absorbs 1 fatal hit or heavy impact.</li>
            <li>🚀 <strong>Speed:</strong> Temporary high velocity.</li>
            <li>💥 <strong>Power:</strong> Doubles collision damage dealt.</li>
            <li>❤️ <strong>Heal:</strong> Restores +35 HP instantly.</li>
          </ul>
        </div>

        <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">4. Series Championship</h2>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">
            Battles are played as a series (First to 1, First to 3, First to 5, or First to 10 Wins). The country that reaches the target number of round wins first becomes the Series Champion!
          </p>
        </div>

      </div>

    </div>
  );
};
