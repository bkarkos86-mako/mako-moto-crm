import React from 'react';

// rows: [{ label, count, pct? }] — pct out of 100, used for bar width if
// given, otherwise computed relative to the largest count in the list.
export default function BarList({ rows, emptyLabel }) {
  if (!rows.length) return <div className="empty-state">{emptyLabel || 'No data yet.'}</div>;
  const max = Math.max(...rows.map((r) => r.count), 1);
  return (
    <div className="bar-list">
      {rows.map((r) => (
        <div className="bar-row" key={r.label}>
          <div className="bar-row-top">
            <span className="bar-label">{r.label}</span>
            <span className="bar-count">
              {r.count}
              {r.pct !== undefined ? ` · ${r.pct}%` : ''}
            </span>
          </div>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${Math.round((r.count / max) * 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
