import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { fetchLeads, saveAllLeads } from '../api.js';
import { makeId } from '../utils/id.js';

const LeadsContext = createContext(null);

const CACHE_KEY = 'mm_leads_cache_v1';
const PENDING_KEY = 'mm_leads_pending_v1';

function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCache(leads) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(leads));
  } catch {
    /* storage full or unavailable — ignore */
  }
}

export function LeadsProvider({ children }) {
  const [leads, setLeads] = useState(loadCache);
  const [status, setStatus] = useState('loading'); // loading | ready | offline
  const [syncing, setSyncing] = useState(false);
  const pendingRef = useRef(localStorage.getItem(PENDING_KEY) === '1');

  const persist = useCallback(async (next) => {
    setLeads(next);
    saveCache(next);
    setSyncing(true);
    try {
      await saveAllLeads(next);
      pendingRef.current = false;
      localStorage.removeItem(PENDING_KEY);
      setStatus('ready');
    } catch {
      pendingRef.current = true;
      localStorage.setItem(PENDING_KEY, '1');
      setStatus('offline');
    } finally {
      setSyncing(false);
    }
  }, []);

  const retryPending = useCallback(async () => {
    if (!pendingRef.current) return;
    setSyncing(true);
    try {
      await saveAllLeads(leads);
      pendingRef.current = false;
      localStorage.removeItem(PENDING_KEY);
      setStatus('ready');
    } catch {
      setStatus('offline');
    } finally {
      setSyncing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leads]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const fresh = await fetchLeads();
        if (cancelled) return;
        if (!pendingRef.current) {
          setLeads(fresh);
          saveCache(fresh);
        }
        setStatus('ready');
      } catch {
        if (!cancelled) setStatus(leads.length ? 'offline' : 'offline');
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onOnline = () => retryPending();
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, [retryPending]);

  const addLead = useCallback(
    (partial) => {
      const now = new Date().toISOString();
      const lead = {
        id: makeId(),
        name: '',
        contact: '',
        model: '',
        source: '',
        salesperson: '',
        stage: 'new',
        lostReason: '',
        notes: '',
        contactLog: [],
        createdAt: now,
        updatedAt: now,
        ...partial,
      };
      persist([lead, ...leads]);
      return lead;
    },
    [leads, persist]
  );

  const updateLead = useCallback(
    (id, patch) => {
      const now = new Date().toISOString();
      const next = leads.map((l) => (l.id === id ? { ...l, ...patch, updatedAt: now } : l));
      persist(next);
    },
    [leads, persist]
  );

  const deleteLead = useCallback(
    (id) => {
      persist(leads.filter((l) => l.id !== id));
    },
    [leads, persist]
  );

  const addContactLogEntry = useCallback(
    (id, text) => {
      const now = new Date().toISOString();
      const next = leads.map((l) => {
        if (l.id !== id) return l;
        const log = Array.isArray(l.contactLog) ? l.contactLog : [];
        return { ...l, contactLog: [...log, { ts: now, text }], updatedAt: now };
      });
      persist(next);
    },
    [leads, persist]
  );

  const changeStage = useCallback(
    (id, stage, lostReason) => {
      const now = new Date().toISOString();
      const next = leads.map((l) => {
        if (l.id !== id) return l;
        const patch = { stage, updatedAt: now };
        if (stage === 'lost') patch.lostReason = lostReason || '';
        else patch.lostReason = '';
        return { ...l, ...patch };
      });
      persist(next);
    },
    [leads, persist]
  );

  const value = {
    leads,
    status,
    syncing,
    hasPending: pendingRef.current,
    addLead,
    updateLead,
    deleteLead,
    addContactLogEntry,
    changeStage,
    saveAll: persist,
  };

  return <LeadsContext.Provider value={value}>{children}</LeadsContext.Provider>;
}

export function useLeads() {
  const ctx = useContext(LeadsContext);
  if (!ctx) throw new Error('useLeads must be used within LeadsProvider');
  return ctx;
}
