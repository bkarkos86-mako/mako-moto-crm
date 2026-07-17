import { BACKEND_URL } from './constants.js';
import { getStoredKey } from './utils/auth.js';

export class UnauthorizedError extends Error {}
export class ForbiddenDeleteError extends Error {}

// The Apps Script backend returns { ok: false, error: '...' } for auth
// failures. Older/unmodified backends never send `ok`, so this is a no-op
// until the backend's auth check exists — see README.
function assertAuthorized(data) {
  if (data && data.ok === false) {
    if (data.error === 'unauthorized') throw new UnauthorizedError('Incorrect PIN');
    if (data.error === 'forbidden_delete') {
      throw new ForbiddenDeleteError('Only admins can delete leads');
    }
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

// Returns { leads, user }. `user` is { name, role } once the backend's
// per-person Team auth is live, or null against an older backend.
export async function fetchLeads() {
  const key = getStoredKey();
  const url = key ? `${BACKEND_URL}?key=${encodeURIComponent(key)}` : BACKEND_URL;
  const res = await fetch(url, { method: 'GET' });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  const data = await res.json();
  assertAuthorized(data);
  const list = Array.isArray(data) ? data : Array.isArray(data.leads) ? data.leads : [];
  return { leads: list.map(inflate), user: data.user || null };
}

// Returns { user } for the same reason as fetchLeads.
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
  return { user: data.user || null };
}

// Cheap round-trip used to confirm a PIN is accepted by the backend before
// unlocking the app. Returns the matched { name, role } or null.
export async function validateAccessKey(key) {
  const url = `${BACKEND_URL}?key=${encodeURIComponent(key)}`;
  const res = await fetch(url, { method: 'GET' });
  if (!res.ok) throw new Error(`Validation request failed: ${res.status}`);
  const data = await res.json();
  if (data && data.ok === false) return null;
  return data.user || null;
}
