// Live online presence for Mimi, Omar, and any guest profiles.
// Tracks per-tab sessions so closing one tab doesn't mark a user offline if another tab is open,
// while closing their last tab marks them offline immediately.
// GET  -> { sync, users: [{ id, name, role, avatar, lastSeen, online }] }
// POST { id, name, role, avatar, tabId?, offline? } -> updates caller's presence and returns { sync, users }
import { checkAuth, hasStore, redis, readJson } from '../lib/store.js';

const KEY = 'mimi:presence';
const ONLINE_MS = 45_000;
const GUEST_TTL = 24 * 60 * 60 * 1000;
const AVATAR_RE = /^\/avatars\/[a-z0-9_-]+\.(jpg|jpeg|png|svg|webp)$/i;
const mem = globalThis.__mimiPresence || (globalThis.__mimiPresence = {});

const DEFAULTS = {
  mimi: { id: 'mimi', name: 'Mimi', role: 'mimi', avatar: '/avatars/mimi.jpg', lastSeen: 0, tabs: {} },
  omar: { id: 'omar', name: 'Omar', role: 'omar', avatar: '/avatars/omar.jpg', lastSeen: 0, tabs: {} },
};

async function loadAll() {
  if (!hasStore) return { ...mem };
  const h = (await redis('HGETALL', KEY)) || [];
  const out = {};
  for (let i = 0; i < h.length; i += 2) {
    try { out[h[i]] = JSON.parse(h[i + 1]); } catch {}
  }
  return out;
}

async function saveOne(id, rec) {
  if (!hasStore) { mem[id] = rec; return; }
  await redis('HSET', KEY, id, JSON.stringify(rec));
}

async function removeOne(id) {
  if (!hasStore) { delete mem[id]; return; }
  await redis('HDEL', KEY, id);
}

function pruneTabs(tabs, now) {
  const clean = {};
  if (tabs && typeof tabs === 'object') {
    for (const [k, ts] of Object.entries(tabs)) {
      if (typeof ts === 'number' && (now - ts) < ONLINE_MS) clean[k] = ts;
    }
  }
  return clean;
}

function formatUsers(map) {
  const now = Date.now();
  const merged = { ...DEFAULTS, ...map };
  const staleGuests = [];
  const users = [];
  for (const [id, raw] of Object.entries(merged)) {
    const u = { ...raw, id };
    const activeTabs = pruneTabs(u.tabs, now);
    // Support legacy records without tabs map too
    const online = Object.keys(activeTabs).length > 0 || (!u.tabs && !u.offline && (now - (u.lastSeen || 0)) < ONLINE_MS);
    if (u.role === 'guest' && !online && (now - (u.lastSeen || 0)) > GUEST_TTL) {
      staleGuests.push(id);
      continue;
    }
    users.push({
      id: u.id,
      name: u.name || id,
      role: u.role || 'guest',
      avatar: AVATAR_RE.test(u.avatar || '') ? u.avatar : '/avatars/guest-1.svg',
      lastSeen: u.lastSeen || 0,
      online,
    });
  }
  if (staleGuests.length) {
    Promise.all(staleGuests.map((id) => removeOne(id))).catch(() => {});
  }
  const order = { mimi: 0, omar: 1, guest: 2 };
  users.sort((a, b) => (order[a.role] ?? 9) - (order[b.role] ?? 9) || (b.online - a.online) || (b.lastSeen - a.lastSeen));
  return users;
}

export default async function handler(req, res) {
  if (!checkAuth(req, res)) return;
  try {
    if (req.method === 'GET') {
      const map = await loadAll();
      return res.status(200).json({ sync: hasStore, users: formatUsers(map) });
    }
    if (req.method === 'POST') {
      const body = await readJson(req);
      const role = ['mimi', 'omar', 'guest'].includes(body.role) ? body.role : 'guest';
      const id = role === 'mimi' ? 'mimi' : role === 'omar' ? 'omar' : String(body.id || '').replace(/[^a-z0-9:_-]/gi, '').slice(0, 40);
      if (!id) return res.status(400).json({ error: 'missing id' });
      const defaultAvatar = role === 'mimi' ? '/avatars/mimi.jpg' : role === 'omar' ? '/avatars/omar.jpg' : '/avatars/guest-1.svg';
      const avatar = AVATAR_RE.test(body.avatar || '') ? body.avatar : defaultAvatar;
      const name = role === 'mimi' ? 'Mimi' : role === 'omar' ? 'Omar' : (String(body.name || 'Invité').trim().slice(0, 28) || 'Invité');
      const tabId = String(body.tabId || 'default').replace(/[^a-z0-9_-]/gi, '').slice(0, 24) || 'default';

      const now = Date.now();
      const map = await loadAll();
      const prev = map[id] || DEFAULTS[id] || {};
      const tabs = pruneTabs(prev.tabs, now);

      if (body.offline) {
        delete tabs[tabId];
      } else {
        tabs[tabId] = now;
      }

      const rec = {
        id,
        name,
        role,
        avatar,
        lastSeen: now,
        tabs,
      };
      await saveOne(id, rec);
      map[id] = rec;
      return res.status(200).json({ sync: hasStore, users: formatUsers(map) });
    }
    res.status(405).json({ error: 'method' });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
}
