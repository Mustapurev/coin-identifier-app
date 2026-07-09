import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const NI = [
  { path: '/', label: 'Home', icon: '🏠' },
  { path: '/scan', label: 'Scan', icon: '📷' },
  { path: '/collections', label: 'Collections', icon: '📚' },
  { path: '/history', label: 'History', icon: '🕐' },
  { path: '/profile', label: 'Profile', icon: '👤' }
];

export function BottomNav() {
  const n = useNavigate();
  const loc = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-brand-900/95 backdrop-blur-md border-t border-brand-800 safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {NI.map((item) => {
          const isActive = item.path === '/' ? loc.pathname === '/' : loc.pathname.startsWith(item.path);
          return (
            <button key={item.path} onClick={() => n(item.path)} className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-lg transition-colors min-w-[60px] ${isActive ? 'text-gold-400' : 'text-gray-500 hover:text-gray-300'}`}>
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
              {isActive && <div className="w-1 h-1 rounded-full bg-gold-400 mt-0.5"/>}
            </button>
          );
        })}
      </div>
    </nav>
  );
}