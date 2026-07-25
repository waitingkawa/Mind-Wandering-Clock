import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

if (navigator.userAgent.toLowerCase().includes('electron')) {
  document.documentElement.classList.add('electron-shell');
}

if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js', {updateViaCache: 'none'}).catch(() => {
      // The app remains fully usable if service workers are unavailable.
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
