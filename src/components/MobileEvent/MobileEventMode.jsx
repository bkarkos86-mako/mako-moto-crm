import React, { useMemo, useState } from 'react';
import { useLeads } from '../../context/LeadsContext.jsx';
import { MODELS, DEFAULT_SALESPEOPLE } from '../../constants.js';

function isToday(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()
  );
}

export default function MobileEventMode() {
  const { leads, addLead } = useLeads();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [fb, setFb] = useState('');
  const [model, setModel] = useState('');
  const [note, setNote] = useState('');
  const [savedLead, setSavedLead] = useState(null);

  const capturedToday = useMemo(() => leads.filter((l) => isToday(l.createdAt)).length, [leads]);

  const canSave = name.trim() && phone.trim();

  const reset = () => {
    setName('');
    setPhone('');
    setFb('');
    setModel('');
    setNote('');
  };

  const save = () => {
    if (!canSave) return;
    const contactParts = [phone.trim()];
    if (fb.trim()) contactParts.push(fb.trim());
    const lead = addLead({
      name: name.trim(),
      contact: contactParts.join(' / '),
      model,
      source: 'Event',
      salesperson: DEFAULT_SALESPEOPLE[0],
      notes: note.trim(),
    });
    setSavedLead(lead);
    reset();
  };

  if (savedLead) {
    return (
      <div className="event-mode">
        <div className="event-success">
          <div className="checkmark">✓</div>
          <h2>{savedLead.name} added</h2>
          <p>Lead saved to the pipeline.</p>
          <button type="button" className="btn btn-primary" onClick={() => setSavedLead(null)}>
            + Add another lead
          </button>
        </div>
        <div className="event-counter">
          Captured today: <strong>{capturedToday}</strong>
        </div>
      </div>
    );
  }

  return (
    <div className="event-mode">
      <div className="event-counter">
        Captured today: <strong>{capturedToday}</strong>
      </div>
      <div className="event-form">
        <div className="field">
          <label htmlFor="ev-name">Name *</label>
          <input id="ev-name" type="text" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </div>
        <div className="field">
          <label htmlFor="ev-phone">Phone *</label>
          <input
            id="ev-phone"
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="ev-fb">FB / Messenger (optional)</label>
          <input id="ev-fb" type="text" value={fb} onChange={(e) => setFb(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="ev-model">Model interested in</label>
          <select id="ev-model" value={model} onChange={(e) => setModel(e.target.value)}>
            <option value="">— Select —</option>
            {MODELS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="ev-note">Quick note</label>
          <textarea id="ev-note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        <p className="privacy-notice">
          We'll only use this info to follow up about your Mako Moto inquiry — we won't share it or use it for
          anything else.
        </p>
        <button type="button" className="btn btn-primary" style={{ width: '100%' }} onClick={save} disabled={!canSave}>
          Save lead
        </button>
      </div>
    </div>
  );
}
