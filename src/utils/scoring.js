import { makeId } from './id.js';
import { callClaude, parseJsonResponse } from './claude.js';

const HISTORY_KEY = 'mm_score_history';
const HISTORY_LIMIT = 50;

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
  const text = await callClaude({
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: conversationText }],
    maxTokens: 1000,
  });
  return parseJsonResponse(text);
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
