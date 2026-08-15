import React, { useState } from 'react';
import { X, Copy, Check, Share2, Trophy } from 'lucide-react';
import { Country, GameMode } from '../types';

interface ShareModalProps {
  winner: Country;
  defeatedCount: number;
  durationSeconds: number;
  mode: GameMode;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  winner,
  defeatedCount,
  durationSeconds,
  mode,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  const battleId = Math.floor(100000 + Math.random() * 900000);
  const shareUrl = `${window.location.origin}/battle/${battleId}`;
  
  const shareText = `🏆 BATTLE COMPLETE!\n\n${winner.flag} ${winner.name.toUpperCase()} WON FLAG ARENA!\n\nDefeated: ${defeatedCount} Countries\nMode: ${mode.toUpperCase()}\n\nWatch Battle: ${shareUrl}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl space-y-5 relative">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
          <Share2 className="w-4 h-4" />
          SHARE BATTLE OUTCOME
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-xs text-slate-300 space-y-2 whitespace-pre-line">
          {shareText}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-400"
          />
          <button
            onClick={handleCopy}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>

      </div>
    </div>
  );
};
