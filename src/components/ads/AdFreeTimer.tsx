import React from 'react';
import { useAdFree } from '../../hooks/useAdFree';

export function AdFreeTimer() {
  const { isAdFree, adFreeRemaining, videosWatched, videosRemaining, totalRequired } = useAdFree();

  if (isAdFree && adFreeRemaining) {
    return (
      <div className="bg-gradient-to-r from-green-900/40 to-emerald-900/40 border border-green-800/50 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎉</span>
          <div><p className="text-green-400 font-semibold text-sm">Ad-Free Active!</p><p className="text-green-300/70 text-xs">{adFreeRemaining}</p></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-800/50 border border-brand-700 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-white font-semibold text-sm">Unlock Ad-Free</h4>
        <span className="text-gold-400 text-xs font-medium">30 Days</span>
      </div>
      <p className="text-gray-400 text-xs mb-3">Watch {totalRequired} short video ads to remove all ads for 30 days</p>
      <div className="mb-2">
        <div className="flex justify-between text-xs text-gray-400 mb-1"><span>Progress</span><span>{videosWatched}/{totalRequired}</span></div>
        <div className="w-full h-2 bg-brand-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-gold-400 to-gold-500 rounded-full transition-all duration-500" style={{ width: `${(videosWatched / totalRequired) * 100}%` }}/>
        </div>
      </div>
      <p className="text-gray-500 text-xs">{videosRemaining > 0 ? `${videosRemaining} more to go` : 'All done! Ad-free activated!'}</p>
    </div>
  );
}