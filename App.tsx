import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthPage } from './pages/AuthPage';
import { Dashboard } from './pages/Dashboard';
import { PublicProfile } from './pages/PublicProfile';

// Simple Hash Router Implementation
const Router = () => {
  const { user, loading } = useAuth();
  const [route, setRoute] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => setRoute(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50 text-indigo-600">
        <svg className="animate-spin h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  // Route Matching Logic
  
  // 1. Check for Public Profile Route: #/u/:username
  const publicProfileMatch = route.match(/^#\/u\/([^/]+)$/);
  if (publicProfileMatch) {
    return <PublicProfile username={publicProfileMatch[1]} />;
  }

  // 2. Dashboard or Auth (Root path)
  if (!user) {
    return <AuthPage />;
  }

  return <Dashboard />;
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router />
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;
