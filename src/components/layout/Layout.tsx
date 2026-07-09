import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { AdManager } from '../ads/AdManager';
import { AdBanner } from '../ads/AdBanner';
import { Toast } from '../common/Toast';
import { ErrorBoundary } from '../common/ErrorBoundary';

export function Layout() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-brand-950 flex flex-col">
        <Header/>
        <main className="flex-1 pb-4"><ErrorBoundary><Outlet/></ErrorBoundary></main>
        <AdBanner position="bottom"/>
        <BottomNav/>
        <AdManager/>
        <Toast/>
      </div>
    </ErrorBoundary>
  );
}