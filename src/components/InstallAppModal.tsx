import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Check, Share2, MoreVertical, Sparkles, ExternalLink } from 'lucide-react';

interface InstallAppModalProps {
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl relative overflow-hidden">
        
        {/* Glow Header */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500" />
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-2xl">
            📱
          </div>
          <div>
            <h3 className="font-black text-xl text-emerald-300">ফোনে অ্যাপ হিসেবে ইনস্টল করুন</h3>
            <p className="text-xs text-slate-400">Install as Mobile App (PWA)</p>
          </div>
        </div>

        {isInstalled ? (
          <div className="bg-emerald-950/40 border border-emerald-500/40 p-4 rounded-2xl text-center my-4 space-y-2">
            <Check className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="font-bold text-emerald-200">অ্যাপটি আপনার ফোনে ইনস্টল করা আছে!</p>
            <p className="text-xs text-slate-300">হোম স্ক্রিন থেকে সহজেই সরাসরি অ্যাপের মতো ব্যবহার করতে পারবেন।</p>
          </div>
        ) : (
          <div className="space-y-4 my-4">
            
            {/* Direct One-Click Install Button if supported */}
            {deferredPrompt && (
              <button
                onClick={handleInstallClick}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 font-black text-white rounded-2xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
              >
                <Download className="w-5 h-5" />
                ১-ক্লিকে অ্যাপ ইনস্টল করুন (Direct Install)
              </button>
            )}

            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="font-bold text-sm text-amber-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                অ্যান্ড্রয়েড (Android) ফোনে ইনস্টল করার নিয়ম:
              </h4>
              <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside pl-1">
                <li>মোবাইলের **Chrome** ব্রাউজারের উপরে ডান কোণায় **৩টি ডট (⋮)** চাপুন।</li>
                <li>মেনু থেকে **"Add to Home screen"** অথবা **"Install app"** অপশনে চাপ দিন।</li>
                <li>**Install** চাপলে এটি সরাসরি ফোনের অ্যাপ লিস্ট ও হোম স্ক্রিনে যুক্ত হয়ে যাবে।</li>
              </ol>
            </div>

            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="font-bold text-sm text-sky-300 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-sky-400" />
                আইফোন (iPhone / iOS) ফোনে ইনস্টল করার নিয়ম:
              </h4>
              <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside pl-1">
                <li>Safari ব্রাউজারে একদম নিচে থাকা **Share (শেয়ার)** আইকনে চাপ দিন।</li>
                <li>নিচে স্ক্রল করে **"Add to Home Screen"** সিলেক্ট করুন।</li>
                <li>উপরে **Add** বাটনে চাপ দিন।</li>
              </ol>
            </div>

          </div>
        )}

        <div className="flex items-center gap-2 mt-5">
          <button
            onClick={handleCopyLink}
            className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-amber-400" />}
            {copied ? 'লিংক কপি হয়েছে!' : 'অ্যাপ লিংক কপি করুন'}
          </button>

          <button
            onClick={onClose}
            className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors"
          >
            ঠিক আছে
          </button>
        </div>

      </div>
    </div>
  );
};
