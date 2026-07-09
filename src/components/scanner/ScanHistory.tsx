import React, { useEffect, useState } from 'react';
import { db } from '../../lib/db';
import { formatRelativeDate } from '../../lib/utils';
import { EmptyState } from '../common/EmptyState';
import { LoadingSkeleton } from '../common/LoadingSkeleton';
import type { ScanRecord } from '../../types';
import { useNavigate } from 'react-router-dom';

export function ScanHistory() {
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const n = useNavigate();

  useEffect(() => { db.getScanHistory(50).then(setScans).finally(() => setLoading(false)); }, []);

  if (loading) return <LoadingSkeleton type="list" count={5}/>;
  if (scans.length === 0) return <EmptyState title="No Scans Yet" description="Scan coins to build your history." action={{ label: 'Scan a Coin', onClick: () => n('/scan') }}/>;

  return (
    <div className="space-y-3 p-4">
      <h2 className="text-lg font-semibold text-white mb-4">Scan History</h2>
      {scans.map((scan) => (
        <div key={scan.id} className="bg-brand-800/50 rounded-xl p-3 flex items-center gap-3 hover:bg-brand-800/70 cursor-pointer">
          <div className="w-12 h-12 rounded-lg bg-brand-700 flex items-center justify-center"><span className="text-xl">🪙</span></div>
          <div className="flex-1 min-w-0"><p className="text-white font-medium truncate">{scan.matchedCoin?.name || 'Unknown'}</p><p className="text-gray-400 text-xs">{scan.matchedCoin ? `${scan.matchedCoin.country} • ${scan.matchedCoin.year}` : 'No match'}</p></div>
          <div className="text-right"><span className="text-gold-400 font-semibold text-sm">{Math.round(scan.confidence * 100)}%</span><p className="text-gray-500 text-xs">{formatRelativeDate(scan.timestamp)}</p></div>
        </div>
      ))}
    </div>
  );
}