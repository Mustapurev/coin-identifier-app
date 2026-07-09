import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLoginButton } from './GoogleLoginButton';
import { useAuth } from '../../hooks/useAuth';

export function LoginPage() {
  const n = useNavigate();
  const { isAuthenticated } = useAuth();
  const [e, setE] = useState<string | null>(null);
  React.useEffect(() => { if (isAuthenticated) n('/'); }, [isAuthenticated, n]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-brand-950">
      <div className="mb-8 text-center">
        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/20"><span className="text-4xl">🪙</span></div>
        <h1 className="text-2xl font-bold text-white mb-1">Coin Identifier</h1>
        <p className="text-gray-400 text-sm">Scan, identify and collect coins</p>
      </div>
      <div className="w-full max-w-sm bg-brand-800/50 border border-brand-700 rounded-2xl p-6">
        <h2 className="text-white font-semibold text-lg mb-2 text-center">Welcome Back</h2>
        <p className="text-gray-400 text-sm text-center mb-6">Sign in to sync your collections</p>
        {e && (<div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg"><p className="text-red-400 text-sm">{e}</p></div>)}
        <GoogleLoginButton onSuccess={() => n('/')} onError={setE}/>
        <div className="mt-6 pt-4 border-t border-brand-700"><p className="text-gray-500 text-xs text-center">By signing in, you agree to our Terms.</p></div>
      </div>
      <button onClick={() => n('/')} className="mt-6 text-gray-500 hover:text-gray-300 text-sm">Continue without signing in</button>
    </div>
  );
}