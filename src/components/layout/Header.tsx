import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function Header() {
  const n = useNavigate();
  const loc = useLocation();
  const { isAuthenticated, user } = useAuth();

  const gt = () => {
    const p = loc.pathname;
    if (p === '/') return 'Coin Identifier';
    if (p.startsWith('/scan')) return 'Scan Coin';
    if (p.startsWith('/collections')) return 'Collections';
    if (p.startsWith('/history')) return 'History';
    if (p.startsWith('/profile')) return 'Profile';
    if (p.startsWith('/login')) return 'Sign In';
    return 'Coin Identifier';
  };

  return (
    <header className="sticky top-0 z-40 bg-brand-950/95 backdrop-blur-md border-b border-brand-800">
      <div className="flex items-center justify-between px-4 h-14 max-w-5xl mx-auto">
        <div className="flex items-center gap-3">
          {loc.pathname !== '/' && <button onClick={() => n(-1)} className="p-1.5 -ml-1.5 text-gray-400 hover:text-white"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg></button>}
          <h1 className="text-lg font-bold text-white">{gt()}</h1>
        </div>
        <div className="flex items-center gap-2">
          {isAuthenticated && user ? <button onClick={() => n('/profile')}><img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full border border-brand-600"/></button> : <button onClick={() => n('/login')} className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm rounded-full font-medium">Sign In</button>}
        </div>
      </div>
    </header>
  );
}