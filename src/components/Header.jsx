import React from 'react';
import ThemeToggle from './ThemeToggle.jsx';
import { useLeads } from '../context/LeadsContext.jsx';
import { useUser } from '../context/UserContext.jsx';
import { forceUpdate } from '../utils/forceUpdate.js';

const TABS = [
  { key: 'kanban', label: 'Pipeline' },
  { key: 'followup', label: 'Follow-ups' },
  { key: 'leads', label: 'All leads' },
  { key: 'scoring', label: 'Lead scoring' },
  { key: 'practice', label: 'Practice' },
  { key: 'insights', label: 'Insights' },
  { key: 'event', label: 'Quick add' },
];

export default function Header({ view, setView }) {
  const { status, syncing } = useLeads();
  const { currentUser, logout } = useUser();
  const offline = status === 'offline';

  return (
    <>
      <header className="app-header">
        <div className="brand">
          <img src={`${import.meta.env.BASE_URL}icons/icon-192.png`} alt="" />
          Mako Moto CRM
        </div>
        <div className="header-actions">
          {currentUser && (
            <button
              type="button"
              className="user-pill"
              onClick={() => {
                if (window.confirm('Switch user? You will need your PIN again.')) logout();
              }}
              title="Tap to switch user"
            >
              {currentUser.name}
              {currentUser.role === 'admin' && <span className="admin-badge">Admin</span>}
            </button>
          )}
          <span className={`sync-pill ${offline ? 'offline' : ''}`}>
            <span className="dot" />
            {syncing ? 'Syncing…' : offline ? 'Offline — will sync' : 'Synced'}
          </span>
          <ThemeToggle />
          <button
            type="button"
            className="icon-btn"
            title="Refresh app — clears the cached version and reloads to get the latest update"
            aria-label="Refresh app"
            onClick={() => {
              if (window.confirm('Refresh the app to get the latest version now?')) forceUpdate();
            }}
          >
            ⟳
          </button>
        </div>
      </header>
      <nav className="tabs">
        {TABS.map((t) => (
          <button key={t.key} className={view === t.key ? 'active' : ''} onClick={() => setView(t.key)}>
            {t.label}
          </button>
        ))}
      </nav>
    </>
  );
}
