import React, { useEffect, useRef } from 'react';
import { useAppStore } from '../../store/appStore';
import { useAds } from '../../hooks/useAds';

interface Props { position?: 'top' | 'bottom' }

export function AdBanner({ position = 'bottom' }: Props) {
  const { isAdFree, adState } = useAppStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const { adCode, loading, networkName, cpm, reportImpression, refresh } = useAds('banner');

  if (isAdFree || !adState.bannerEnabled) return null;

  useEffect(() => { if (adCode && !loading) reportImpression(); }, [adCode, loading]);

  return (
    <div ref={containerRef} className={`w-full ${position === 'top' ? 'mb-0' : 'mt-auto'}`} style={{ minHeight: '50px', maxHeight: '100px' }}>
      {loading ? (
        <div className="flex items-center justify-center py-3"><div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"/></div>
      ) : (
        <>
          <div className="ad-container w-full flex justify-center" dangerouslySetInnerHTML={{ __html: adCode }}/>
          {import.meta.env.DEV && (<div className="text-[10px] text-gray-600 text-center">{networkName} @ ${cpm.toFixed(2)} <button onClick={refresh} className="ml-2 underline">↻</button></div>)}
        </>
      )}
    </div>
  );
}