import React from 'react';

function Loading() {
  return (
    <div className="sim-dloading">
      <div className="sim-spin" />
      Analyzing…
    </div>
  );
}

const GRADE_CLASS = { good: 'sim-vg', ok: 'sim-vo', bad: 'sim-vb' };

export default function DebriefScreen({ loading, data, error, onTryDifferent, onRetrySame }) {
  return (
    <div className="sim-debrief">
      <div className="sim-logo-row">
        <div className="sim-logo-dot" />
        <div className="sim-logo-txt">Session Complete</div>
      </div>
      <div className="sim-deb-title">Coaching Debrief</div>
      <p className="hint" style={{ marginBottom: 20 }}>
        How your conversation measured up against the Mako Moto sales framework.
      </p>

      <div className="sim-score-card">
        <div className="sim-score-num" style={{ color: data?.scoreColor || 'var(--accent)' }}>
          {loading ? '…' : error ? '–' : `${data.score}/100`}
        </div>
        <div className="sim-score-lbl">Overall Score</div>
      </div>

      {error ? (
        <div className="sim-dsec">
          <div className="hint" style={{ color: 'var(--danger)' }}>
            Analysis failed: {error}
          </div>
        </div>
      ) : (
        <>
          <div className="sim-dsec">
            <div className="sim-dsec-title">Performance Metrics</div>
            {loading ? (
              <Loading />
            ) : (
              data.metrics.map((m) => (
                <div className="sim-mrow" key={m.label}>
                  <span className="hint">{m.label}</span>
                  <span className={`sim-mval ${GRADE_CLASS[m.grade] || ''}`}>{m.value}</span>
                </div>
              ))
            )}
          </div>
          <div className="sim-dsec">
            <div className="sim-dsec-title" style={{ color: 'var(--won)' }}>
              What Worked
            </div>
            {loading ? <Loading /> : <div className="sim-dcontent">{data.wins}</div>}
          </div>
          <div className="sim-dsec">
            <div className="sim-dsec-title" style={{ color: 'var(--warn)' }}>
              What to Improve
            </div>
            {loading ? <Loading /> : <div className="sim-dcontent">{data.improve}</div>}
          </div>
          <div className="sim-dsec">
            <div className="sim-dsec-title">Key Moment</div>
            {loading ? <Loading /> : <div className="sim-dcontent">{data.keyMoment}</div>}
          </div>
          <div className="sim-dsec">
            <div className="sim-dsec-title" style={{ color: 'var(--danger)' }}>
              One Thing to Practice Next
            </div>
            {loading ? <Loading /> : <div className="sim-dcontent">{data.nextPractice}</div>}
          </div>
        </>
      )}

      <div className="sim-deb-btns">
        <button type="button" className="btn btn-primary" onClick={onTryDifferent}>
          Try a Different Customer
        </button>
        <button type="button" className="btn" onClick={onRetrySame}>
          Retry Same Customer
        </button>
      </div>
    </div>
  );
}
