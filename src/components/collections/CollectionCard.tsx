import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Collection } from '../../types';
import { formatRelativeDate } from '../../lib/utils';

interface Props { collection: Collection; coinCount: number }

export function CollectionCard({ collection, coinCount }: Props) {
  const n = useNavigate();
  return (
    <div onClick={() => n(`/collections/${collection.id}`)} className="bg-brand-800/50 rounded-xl overflow-hidden border border-brand-700 hover:border-brand-600 transition-all cursor-pointer active:scale-[0.98]">
      <div className="aspect-video bg-gradient-to-br from-brand-700 to-brand-800 flex items-center justify-center"><span className="text-4xl">📚</span></div>
      <div className="p-3">
        <h3 className="text-white font-semibold truncate">{collection.name}</h3>
        <p className="text-gray-400 text-xs mt-1 line-clamp-2">{collection.description || 'No description'}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-gray-500 text-xs">{coinCount} coins</span>
          <span className="text-gray-500 text-xs">{formatRelativeDate(collection.updatedAt)}</span>
        </div>
        {collection.isPublic && <span className="inline-block mt-2 px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">Public</span>}
      </div>
    </div>
  );
}