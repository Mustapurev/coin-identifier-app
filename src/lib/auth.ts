import type { UserProfile } from '../types';
import { db } from './db';
import { generateId } from './utils';

const GOOGLE_CLIENT_ID =
  '556523444045-gde4m24drg169sokee10bemhtofbgkvc.apps.googleusercontent.com';
const PROFILE_KEY = 'coin-identifier-profile';

type GoogleTokenData = {
  sub: string;
  email: string;
  name: string;
  picture: string;
};

export function decodeGoogleToken(t: string): GoogleTokenData | null {
  try {
    const b = t.split('.')[1];
    const j = decodeURIComponent(
      atob(b.replace(/-/g, '+').replace(/_/g, '/'))
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(j);
  } catch {
    return null;
  }
}

export async function handleGoogleLogin(r: {
  credential: string;
}): Promise<UserProfile> {
  const d = decodeGoogleToken(r.credential);
  if (!d) throw new Error('Failed to decode token');

  const ex = await db.profile.where('googleId').equals(d.sub).first();

  const p: UserProfile = ex || {
    id: generateId(),
    email: d.email,
    name: d.name,
    picture: d.picture,
    googleId: d.sub,
    createdAt: Date.now(),
    displayName: d.name,
    bio: '',
    preferredCurrency: 'USD',
  };

  if (!ex) {
    await db.profile.put(p);
  } else {
    await db.profile.update(ex.id, { picture: d.picture });
    p.picture = d.picture;
  }

  localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
  return p;
}

export function getStoredProfile(): UserProfile | null {
  const s = localStorage.getItem(PROFILE_KEY);
  return s ? JSON.parse(s) : null;
}

export async function updateProfile(
  uid: string,
  u: Partial<UserProfile>
): Promise<void> {
  await db.profile.update(uid, u);
  const p = await db.profile.get(uid);
  if (p) localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
}

export function logout(): void {
  localStorage.removeItem(PROFILE_KEY);
  const win = window as any;
  if (win.google) win.google.accounts.id.disableAutoSelect();
  window.location.href = '/';
}

export { GOOGLE_CLIENT_ID };