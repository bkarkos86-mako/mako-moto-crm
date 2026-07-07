import React, { useState } from 'react';
import { STAGES } from '../../constants.js';
import { useLeads } from '../../context/LeadsContext.jsx';
import KanbanCard from './KanbanCard.jsx';
import LostReasonModal from '../Leads/LostReasonModal.jsx';
import NewLeadModal from '../Leads/NewLeadModal.jsx';

export default function KanbanBoard({ onOpenLead }) {
  const { leads, changeStage } = useLeads();
  const [dragOverStage, setDragOverStage] = useState(null);
  const [pendingDrop, setPendingDrop] = useState(null); // { leadId, leadName }
  const [showNewLead, setShowNewLead] = useState(false);

  const handleDrop = (stage) => (e) => {
    e.preventDefault();
    setDragOverStage(null);
    const leadId = e.dataTransfer.getData('text/plain');
    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.stage === stage) return;
    if (stage === 'lost') {
      setPendingDrop({ leadId, leadName: lead.name });
      return;
    }
    changeStage(leadId, stage);
  };

  return (
    <div>
      <div className="page-title">
        <span>Pipeline</span>
        <button type="button" className="btn btn-primary" onClick={() => setShowNewLead(true)}>
          + New lead
        </button>
      </div>
      <div className="kanban-board">
        {STAGES.map((stage) => {
          const stageLeads = leads.filter((l) => l.stage === stage.key);
          return (
            <div
              key={stage.key}
              className={`kanban-col ${dragOverStage === stage.key ? 'drag-over' : ''}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverStage(stage.key);
              }}
              onDragLeave={() => setDragOverStage((s) => (s === stage.key ? null : s))}
              onDrop={handleDrop(stage.key)}
            >
              <div
                className={`kanban-col-header ${stage.key === 'won' ? 'won-header' : ''} ${
                  stage.key === 'lost' ? 'lost-header' : ''
                }`}
              >
                <span>{stage.label}</span>
                <span className="count">{stageLeads.length}</span>
              </div>
              <div className="kanban-col-body">
                {stageLeads.length === 0 && <div className="hint">No leads</div>}
                {stageLeads.map((lead) => (
                  <KanbanCard
                    key={lead.id}
                    lead={lead}
                    onOpen={onOpenLead}
                    onDragStart={(e, id) => e.dataTransfer.setData('text/plain', id)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {pendingDrop && (
        <LostReasonModal
          leadName={pendingDrop.leadName}
          onConfirm={(reason) => {
            changeStage(pendingDrop.leadId, 'lost', reason);
            setPendingDrop(null);
          }}
          onCancel={() => setPendingDrop(null)}
        />
      )}
      {showNewLead && <NewLeadModal onClose={() => setShowNewLead(false)} />}
    </div>
  );
}
