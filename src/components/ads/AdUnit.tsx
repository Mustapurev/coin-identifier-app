import React, { useCallback, useEffect } from 'react';
import { useAppStore } from '../../store/appStore';
import { adMediation } from '../../lib/adMediation';

interface AdUnitProps { type: 'banner' | 'interstitial' | 'fullscreen' | 'rewarded'; onComplete?: () => void; autoShow?: boolean }

export function AdUnit({ type, onComplete, autoShow = false }: AdUnitProps) {
  const { isAdFree } = useAppStore();
  const [adCode, setAdCode] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [visible, setVisible] = React.useState(false);

  const loadAd = useCallback(async () => {
    if (isAdFree) return;
    setLoading(true);
    try {
      const result = await adMediation.requestAd({ placementType: type, currentPage: window.location.pathname });
      setAdCode(result.winner.adCode);
      if (type !== 'banner') setVisible(true);
      adMediation.reportEvent(result.auctionId, result.winner.networkId, result.winner.networkName, 'impression', undefined, type);
    } catch {} finally { setLoading(false); }
  }, [type, isAdFree]);

  useEffect(() => { if (autoShow && type !== 'banner') loadAd(); }, [autoShow, type, loadAd]);

  return (
    <>
      {type === 'banner' && <div className="ad-container" dangerouslySetInnerHTML={{ __html: adCode }}/>}
      {visible && type !== 'banner' && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center">
          <button onClick={() => { setVisible(false); onComplete?.(); }} className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">✕</button>
          <div className="w-full max-w-md mx-4" dangerouslySetInnerHTML={{ __html: adCode }}/>
          {loading && (<div className="text-center text-gray-400 py-8"><div className="animate-spin w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full mx-auto mb-2"/><p className="text-sm">Loading...</p></div>)}
        </div>
      )}
    </>
  );
}