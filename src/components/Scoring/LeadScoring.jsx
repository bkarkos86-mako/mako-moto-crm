import React, { useMemo, useState } from 'react';
import { useLeads } from '../../context/LeadsContext.jsx';
import {
  addScoreToHistory,
  getApiKey,
  loadScoreHistory,
  makeScoreRecord,
  scoreConversation,
  setApiKey,
} from '../../utils/scoring.js';

function ScoreResult({ result, leads, onLinked }) {
  const [linkedLeadId, setLinkedLeadId] = useState('');
  const { addContactLogEntry } = useLeads();
  const [logged, setLogged] = useState(false);

  const logToLead = () => {
    if (!linkedLeadId) return;
    const lead = leads.find((l) => l.id === linkedLeadId);
    const summary = `Lead score: ${result.overall}/100 (${result.classification}). Readiness ${result.readiness}, model fit ${result.modelFit}, financing ${result.financing}. Next step: ${result.nextStep}`;
    addContactLogEntry(linkedLeadId, summary);
    setLogged(true);
    if (onLinked) onLinked(linkedLeadId, lead?.name);
  };

  return (
    <div className="score-result">
      <span className={`classification-badge ${result.classification}`}>{result.classification}</span>
      <div className="score-grid">
        <div className="score-tile">
          <div className="st-label">Readiness</div>
          <div className="st-value">{result.readiness}</div>
        </div>
        <div className="score-tile">
          <div className="st-label">Model fit</div>
          <div className="st-value">{result.modelFit}</div>
        </div>
        <div className="score-tile">
          <div className="st-label">Financing</div>
          <div className="st-value">{result.financing}</div>
        </div>
        <div className="score-tile">
          <div className="st-label">Overall</div>
          <div className="st-value">{result.overall}</div>
        </div>
      </div>
      <p>{result.reasoning}</p>
      <p>
        <strong>Next step:</strong> {result.nextStep}
      </p>
      <div className="field">
        <label htmlFor="link-lead">Link to lead</label>
        <select id="link-lead" value={linkedLeadId} onChange={(e) => setLinkedLeadId(e.target.value)}>
          <option value="">— Select a lead —</option>
          {leads.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name || 'Unnamed'} · {l.contact}
            </option>
          ))}
        </select>
      </div>
      <button type="button" className="btn btn-primary" onClick={logToLead} disabled={!linkedLeadId || logged}>
        {logged ? 'Logged to contact history ✓' : 'Log score to lead'}
      </button>
    </div>
  );
}

export default function LeadScoring() {
  const { leads } = useLeads();
  const [apiKeyInput, setApiKeyInput] = useState(getApiKey());
  const [showSettings, setShowSettings] = useState(!getApiKey());
  const [conversation, setConversation] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState(loadScoreHistory);

  const visibleHistory = useMemo(() => history.slice(0, 20), [history]);

  const saveKey = () => {
    setApiKey(apiKeyInput.trim());
    setShowSettings(false);
  };

  const run = async () => {
    if (!conversation.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const scored = await scoreConversation(conversation.trim());
      setResult(scored);
      const record = makeScoreRecord(conversation.trim(), scored, null, null);
      setHistory(addScoreToHistory(record));
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-title">
        <span>Lead scoring</span>
        <button type="button" className="btn btn-ghost" onClick={() => setShowSettings((s) => !s)}>
          {getApiKey() ? 'API key set ✓' : 'Set API key'}
        </button>
      </div>

      {showSettings && (
        <div className="score-result" style={{ marginBottom: 16 }}>
          <div className="field">
            <label htmlFor="claude-key">Claude API key</label>
            <input
              id="claude-key"
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="sk-ant-…"
            />
          </div>
          <p className="hint">
            Stored only in this browser's local storage. Calls go directly from your device to Anthropic's API —
            do not share this device's storage or use a key with billing you don't control.
          </p>
          <button type="button" className="btn btn-primary" onClick={saveKey}>
            Save key
          </button>
        </div>
      )}

      <div className="scoring-layout">
        <div>
          <div className="field">
            <label htmlFor="conv">Paste conversation</label>
            <textarea
              id="conv"
              rows={12}
              value={conversation}
              onChange={(e) => setConversation(e.target.value)}
              placeholder="Paste the SMS / Messenger / call transcript here…"
            />
          </div>
          <button type="button" className="btn btn-primary" onClick={run} disabled={loading || !conversation.trim()}>
            {loading ? 'Scoring…' : 'Score lead'}
          </button>
          {error && (
            <p className="hint" style={{ color: 'var(--danger)', marginTop: 10 }}>
              {error}
            </p>
          )}
          {result && <ScoreResult result={result} leads={leads} />}
        </div>

        <div>
          <div className="section-title" style={{ marginTop: 0 }}>
            Recent scores
          </div>
          {visibleHistory.length === 0 && <div className="empty-state">No scores yet.</div>}
          {visibleHistory.map((h) => (
            <div className="score-history-item" key={h.id}>
              <div className="shi-top">
                <span className={`classification-badge ${h.classification}`}>{h.classification}</span>
                <span className="shi-ts">{new Date(h.ts).toLocaleString()}</span>
              </div>
              <div className="hint">Overall {h.overall} · Readiness {h.readiness} · Fit {h.modelFit} · Financing {h.financing}</div>
              <div style={{ marginTop: 6, fontSize: 13 }}>{h.excerpt}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
