import React from 'react';
import FollowUpFlag from '../common/FollowUpFlag.jsx';
import StageMover from '../common/StageMover.jsx';
import FinancingToggle from '../common/FinancingToggle.jsx';
import { useLeads } from '../../context/LeadsContext.jsx';
import { lastContactEntry } from '../../utils/followUp.js';

export default function KanbanCard({ lead, onOpen, onDragStart }) {
  const { updateLead } = useLeads();
  const last = lastContactEntry(lead);
  return (
    <div
      className="lead-card"
      draggable
      onDragStart={(e) => onDragStart(e, lead.id)}
      onClick={() => onOpen(lead.id)}
    >
      <FollowUpFlag lead={lead} />
      <div className="lc-name">{lead.name || 'Unnamed lead'}</div>
      <div className="lc-meta">
        {lead.model || 'No model set'}
        {lead.salesperson ? ` · ${lead.salesperson}` : ''}
      </div>
      {last && <div className="lc-last-log">{last.text}</div>}
      <div className="lc-financing">
        <span className="hint">Financing?</span>
        <FinancingToggle value={lead.financing} onChange={(v) => updateLead(lead.id, { financing: v })} compact />
      </div>
      <StageMover lead={lead} variant="select" />
    </div>
  );
}
