// Merges this device's local leads with the server's current leads so that
// syncing never blindly overwrites what another device already saved.
// New leads (unique ids) from either side always survive. When the same
// lead id was touched on both sides, the newer `updatedAt` wins for the
// scalar fields, but contact log entries from both versions are unioned so
// neither device's notes get silently dropped.
//
// Deletion is NOT modeled here: this backend has no tombstone field, so a
// lead missing from one side is always treated as "new to that side," never
// as "deleted." See README for the operational implication.

function mergeContactLogs(a, b) {
  const seen = new Set();
  const merged = [];
  for (const entry of [...(a || []), ...(b || [])]) {
    const key = `${entry.ts}|${entry.text}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(entry);
  }
  merged.sort((x, y) => new Date(x.ts) - new Date(y.ts));
  return merged;
}

function mergeLead(a, b) {
  const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
  const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
  const newer = aTime >= bTime ? a : b;
  const older = newer === a ? b : a;
  return { ...newer, contactLog: mergeContactLogs(newer.contactLog, older.contactLog) };
}

export function mergeLeadLists(localLeads, serverLeads) {
  const merged = new Map();
  for (const lead of serverLeads) merged.set(lead.id, lead);
  for (const lead of localLeads) {
    const existing = merged.get(lead.id);
    merged.set(lead.id, existing ? mergeLead(lead, existing) : lead);
  }
  return Array.from(merged.values());
}
