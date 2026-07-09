import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/appStore';
export function Toast() {
  const { toastMessage } = useAppStore();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  useEffect(() => { if (toastMessage) { setMessage(toastMessage); setVisible(true); const t = setTimeout(() => setVisible(false), 2800); return () => clearTimeout(t); } }, [toastMessage]);
  if (!message) return null;
  return (<div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}><div className="bg-brand-800 border border-brand-700 text-white px-6 py-3 rounded-full shadow-2xl text-sm font-medium">{message}</div></div>);
}