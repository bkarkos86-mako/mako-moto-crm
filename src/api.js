import { BACKEND_URL } from './constants.js';
import { getStoredKey } from './utils/auth.js';

export class UnauthorizedError extends Error {}

// The Apps Script backend returns { ok: false, error: 'unauthorized' } when the
// passcode is missing/wrong (once the doGet/doPost auth check has been added
// there — see README). Older/unmodified backends never send `ok`, so this is a
// no-op until that check exists.
function assertAuthorized(data) {
  if (data && data.ok === false) {
    if (data.error === 'unauthorized') throw new UnauthorizedError('Incorrect passcode');
    throw new Error(data.error || 'Backend rejected the request');
  }
}

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
  const key = getStoredKey();
  const url = key ? `${BACKEND_URL}?key=${encodeURIComponent(key)}` : BACKEND_URL;
  const res = await fetch(url, { method: 'GET' });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  const data = await res.json();
  assertAuthorized(data);
  const list = Array.isArray(data) ? data : Array.isArray(data.leads) ? data.leads : [];
  return list.map(inflate);
}

export async function saveAllLeads(leads) {
  const payload = { action: 'save_all', leads: leads.map(deflate), key: getStoredKey() };
  // Content-Type text/plain avoids a CORS preflight against the Apps Script
  // web app, which does not implement OPTIONS. doPost() still JSON.parses
  // e.postData.contents regardless of the declared content type.
  const res = await fetch(BACKEND_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Save failed: ${res.status}`);
  const data = await res.json().catch(() => ({}));
  assertAuthorized(data);
  return true;
}

// Cheap round-trip used purely to confirm a passcode is accepted by the
// backend before unlocking the app.
export async function validateAccessKey(key) {
  const url = `${BACKEND_URL}?key=${encodeURIComponent(key)}`;
  const res = await fetch(url, { method: 'GET' });
  if (!res.ok) throw new Error(`Validation request failed: ${res.status}`);
  const data = await res.json();
  return !(data && data.ok === false);
}
