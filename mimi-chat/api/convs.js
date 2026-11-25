// Conversation history synced on the server (so it follows her on phone and laptop).
// GET            -> list [{id,title,updated,model}]
// GET ?id=..     -> one conversation
// PUT  {conv}    -> save
// DELETE ?id=..  -> delete
import { checkAuth, hasStore, redis, readJson } from '../lib/store.js';

const MAX = 900_000; // Upstash request limit is 1 MB

export default async function handler(req, res) {
  if (!checkAuth(req, res)) return;
  if (!hasStore) return res.status(200).json({ sync: false, list: [] });
  const id = req.query?.id || new URL(req.url, 'http://x').searchParams.get('id');
  try {
    if (req.method === 'GET' && !id) {
      const h = (await redis('HGETALL', 'mimi:index')) || [];
      const list = [];
      for (let i = 0; i < h.length; i += 2) list.push(JSON.parse(h[i + 1]));
      list.sort((a, b) => b.updated - a.updated);
      return res.status(200).json({ sync: true, list });
    }
    if (req.method === 'GET') {
      const s = await redis('GET', `mimi:conv:${id}`);
      return res.status(200).json(s ? JSON.parse(s) : null);
    }
    if (req.method === 'PUT') {
      const { conv } = await readJson(req);
      if (!conv?.id) return res.status(400).json({ error: 'missing conv' });
      let s = JSON.stringify(conv);
      if (s.length > MAX) {
        // too big (attached PDFs): keep the text, drop the file bytes on the server copy
        const light = structuredClone(conv);
        for (const m of light.messages || []) for (const a of m.files || []) delete a.data;
        s = JSON.stringify(light);
      }
      await redis('SET', `mimi:conv:${conv.id}`, s);
      await redis('HSET', 'mimi:index', conv.id, JSON.stringify({
        id: conv.id, title: conv.title, updated: conv.updated, model: conv.model, pinned: !!conv.pinned,
      }));
      return res.status(200).json({ ok: true });
    }
    if (req.method === 'DELETE' && id) {
      await redis('DEL', `mimi:conv:${id}`);
      await redis('HDEL', 'mimi:index', id);
      return res.status(200).json({ ok: true });
    }
    res.status(405).json({ error: 'method' });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
}
