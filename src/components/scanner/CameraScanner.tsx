import React, { useState, useCallback } from 'react';
import { useCamera } from '../../hooks/useCamera';
import { useAppStore } from '../../store/appStore';
import { identifyCoin } from '../../lib/coinApi';
import { FullPageSpinner } from '../common/FullPageSpinner';

export function CameraScanner() {
  const { error, isActive, startCamera, stopCamera, captureImage, videoRef } = useCamera();
  const { setLastScan, setScanning, isScanning } = useAppStore();
  const [processing, setProcessing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const handleCapture = useCallback(async () => {
    if (isScanning || processing) return;
    setScanning(true); setProcessing(true);
    try {
      const blob = await captureImage();
      if (!blob) { setProcessing(false); setScanning(false); return; }
      setCapturedImage(URL.createObjectURL(blob));
      const scan = await identifyCoin(blob);
      setLastScan(scan);
      stopCamera();
    } catch {} finally { setProcessing(false); setScanning(false); }
  }, [isScanning, processing, captureImage, setScanning, setLastScan, stopCamera]);

  if (processing) return <FullPageSpinner message="Identifying coin..."/>;

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <div className="w-16 h-16 mb-4 rounded-full bg-red-500/20 flex items-center justify-center"><span className="text-2xl">📷</span></div>
      <h3 className="text-lg font-semibold text-white mb-2">Camera Error</h3>
      <p className="text-gray-400 mb-6 max-w-sm">{error}</p>
      <button onClick={startCamera} className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium">Try Again</button>
    </div>
  );

  if (capturedImage) return (
    <div className="flex flex-col items-center p-4">
      <div className="relative w-full max-w-md rounded-2xl overflow-hidden border-2 border-brand-600">
        <img src={capturedImage} alt="Captured" className="w-full"/>
        <div className="absolute inset-0 border-4 border-gold-500/50 rounded-2xl pointer-events-none"/>
      </div>
    </div>
  );

  if (!isActive) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <div className="w-24 h-24 mb-6 rounded-full bg-brand-800/50 flex items-center justify-center"><span className="text-4xl">📷</span></div>
      <h2 className="text-xl font-bold text-white mb-2">Coin Scanner</h2>
      <p className="text-gray-400 mb-6 max-w-sm">Point your camera at a coin to identify it instantly.</p>
      <button onClick={startCamera} className="px-8 py-3 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white rounded-xl font-semibold text-lg shadow-lg shadow-brand-600/25 active:scale-95">Open Camera</button>
      <p className="text-gray-500 text-xs mt-4">Works best on mobile devices</p>
    </div>
  );

  return (
    <div className="relative min-h-[60vh]">
      <div className="relative w-full max-w-md mx-auto rounded-2xl overflow-hidden bg-black">
        <video ref={videoRef as React.Ref<HTMLVideoElement>}
 autoPlay playsInline muted className="w-full aspect-[3/4] object-cover"/>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-gold-400 rounded-tl-lg"/>
          <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-gold-400 rounded-tr-lg"/>
          <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-gold-400 rounded-bl-lg"/>
          <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-gold-400 rounded-br-lg"/>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"><div className="w-20 h-20 rounded-full border-2 border-gold-400/50"/></div>
        </div>
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm px-4 py-1.5 rounded-full"><p className="text-white text-xs font-medium">Center the coin in the frame</p></div>
      </div>
      <div className="flex justify-center mt-6">
        <button onClick={handleCapture} disabled={isScanning} className="w-20 h-20 rounded-full bg-white border-4 border-brand-800 hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center"><div className="w-16 h-16 rounded-full bg-white border-2 border-brand-300"/></button>
      </div>
      <p className="text-center text-gray-500 text-xs mt-3">Hold steady and tap to capture</p>
    </div>
  );
}