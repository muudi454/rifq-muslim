import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { trackInviteOpen } from './lib/inviteTracking';
import './index.css';
import './extra.css';
import './admin.css';

/**
 * Retire the HTML launch screen once React has painted its first frame.
 * Keeping the splash in index.html (instead of a React component) means the
 * very first frame is branded, so there is no blank or white flash between the
 * Android splash screen and the app.
 */
function dismissLaunchSplash(): void {
  const splash = document.getElementById('launch-splash');
  if (!splash) return;
  splash.classList.add('is-hidden');
  window.setTimeout(() => splash.remove(), 520);
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Two frames: one for React's commit, one for the browser to paint it.
window.requestAnimationFrame(() => window.requestAnimationFrame(dismissLaunchSplash));
// Failsafe: never leave the splash covering a page that failed to mount.
window.setTimeout(dismissLaunchSplash, 5000);

// Count this visit if it arrived from an invitation link (opt-in only).
trackInviteOpen();

// Register the service worker for offline support and installability.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* offline support unavailable — app still works online */
    });
  });
}
