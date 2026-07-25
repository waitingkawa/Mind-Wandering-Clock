import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

if (navigator.userAgent.toLowerCase().includes('electron')) {
  document.documentElement.classList.add('electron-shell');
}

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js', {updateViaCache: 'none'}).catch(() => {
      // The app remains fully usable if service workers are unavailable.
    });
  });
} else if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => registration.unregister());
  });
  window.caches?.keys().then((keys) => {
    keys.forEach((key) => window.caches.delete(key));
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
