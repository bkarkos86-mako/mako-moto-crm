import { makeId } from './id.js';

export const CLAUDE_MODEL = 'claude-sonnet-4-6';
const API_KEY_STORAGE = 'mm_claude_api_key';
const HISTORY_KEY = 'mm_score_history';
const HISTORY_LIMIT = 50;

export function getApiKey() {
  return localStorage.getItem(API_KEY_STORAGE) || '';
}

export function setApiKey(key) {
  if (key) localStorage.setItem(API_KEY_STORAGE, key);
  else localStorage.removeItem(API_KEY_STORAGE);
}

export function loadScoreHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveScoreHistory(list) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, HISTORY_LIMIT)));
  } catch {
    /* ignore */
  }
}

export function addScoreToHistory(record) {
  const list = loadScoreHistory();
  list.unshift(record);
  saveScoreHistory(list);
  return list;
}

const SYSTEM_PROMPT = `You are a motorcycle/e-vehicle sales lead qualification assistant for Mako Moto PH, a company selling electric two- and multi-wheeler vehicles. Given a pasted sales conversation (SMS, Messenger, or call notes), score the lead's buying readiness.

Respond with ONLY a single JSON object, no markdown fences, no commentary, in exactly this shape:
{
  "readiness": <integer 0-100, how close they are to buying now>,
  "modelFit": <integer 0-100, how well their stated needs match a specific Mako Moto model>,
  "financing": <integer 0-100, how likely they are to have financing sorted or not need it>,
  "overall": <integer 0-100, weighted overall score>,
  "classification": "HOT" | "WARM" | "COLD",
  "reasoning": "<2-4 sentences explaining the scores>",
  "nextStep": "<one concrete recommended next action for the salesperson>"
}`;

export async function scoreConversation(conversationText) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('No Claude API key set. Add one in the Lead Scoring settings first.');
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: conversationText }],
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Claude API error ${res.status}: ${body.slice(0, 300)}`);
  }

  const data = await res.json();
  const text = (data.content || []).map((b) => b.text || '').join('').trim();
  const jsonStr = text.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
  let parsed;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error('Could not parse Claude response as JSON: ' + text.slice(0, 200));
  }
  return parsed;
}

export function makeScoreRecord(conversationText, result, linkedLeadId, linkedLeadName) {
  return {
    id: makeId(),
    ts: new Date().toISOString(),
    excerpt: conversationText.slice(0, 240),
    ...result,
    linkedLeadId: linkedLeadId || null,
    linkedLeadName: linkedLeadName || null,
  };
}
