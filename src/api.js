import { BACKEND_URL } from './constants.js';

// Apps Script leads keep contactLog as a JSON string; the app works with a real array.
function inflate(lead) {
  let contactLog = [];
  if (Array.isArray(lead.contactLog)) {
    contactLog = lead.contactLog;
  } else if (typeof lead.contactLog === 'string' && lead.contactLog.trim()) {
    try {
      const parsed = JSON.parse(lead.contactLog);
      contactLog = Array.isArray(parsed) ? parsed : [];
    } catch {
      contactLog = [];
    }
  }
  return { ...lead, contactLog };
}

function deflate(lead) {
  return { ...lead, contactLog: JSON.stringify(lead.contactLog || []) };
}

export async function fetchLeads() {
  const res = await fetch(BACKEND_URL, { method: 'GET' });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  const data = await res.json();
  const list = Array.isArray(data) ? data : Array.isArray(data.leads) ? data.leads : [];
  return list.map(inflate);
}

export async function saveAllLeads(leads) {
  const payload = { action: 'save_all', leads: leads.map(deflate) };
  // Content-Type text/plain avoids a CORS preflight against the Apps Script
  // web app, which does not implement OPTIONS. doPost() still JSON.parses
  // e.postData.contents regardless of the declared content type.
  const res = await fetch(BACKEND_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Save failed: ${res.status}`);
  return true;
}
