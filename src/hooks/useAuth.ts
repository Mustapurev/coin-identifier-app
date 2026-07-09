import { useCallback } from 'react';
import { useAppStore } from '../store/appStore';
import { handleGoogleLogin, logout as authLogout } from '../lib/auth';
import type { UserProfile } from '../types';

export function useAuth() {
  const { user, isAuthenticated, setUser } = useAppStore();
  const loginWithGoogle = useCallback(async (r: { credential: string }) => {
    try { const p: UserProfile = await handleGoogleLogin(r); setUser(p); return { success: true, profile: p }; }
    catch (e) { return { success: false, error: e instanceof Error ? e.message : 'Login failed' }; }
  }, [setUser]);
  const logout = useCallback(() => { authLogout(); setUser(null); }, [setUser]);
  return { user, isAuthenticated, loginWithGoogle, logout };
}