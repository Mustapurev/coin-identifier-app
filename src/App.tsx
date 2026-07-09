import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Layout } from './components/layout/Layout';
import { HomePage } from './components/HomePage';
import { CameraScanner } from './components/scanner/CameraScanner';
import { ScanResult } from './components/scanner/ScanResult';
import { ScanHistory } from './components/scanner/ScanHistory';
import { CollectionList } from './components/collections/CollectionList';
import { CollectionDetail } from './components/collections/CollectionDetail';
import { CreateCollection } from './components/collections/CreateCollection';
import { ProfilePage } from './components/profile/ProfilePage';
import { LoginPage } from './components/auth/LoginPage';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { GOOGLE_CLIENT_ID } from './lib/auth';

export default function App() {
  return (
    <ErrorBoundary>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout/>}>
              <Route path="/" element={<HomePage/>}/>
              <Route path="/scan" element={<CameraScanner/>}/>
              <Route path="/scan/result" element={<ScanResult/>}/>
              <Route path="/history" element={<ScanHistory/>}/>
              <Route path="/collections" element={<CollectionList/>}/>
              <Route path="/collections/create" element={<CreateCollection/>}/>
              <Route path="/collections/:id" element={<CollectionDetail/>}/>
              <Route path="/profile" element={<ProfilePage/>}/>
              <Route path="/login" element={<LoginPage/>}/>
              <Route path="*" element={<div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center"><span className="text-5xl mb-4">🔍</span><h2 className="text-xl font-semibold text-white mb-2">Page Not Found</h2><p className="text-gray-400">This page does not exist.</p></div>}/>
            </Route>
          </Routes>
        </BrowserRouter>
      </GoogleOAuthProvider>
    </ErrorBoundary>
  );
}