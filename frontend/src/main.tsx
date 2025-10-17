import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Import Tailwind/global CSS so utility classes are applied app-wide
import './index.css';
// Load react-toastify styles after Tailwind to avoid being overridden
import 'react-toastify/dist/ReactToastify.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);