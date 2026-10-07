import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Automatically register PWA service worker with auto reload on update
registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(<App />);
