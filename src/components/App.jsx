import React, { useCallback, useEffect, useState } from 'react';
import HomePage from './HomePage';
import AboutPage from './AboutPage';

function App() {
  const [path, setPath] = useState(() => window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback(
    (targetPath) => (event) => {
      if (event) {
        event.preventDefault();
      }

      if (window.location.pathname !== targetPath) {
        window.history.pushState({}, '', targetPath);
        setPath(targetPath);
      }
    },
    []
  );

  if (path.includes('about')) {
    return <AboutPage onNavigateHome={navigate('/')} />;
  }

  return <HomePage onNavigateAbout={navigate('/about')} />;
}

export default App;
