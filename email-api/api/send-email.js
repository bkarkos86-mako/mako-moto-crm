import nodemailer from 'nodemailer';

// Only the CRM's own origins may call this — kept as an allowlist rather
// than a wildcard even though the real security boundary is the PIN check
// below (anything in the frontend's JS is public, so this can't be a
// secret; it's just tidy defense-in-depth).
const ALLOWED_ORIGINS = new Set([
  'https://bkarkos86-mako.github.io',
  'http://localhost:5173',
  'http://localhost:5180',
]);

function setCors(req, res) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// Verifies the caller's PIN against the CRM's existing Team-sheet auth
// (the same Apps Script GET the frontend already uses) — this endpoint
// has no auth system of its own, it borrows the CRM's.
async function verifyPin(pin) {
  if (!pin || !process.env.APPS_SCRIPT_URL) return null;
  const url = `${process.env.APPS_SCRIPT_URL}?key=${encodeURIComponent(pin)}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  if (data && data.ok === false) return null;
  return data.user || null;
}

export default async function handler(req, res) {
  setCors(req, res);

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'method_not_allowed' });
    return;
  }

  const { to, subject, body, leadId, pin } = req.body || {};
  if (!to || !subject || !body || !pin) {
    res.status(400).json({ ok: false, error: 'missing_fields' });
    return;
  }

  const user = await verifyPin(pin).catch(() => null);
  if (!user) {
    res.status(401).json({ ok: false, error: 'unauthorized' });
    return;
  }

  const transporter = nodemailer.createTransport({
    host: 'mail.makomotoph.com',
    port: 465,
    secure: true,
    auth: {
      user: 'sales@makomotoph.com',
      pass: process.env.SMTP_PASSWORD,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  try {
    await transporter.sendMail({
      from: `"${user.name} — Mako Moto PH" <sales@makomotoph.com>`,
      to,
      subject,
      text: body,
      replyTo: 'sales@makomotoph.com',
    });
    console.log(`Email sent by ${user.name} for lead ${leadId || 'unknown'}`);
    res.status(200).json({ ok: true, sentBy: user.name });
  } catch (err) {
    const message = String((err && err.message) || err);
    let errorType = 'send_failed';
    if (/auth|invalid login|username and password/i.test(message)) errorType = 'auth_error';
    else if (/timedout|timeout|etimedout|econnrefused|econnreset|enotfound/i.test(message)) {
      errorType = 'connection_error';
    } else if (/rate|too many|limit/i.test(message)) errorType = 'rate_limited';

    console.error('send-email failed:', message);
    res.status(502).json({ ok: false, error: errorType, detail: message });
  }
}
