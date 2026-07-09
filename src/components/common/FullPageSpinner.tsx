import React from 'react';
export function FullPageSpinner({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-brand-950/90 backdrop-blur-sm">
      <div className="relative"><div className="w-16 h-16 border-4 border-brand-700 rounded-full"/><div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-gold-500 rounded-full animate-spin"/></div>
      <p className="mt-4 text-gray-400 font-medium">{message}</p>
    </div>
  );
}