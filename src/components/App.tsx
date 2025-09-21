import React from 'react';
import HomePage from './HomePage';
import AboutPage from './AboutPage';

const App: React.FC = () => {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
  if (pathname.toLowerCase().includes('about')) {
    return <AboutPage />;
  }
  return <HomePage />;
};

export default App;
