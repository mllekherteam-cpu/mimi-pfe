// What Mimi answered to the flower cards.
// POST {quote, reply} -> saves it.  GET -> list (newest first), for Omar.
import { checkAuth, hasStore, redis, readJson } from '../lib/store.js';

const mem = globalThis.__mimiReacts || (globalThis.__mimiReacts = []);

export default async function handler(req, res) {
  if (!checkAuth(req, res)) return;
  if (req.method === 'POST') {
    const { quote, reply } = await readJson(req);
    const item = JSON.stringify({ at: new Date().toISOString(), quote: String(quote || '').slice(0, 200), reply: String(reply || '').slice(0, 200) });
    if (hasStore) await redis('LPUSH', 'mimi:reactions', item); else mem.unshift(item);
    return res.status(200).json({ ok: true });
  }
  const list = hasStore ? (await redis('LRANGE', 'mimi:reactions', 0, 199)) || [] : mem;
  res.status(200).json(list.map((s) => JSON.parse(s)));
}
