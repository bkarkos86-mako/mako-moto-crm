import React, { useState } from 'react';
import { getApiKey, setApiKey } from '../../utils/claude.js';

// Shared Claude API key entry, used by both Lead Scoring and the Sales
// Simulator — one key, stored once, works for both.
export default function ApiKeySettings({ onSaved }) {
  const [input, setInput] = useState(getApiKey());

  const save = () => {
    setApiKey(input.trim());
    if (onSaved) onSaved();
  };

  return (
    <div className="score-result" style={{ marginBottom: 16 }}>
      <div className="field">
        <label htmlFor="claude-key">Claude API key</label>
        <input
          id="claude-key"
          type="password"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="sk-ant-…"
        />
      </div>
      <p className="hint">
        Stored only in this browser's local storage, shared by Lead Scoring and the Sales Simulator. Calls go
        directly from your device to Anthropic's API — do not share this device's storage or use a key with
        billing you don't control.
      </p>
      <button type="button" className="btn btn-primary" onClick={save}>
        Save key
      </button>
    </div>
  );
}
