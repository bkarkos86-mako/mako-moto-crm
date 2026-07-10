import React, { useState } from 'react';
import { PERSONAS } from '../../data/personas.js';
import { getApiKey } from '../../utils/claude.js';
import ApiKeySettings from '../common/ApiKeySettings.jsx';

const DIFFICULTIES = [
  { key: 'all', label: 'All' },
  { key: 'easy', label: 'Easy' },
  { key: 'medium', label: 'Medium' },
  { key: 'hard', label: 'Hard' },
];

export default function PersonaSelect({ diffFilter, setDiffFilter, lang, setLang, selected, setSelected, onStart }) {
  const [showSettings, setShowSettings] = useState(!getApiKey());

  const list = diffFilter === 'all' ? PERSONAS : PERSONAS.filter((p) => p.difficulty === diffFilter);

  return (
    <div className="sim-select">
      <div className="page-title">
        <span>Sales Practice Simulator</span>
        <button type="button" className="btn btn-ghost" onClick={() => setShowSettings((s) => !s)}>
          {getApiKey() ? 'API key set ✓' : 'Set API key'}
        </button>
      </div>
      <p className="hint" style={{ marginBottom: 16 }}>
        Choose a virtual customer. The AI plays their role with real objections. Get a coaching debrief when
        you're done.
      </p>

      {showSettings && <ApiKeySettings onSaved={() => setShowSettings(false)} />}

      <div className="sim-controls-row">
        <div className="sim-diff-row">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.key}
              type="button"
              className={`sim-diff-btn ${diffFilter === d.key ? 'active' : ''}`}
              onClick={() => setDiffFilter(d.key)}
            >
              {d.label}
            </button>
          ))}
        </div>
        <div className="sim-lang-wrap">
          <span className="hint">Customer language:</span>
          <div className="sim-lang-toggle">
            <button
              type="button"
              className={`sim-lang-opt ${lang === 'taglish' ? 'active' : ''}`}
              onClick={() => setLang('taglish')}
            >
              Taglish
            </button>
            <button
              type="button"
              className={`sim-lang-opt ${lang === 'english' ? 'active' : ''}`}
              onClick={() => setLang('english')}
            >
              English
            </button>
          </div>
        </div>
      </div>

      <div className="sim-pgrid">
        {list.map((p) => (
          <div
            key={p.id}
            className={`sim-pcard ${selected?.id === p.id ? 'selected' : ''}`}
            onClick={() => setSelected(p)}
          >
            <div className="sim-pcard-top">
              <div className="sim-pcard-emoji">{p.emoji}</div>
              <div className={`sim-pdiff sim-d-${p.difficulty}`}>{p.difficulty}</div>
            </div>
            <div className="sim-pname">{p.name}</div>
            <div className="sim-prole">{p.role}</div>
            <div className="sim-pdesc">{p.desc}</div>
            <div className="sim-ptags">
              {p.tags.map((t) => (
                <span className="sim-ptag" key={t}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="sim-start-bar">
        <button type="button" className="btn btn-primary" style={{ width: '100%' }} disabled={!selected} onClick={onStart}>
          {selected ? `Start Session with ${selected.name} →` : 'Select a customer to begin'}
        </button>
      </div>
    </div>
  );
}
