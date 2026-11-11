import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { ProposalView } from './components/ProposalView';
import { AuthScreen } from './components/AuthScreen';
import { Creator, getActiveCreator } from './api';

export const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [authToken, setAuthToken] = useState<string | null>(localStorage.getItem('settle_auth_token'));
  const [_creator, setCreator] = useState<Creator | null>(getActiveCreator());

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleLoginSuccess = (user: Creator, token: string) => {
    setCreator(user);
    setAuthToken(token);
  };

  const handleSignOut = () => {
    localStorage.removeItem('settle_auth_token');
    setAuthToken(null);
    setCreator(null);
  };

  // Route 1: Public Client Proposal & Receipt View (/p/:slug)
  if (currentPath.startsWith('/p/')) {
    const slug = currentPath.replace('/p/', '').split('/')[0].split('?')[0];
    return <ProposalView slug={slug} />;
  }

  // Route 2: Creator Authentication Gate (If not logged in, show AuthScreen)
  if (!authToken) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // Route 3: Authenticated Multi-Tenant Creator Studio
  return <Dashboard onSignOut={handleSignOut} />;
};

export default App;
