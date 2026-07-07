import React, { useEffect, useState } from 'react';
import { validateAccessKey } from '../api.js';
import { clearStoredKey, getStoredKey, setStoredKey } from '../utils/auth.js';

// Gates the whole app behind a passcode that the Apps Script backend checks
// server-side (see README "Locking the app down"). Nothing here is a secret —
// the actual passcode lives only in the backend's Script Properties.
export default function PasscodeGate({ children }) {
  const [checking, setChecking] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const stored = getStoredKey();
    if (!stored) {
      setChecking(false);
      return;
    }
    validateAccessKey(stored)
      .then((ok) => {
        if (ok) setUnlocked(true);
        else clearStoredKey();
      })
      .catch(() => {
        // Network hiccup on a device that was previously unlocked — let them
        // straight in rather than locking them out while offline. The normal
        // leads fetch will surface any real connectivity problem.
        setUnlocked(true);
      })
      .finally(() => setChecking(false));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!input.trim() || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const ok = await validateAccessKey(input.trim());
      if (ok) {
        setStoredKey(input.trim());
        setUnlocked(true);
      } else {
        setError('Incorrect passcode.');
      }
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (checking) return null;
  if (unlocked) return children;

  return (
    <div className="gate-screen">
      <form className="gate-card" onSubmit={submit}>
        <img src={`${import.meta.env.BASE_URL}icons/icon-192.png`} alt="" className="gate-logo" />
        <h1>Mako Moto CRM</h1>
        <p className="hint">Enter the team passcode to continue.</p>
        <div className="field">
          <input
            type="password"
            inputMode="numeric"
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Passcode"
          />
        </div>
        {error && (
          <p className="hint" style={{ color: 'var(--danger)' }}>
            {error}
          </p>
        )}
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
          {submitting ? 'Checking…' : 'Unlock'}
        </button>
      </form>
    </div>
  );
}
