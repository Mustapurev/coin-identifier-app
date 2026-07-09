import React, { useState, useCallback, useEffect } from 'react';
import { useAppStore } from '../../store/appStore';
import { shouldShowInterstitial, INTERSTITIAL_VIDEOS_REQUIRED } from '../../lib/ads';
import { useAdFree } from '../../hooks/useAdFree';

export function AdInterstitial() {
  const [visible, setVisible] = useState(false);
  const [countdown, setCountdown] = useState(15);
  const { adState } = useAppStore();
  const { watchInterstitial, videosRemaining } = useAdFree();

  const show = useCallback(() => { if (!shouldShowInterstitial(adState)) return; setVisible(true); setCountdown(15); }, [adState]);

  useEffect(() => { const t = setTimeout(() => { if (shouldShowInterstitial(adState)) show(); }, 5000); return () => clearTimeout(t); }, [adState, show]);
  useEffect(() => { if (!visible) return; if (countdown <= 0) { handleComplete(); return; } const t = setInterval(() => setCountdown((c) => c - 1), 1000); return () => clearInterval(t); }, [visible, countdown]);

  const handleComplete = () => { setVisible(false); const r = watchInterstitial(); if (r.adFreeActivated) alert('🎉 You are now ad-free for 30 days!'); };
  const handleSkip = () => setVisible(false);
  if (!visible) return null;

  const progress = ((15 - countdown) / 15) * 100;
  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center">
      <button onClick={handleSkip} className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-white">✕</button>
      <div className="w-full max-w-md aspect-[9/16] bg-brand-900 mx-4 rounded-xl flex flex-col items-center justify-center border border-brand-700">
        <div className="text-6xl mb-4">📺</div>
        <p className="text-white font-semibold text-lg mb-2">Video Ad</p>
        <p className="text-gray-400 text-sm mb-6">Watch to earn ad-free time</p>
        <div className="w-48 h-1.5 bg-brand-700 rounded-full overflow-hidden mb-3"><div className="h-full bg-gold-500 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}/></div>
        <p className="text-gray-500 text-xs mb-1">{countdown}s remaining</p>
        <div className="mt-4 bg-brand-800/50 rounded-lg px-4 py-2"><p className="text-gray-400 text-xs">Video {INTERSTITIAL_VIDEOS_REQUIRED - videosRemaining + 1} of {INTERSTITIAL_VIDEOS_REQUIRED}</p></div>
      </div>
      <button onClick={handleSkip} className="mt-6 px-8 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm">Skip (won not count)</button>
    </div>
  );
}