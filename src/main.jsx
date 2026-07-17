import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { LeadsProvider } from './context/LeadsContext.jsx';
import { UserProvider } from './context/UserContext.jsx';
import PasscodeGate from './components/PasscodeGate.jsx';
import UpdateBanner from './components/UpdateBanner.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <UpdateBanner />
      <UserProvider>
        <PasscodeGate>
          <LeadsProvider>
            <App />
          </LeadsProvider>
        </PasscodeGate>
      </UserProvider>
    </ThemeProvider>
  </React.StrictMode>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {
      /* offline shell just won't be available — non-fatal */
    });
  });
}
