// What Mimi did on the flower cards (open, reply button, cross ✕, or backdrop click).
// POST {action, quote, reply, who?, role?} -> saves it.  GET -> list (newest first), for Omar.
import { checkAuth, hasStore, redis, readJson } from '../lib/store.js';

const KEY = 'mimi:reactions';
const ACTIONS = new Set(['open', 'reply', 'cross', 'backdrop']);
const mem = globalThis.__mimiReacts || (globalThis.__mimiReacts = []);
const cut = (s, n) => String(s || '').slice(0, n);

export default async function handler(req, res) {
  if (!checkAuth(req, res)) return;
  if (req.method === 'POST') {
    const b = await readJson(req);
    const action = ACTIONS.has(b.action) ? b.action : 'reply';
    const item = JSON.stringify({
      at: new Date().toISOString(),
      action,
      quote: cut(b.quote, 200),
      reply: cut(b.reply, 200),
      who: cut(b.who, 40),
      role: cut(b.role, 20),
    });
    if (hasStore) { await redis('LPUSH', KEY, item); await redis('LTRIM', KEY, 0, 499); }
    else { mem.unshift(item); if (mem.length > 500) mem.length = 500; }
    return res.status(200).json({ ok: true });
  }
  const list = hasStore ? (await redis('LRANGE', KEY, 0, 199)) || [] : mem;
  res.status(200).json(list.map((s) => JSON.parse(s)));
}
