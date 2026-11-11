import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { ProposalView } from './components/ProposalView';

export const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Route: /p/:slug
  if (currentPath.startsWith('/p/')) {
    const slug = currentPath.replace('/p/', '').split('/')[0].split('?')[0];
    return <ProposalView slug={slug} />;
  }

  // Default: Dashboard
  return <Dashboard />;
};

export default App;
