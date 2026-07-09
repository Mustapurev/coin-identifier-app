import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCollections } from '../../hooks/useCollections';
import { useAppStore } from '../../store/appStore';

export function CreateCollection() {
  const [nm, setNm] = useState(''); const [d, setD] = useState(''); const [isp, setIsp] = useState(false);
  const [e, setE] = useState(''); const [sv, setSv] = useState(false);
  const { createCollection } = useCollections();
  const { showToast } = useAppStore();
  const n = useNavigate();

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!nm.trim()) { setE('Name is required'); return; }
    setSv(true); setE('');
    try { await createCollection(nm.trim(), d.trim(), isp); showToast('Collection created!'); n('/collections'); }
    catch (err) { setE(err instanceof Error ? err.message : 'Failed'); }
    finally { setSv(false); }
  };

  return (
    <div className="p-4 max-w-md mx-auto pb-24">
      <h2 className="text-xl font-bold text-white mb-6">Create New Collection</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {e && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg"><p className="text-red-400 text-sm">{e}</p></div>}
        <div><label className="block text-sm font-medium text-gray-300 mb-1.5">Collection Name *</label><input type="text" value={nm} onChange={(x) => setNm(x.target.value)} placeholder="e.g. Morgan Dollars" className="w-full bg-brand-800 border border-brand-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500" maxLength={100}/></div>
        <div><label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label><textarea value={d} onChange={(x) => setD(x.target.value)} placeholder="Describe your collection..." rows={3} className="w-full bg-brand-800 border border-brand-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 resize-none" maxLength={500}/></div>
        <div className="flex items-center justify-between py-2">
          <div><p className="text-sm font-medium text-gray-300">Make Public</p><p className="text-xs text-gray-500">Others can view</p></div>
          <button type="button" onClick={() => setIsp(!isp)} className={`relative w-12 h-6 rounded-full transition-colors ${isp ? 'bg-brand-600' : 'bg-brand-700'}`}><div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${isp ? 'translate-x-6' : 'translate-x-0.5'}`}/></button>
        </div>
        <button type="submit" disabled={sv} className="w-full py-3 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white rounded-xl font-semibold disabled:opacity-50 transition-all">{sv ? 'Creating...' : 'Create Collection'}</button>
      </form>
    </div>
  );
}