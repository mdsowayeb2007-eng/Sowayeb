import React from 'react';
import { Settings, Volume2, VolumeX, Music, Cpu, RotateCcw, Sparkles } from 'lucide-react';
import { SoundSettings } from '../types';
import { soundManager } from '../utils/audio';

interface SettingsModalProps {
  soundSettings: SoundSettings;
  onUpdateSoundSettings: (newSettings: Partial<SoundSettings>) => void;
  onResetStats: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  soundSettings,
  onUpdateSoundSettings,
  onResetStats,
}) => {
  const currentStyle = soundSettings.soundStyle || 'arcade';

  const handleSelectStyle = (style: 'arcade' | 'marble' | 'chiptune') => {
    onUpdateSoundSettings({ soundStyle: style });
    soundManager.updateSettings({ soundStyle: style });
    soundManager.playCollision(0.8);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8 text-white">
      
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-bold uppercase tracking-wider">
          <Settings className="w-3.5 h-3.5" /> PREFERENCES
        </div>
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">
          GAME <span className="text-slate-400">SETTINGS</span>
        </h1>
      </div>

      <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 space-y-6">
        
        {/* Sound FX Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="font-bold text-sm text-white flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-emerald-400" />
              Sound Effects
            </div>
            <div className="text-xs text-slate-400">Collisions, eliminations, countdown & victory sounds</div>
          </div>
          <button
            onClick={() => onUpdateSoundSettings({ soundFx: !soundSettings.soundFx })}
            className={`w-12 h-6 rounded-full transition-colors relative p-1 cursor-pointer ${
              soundSettings.soundFx ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                soundSettings.soundFx ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Sound FX Style Selector */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Sound Effect Style
            </span>
            <button
              onClick={() => soundManager.playCollision(0.8)}
              className="text-[11px] text-amber-400 hover:underline cursor-pointer"
            >
              🔊 Test Sound
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'arcade', label: '🕹️ Arcade Bounce', desc: 'Punchy dual-tone' },
              { id: 'marble', label: '🔮 Marble Clicks', desc: 'Realistic wooden pops' },
              { id: 'chiptune', label: '👾 Retro 8-Bit', desc: 'Classic chiptune' },
            ].map(style => (
              <button
                key={style.id}
                onClick={() => handleSelectStyle(style.id as any)}
                className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  currentStyle === style.id
                    ? 'bg-amber-500/20 border-amber-500 text-amber-200 shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="font-extrabold text-xs">{style.label}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{style.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Master Volume */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span>Master Volume</span>
            <span>{Math.round(soundSettings.volume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={soundSettings.volume}
            onChange={(e) => onUpdateSoundSettings({ volume: parseFloat(e.target.value) })}
            className="w-full accent-emerald-500 bg-slate-950 rounded-lg cursor-pointer"
          />
        </div>

        {/* Background Music */}
        <div className="flex items-center justify-between pt-2">
          <div className="space-y-0.5">
            <div className="font-bold text-sm text-white flex items-center gap-2">
              <Music className="w-4 h-4 text-indigo-400" />
              Background Music
            </div>
            <div className="text-xs text-slate-400">Synthesized ambient background rhythm</div>
          </div>
          <button
            onClick={() => onUpdateSoundSettings({ bgm: !soundSettings.bgm })}
            className={`w-12 h-6 rounded-full transition-colors relative p-1 cursor-pointer ${
              soundSettings.bgm ? 'bg-indigo-500' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                soundSettings.bgm ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Performance Mode */}
        <div className="flex items-center justify-between pt-2">
          <div className="space-y-0.5">
            <div className="font-bold text-sm text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-amber-400" />
              Performance Mode (60 FPS Mobile Optimization)
            </div>
            <div className="text-xs text-slate-400">Disables heavy canvas glow filters for low-end devices</div>
          </div>
          <button
            onClick={() => onUpdateSoundSettings({ performanceMode: !soundSettings.performanceMode })}
            className={`w-12 h-6 rounded-full transition-colors relative p-1 cursor-pointer ${
              soundSettings.performanceMode ? 'bg-amber-500' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                soundSettings.performanceMode ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Reset Statistics */}
        <div className="pt-4 border-t border-slate-800">
          <button
            onClick={onResetStats}
            className="px-4 py-2.5 rounded-xl bg-rose-600/20 border border-rose-500/30 text-rose-300 text-xs font-bold hover:bg-rose-600/30 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Stored Game Statistics
          </button>
        </div>

      </div>

    </div>
  );
};

