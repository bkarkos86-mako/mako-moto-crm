import React, { useEffect, useState } from 'react';
import { useLeads } from '../../context/LeadsContext.jsx';
import StageMover from '../common/StageMover.jsx';
import FinancingToggle from '../common/FinancingToggle.jsx';
import { MODELS } from '../../constants.js';
import QuickActions from '../common/QuickActions.jsx';
import { useUser } from '../../context/UserContext.jsx';

export default function LeadDetail({ leadId, onClose }) {
  const { leads, updateLead, deleteLead, addContactLogEntry } = useLeads();
  const { currentUser } = useUser();
  const isAdmin = currentUser?.role === 'admin';
  const lead = leads.find((l) => l.id === leadId);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [notes, setNotes] = useState(lead?.notes || '');
  const [logText, setLogText] = useState('');

  useEffect(() => {
    setNotes(lead?.notes || '');
  }, [lead?.id]);

  if (!lead) return null;

  const startEdit = () => {
    setForm({
      name: lead.name || '',
      contact: lead.contact || '',
      model: lead.model || '',
      source: lead.source || '',
      salesperson: lead.salesperson || '',
    });
    setEditing(true);
  };

  const saveEdit = () => {
    updateLead(lead.id, form);
    setEditing(false);
  };

  const saveNotes = () => {
    if (notes !== lead.notes) updateLead(lead.id, { notes });
  };

  const addLog = () => {
    const text = logText.trim();
    if (!text) return;
    addContactLogEntry(lead.id, text);
    setLogText('');
  };

  const handleDelete = () => {
    if (window.confirm(`Delete ${lead.name || 'this lead'}? This cannot be undone.`)) {
      deleteLead(lead.id);
      onClose();
    }
  };

  const log = Array.isArray(lead.contactLog) ? [...lead.contactLog].reverse() : [];

  return (
    <div className="detail-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="detail-panel">
        <div className="detail-header">
          {editing ? (
            <div style={{ flex: 1 }}>
              <div className="field">
                <label>Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="field">
                <label>Contact</label>
                <input
                  type="text"
                  value={form.contact}
                  onChange={(e) => setForm({ ...form, contact: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Model</label>
                <select value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })}>
                  <option value="">— Select —</option>
                  {MODELS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Source</label>
                <input type="text" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
              </div>
              <div className="field">
                <label>Salesperson</label>
                <input
                  type="text"
                  value={form.salesperson}
                  onChange={(e) => setForm({ ...form, salesperson: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" className="btn btn-primary" onClick={saveEdit}>
                  Save
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h2>{lead.name || 'Unnamed lead'}</h2>
              <div className="contact">
                {lead.contact} {lead.model ? `· ${lead.model}` : ''}
              </div>
              <div className="contact">
                {lead.source ? `Source: ${lead.source}` : ''} {lead.salesperson ? `· ${lead.salesperson}` : ''}
              </div>
              <QuickActions lead={lead} />
            </div>
          )}
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {lead.stage === 'lost' && lead.lostReason && (
          <div className="lost-reason-tag">Lost reason: {lead.lostReason}</div>
        )}

        <div className="section-title">Stage</div>
        <StageMover lead={lead} variant="buttons" />

        <div className="section-title">Interested in financing?</div>
        <FinancingToggle value={lead.financing} onChange={(v) => updateLead(lead.id, { financing: v })} />

        <div className="section-title">Notes</div>
        <div className="field">
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={saveNotes}
            placeholder="Notes about this lead…"
          />
        </div>

        <div className="section-title">Contact log</div>
        <div className="contact-log-add">
          <textarea
            rows={2}
            value={logText}
            onChange={(e) => setLogText(e.target.value)}
            placeholder="Log a call, message, or visit…"
          />
          <button type="button" className="btn btn-primary" onClick={addLog}>
            Add
          </button>
        </div>
        <div className="contact-log-list">
          {log.length === 0 && <div className="hint">No contact log entries yet.</div>}
          {log.map((entry, i) => (
            <div className="contact-log-entry" key={i}>
              <div className="cle-ts">{new Date(entry.ts).toLocaleString()}</div>
              <div className="cle-text">{entry.text}</div>
            </div>
          ))}
        </div>

        <div className="detail-actions">
          {!editing && (
            <button type="button" className="btn" onClick={startEdit}>
              Edit
            </button>
          )}
          {isAdmin && (
            <button type="button" className="btn btn-danger" onClick={handleDelete}>
              Delete lead
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
