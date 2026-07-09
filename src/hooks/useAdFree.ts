import { useCallback } from 'react';
import { useAppStore } from '../store/appStore';
import { recordInterstitialWatch, getVideosRemaining, getAdFreeRemaining, isAdFree } from '../lib/ads';

export function useAdFree() {
  const { adState, setAdState } = useAppStore();
  const watchInterstitial = useCallback(() => {
    const ns = recordInterstitialWatch(adState);
    setAdState(ns);
    return { success: true, adFreeActivated: isAdFree(ns) };
  }, [adState, setAdState]);
  return {
    watchInterstitial,
    videosWatched: adState.interstitialVideosWatched,
    videosRemaining: getVideosRemaining(adState),
    totalRequired: 5,
    adFreeRemaining: getAdFreeRemaining(adState),
    isAdFree: isAdFree(adState),
    adFreeUntil: adState.adFreeUntil
  };
}