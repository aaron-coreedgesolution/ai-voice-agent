import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Removed Tailwind/global CSS imports as Tailwind is being removed
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
