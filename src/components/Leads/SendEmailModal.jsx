import React, { useState } from 'react';
import Modal from '../common/Modal.jsx';
import { useLeads } from '../../context/LeadsContext.jsx';
import { sendFollowUpEmail } from '../../utils/emailSend.js';
import { getEmailAddress } from '../../utils/contactLinks.js';
import { emailsSentToday, EMAIL_LOG_PREFIX } from '../../utils/analytics.js';

const DAILY_WARNING_THRESHOLD = 400;

export default function SendEmailModal({ lead, onClose }) {
  const { leads, addContactLogEntry } = useLeads();
  const [to, setTo] = useState(getEmailAddress(lead.contact) || '');
  const [subject, setSubject] = useState(`Mako Moto PH — following up${lead.name ? ` with ${lead.name}` : ''}`);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const todayCount = emailsSentToday(leads);
  const nearLimit = todayCount >= DAILY_WARNING_THRESHOLD;
  const canSend = to.trim() && subject.trim() && body.trim() && !sending;

  const send = async () => {
    if (!canSend) return;
    setSending(true);
    setError('');
    try {
      await sendFollowUpEmail({ to: to.trim(), subject: subject.trim(), body: body.trim(), leadId: lead.id });
      addContactLogEntry(lead.id, `${EMAIL_LOG_PREFIX} ${subject.trim()}`);
      setSent(true);
    } catch (err) {
      setError(err.message || 'The email could not be sent.');
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <Modal onClose={onClose}>
        <h3>Email sent</h3>
        <p className="hint">Logged to {lead.name || 'this lead'}'s contact history.</p>
        <div className="modal-actions">
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal onClose={onClose}>
      <h3>Send email</h3>
      {nearLimit && (
        <p className="hint" style={{ color: 'var(--warn)' }}>
          {todayCount} emails sent today — approaching the mail host's daily limit (~450–500). Consider spacing
          out remaining sends.
        </p>
      )}
      <div className="field">
        <label htmlFor="se-to">To</label>
        <input id="se-to" type="email" value={to} onChange={(e) => setTo(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="se-subject">Subject</label>
        <input id="se-subject" type="text" value={subject} onChange={(e) => setSubject(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="se-body">Message</label>
        <textarea
          id="se-body"
          rows={8}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Type your message…"
        />
      </div>
      {error && (
        <p className="hint" style={{ color: 'var(--danger)' }}>
          {error}
        </p>
      )}
      <div className="modal-actions">
        <button type="button" className="btn btn-ghost" onClick={onClose} disabled={sending}>
          Cancel
        </button>
        <button type="button" className="btn btn-primary" onClick={send} disabled={!canSend}>
          {sending ? 'Sending…' : 'Send'}
        </button>
      </div>
    </Modal>
  );
}
