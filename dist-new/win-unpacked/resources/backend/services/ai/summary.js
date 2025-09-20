// Simple extractive summary for recent messages (fallback without external LLM)

/**
 * Summarize an array of messages (strings).
 * Heuristic: pick most representative lines by length and uniqueness.
 */
export function summarizeMessages(messages, maxLines = 5) {
  if (!Array.isArray(messages) || messages.length === 0) return '';
  const normalized = messages
    .map(m => (m || '').toString().trim())
    .filter(Boolean)
    .slice(-200);
  if (normalized.length === 0) return '';
  const scored = normalized.map((text) => ({
    text,
    score: scoreText(text)
  }));
  scored.sort((a, b) => b.score - a.score);
  const picked = uniqueByText(scored, maxLines).map(s => s.text);
  return picked.join('\n');
}

function scoreText(t) {
  // length-based + token diversity score
  const len = Math.min(t.length, 400);
  const tokens = t.toLowerCase().split(/\W+/).filter(Boolean);
  const unique = new Set(tokens).size;
  return len * 0.6 + unique * 2.0;
}

function uniqueByText(items, limit) {
  const seen = new Set();
  const result = [];
  for (const it of items) {
    const key = it.text.toLowerCase().slice(0, 80);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(it);
    if (result.length >= limit) break;
  }
  return result;
}

export default { summarizeMessages };


