import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import '../css/style.css';

declare global {
  interface Window {
    __APP_ROOT__?: HTMLElement;
  }
}

const container = document.getElementById('root');
if (container) {
  window.__APP_ROOT__ = container;
  ReactDOM.createRoot(container).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
