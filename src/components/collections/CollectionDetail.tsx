import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCollections } from '../../hooks/useCollections';
import { formatDate, formatRelativeDate } from '../../lib/utils';
import { EmptyState } from '../common/EmptyState';
import { LoadingSkeleton } from '../common/LoadingSkeleton';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useAppStore } from '../../store/appStore';
import type { CoinRecord } from '../../types';
import { MOCK_COINS } from '../../lib/coinApi';

export function CollectionDetail() {
  const { id } = useParams<{ id: string }>();
  const { collections, removeCoin, deleteCollection, editCollection } = useCollections();
  const { showToast } = useAppStore();
  const n = useNavigate();
  const [l, setL] = useState(true);
  const [coins, setCoins] = useState<CoinRecord[]>([]);
  const [sdd, setSdd] = useState(false);
  const [ed, setEd] = useState(false);
  const [en, setEn] = useState('');
  const [eds, setEds] = useState('');

  const collection = collections.find((c) => c.id === id);

  useEffect(() => {
    if (!collection) return;
    setEn(collection.name); setEds(collection.description);
    setCoins(MOCK_COINS.filter((c) => collection.coinIds.includes(c.id)));
    setL(false);
  }, [collection]);

  if (l) return <LoadingSkeleton type="detail"/>;
  if (!collection) return <EmptyState title="Not Found" description="Collection may have been deleted." action={{ label: 'Back', onClick: () => n('/collections') }}/>;

  const hd = async () => { await deleteCollection(collection.id); showToast('Deleted'); n('/collections'); };
  const hse = async () => { await editCollection(collection.id, { name: en, description: eds }); setEd(false); showToast('Updated!'); };

  return (
    <div className="p-4 pb-24 max-w-lg mx-auto">
      {ed ? (
        <div className="space-y-3 mb-4">
          <input type="text" value={en} onChange={(e) => setEn(e.target.value)} className="w-full bg-brand-800 border border-brand-700 rounded-lg px-4 py-2 text-white text-lg font-semibold"/>
          <textarea value={eds} onChange={(e) => setEds(e.target.value)} className="w-full bg-brand-800 border border-brand-700 rounded-lg px-4 py-2 text-white resize-none" rows={2}/>
          <div className="flex gap-2"><button onClick={hse} className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm">Save</button><button onClick={() => setEd(false)} className="px-4 py-2 bg-brand-700 text-white rounded-lg text-sm">Cancel</button></div>
        </div>
      ) : (
        <div className="mb-4">
          <div className="flex items-start justify-between">
            <div><h2 className="text-xl font-bold text-white">{collection.name}</h2><p className="text-gray-400 text-sm mt-1">{collection.description || 'No description'}</p></div>
            <div className="flex gap-1"><button onClick={() => setEd(true)} className="p-2 text-gray-400 hover:text-white">✏️</button><button onClick={() => setSdd(true)} className="p-2 text-gray-400 hover:text-red-400">🗑️</button></div>
          </div>
          <div className="flex gap-3 mt-2 text-xs text-gray-500"><span>{collection.coinIds.length} coins</span><span>Created {formatDate(collection.createdAt)}</span>{collection.isPublic && <span className="text-green-400">Public</span>}</div>
        </div>
      )}
      {coins.length === 0 ? <EmptyState title="No Coins" description="Scan coins and add them here." action={{ label: 'Scan', onClick: () => n('/scan') }}/> : (
        <div className="space-y-2">{coins.map((coin) => (
          <div key={coin.id} className="bg-brand-800/50 rounded-xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-700 flex items-center justify-center text-lg">🪙</div>
            <div className="flex-1 min-w-0"><p className="text-white font-medium truncate">{coin.name}</p><p className="text-gray-400 text-xs">{coin.country} • {coin.year}</p></div>
            <button onClick={async () => { await removeCoin(collection.id, coin.id); setCoins((p) => p.filter((c) => c.id !== coin.id)); }} className="text-gray-500 hover:text-red-400 text-sm">Remove</button>
          </div>
        ))}</div>
      )}
      <ConfirmDialog open={sdd} title="Delete Collection" message={`Delete "${collection.name}"?`} confirmLabel="Delete" variant="danger" onConfirm={hd} onCancel={() => setSdd(false)}/>
    </div>
  );
}