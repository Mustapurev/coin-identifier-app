import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCollections } from '../../hooks/useCollections';
import { CollectionCard } from './CollectionCard';
import { EmptyState } from '../common/EmptyState';
import { LoadingSkeleton } from '../common/LoadingSkeleton';

export function CollectionList() {
  const { collections, loadCollections } = useCollections();
  const n = useNavigate();
  const [l, setL] = React.useState(true);
  React.useEffect(() => { loadCollections().finally(() => setL(false)); }, []);

  if (l) return <LoadingSkeleton type="card" count={4}/>;
  return (
    <div className="p-4 pb-24">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">My Collections</h2>
        <button onClick={() => n('/collections/create')} className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium">+ New</button>
      </div>
      {collections.length === 0 ? <EmptyState title="No Collections" description="Create your first collection." action={{ label: 'Create Collection', onClick: () => n('/collections/create') }}/> : <div className="grid grid-cols-2 gap-3">{collections.map((c) => <CollectionCard key={c.id} collection={c} coinCount={c.coinIds.length}/>)}</div>}
    </div>
  );
}