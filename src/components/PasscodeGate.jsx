import React, { useEffect, useState } from 'react';
import { validateAccessKey } from '../api.js';
import { clearStoredKey, getStoredKey, setStoredKey } from '../utils/auth.js';
import { useUser } from '../context/UserContext.jsx';

// Gates the whole app behind a personal PIN that the Apps Script backend
// checks server-side against the Team sheet (see README "Locking the app
// down"). Nothing here is a secret — the actual PINs live only in the
// backend's Team tab.
export default function PasscodeGate({ children }) {
  const { identify } = useUser();
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
      .then((user) => {
        if (user) {
          identify(user);
          setUnlocked(true);
        } else {
          clearStoredKey();
        }
      })
      .catch(() => {
        // Network hiccup on a device that was previously unlocked — let them
        // straight in rather than locking them out while offline. The normal
        // leads fetch will surface any real connectivity problem.
        setUnlocked(true);
      })
      .finally(() => setChecking(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!input.trim() || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const user = await validateAccessKey(input.trim());
      if (user) {
        setStoredKey(input.trim());
        identify(user);
        setUnlocked(true);
      } else {
        setError('Incorrect PIN.');
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
        <p className="hint">Enter your personal PIN to continue.</p>
        <div className="field">
          <input
            type="password"
            inputMode="numeric"
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="PIN"
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
