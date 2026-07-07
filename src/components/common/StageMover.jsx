import React, { useState } from 'react';
import { STAGES } from '../../constants.js';
import { useLeads } from '../../context/LeadsContext.jsx';
import LostReasonModal from '../Leads/LostReasonModal.jsx';

// variant: 'buttons' (lead detail) | 'select' (compact, kanban card)
export default function StageMover({ lead, variant = 'buttons' }) {
  const { changeStage } = useLeads();
  const [pendingLost, setPendingLost] = useState(false);

  const requestStage = (stage) => {
    if (stage === lead.stage) return;
    if (stage === 'lost') {
      setPendingLost(true);
      return;
    }
    changeStage(lead.id, stage);
  };

  const confirmLost = (reason) => {
    changeStage(lead.id, 'lost', reason);
    setPendingLost(false);
  };

  return (
    <>
      {variant === 'buttons' ? (
        <div className="stage-mover">
          {STAGES.map((s) => (
            <button
              key={s.key}
              type="button"
              className={`stage-${s.key} ${lead.stage === s.key ? 'current' : ''}`}
              onClick={() => requestStage(s.key)}
            >
              {s.label}
            </button>
          ))}
        </div>
      ) : (
        <select
          className="lc-move"
          value={lead.stage}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => requestStage(e.target.value)}
        >
          {STAGES.map((s) => (
            <option key={s.key} value={s.key}>
              Move to: {s.label}
            </option>
          ))}
        </select>
      )}
      {pendingLost && (
        <LostReasonModal leadName={lead.name} onConfirm={confirmLost} onCancel={() => setPendingLost(false)} />
      )}
    </>
  );
}
