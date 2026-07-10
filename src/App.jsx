import React, { useState } from 'react';
import Header from './components/Header.jsx';
import BottomNav from './components/BottomNav.jsx';
import KanbanBoard from './components/Kanban/KanbanBoard.jsx';
import FollowUpDashboard from './components/FollowUp/FollowUpDashboard.jsx';
import LeadsList from './components/Leads/LeadsList.jsx';
import LeadDetail from './components/Leads/LeadDetail.jsx';
import LeadScoring from './components/Scoring/LeadScoring.jsx';
import MobileEventMode from './components/MobileEvent/MobileEventMode.jsx';
import SalesSimulator from './components/SalesSim/SalesSimulator.jsx';

function getDefaultView() {
  return window.innerWidth < 600 ? 'event' : 'kanban';
}

export default function App() {
  const [view, setView] = useState(getDefaultView);
  const [selectedLeadId, setSelectedLeadId] = useState(null);

  return (
    <>
      <Header view={view} setView={setView} />
      <main className="app-main">
        {view === 'kanban' && <KanbanBoard onOpenLead={setSelectedLeadId} />}
        {view === 'followup' && <FollowUpDashboard onOpenLead={setSelectedLeadId} />}
        {view === 'leads' && <LeadsList onOpenLead={setSelectedLeadId} />}
        {view === 'scoring' && <LeadScoring />}
        {view === 'practice' && <SalesSimulator />}
        {view === 'event' && <MobileEventMode />}
      </main>
      <BottomNav view={view} setView={setView} />
      {selectedLeadId && <LeadDetail leadId={selectedLeadId} onClose={() => setSelectedLeadId(null)} />}
    </>
  );
}
