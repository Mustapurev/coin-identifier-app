import React from 'react';
interface Props { icon?: React.ReactNode; title: string; description: string; action?: { label: string; onClick: () => void } }
export function EmptyState({ icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center">
      {icon || (<div className="w-20 h-20 mb-4 rounded-full bg-brand-800/50 flex items-center justify-center"><svg className="w-10 h-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/></svg></div>)}
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 mb-6 max-w-sm">{description}</p>
      {action && (<button onClick={action.onClick} className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium">{action.label}</button>)}
    </div>
  );
}