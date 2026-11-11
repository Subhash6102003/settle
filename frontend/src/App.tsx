import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { ProposalView } from './components/ProposalView';
import { InvoiceReceiptView } from './components/InvoiceReceiptView';
import { AuthScreen } from './components/AuthScreen';
import { LandingPage } from './components/LandingPage';
import { Creator, getActiveCreator } from './api';

export const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [authToken, setAuthToken] = useState<string | null>(() => localStorage.getItem('settle_auth_token'));
  const [creator, setCreator] = useState<Creator | null>(() => {
    const token = localStorage.getItem('settle_auth_token');
    return token ? getActiveCreator() : null;
  });
  const [currentView, setCurrentView] = useState<'landing' | 'app' | 'login'>(() => {
    return localStorage.getItem('settle_auth_token') ? 'app' : 'landing';
  });

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
    setCurrentView('app');
  };

  const handleSignOut = () => {
    localStorage.removeItem('settle_auth_token');
    localStorage.removeItem('settle_active_creator');
    setAuthToken(null);
    setCreator(null);
    setCurrentView('login');
  };

  // Route 1: Public Client Proposal & Receipt View (/p/:slug)
  if (currentPath.startsWith('/p/')) {
    const slug = currentPath.replace('/p/', '').split('/')[0].split('?')[0];
    return <ProposalView slug={slug} />;
  }

  // Route 1.5: Public Client Invoice & Receipt View (/invoices/:id or /receipt/:id)
  if (currentPath.startsWith('/invoices/') || currentPath.startsWith('/receipt/')) {
    const invoiceId = currentPath.replace(/^\/(invoices|receipt)\//, '').split('/')[0].split('?')[0];
    return <InvoiceReceiptView invoiceId={invoiceId} />;
  }

  // Route 2: Landing Page (Default View)
  if (currentView === 'landing') {
    return (
      <LandingPage
        onGoToApp={() => {
          if (authToken) {
            setCurrentView('app');
          } else {
            setCurrentView('login');
          }
        }}
        onGoToLogin={() => setCurrentView('login')}
        onViewDemoProposal={() => {
          window.location.pathname = '/p/acme-brand-refresh-2026';
        }}
      />
    );
  }

  // Route 3: Auth Screen (If user wants to sign in or register)
  if (currentView === 'login' && !authToken) {
    return (
      <div>
        <div style={{ position: 'fixed', top: '15px', right: '20px', zIndex: 100 }}>
          <button
            onClick={() => setCurrentView('landing')}
            className="btn-ghost"
            style={{ fontSize: '0.85rem', padding: '0.45rem 0.85rem' }}
          >
            ← Back to Landing Page
          </button>
        </div>
        <AuthScreen onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  // Route 4: Authenticated Multi-Tenant Creator Studio Dashboard
  return (
    <Dashboard
      creator={creator || getActiveCreator()}
      onSignOut={handleSignOut}
      onOpenLanding={() => setCurrentView('landing')}
    />
  );
};

export default App;
