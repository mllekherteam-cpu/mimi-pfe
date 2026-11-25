// "Mimi l'ghzala": how happy Mimi is with the work so far (0-100).
// POST {score, why?, anxiety?, improve?, stage}  -> saves it; low scores (and her answers) alert Omar on his phone (ntfy).
// GET -> { latest, list } newest first, for Omar.
import { checkAuth, hasStore, redis, readJson } from '../lib/store.js';

const KEY = 'mimi:mood';
const LOW = 40;
// Omar subscribes to this topic in the free ntfy app (ntfy.sh). Override with env NTFY_TOPIC.
const TOPIC = process.env.NTFY_TOPIC || 'mimi-pfe-omar-7f3k9q2xw8';
const mem = globalThis.__mimiMood || (globalThis.__mimiMood = []);
const cut = (s, n) => String(s || '').trim().slice(0, n);

async function alertOmar(item) {
  const low = item.score < LOW;
  let message = `Mimi : ${item.score}/100 sur le travail.`;
  if (item.why) message += `\n\nPourquoi : ${item.why}`;
  if (item.anxiety) message += `\n\nSon anxiété vient de : ${item.anxiety}`;
  if (item.improve) message += `\n\nÀ améliorer : ${item.improve}`;
  try {
    await fetch('https://ntfy.sh/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: TOPIC,
        title: item.stage === 'answers' ? 'Mimi a répondu 💌' : (low ? 'Mimi ne va pas bien 🥺' : 'Mimi est heureuse 🌸'),
        message,
        tags: [low ? 'warning' : 'tada'],
        priority: low ? 5 : 3,
      }),
    });
  } catch {}
}

export default async function handler(req, res) {
  if (!checkAuth(req, res)) return;
  try {
    if (req.method === 'POST') {
      const b = await readJson(req);
      const score = Math.max(0, Math.min(100, Math.round(Number(b.score) || 0)));
      const item = {
        at: new Date().toISOString(), score,
        stage: b.stage === 'answers' ? 'answers' : 'score',
        why: cut(b.why, 1500), anxiety: cut(b.anxiety, 1500), improve: cut(b.improve, 1500),
      };
      const s = JSON.stringify(item);
      if (hasStore) { await redis('LPUSH', KEY, s); await redis('LTRIM', KEY, 0, 499); } else mem.unshift(s);
      if ((item.score < LOW && !b.quiet) || item.stage === 'answers') await alertOmar(item);
      return res.status(200).json({ ok: true });
    }
    const list = (hasStore ? (await redis('LRANGE', KEY, 0, 199)) || [] : mem).map((s) => JSON.parse(s));
    res.status(200).json({ latest: list[0] || null, list });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
}
