// Conversation history synced on the server (shared across Mimi & Omar's devices).
// GET            -> list [{id,title,updated,model,pinned,msgCount,lastBy}]
// GET ?all=1     -> full export of all conversations (for backup)
// GET ?id=..     -> one conversation
// PUT  {conv}    -> save (strips heavy file bytes if > MAX; avoids stale overwrite)
// DELETE ?id=..  -> soft-delete (moves to mimi:trash:<id> so history is never lost)
import { checkAuth, hasStore, redis, readJson } from '../lib/store.js';

const MAX = 900_000; // Upstash request limit is 1 MB

export default async function handler(req, res) {
  if (!checkAuth(req, res)) return;
  if (!hasStore) return res.status(200).json({ sync: false, list: [] });
  const u = new URL(req.url, 'http://x');
  const id = req.query?.id || u.searchParams.get('id');
  const all = req.query?.all || u.searchParams.get('all');
  try {
    if (req.method === 'GET' && all === '1') {
      const h = (await redis('HGETALL', 'mimi:index')) || [];
      const ids = [];
      for (let i = 0; i < h.length; i += 2) ids.push(h[i]);
      const convs = [];
      for (const cid of ids) {
        const s = await redis('GET', `mimi:conv:${cid}`);
        if (s) { try { convs.push(JSON.parse(s)); } catch {} }
      }
      convs.sort((a, b) => (b.updated || 0) - (a.updated || 0));
      return res.status(200).json({ sync: true, exportedAt: Date.now(), count: convs.length, conversations: convs });
    }
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
      const { conv, force } = await readJson(req);
      if (!conv?.id) return res.status(400).json({ error: 'missing conv' });
      if (!force) {
        const existingRaw = await redis('GET', `mimi:conv:${conv.id}`);
        if (existingRaw) {
          try {
            const existing = JSON.parse(existingRaw);
            const curCount = (existing.messages || []).length;
            const newCount = (conv.messages || []).length;
            if ((existing.updated || 0) > (conv.updated || 0) && curCount >= newCount) {
              return res.status(200).json({ ok: true, skipped: 'stale' });
            }
          } catch {}
        }
      }
      let s = JSON.stringify(conv);
      if (s.length > MAX) {
        // too big (attached PDFs): keep the text, drop the file bytes on the server copy
        const light = structuredClone(conv);
        for (const m of light.messages || []) for (const a of m.files || []) delete a.data;
        s = JSON.stringify(light);
      }
      const msgs = conv.messages || [];
      const lastUser = [...msgs].reverse().find((m) => m.role === 'user');
      await redis('SET', `mimi:conv:${conv.id}`, s);
      await redis('HSET', 'mimi:index', conv.id, JSON.stringify({
        id: conv.id,
        title: conv.title,
        updated: conv.updated,
        model: conv.model,
        pinned: !!conv.pinned,
        msgCount: msgs.length,
        lastBy: lastUser?.sender || null,
      }));
      return res.status(200).json({ ok: true });
    }
    if (req.method === 'DELETE' && id) {
      // Soft-delete: archive to mimi:trash:<id> so history is never permanently lost
      const prev = await redis('GET', `mimi:conv:${id}`);
      if (prev) {
        await redis('SET', `mimi:trash:${id}`, prev);
      }
      await redis('DEL', `mimi:conv:${id}`);
      await redis('HDEL', 'mimi:index', id);
      return res.status(200).json({ ok: true });
    }
    res.status(405).json({ error: 'method' });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
}
