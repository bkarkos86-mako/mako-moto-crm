import React, { useState } from 'react';
import PersonaSelect from './PersonaSelect.jsx';
import ChatScreen from './ChatScreen.jsx';
import DebriefScreen from './DebriefScreen.jsx';
import { getDebrief, getPersonaReply } from '../../utils/salesSim.js';

export default function SalesSimulator() {
  const [screen, setScreen] = useState('select');
  const [diffFilter, setDiffFilter] = useState('all');
  const [lang, setLang] = useState('taglish');
  const [selected, setSelected] = useState(null);

  const [messages, setMessages] = useState([]); // display log: {role: sys|customer|salesperson|error, text}
  const [apiHistory, setApiHistory] = useState([]); // [{role: user|assistant, content}]
  const [waiting, setWaiting] = useState(false);

  const [debriefLoading, setDebriefLoading] = useState(false);
  const [debriefData, setDebriefData] = useState(null);
  const [debriefError, setDebriefError] = useState('');

  const requestReply = async (persona, nextHistory) => {
    setWaiting(true);
    try {
      const reply = await getPersonaReply(persona, lang, nextHistory);
      setMessages((m) => [...m, { role: 'customer', text: reply }]);
      setApiHistory((h) => [...h, { role: 'assistant', content: reply }]);
    } catch (err) {
      setMessages((m) => [...m, { role: 'error', text: '⚠ API Error: ' + (err.message || String(err)) }]);
    } finally {
      setWaiting(false);
    }
  };

  const startSession = async () => {
    if (!selected) return;
    setScreen('chat');
    setMessages([{ role: 'sys', text: 'Session started — you are the salesperson' }]);
    setApiHistory([]);
    await requestReply(selected, []);
  };

  const sendMsg = (text) => {
    setMessages((m) => [...m, { role: 'salesperson', text }]);
    const next = [...apiHistory, { role: 'user', content: text }];
    setApiHistory(next);
    requestReply(selected, next);
  };

  const switchLang = (l) => {
    if (l === lang) return;
    setLang(l);
    setMessages((m) => [...m, { role: 'sys', text: 'Language switched to ' + (l === 'taglish' ? 'Taglish' : 'English') }]);
  };

  const endSession = async () => {
    if (apiHistory.length < 2) {
      alert('Have a few more exchanges first.');
      return;
    }
    setScreen('debrief');
    setDebriefLoading(true);
    setDebriefData(null);
    setDebriefError('');
    try {
      const d = await getDebrief(selected, lang, apiHistory);
      setDebriefData(d);
    } catch (err) {
      setDebriefError(err.message || String(err));
    } finally {
      setDebriefLoading(false);
    }
  };

  const resetToSelect = () => {
    setSelected(null);
    setMessages([]);
    setApiHistory([]);
    setScreen('select');
  };

  const retrySame = () => {
    if (!selected) {
      resetToSelect();
      return;
    }
    startSession();
  };

  const goBack = () => {
    if (apiHistory.length > 0 && !window.confirm('End this session? Progress will be lost.')) return;
    resetToSelect();
  };

  if (screen === 'chat' && selected) {
    return (
      <ChatScreen
        persona={selected}
        lang={lang}
        onLangSwitch={switchLang}
        messages={messages}
        waiting={waiting}
        onSend={sendMsg}
        onBack={goBack}
        onEnd={endSession}
      />
    );
  }

  if (screen === 'debrief' && selected) {
    return (
      <DebriefScreen
        loading={debriefLoading}
        data={debriefData}
        error={debriefError}
        onTryDifferent={resetToSelect}
        onRetrySame={retrySame}
      />
    );
  }

  return (
    <PersonaSelect
      diffFilter={diffFilter}
      setDiffFilter={setDiffFilter}
      lang={lang}
      setLang={setLang}
      selected={selected}
      setSelected={setSelected}
      onStart={startSession}
    />
  );
}
