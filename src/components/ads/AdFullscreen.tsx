import React, { useState, useCallback, useEffect } from 'react';
import { useAppStore } from '../../store/appStore';
import { shouldShowFullscreen, recordFullscreenShown } from '../../lib/ads';

export function AdFullscreen() {
  const [visible, setVisible] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const { adState, setAdState } = useAppStore();

  const show = useCallback(() => { if (!shouldShowFullscreen(adState)) return; setVisible(true); setCountdown(5); }, [adState]);

  useEffect(() => { if (!shouldShowFullscreen(adState)) return; const d = 60000 + Math.random() * 60000; const t = setTimeout(show, d); return () => clearTimeout(t); }, []);
  useEffect(() => { if (!visible) return; if (countdown <= 0) { handleClose(); return; } const t = setInterval(() => setCountdown((c) => c - 1), 1000); return () => clearInterval(t); }, [visible, countdown]);

  const handleClose = () => { setVisible(false); setAdState(recordFullscreenShown(adState)); };
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[99] bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center animate-bounce-in">
      <div className="w-full max-w-sm mx-4 bg-gradient-to-br from-brand-800 to-brand-900 rounded-2xl p-8 border border-brand-700 text-center">
        <div className="text-5xl mb-4">🪙</div>
        <h3 className="text-white font-bold text-xl mb-2">Discover Rare Coins</h3>
        <p className="text-gray-400 mb-6">Premium coin identification at your fingertips.</p>
        <div className="bg-brand-700/50 rounded-lg px-4 py-2 mb-4 inline-block"><span className="text-gold-400 font-semibold">Try Premium Features</span></div>
        <p className="text-gray-500 text-xs">Ad closes in {countdown}s</p>
      </div>
      <button onClick={handleClose} className="absolute bottom-10 text-gray-500 hover:text-white text-sm">Close Ad</button>
    </div>
  );
}