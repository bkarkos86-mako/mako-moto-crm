import { EMAIL_FUNCTION_URL } from '../constants.js';
import { getStoredKey } from './auth.js';

export class EmailAuthError extends Error {}
export class EmailConnectionError extends Error {}
export class EmailRateLimitError extends Error {}

export async function sendFollowUpEmail({ to, subject, body, leadId }) {
  const pin = getStoredKey();
  let res;
  try {
    res = await fetch(EMAIL_FUNCTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, body, leadId, pin }),
    });
  } catch {
    throw new EmailConnectionError('Could not reach the email service. Check your connection and try again.');
  }

  let data = {};
  try {
    data = await res.json();
  } catch {
    /* non-JSON response — fall through to the generic error below */
  }

  if (res.ok && data.ok) return data;

  switch (data.error) {
    case 'unauthorized':
      throw new EmailAuthError('Your PIN could not be verified — try logging out and back in.');
    case 'auth_error':
      throw new EmailAuthError('The email account rejected the login — the mailbox password may need updating.');
    case 'connection_error':
      throw new EmailConnectionError(
        'Could not connect to the mail server. It may be temporarily down — try again shortly.'
      );
    case 'rate_limited':
      throw new EmailRateLimitError('The mail server says we are sending too fast. Wait a bit and try again.');
    default:
      throw new Error(data.detail || 'The email could not be sent. Try again, or use the WhatsApp/Viber link instead.');
  }
}
