import { FOLLOWUP_DUE_DAYS, FOLLOWUP_OVERDUE_DAYS } from '../constants.js';

export function daysSince(dateStr) {
  if (!dateStr) return 0;
  const t = new Date(dateStr).getTime();
  if (Number.isNaN(t)) return 0;
  return (Date.now() - t) / (1000 * 60 * 60 * 24);
}

// Returns 'overdue' | 'due' | 'none'
export function followUpStatus(lead) {
  if (!lead || lead.stage === 'won' || lead.stage === 'lost') return 'none';
  const d = daysSince(lead.updatedAt || lead.createdAt);
  if (d >= FOLLOWUP_OVERDUE_DAYS) return 'overdue';
  if (d >= FOLLOWUP_DUE_DAYS) return 'due';
  return 'none';
}

export function lastContactEntry(lead) {
  const log = parseContactLog(lead);
  if (!log.length) return null;
  return log[log.length - 1];
}

export function parseContactLog(lead) {
  const raw = lead && lead.contactLog;
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string' && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}
