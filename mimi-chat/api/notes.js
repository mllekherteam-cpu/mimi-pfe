// Mimi's sticky notes, synced so they follow her between phone and laptop. No AI involved.
// GET            -> { sync, notes: [...] }
// PUT {notes}    -> merges with the server copy (newest edit of each note wins), returns the merged list
import { checkAuth, hasStore, redis, readJson } from '../lib/store.js';

const KEY = 'mimi:notes';
const mem = globalThis.__mimiNotes || (globalThis.__mimiNotes = { list: [] });
const MONTH = 30 * 864e5;

function merge(a, b) {
  const m = new Map();
  for (const n of [...a, ...b]) {
    if (!n?.id) continue;
    const o = m.get(n.id);
    if (!o || (n.updated || 0) > (o.updated || 0)) m.set(n.id, n);
  }
  // forget deleted notes after a month
  return [...m.values()].filter((n) => !n.deleted || Date.now() - n.updated < MONTH);
}

async function load() {
  if (!hasStore) return mem.list;
  const s = await redis('GET', KEY);
  return s ? JSON.parse(s) : [];
}

export default async function handler(req, res) {
  if (!checkAuth(req, res)) return;
  try {
    if (req.method === 'GET') return res.status(200).json({ sync: hasStore, notes: await load() });
    if (req.method === 'PUT') {
      const { notes } = await readJson(req);
      if (!Array.isArray(notes)) return res.status(400).json({ error: 'missing notes' });
      const merged = merge(await load(), notes);
      const s = JSON.stringify(merged);
      if (s.length > 900_000) return res.status(413).json({ error: 'too big' });
      if (hasStore) await redis('SET', KEY, s); else mem.list = merged;
      return res.status(200).json({ sync: hasStore, notes: merged });
    }
    res.status(405).json({ error: 'method' });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
}
