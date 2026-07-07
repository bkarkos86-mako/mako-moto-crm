import React from 'react';
import ThemeToggle from './ThemeToggle.jsx';
import { useLeads } from '../context/LeadsContext.jsx';

const TABS = [
  { key: 'kanban', label: 'Pipeline' },
  { key: 'followup', label: 'Follow-ups' },
  { key: 'leads', label: 'All leads' },
  { key: 'scoring', label: 'Lead scoring' },
  { key: 'event', label: 'Quick add' },
];

export default function Header({ view, setView }) {
  const { status, syncing } = useLeads();
  const offline = status === 'offline';

  return (
    <>
      <header className="app-header">
        <div className="brand">
          <img src={`${import.meta.env.BASE_URL}icons/icon-192.png`} alt="" />
          Mako Moto CRM
        </div>
        <div className="header-actions">
          <span className={`sync-pill ${offline ? 'offline' : ''}`}>
            <span className="dot" />
            {syncing ? 'Syncing…' : offline ? 'Offline — will sync' : 'Synced'}
          </span>
          <ThemeToggle />
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
