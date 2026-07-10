import React from 'react';

const TABS = [
  { key: 'event', label: 'Quick add', icon: '⚡' },
  { key: 'kanban', label: 'Pipeline', icon: '📋' },
  { key: 'followup', label: 'Follow-ups', icon: '⏰' },
  { key: 'leads', label: 'Leads', icon: '👥' },
  { key: 'scoring', label: 'Score', icon: '🎯' },
  { key: 'practice', label: 'Practice', icon: '🗣️' },
];

export default function BottomNav({ view, setView }) {
  return (
    <nav className="bottom-nav">
      {TABS.map((t) => (
        <button key={t.key} className={view === t.key ? 'active' : ''} onClick={() => setView(t.key)}>
          <span className="bn-icon">{t.icon}</span>
          {t.label}
        </button>
      ))}
    </nav>
  );
}
