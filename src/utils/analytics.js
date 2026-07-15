import { daysSince } from './followUp.js';

function sortByCountDesc(a, b) {
  return b.count - a.count;
}

// leads lost, grouped by reason, sorted most-common first.
export function lostReasonBreakdown(leads) {
  const lost = leads.filter((l) => l.stage === 'lost');
  const counts = new Map();
  for (const lead of lost) {
    const reason = lead.lostReason || 'Not specified';
    counts.set(reason, (counts.get(reason) || 0) + 1);
  }
  const total = lost.length;
  return Array.from(counts.entries())
    .map(([reason, count]) => ({ reason, count, pct: total ? Math.round((count / total) * 100) : 0 }))
    .sort(sortByCountDesc);
}

// per-source totals + win rate (won / (won + lost), ignoring leads still in
// progress since they haven't resolved either way yet).
export function sourcePerformance(leads) {
  const bySource = new Map();
  for (const lead of leads) {
    const source = lead.source || 'Unknown';
    if (!bySource.has(source)) bySource.set(source, { source, total: 0, won: 0, lost: 0 });
    const row = bySource.get(source);
    row.total += 1;
    if (lead.stage === 'won') row.won += 1;
    if (lead.stage === 'lost') row.lost += 1;
  }
  return Array.from(bySource.values())
    .map((row) => {
      const resolved = row.won + row.lost;
      return { ...row, winRate: resolved ? Math.round((row.won / resolved) * 100) : null };
    })
    .sort((a, b) => b.total - a.total);
}

// how many leads expressed interest in each model, across all stages.
export function modelInterest(leads) {
  const counts = new Map();
  for (const lead of leads) {
    const model = lead.model || 'Not specified';
    counts.set(model, (counts.get(model) || 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([model, count]) => ({ model, count }))
    .sort(sortByCountDesc);
}

// per-salesperson activity: captured today, captured in the last 7 days,
// and leads won in the last 30 days.
export function teamActivity(leads) {
  const byPerson = new Map();
  for (const lead of leads) {
    const person = lead.salesperson || 'Unassigned';
    if (!byPerson.has(person)) {
      byPerson.set(person, { salesperson: person, today: 0, last7Days: 0, wonLast30Days: 0 });
    }
    const row = byPerson.get(person);
    const createdDays = daysSince(lead.createdAt);
    if (createdDays < 1) row.today += 1;
    if (createdDays < 7) row.last7Days += 1;
    if (lead.stage === 'won' && daysSince(lead.updatedAt || lead.createdAt) < 30) row.wonLast30Days += 1;
  }
  return Array.from(byPerson.values()).sort((a, b) => b.last7Days - a.last7Days);
}
