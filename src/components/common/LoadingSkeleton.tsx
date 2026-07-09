import React from 'react';
interface Props { type: 'card' | 'list' | 'detail'; count?: number }
export function LoadingSkeleton({ type, count = 1 }: Props) {
  const items = Array.from({ length: count }, (_, i) => i);
  if (type === 'card') return (<div className="grid grid-cols-2 md:grid-cols-3 gap-4">{items.map((i) => (<div key={i} className="bg-brand-800/50 rounded-xl p-4 animate-pulse"><div className="aspect-square bg-brand-700 rounded-lg mb-3"/><div className="h-4 bg-brand-700 rounded w-3/4 mb-2"/><div className="h-3 bg-brand-700 rounded w-1/2"/></div>))}</div>);
  if (type === 'list') return (<div className="space-y-3">{items.map((i) => (<div key={i} className="bg-brand-800/50 rounded-xl p-4 animate-pulse flex items-center gap-4"><div className="w-12 h-12 bg-brand-700 rounded-full"/><div className="flex-1"><div className="h-4 bg-brand-700 rounded w-1/2 mb-2"/><div className="h-3 bg-brand-700 rounded w-3/4"/></div></div>))}</div>);
  return (<div className="space-y-4 animate-pulse"><div className="h-8 bg-brand-700 rounded w-1/3"/><div className="h-64 bg-brand-700 rounded-xl"/><div className="h-4 bg-brand-700 rounded w-3/4"/></div>);
}