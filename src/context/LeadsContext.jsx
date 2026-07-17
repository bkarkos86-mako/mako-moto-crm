import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { fetchLeads, saveAllLeads, ForbiddenDeleteError } from '../api.js';
import { makeId } from '../utils/id.js';
import { mergeLeadLists } from '../utils/merge.js';
import { useUser } from './UserContext.jsx';

const LeadsContext = createContext(null);

const CACHE_KEY = 'mm_leads_cache_v1';
const PENDING_KEY = 'mm_leads_pending_v1';
const EXCLUDE_KEY = 'mm_leads_pending_excludes_v1';

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

function loadPendingExcludes() {
  try {
    const raw = localStorage.getItem(EXCLUDE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function savePendingExcludes(set) {
  try {
    localStorage.setItem(EXCLUDE_KEY, JSON.stringify(Array.from(set)));
  } catch {
    /* ignore */
  }
}

export function LeadsProvider({ children }) {
  const { identify } = useUser();
  const [leads, setLeads] = useState(loadCache);
  const [status, setStatus] = useState('loading'); // loading | ready | offline
  const [syncing, setSyncing] = useState(false);
  const pendingRef = useRef(localStorage.getItem(PENDING_KEY) === '1');
  // Ids explicitly deleted on this device that haven't been confirmed synced
  // yet — a merge must exclude these even if the server still has them,
  // otherwise a delete made while offline would get merged back in. See
  // src/utils/merge.js for why this can't just be part of the merge itself.
  const pendingExcludesRef = useRef(loadPendingExcludes());

  // Fetches the server's current leads, merges in whatever this device wants
  // to save, applies any still-pending deletions, and pushes the result.
  // Every save goes through this — not just offline recovery — so that two
  // devices saving around the same time merge instead of one clobbering the
  // other.
  const syncNow = useCallback(
    async (candidateLeads) => {
      const fetched = await fetchLeads();
      identify(fetched.user);
      let merged = mergeLeadLists(candidateLeads, fetched.leads);
      if (pendingExcludesRef.current.size) {
        merged = merged.filter((l) => !pendingExcludesRef.current.has(l.id));
      }
      const saved = await saveAllLeads(merged);
      identify(saved.user);
      return merged;
    },
    [identify]
  );

  const clearPending = () => {
    pendingRef.current = false;
    pendingExcludesRef.current.clear();
    localStorage.removeItem(PENDING_KEY);
    savePendingExcludes(pendingExcludesRef.current);
  };

  const persist = useCallback(
    async (next, options = {}) => {
      setLeads(next);
      saveCache(next);
      if (options.excludeIds) {
        for (const id of options.excludeIds) pendingExcludesRef.current.add(id);
        savePendingExcludes(pendingExcludesRef.current);
      }
      setSyncing(true);
      try {
        const merged = await syncNow(next);
        setLeads(merged);
        saveCache(merged);
        clearPending();
        setStatus('ready');
      } catch (err) {
        if (err instanceof ForbiddenDeleteError) {
          // Not a connectivity problem — retrying won't help. Discard the
          // disallowed local delete and resync to the server's real state.
          alert('Only admins can delete leads.');
          clearPending();
          try {
            const fresh = await fetchLeads();
            identify(fresh.user);
            setLeads(fresh.leads);
            saveCache(fresh.leads);
            setStatus('ready');
          } catch {
            setStatus('offline');
          }
        } else {
          pendingRef.current = true;
          localStorage.setItem(PENDING_KEY, '1');
          setStatus('offline');
        }
      } finally {
        setSyncing(false);
      }
    },
    [syncNow, identify]
  );

  const retryPending = useCallback(async () => {
    if (!pendingRef.current) return;
    setSyncing(true);
    try {
      const merged = await syncNow(leads);
      setLeads(merged);
      saveCache(merged);
      clearPending();
      setStatus('ready');
    } catch {
      setStatus('offline');
    } finally {
      setSyncing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leads, syncNow]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (pendingRef.current) {
        await retryPending();
        return;
      }
      try {
        const fresh = await fetchLeads();
        if (cancelled) return;
        identify(fresh.user);
        setLeads(fresh.leads);
        saveCache(fresh.leads);
        setStatus('ready');
      } catch {
        if (!cancelled) setStatus('offline');
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
      persist(
        leads.filter((l) => l.id !== id),
        { excludeIds: new Set([id]) }
      );
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
