import React, { useEffect, useRef, useState } from 'react';

export default function ChatScreen({ persona, lang, onLangSwitch, messages, waiting, onSend, onBack, onEnd }) {
  const [input, setInput] = useState('');
  const [briefVisible, setBriefVisible] = useState(true);
  const listRef = useRef(null);
  const taRef = useRef(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, waiting]);

  const send = () => {
    const text = input.trim();
    if (!text || waiting) return;
    onSend(text);
    setInput('');
    if (taRef.current) taRef.current.style.height = 'auto';
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const autoResize = (e) => {
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
  };

  return (
    <div className="sim-chat">
      <div className="sim-chat-hdr">
        <button type="button" className="sim-back-btn" onClick={onBack} aria-label="Back">
          ←
        </button>
        <div className="sim-hdr-avatar">{persona.emoji}</div>
        <div className="sim-hdr-info">
          <div className="sim-hdr-name">{persona.name}</div>
          <div className="sim-hdr-role">{persona.role}</div>
        </div>
        <div className="sim-hdr-right">
          <div className="sim-lang-toggle">
            <button
              type="button"
              className={`sim-lang-opt ${lang === 'taglish' ? 'active' : ''}`}
              onClick={() => onLangSwitch('taglish')}
            >
              Taglish
            </button>
            <button
              type="button"
              className={`sim-lang-opt ${lang === 'english' ? 'active' : ''}`}
              onClick={() => onLangSwitch('english')}
            >
              English
            </button>
          </div>
          <button type="button" className="sim-end-btn" onClick={onEnd}>
            End &amp; Debrief →
          </button>
        </div>
      </div>

      <div className="sim-brief-bar">
        <span className="sim-brief-lbl">Brief</span>
        {briefVisible && <span className="sim-brief-txt">{persona.brief}</span>}
        <button type="button" className="sim-brief-hide" onClick={() => setBriefVisible((v) => !v)}>
          {briefVisible ? 'Hide' : 'Show'}
        </button>
      </div>

      <div className="sim-messages" ref={listRef}>
        {messages.map((m, i) =>
          m.role === 'sys' ? (
            <div className="sim-sysmsg" key={i}>
              {m.text}
            </div>
          ) : (
            <div className={`sim-msg ${m.role}`} key={i}>
              <div className="sim-mavatar">{m.role === 'customer' ? persona.emoji : m.role === 'error' ? '⚠' : '🧑‍💼'}</div>
              <div className="sim-mbubble">{m.text}</div>
            </div>
          )
        )}
        {waiting && (
          <div className="sim-msg customer">
            <div className="sim-mavatar">{persona.emoji}</div>
            <div className="sim-typing">
              <div className="sim-tdot" />
              <div className="sim-tdot" />
              <div className="sim-tdot" />
            </div>
          </div>
        )}
      </div>

      <div className="sim-input-area">
        <div className="sim-input-row">
          <textarea
            ref={taRef}
            className="sim-chat-ta"
            rows={1}
            placeholder="Type your response as the salesperson…"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              autoResize(e);
            }}
            onKeyDown={handleKey}
            disabled={waiting}
          />
          <button type="button" className="sim-send-btn" onClick={send} disabled={waiting || !input.trim()}>
            ➤
          </button>
        </div>
        <div className="sim-input-hint">Enter to send · Shift+Enter for new line</div>
      </div>
    </div>
  );
}
