import React, { useMemo, useState } from 'react';
import Modal from '../common/Modal.jsx';
import { MODELS, DEFAULT_SOURCES, DEFAULT_SALESPEOPLE } from '../../constants.js';
import { useLeads } from '../../context/LeadsContext.jsx';
import FinancingToggle from '../common/FinancingToggle.jsx';
import { findPossibleDuplicate } from '../../utils/duplicates.js';

export default function NewLeadModal({ onClose, onCreated }) {
  const { leads, addLead } = useLeads();
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [model, setModel] = useState('');
  const [source, setSource] = useState('');
  const [salesperson, setSalesperson] = useState('');
  const [financing, setFinancing] = useState(undefined);
  const [duplicate, setDuplicate] = useState(null);

  const sources = useMemo(() => {
    const existing = leads.map((l) => l.source).filter(Boolean);
    return Array.from(new Set([...DEFAULT_SOURCES, ...existing]));
  }, [leads]);
  const salespeople = useMemo(() => {
    const existing = leads.map((l) => l.salesperson).filter(Boolean);
    return Array.from(new Set([...DEFAULT_SALESPEOPLE, ...existing]));
  }, [leads]);

  const canSave = name.trim() && contact.trim();

  const doSave = () => {
    const lead = addLead({
      name: name.trim(),
      contact: contact.trim(),
      model,
      source,
      salesperson,
      financing,
    });
    if (onCreated) onCreated(lead);
    onClose();
  };

  const attemptSave = () => {
    if (!canSave) return;
    const match = findPossibleDuplicate(leads, { name: name.trim(), contact: contact.trim() });
    if (match) {
      setDuplicate(match);
      return;
    }
    doSave();
  };

  return (
    <Modal onClose={onClose}>
      <h3>New lead</h3>
      <div className="field">
        <label htmlFor="nl-name">Name *</label>
        <input id="nl-name" type="text" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
      </div>
      <div className="field">
        <label htmlFor="nl-contact">Phone / contact *</label>
        <input id="nl-contact" type="text" value={contact} onChange={(e) => setContact(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="nl-model">Model interested in</label>
        <select id="nl-model" value={model} onChange={(e) => setModel(e.target.value)}>
          <option value="">— Select —</option>
          {MODELS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="nl-source">Source</label>
        <input id="nl-source" list="nl-source-list" type="text" value={source} onChange={(e) => setSource(e.target.value)} />
        <datalist id="nl-source-list">
          {sources.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </div>
      <div className="field">
        <label htmlFor="nl-salesperson">Salesperson</label>
        <input
          id="nl-salesperson"
          list="nl-salesperson-list"
          type="text"
          value={salesperson}
          onChange={(e) => setSalesperson(e.target.value)}
        />
        <datalist id="nl-salesperson-list">
          {salespeople.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </div>
      <div className="field">
        <label>Interested in financing?</label>
        <FinancingToggle value={financing} onChange={setFinancing} />
      </div>
      <p className="privacy-notice">
        We'll only use this info to follow up about the inquiry — we won't share it or use it for anything else.
      </p>

      {duplicate && (
        <div className="duplicate-warning">
          Possible duplicate: <strong>{duplicate.name || 'Unnamed'}</strong> ({duplicate.contact}) was already
          added {new Date(duplicate.createdAt).toLocaleDateString()}.
          <div className="modal-actions" style={{ marginTop: 10 }}>
            <button type="button" className="btn btn-ghost" onClick={() => setDuplicate(null)}>
              Go back
            </button>
            <button type="button" className="btn btn-primary" onClick={doSave}>
              Save anyway
            </button>
          </div>
        </div>
      )}

      {!duplicate && (
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={attemptSave} disabled={!canSave}>
            Add lead
          </button>
        </div>
      )}
    </Modal>
  );
}
