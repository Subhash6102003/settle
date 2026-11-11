import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { ProposalView } from './components/ProposalView';
import { AuthScreen } from './components/AuthScreen';
import { LandingPage } from './components/LandingPage';
import { Creator, getActiveCreator } from './api';

export const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [authToken, setAuthToken] = useState<string | null>(localStorage.getItem('settle_auth_token'));
  const [_creator, setCreator] = useState<Creator | null>(getActiveCreator());
  const [isLandingView, setIsLandingView] = useState(false);

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
    setIsLandingView(false);
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

  // Route 2: Product Landing Page (Accessible anytime)
  if (isLandingView) {
    return (
      <LandingPage
        onGoToApp={() => setIsLandingView(false)}
        onViewDemoProposal={() => {
          window.location.pathname = '/p/acme-brand-refresh-2026';
        }}
      />
    );
  }

  // Route 3: Creator Authentication Gate (If not logged in, show AuthScreen with option to view landing page)
  if (!authToken) {
    return (
      <div>
        <div style={{ position: 'fixed', top: '15px', right: '20px', zIndex: 100 }}>
          <button
            onClick={() => setIsLandingView(true)}
            className="btn-ghost"
            style={{ fontSize: '0.85rem', padding: '0.45rem 0.85rem' }}
          >
            Explore Product Tour ↗
          </button>
        </div>
        <AuthScreen onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  // Route 4: Authenticated Multi-Tenant Creator Studio
  return (
    <Dashboard
      onSignOut={handleSignOut}
      onOpenLanding={() => setIsLandingView(true)}
    />
  );
};

export default App;
