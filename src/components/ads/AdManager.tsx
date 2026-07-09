import React from 'react';
import { AdBanner } from './AdBanner';
import { AdInterstitial } from './AdInterstitial';
import { AdFullscreen } from './AdFullscreen';
import { AdFreeTimer } from './AdFreeTimer';

export function AdManager() { return (<><AdInterstitial/><AdFullscreen/></>); }
export function AdBannerWrapper({ position = 'bottom' }: { position?: 'top' | 'bottom' }) { return <AdBanner position={position}/>; }
export { AdFreeTimer };