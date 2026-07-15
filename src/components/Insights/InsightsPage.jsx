import React, { useMemo } from 'react';
import { useLeads } from '../../context/LeadsContext.jsx';
import { lostReasonBreakdown, modelInterest, sourcePerformance, teamActivity } from '../../utils/analytics.js';
import BarList from './BarList.jsx';

export default function InsightsPage() {
  const { leads } = useLeads();

  const lostReasons = useMemo(
    () => lostReasonBreakdown(leads).map((r) => ({ label: r.reason, count: r.count, pct: r.pct })),
    [leads]
  );
  const sources = useMemo(() => sourcePerformance(leads), [leads]);
  const models = useMemo(
    () => modelInterest(leads).map((r) => ({ label: r.model, count: r.count })),
    [leads]
  );
  const team = useMemo(() => teamActivity(leads), [leads]);

  return (
    <div>
      <div className="page-title">Insights</div>

      <div className="insights-grid">
        <div className="insights-card">
          <div className="section-title" style={{ marginTop: 0 }}>
            Why leads are lost
          </div>
          <BarList rows={lostReasons} emptyLabel="No lost leads yet." />
        </div>

        <div className="insights-card">
          <div className="section-title" style={{ marginTop: 0 }}>
            Model interest
          </div>
          <BarList rows={models} emptyLabel="No leads yet." />
        </div>

        <div className="insights-card insights-card-wide">
          <div className="section-title" style={{ marginTop: 0 }}>
            Performance by source
          </div>
          {sources.length === 0 ? (
            <div className="empty-state">No leads yet.</div>
          ) : (
            <div className="leads-table-wrap">
              <table className="leads-table">
                <thead>
                  <tr>
                    <th>Source</th>
                    <th>Total</th>
                    <th>Won</th>
                    <th>Lost</th>
                    <th>Win rate</th>
                  </tr>
                </thead>
                <tbody>
                  {sources.map((s) => (
                    <tr key={s.source}>
                      <td>{s.source}</td>
                      <td>{s.total}</td>
                      <td>{s.won}</td>
                      <td>{s.lost}</td>
                      <td>{s.winRate === null ? '—' : `${s.winRate}%`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="insights-card insights-card-wide">
          <div className="section-title" style={{ marginTop: 0 }}>
            Team activity
          </div>
          {team.length === 0 ? (
            <div className="empty-state">No leads yet.</div>
          ) : (
            <div className="leads-table-wrap">
              <table className="leads-table">
                <thead>
                  <tr>
                    <th>Salesperson</th>
                    <th>Captured today</th>
                    <th>Captured last 7 days</th>
                    <th>Won last 30 days</th>
                  </tr>
                </thead>
                <tbody>
                  {team.map((t) => (
                    <tr key={t.salesperson}>
                      <td>{t.salesperson}</td>
                      <td>{t.today}</td>
                      <td>{t.last7Days}</td>
                      <td>{t.wonLast30Days}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
