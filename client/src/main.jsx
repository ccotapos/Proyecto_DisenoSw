import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './i18n';
import { GoogleOAuthProvider } from '@react-oauth/google';

// IMPORTANTE: Reemplaza esto con tu Client ID real de Google Cloud Console
const GOOGLE_CLIENT_ID = "734633286572-9n8863fvce8rfs1gku3v5i2mm9ljp792.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
)