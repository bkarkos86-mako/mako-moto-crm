import React from 'react';
import FollowUpFlag from '../common/FollowUpFlag.jsx';
import StageMover from '../common/StageMover.jsx';
import { lastContactEntry } from '../../utils/followUp.js';

export default function KanbanCard({ lead, onOpen, onDragStart }) {
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
      <StageMover lead={lead} variant="select" />
    </div>
  );
}
