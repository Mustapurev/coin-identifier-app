import React from 'react';
interface Props { open: boolean; title: string; message: string; confirmLabel?: string; cancelLabel?: string; onConfirm: () => void; onCancel: () => void; variant?: 'danger' | 'default' }
export function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm, onCancel, variant = 'default' }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel}/>
      <div className="relative bg-brand-800 border border-brand-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-bounce-in">
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-gray-400 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-gray-300 hover:text-white">{cancelLabel}</button>
          <button onClick={onConfirm} className={`px-4 py-2 rounded-lg font-medium ${variant === 'danger' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-brand-600 hover:bg-brand-700 text-white'}`}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}