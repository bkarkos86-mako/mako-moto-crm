import React, { useState } from 'react';
import Modal from '../common/Modal.jsx';
import { LOST_REASONS } from '../../constants.js';

export default function LostReasonModal({ leadName, onConfirm, onCancel }) {
  const [reason, setReason] = useState('');
  const [custom, setCustom] = useState('');

  const confirm = () => {
    const final = reason === 'Other' && custom.trim() ? custom.trim() : reason;
    if (!final) return;
    onConfirm(final);
  };

  return (
    <Modal onClose={onCancel}>
      <h3>Mark as lost</h3>
      <div className="modal-sub">
        Why did {leadName || 'this lead'} not convert? This helps track patterns over time.
      </div>
      <div className="reason-options">
        {LOST_REASONS.map((r) => (
          <button
            key={r}
            type="button"
            className={reason === r ? 'selected' : ''}
            onClick={() => setReason(r)}
          >
            {r}
          </button>
        ))}
      </div>
      {reason === 'Other' && (
        <div className="field">
          <label htmlFor="other-reason">Specify reason</label>
          <input
            id="other-reason"
            type="text"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="e.g. Went with a bicycle instead"
          />
        </div>
      )}
      <div className="modal-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className="btn btn-danger" onClick={confirm} disabled={!reason}>
          Mark lost
        </button>
      </div>
    </Modal>
  );
}
