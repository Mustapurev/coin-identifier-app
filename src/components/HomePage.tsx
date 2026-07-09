import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAdFree } from '../hooks/useAdFree';
import { AdFreeTimer } from './ads/AdFreeTimer';

export function HomePage() {
  const n = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { isAdFree } = useAdFree();

  return (
    <div className="p-4 pb-24 space-y-6 max-w-lg mx-auto">
      <div className="text-center py-6">
        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/20"><span className="text-4xl">🪙</span></div>
        <h1 className="text-2xl font-bold text-white mb-2">{isAuthenticated ? `Welcome, ${user?.displayName || user?.name}!` : 'Coin Identifier'}</h1>
        <p className="text-gray-400 text-sm max-w-xs mx-auto">Scan any coin to identify it instantly. Build your collection.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <QA icon="📷" title="Scan Coin" desc="Identify any coin" onClick={() => n('/scan')} primary/>
        <QA icon="📚" title="Collections" desc="Browse your coins" onClick={() => n('/collections')}/>
        <QA icon="🕐" title="History" desc="Recent scans" onClick={() => n('/history')}/>
        <QA icon="👤" title="Profile" desc="Manage account" onClick={() => n('/profile')}/>
      </div>
      {!isAdFree && <AdFreeTimer/>}
      <div className="bg-brand-800/30 border border-brand-700 rounded-xl p-4">
        <h3 className="text-white font-semibold text-sm mb-3">Getting Started</h3>
        <div className="space-y-3 text-sm text-gray-400">
          <div className="flex gap-3"><span className="text-gold-400 font-bold">1.</span><p>Tap <strong className="text-white">Scan</strong> and point camera at a coin.</p></div>
          <div className="flex gap-3"><span className="text-gold-400 font-bold">2.</span><p>AI identifies the coin with details.</p></div>
          <div className="flex gap-3"><span className="text-gold-400 font-bold">3.</span><p>Add to <strong className="text-white">Collections</strong>.</p></div>
          <div className="flex gap-3"><span className="text-gold-400 font-bold">4.</span><p>Watch 5 ads for <strong className="text-white">30 days ad-free</strong>.</p></div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <FB text="🔍 AI Identification"/><FB text="📱 PWA Support"/>
        <FB text="📚 Collections"/><FB text="🔐 Google Login"/>
        <FB text="🎯 Offline Ready"/><FB text="📊 Rarity Info"/>
      </div>
    </div>
  );
}

function QA({ icon, title, desc, onClick, primary }: { icon: string; title: string; desc: string; onClick: () => void; primary?: boolean }) {
  return (
    <button onClick={onClick} className={`p-4 rounded-xl text-left transition-all active:scale-[0.98] ${primary ? 'bg-gradient-to-br from-brand-600 to-brand-700 border border-brand-500/50' : 'bg-brand-800/50 border border-brand-700'}`}>
      <span className="text-2xl">{icon}</span><h3 className="text-white font-semibold text-sm mt-2">{title}</h3><p className="text-gray-400 text-xs mt-0.5">{desc}</p>
    </button>
  );
}

function FB({ text }: { text: string }) {
  return <div className="bg-brand-800/30 border border-brand-700/50 rounded-lg px-3 py-2 text-center"><span className="text-gray-300 text-xs">{text}</span></div>;
}