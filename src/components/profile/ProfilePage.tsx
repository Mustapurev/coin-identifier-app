import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useAdFree } from '../../hooks/useAdFree';
import { AdFreeTimer } from '../ads/AdFreeTimer';
import { updateProfile } from '../../lib/auth';
import { useAppStore } from '../../store/appStore';
import { useNavigate } from 'react-router-dom';

export function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth();
  const { showToast } = useAppStore();
  const { isAdFree, adFreeRemaining, videosWatched, videosRemaining, totalRequired } = useAdFree();
  const n = useNavigate();
  const [ed, setEd] = useState(false);
  const [dn, setDn] = useState(user?.displayName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [curr, setCurr] = useState(user?.preferredCurrency || 'USD');

  if (!isAuthenticated || !user) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <div className="w-20 h-20 rounded-full bg-brand-800/50 flex items-center justify-center mb-4"><span className="text-3xl">👤</span></div>
      <h3 className="text-lg font-semibold text-white mb-2">Sign In Required</h3>
      <p className="text-gray-400 mb-6">Sign in with Google to manage your profile.</p>
      <button onClick={() => n('/login')} className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium">Sign In</button>
    </div>
  );

  const hs = async () => { await updateProfile(user.id, { displayName: dn, bio, preferredCurrency: curr }); setEd(false); showToast('Profile updated!'); };

  return (
    <div className="p-4 max-w-md mx-auto pb-24 space-y-6">
      <div className="text-center"><img src={user.picture} alt={user.name} className="w-20 h-20 rounded-full mx-auto border-2 border-brand-600"/><h2 className="text-xl font-bold text-white mt-3">{user.name}</h2><p className="text-gray-400 text-sm">{user.email}</p></div>
      <AdFreeTimer/>
      {ed ? (
        <div className="space-y-4 bg-brand-800/50 border border-brand-700 rounded-xl p-4">
          <div><label className="block text-sm font-medium text-gray-300 mb-1">Display Name</label><input type="text" value={dn} onChange={(e) => setDn(e.target.value)} className="w-full bg-brand-800 border border-brand-700 rounded-lg px-4 py-2.5 text-white"/></div>
          <div><label className="block text-sm font-medium text-gray-300 mb-1">Bio</label><textarea value={bio} onChange={(e) => setBio(e.target.value)} className="w-full bg-brand-800 border border-brand-700 rounded-lg px-4 py-2.5 text-white resize-none" rows={3}/></div>
          <div><label className="block text-sm font-medium text-gray-300 mb-1">Currency</label><select value={curr} onChange={(e) => setCurr(e.target.value)} className="w-full bg-brand-800 border border-brand-700 rounded-lg px-4 py-2.5 text-white"><option value="USD">USD</option><option value="EUR">EUR</option><option value="GBP">GBP</option><option value="INR">INR</option></select></div>
          <div className="flex gap-2"><button onClick={hs} className="flex-1 py-2.5 bg-brand-600 text-white rounded-lg font-medium">Save</button><button onClick={() => setEd(false)} className="px-4 py-2.5 bg-brand-700 text-white rounded-lg">Cancel</button></div>
        </div>
      ) : (
        <div className="bg-brand-800/50 border border-brand-700 rounded-xl p-4 space-y-3">
          <div className="flex justify-between"><span className="text-gray-400 text-sm">Display Name</span><span className="text-white text-sm">{user.displayName || user.name}</span></div>
          <div className="flex justify-between"><span className="text-gray-400 text-sm">Bio</span><span className="text-white text-sm">{user.bio || '—'}</span></div>
          <div className="flex justify-between"><span className="text-gray-400 text-sm">Currency</span><span className="text-white text-sm">{user.preferredCurrency || 'USD'}</span></div>
          <button onClick={() => setEd(true)} className="w-full mt-2 py-2 bg-brand-700 hover:bg-brand-600 text-white rounded-lg text-sm">Edit Profile</button>
        </div>
      )}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-brand-800/50 border border-brand-700 rounded-xl p-3 text-center"><p className="text-gray-400 text-xs">Scans</p><p className="text-white font-bold text-lg">—</p></div>
        <div className="bg-brand-800/50 border border-brand-700 rounded-xl p-3 text-center"><p className="text-gray-400 text-xs">Collections</p><p className="text-white font-bold text-lg">—</p></div>
        <div className="bg-brand-800/50 border border-brand-700 rounded-xl p-3 text-center"><p className="text-gray-400 text-xs">Coins</p><p className="text-white font-bold text-lg">—</p></div>
      </div>
      <div className="bg-brand-800/50 border border-brand-700 rounded-xl p-4">
        <h3 className="text-white font-semibold text-sm mb-3">Ad Status</h3>
        {isAdFree ? <div className="text-green-400 text-sm">Ad-Free: {adFreeRemaining}</div> : <div className="text-gray-400 text-sm space-y-1"><p>Videos: {videosWatched}/{totalRequired}</p><p>{videosRemaining} more to unlock 30-day ad-free</p></div>}
      </div>
      <button onClick={logout} className="w-full py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-xl font-medium">Sign Out</button>
    </div>
  );
}