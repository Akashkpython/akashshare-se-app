// Simple AI moderation service (no external dependencies)
// Provides lightweight toxicity/profanity checks with configurable env flags

const defaultBannedWords = [
  'abuse', 'hate', 'kill', 'terror', 'bomb', 'attack',
  'bastard', 'bitch', 'fuck', 'shit', 'asshole', 'slut', 'whore',
];

function normalize(text) {
  return (text || '').toString().toLowerCase();
}

/**
 * Moderates a chat message.
 * @param {string} text
 * @returns {Promise<{allowed:boolean,categories:string[],reason?:string}>}
 */
export async function moderateMessage(text) {
  try {
    if (process.env.AI_MODERATION_ENABLED === 'false') {
      return { allowed: true, categories: [] };
    }

    const normalized = normalize(text);
    if (!normalized.trim()) {
      return { allowed: true, categories: [] };
    }

    // Basic heuristics
    const categories = [];

    // Profanity detection
    const banned = (process.env.AI_BANNED_WORDS || '').split(',').map(w => w.trim()).filter(Boolean);
    const bannedWords = banned.length ? banned : defaultBannedWords;
    const hit = bannedWords.find(w => w && normalized.includes(w));
    if (hit) {
      categories.push('profanity');
    }

    // Excessive shouting
    if (text.length >= 8 && text === text.toUpperCase()) {
      categories.push('shouting');
    }

    // Link flood or spammy patterns
    const linkCount = (normalized.match(/https?:\/\//g) || []).length;
    if (linkCount >= 3) {
      categories.push('spam');
    }

    const tooLong = normalized.length > 2000;
    if (tooLong) {
      categories.push('length');
    }

    const blocked = categories.length > 0;
    if (blocked) {
      return {
        allowed: false,
        categories,
        reason: `Message blocked: ${categories.join(', ')}`
      };
    }

    return { allowed: true, categories: [] };
  } catch (error) {
    // Fail-open to avoid blocking chat on moderation errors
    return { allowed: true, categories: [], reason: `moderation_error: ${error.message}` };
  }
}

export default { moderateMessage };


