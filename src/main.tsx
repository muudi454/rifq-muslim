import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import './extra.css';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Register the service worker for offline support and installability.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* offline support unavailable — app still works online */
    });
  });
}
