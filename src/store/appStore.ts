import { create } from 'zustand';
import type { UserProfile, AdState, ScanRecord, Collection } from '../types';
import { loadAdState, getDefaultAdState } from '../lib/ads';
import { getStoredProfile } from '../lib/auth';

interface AppState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  setUser: (u: UserProfile | null) => void;
  logout: () => void;
  adState: AdState;
  setAdState: (s: AdState | ((p: AdState) => AdState)) => void;
  isAdFree: boolean;
  isScanning: boolean;
  lastScan: ScanRecord | null;
  setScanning: (v: boolean) => void;
  setLastScan: (s: ScanRecord | null) => void;
  collections: Collection[];
  setCollections: (c: Collection[]) => void;
  addCollection: (c: Collection) => void;
  updateCollection: (id: string, u: Partial<Collection>) => void;
  removeCollection: (id: string) => void;
  toastMessage: string | null;
  showToast: (m: string, d?: number) => void;
}

export const useAppStore = create<AppState>((set) => {
  const sp = getStoredProfile();
  const sa = loadAdState();
  return {
    user: sp, isAuthenticated: !!sp,
    setUser: (u) => set({ user: u, isAuthenticated: !!u }),
    logout: () => { localStorage.removeItem('coin-identifier-profile'); set({ user: null, isAuthenticated: false }); },
    adState: sa,
    setAdState: (s) => set((p) => {
      const ns = typeof s === 'function' ? s(p.adState) : s;
      return { adState: ns, isAdFree: ns.adFreeUntil ? ns.adFreeUntil > Date.now() : false };
    }),
    isAdFree: sa.adFreeUntil ? sa.adFreeUntil > Date.now() : false,
    isScanning: false, lastScan: null,
    setScanning: (v) => set({ isScanning: v }),
    setLastScan: (s) => set({ lastScan: s }),
    collections: [], setCollections: (c) => set({ collections: c }),
    addCollection: (c) => set((p) => ({ collections: [...p.collections, c] })),
    updateCollection: (id, u) => set((p) => ({ collections: p.collections.map((c) => c.id === id ? { ...c, ...u, updatedAt: Date.now() } : c) })),
    removeCollection: (id) => set((p) => ({ collections: p.collections.filter((c) => c.id !== id) })),
    toastMessage: null, showToast: (m, d = 3000) => { set({ toastMessage: m }); setTimeout(() => set({ toastMessage: null }), d); }
  };
});