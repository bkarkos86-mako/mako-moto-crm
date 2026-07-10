const API_KEY_STORAGE = 'mm_claude_api_key';

export const CLAUDE_MODEL = 'claude-sonnet-4-6';

export function getApiKey() {
  return localStorage.getItem(API_KEY_STORAGE) || '';
}

export function setApiKey(key) {
  if (key) localStorage.setItem(API_KEY_STORAGE, key);
  else localStorage.removeItem(API_KEY_STORAGE);
}

// Direct browser -> Anthropic call. Fine for an internal single-user-key
// tool; see README for the tradeoff (the key lives in this browser's
// localStorage, not on a server).
export async function callClaude({ system, messages, maxTokens = 1000 }) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('No Claude API key set. Add one in the settings above first.');
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
      max_tokens: maxTokens,
      ...(system ? { system } : {}),
      messages,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Claude API error ${res.status}: ${body.slice(0, 300)}`);
  }

  const data = await res.json();
  return (data.content || []).map((b) => b.text || '').join('').trim();
}

// Strips ```json fences some responses wrap output in, then parses.
export function parseJsonResponse(text) {
  const jsonStr = text.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
  try {
    return JSON.parse(jsonStr);
  } catch {
    throw new Error('Could not parse Claude response as JSON: ' + text.slice(0, 200));
  }
}
