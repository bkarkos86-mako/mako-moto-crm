import React, { useMemo } from 'react';
import { useLeads } from '../../context/LeadsContext.jsx';
import { daysSince, followUpStatus, lastContactEntry } from '../../utils/followUp.js';
import StagePill from '../common/StagePill.jsx';

function FollowUpCard({ lead, status, onOpen }) {
  const last = lastContactEntry(lead);
  const days = Math.floor(daysSince(lead.updatedAt || lead.createdAt));
  return (
    <div className={`followup-card ${status}`} onClick={() => onOpen(lead.id)}>
      <div className="fc-main">
        <div className="fc-name">{lead.name || 'Unnamed lead'}</div>
        <div className="fc-meta">
          <StagePill stage={lead.stage} /> {lead.model ? `· ${lead.model}` : ''}{' '}
          {lead.salesperson ? `· ${lead.salesperson}` : ''}
        </div>
        {last ? (
          <div className="fc-log">Last: {last.text}</div>
        ) : (
          <div className="fc-log">No contact log yet</div>
        )}
      </div>
      <div className="fc-days">{days}d</div>
    </div>
  );
}

export default function FollowUpDashboard({ onOpenLead }) {
  const { leads } = useLeads();

  const { overdue, due } = useMemo(() => {
    const overdue = [];
    const due = [];
    for (const lead of leads) {
      const status = followUpStatus(lead);
      if (status === 'overdue') overdue.push(lead);
      else if (status === 'due') due.push(lead);
    }
    const byStale = (a, b) => daysSince(b.updatedAt || b.createdAt) - daysSince(a.updatedAt || a.createdAt);
    overdue.sort(byStale);
    due.sort(byStale);
    return { overdue, due };
  }, [leads]);

  return (
    <div>
      <div className="page-title">Follow-ups</div>

      <div className="followup-section overdue">
        <h2>
          Overdue <span className="badge-count">{overdue.length}</span>
        </h2>
        {overdue.length === 0 ? (
          <div className="empty-state">Nothing overdue. Nice work.</div>
        ) : (
          <div className="followup-list">
            {overdue.map((lead) => (
              <FollowUpCard key={lead.id} lead={lead} status="overdue" onOpen={onOpenLead} />
            ))}
          </div>
        )}
      </div>

      <div className="followup-section due">
        <h2>
          Due soon <span className="badge-count">{due.length}</span>
        </h2>
        {due.length === 0 ? (
          <div className="empty-state">No follow-ups due right now.</div>
        ) : (
          <div className="followup-list">
            {due.map((lead) => (
              <FollowUpCard key={lead.id} lead={lead} status="due" onOpen={onOpenLead} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
