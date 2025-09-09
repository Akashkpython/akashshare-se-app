// Lightweight classification / OCR scaffolding using Node-only fallbacks
// Designed to run without GPU or large runtime deps; can be swapped for cloud APIs

import fs from 'fs';
import path from 'path';

/**
 * Produce simple tags from filename and mimetype.
 */
export async function tagFile({ originalName, mimetype, filePath }) {
  const tags = new Set();
  if (mimetype) {
    const [type, subtype] = mimetype.split('/')
      .map(s => (s || '').trim().toLowerCase());
    if (type) tags.add(type);
    if (subtype) tags.add(subtype.replace(/[^a-z0-9]+/g, ''));
  }
  if (originalName) {
    const base = path.basename(originalName, path.extname(originalName));
    base.split(/[^a-z0-9]+/i).filter(Boolean).slice(0, 5).forEach(t => tags.add(t.toLowerCase()));
  }
  if (filePath && fs.existsSync(filePath)) {
    const size = fs.statSync(filePath).size;
    if (size > 50 * 1024 * 1024) tags.add('large');
    if (size > 200 * 1024 * 1024) tags.add('very-large');
  }
  return Array.from(tags);
}

/**
 * Heuristic NSFW flagging by filename and mime (placeholder for real model/API)
 */
export async function detectNSFW({ originalName, mimetype }) {
  if (process.env.AI_NSFW_ENABLED === 'false') return { nsfw: false, confidence: 0.0 };
  const name = (originalName || '').toLowerCase();
  const hints = ['nsfw', '18+', 'xxx'];
  const hit = hints.some(h => name.includes(h));
  return { nsfw: hit, confidence: hit ? 0.7 : 0.05 };
}

/**
 * Simple OCR stub. Replace with tesseract.js or cloud OCR when enabled.
 */
export async function runOCR({ mimetype, filePath }) {
  if (process.env.AI_OCR_ENABLED !== 'true') return { text: '', performed: false };
  const isImage = (mimetype || '').startsWith('image/');
  if (!isImage) return { text: '', performed: false };
  // Placeholder: real OCR integration to be added as needed
  return { text: '', performed: true };
}

/**
 * Simple PII detection via regexes (emails/phones). Replace with cloud PII if needed.
 */
export async function detectPII({ text }) {
  if (!text) return { pii: [], performed: false };
  const hits = [];
  const emailRe = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
  const phoneRe = /\b\+?\d[\d\s().-]{7,}\b/g;
  const emails = text.match(emailRe) || [];
  const phones = text.match(phoneRe) || [];
  if (emails.length) hits.push({ type: 'email', values: emails.slice(0, 5) });
  if (phones.length) hits.push({ type: 'phone', values: phones.slice(0, 5) });
  return { pii: hits, performed: true };
}

export default { tagFile, detectNSFW, runOCR, detectPII };


