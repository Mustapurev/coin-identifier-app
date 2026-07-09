import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/appStore';
import { formatDate } from '../../lib/utils';

export function ScanResult() {
  const { lastScan } = useAppStore();
  const n = useNavigate();

  if (!lastScan || !lastScan.matchedCoin) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
      <p className="text-gray-400">No scan results yet.</p>
      <button onClick={() => n('/scan')} className="mt-4 px-6 py-2.5 bg-brand-600 text-white rounded-lg">Scan a Coin</button>
    </div>
  );

  const coin = lastScan.matchedCoin;
  const cp = Math.round(lastScan.confidence * 100);

  return (
    <div className="max-w-lg mx-auto p-4 pb-24">
      <div className="mb-4 p-3 rounded-xl bg-brand-800/50 border border-brand-700 flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${cp >= 80 ? 'bg-green-500/20' : cp >= 60 ? 'bg-yellow-500/20' : 'bg-red-500/20'}`}>{cp >= 80 ? '✅' : cp >= 60 ? '⚠️' : '❓'}</div>
        <div><p className="text-white font-semibold">{cp}% Match</p><p className="text-gray-400 text-xs">{cp >= 80 ? 'High confidence' : 'Verify details'}</p></div>
      </div>
      <div className="bg-gradient-to-br from-brand-800 to-brand-900 rounded-2xl border border-brand-700 overflow-hidden">
        <div className="aspect-square bg-brand-700 flex items-center justify-center"><div className="text-8xl">🪙</div></div>
        <div className="p-4 space-y-3">
          <h2 className="text-xl font-bold text-white">{coin.name}</h2>
          <p className="text-gold-400 font-medium">{coin.country} • {coin.year} • {coin.denomination} {coin.currency}</p>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-brand-800/30 rounded-lg p-2.5"><p className="text-gray-500 text-xs">Composition</p><p className="text-white text-sm font-medium">{coin.composition}</p></div>
            <div className="bg-brand-800/30 rounded-lg p-2.5"><p className="text-gray-500 text-xs">Diameter</p><p className="text-white text-sm font-medium">{coin.diameter ? `${coin.diameter}mm` : 'N/A'}</p></div>
            <div className="bg-brand-800/30 rounded-lg p-2.5"><p className="text-gray-500 text-xs">Weight</p><p className="text-white text-sm font-medium">{coin.weight ? `${coin.weight}g` : 'N/A'}</p></div>
            <div className="bg-brand-800/30 rounded-lg p-2.5"><p className="text-gray-500 text-xs">Rarity</p><p className="text-white text-sm font-medium">{coin.rarity}</p></div>
          </div>
        </div>
      </div>
      <div className="flex gap-3 mt-4">
        <button onClick={() => n(`/collections/create`)} className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold">+ Add to Collection</button>
        <button onClick={() => n('/scan')} className="px-6 py-3 bg-brand-800 hover:bg-brand-700 text-white rounded-xl">Scan Again</button>
      </div>
      <p className="text-gray-500 text-xs text-center mt-4">Scanned: {formatDate(lastScan.timestamp)}</p>
    </div>
  );
}