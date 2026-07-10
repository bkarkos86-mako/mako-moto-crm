import { callClaude, parseJsonResponse } from './claude.js';

export function getPersonaSystem(persona, lang) {
  return lang === 'taglish' ? persona.sysTaglish : persona.sysEnglish;
}

// history: [{role: 'user'|'assistant', content}]. Empty history means "give
// the opening line only" — mirrors how a real conversation starts.
export async function getPersonaReply(persona, lang, history) {
  const messages = history.length
    ? history
    : [{ role: 'user', content: 'Start the conversation with your opening line only. Nothing else.' }];
  return callClaude({ system: getPersonaSystem(persona, lang), messages, maxTokens: 300 });
}

export async function getDebrief(persona, lang, history) {
  const transcript = history
    .map((m) => (m.role === 'user' ? 'SALESPERSON' : `CUSTOMER (${persona.name})`) + ': ' + m.content)
    .join('\n\n');

  const prompt = `You are a senior sales coach for Mako Moto Philippines, an EV startup in Imus, Cavite.

Trainee just completed a practice session with: ${persona.name} (${persona.role}, difficulty: ${persona.difficulty}).
Customer profile: ${persona.desc}
Language mode: ${lang}

TRANSCRIPT:
${transcript}

Provide a honest coaching debrief. Reference specific things the salesperson actually said. Be direct.

Return ONLY valid JSON with no markdown fences:
{"score":<0-100>,"scoreColor":"<#00c896 if 70+, #f0b429 if 40-69, #ff4d00 if below 40>","metrics":[{"label":"Asked discovery questions","value":"<Yes/Partially/No>","grade":"<good/ok/bad>"},{"label":"Did cost/savings math","value":"<Yes/Partially/No>","grade":"<good/ok/bad>"},{"label":"Handled objections","value":"<Well/Partially/Poorly>","grade":"<good/ok/bad>"},{"label":"Avoided pressure tactics","value":"<Yes/Partially/No>","grade":"<good/ok/bad>"},{"label":"Proposed a clear next step","value":"<Yes/No>","grade":"<good/ok/bad>"}],"wins":"<2-3 specific things that worked, referencing actual lines from the transcript>","improve":"<2-3 specific improvements with example alternative phrasing they could have used>","keyMoment":"<The single most important turning point in the conversation — what happened and why it mattered>","nextPractice":"<One specific skill to focus on next time, with a concrete example of how to do it>"}`;

  const text = await callClaude({ messages: [{ role: 'user', content: prompt }], maxTokens: 1000 });
  return parseJsonResponse(text);
}
