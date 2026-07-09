import { useState, useCallback, useEffect, useRef } from 'react';
import { useAppStore } from '../store/appStore';
import { adMediation, type AuctionResponse } from '../lib/adMediation';
import { isAdFree } from '../lib/ads';

type PlacementType = 'banner' | 'interstitial' | 'fullscreen' | 'rewarded';

export function useAds(placementType: PlacementType) {
  const { adState, isAdFree: adFreeStatus } = useAppStore();
  const [adCode, setAdCode] = useState('');
  const [networkName, setNetworkName] = useState('');
  const [cpm, setCpm] = useState(0);
  const [loading, setLoading] = useState(true);
  const [auctionId, setAuctionId] = useState('');
  const auctionRef = useRef<AuctionResponse | null>(null);

  const fetchAd = useCallback(async () => {
    if (adFreeStatus) { setLoading(false); setAdCode(''); return; }
    setLoading(true);
    try {
      const result = await adMediation.requestAd({ placementType, currentPage: window.location.pathname });
      auctionRef.current = result;
      setAdCode(result.winner.adCode);
      setNetworkName(result.winner.networkName);
      setCpm(result.winner.bid);
      setAuctionId(result.auctionId);
    } catch {} finally { setLoading(false); }
  }, [placementType, adFreeStatus]);

  const reportImpression = useCallback(() => {
    if (auctionRef.current) adMediation.reportEvent(auctionRef.current.auctionId, auctionRef.current.winner.networkId, auctionRef.current.winner.networkName, 'impression', undefined, placementType);
  }, [placementType]);

  const reportClick = useCallback(() => {
    if (auctionRef.current) adMediation.reportEvent(auctionRef.current.auctionId, auctionRef.current.winner.networkId, auctionRef.current.winner.networkName, 'click', undefined, placementType);
  }, [placementType]);

  useEffect(() => { fetchAd(); if (placementType === 'banner') { const i = setInterval(fetchAd, 60000); return () => clearInterval(i); } }, [fetchAd, placementType]);

  return { adCode, networkName, cpm, loading, auctionId, refresh: fetchAd, reportImpression, reportClick };
}