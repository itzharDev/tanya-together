import React from 'react'
import { hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { SSRProvider } from './context/SSRContext.jsx'

hydrateRoot(
  document.getElementById('root'),
  <React.StrictMode>
    <SSRProvider data={null}>
      <App />
    </SSRProvider>
  </React.StrictMode>
)
