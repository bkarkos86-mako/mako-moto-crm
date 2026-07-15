import React, { useMemo, useState } from 'react';
import { useLeads } from '../../context/LeadsContext.jsx';
import StagePill from '../common/StagePill.jsx';
import FollowUpFlag from '../common/FollowUpFlag.jsx';
import NewLeadModal from './NewLeadModal.jsx';
import { downloadCsv, leadsToCsv } from '../../utils/csv.js';

export default function LeadsList({ onOpenLead }) {
  const { leads } = useLeads();
  const [query, setQuery] = useState('');
  const [source, setSource] = useState('');
  const [salesperson, setSalesperson] = useState('');
  const [financing, setFinancing] = useState('');
  const [showNewLead, setShowNewLead] = useState(false);

  const sources = useMemo(() => Array.from(new Set(leads.map((l) => l.source).filter(Boolean))).sort(), [leads]);
  const salespeople = useMemo(
    () => Array.from(new Set(leads.map((l) => l.salesperson).filter(Boolean))).sort(),
    [leads]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads
      .filter((l) => (source ? l.source === source : true))
      .filter((l) => (salesperson ? l.salesperson === salesperson : true))
      .filter((l) => {
        if (financing === 'yes') return l.financing === true;
        if (financing === 'no') return l.financing === false;
        if (financing === 'unset') return l.financing !== true && l.financing !== false;
        return true;
      })
      .filter((l) => {
        if (!q) return true;
        return (
          (l.name || '').toLowerCase().includes(q) ||
          String(l.contact ?? '').toLowerCase().includes(q) ||
          (l.model || '').toLowerCase().includes(q) ||
          (l.notes || '').toLowerCase().includes(q)
        );
      })
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
  }, [leads, query, source, salesperson, financing]);

  const exportCsv = () => {
    downloadCsv(`mako-moto-leads-${new Date().toISOString().slice(0, 10)}.csv`, leadsToCsv(leads));
  };

  return (
    <div>
      <div className="page-title">
        <span>All leads ({filtered.length})</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn" onClick={exportCsv}>
            Export CSV
          </button>
          <button type="button" className="btn btn-primary" onClick={() => setShowNewLead(true)}>
            + New lead
          </button>
        </div>
      </div>

      <div className="leads-toolbar">
        <input
          type="search"
          placeholder="Search name, contact, model, notes…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select value={source} onChange={(e) => setSource(e.target.value)}>
          <option value="">All sources</option>
          {sources.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select value={salesperson} onChange={(e) => setSalesperson(e.target.value)}>
          <option value="">All salespeople</option>
          {salespeople.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select value={financing} onChange={(e) => setFinancing(e.target.value)}>
          <option value="">Financing: All</option>
          <option value="yes">Financing: Yes</option>
          <option value="no">Financing: No</option>
          <option value="unset">Financing: Not asked</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">No leads match.</div>
      ) : (
        <>
          <div className="leads-table-wrap">
            <table className="leads-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Model</th>
                  <th>Source</th>
                  <th>Salesperson</th>
                  <th>Stage</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead) => (
                  <tr key={lead.id} onClick={() => onOpenLead(lead.id)}>
                    <td>
                      {lead.name || 'Unnamed'} <FollowUpFlag lead={lead} />
                    </td>
                    <td>{lead.contact}</td>
                    <td>{lead.model}</td>
                    <td>{lead.source}</td>
                    <td>{lead.salesperson}</td>
                    <td>
                      <StagePill stage={lead.stage} />
                    </td>
                    <td>{lead.updatedAt ? new Date(lead.updatedAt).toLocaleDateString() : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="leads-cards-mobile">
            {filtered.map((lead) => (
              <div key={lead.id} className="lead-card" onClick={() => onOpenLead(lead.id)}>
                <FollowUpFlag lead={lead} />
                <div className="lc-name">{lead.name || 'Unnamed lead'}</div>
                <div className="lc-meta">
                  {lead.model} {lead.salesperson ? `· ${lead.salesperson}` : ''}
                </div>
                <div style={{ marginTop: 6 }}>
                  <StagePill stage={lead.stage} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {showNewLead && <NewLeadModal onClose={() => setShowNewLead(false)} />}
    </div>
  );
}
