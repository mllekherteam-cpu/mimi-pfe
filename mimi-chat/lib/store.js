// Tiny Upstash Redis (REST) client. Works with the Vercel "Upstash for Redis" integration
// (env KV_REST_API_URL / KV_REST_API_TOKEN) or a plain Upstash database
// (UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN).
const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

export const hasStore = Boolean(URL_ && TOKEN);

export async function redis(...cmd) {
  if (!hasStore) throw new Error('no store');
  const r = await fetch(URL_, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmd),
  });
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j.result;
}

// In-memory fallback (only lives as long as one server instance: fine for local tests).
const mem = globalThis.__mimiMem || (globalThis.__mimiMem = { spent: 0 });

export const BUDGET = Number(process.env.BUDGET_USD || 5);

export async function getSpent() {
  if (!hasStore) return mem.spent;
  return Number((await redis('GET', 'mimi:spent')) || 0);
}

export async function addSpent(usd) {
  if (!hasStore) { mem.spent += usd; return mem.spent; }
  return Number(await redis('INCRBYFLOAT', 'mimi:spent', usd.toFixed(6)));
}

export function checkAuth(req, res) {
  const code = process.env.ACCESS_CODE;
  if (!code) return true; // no code set: open (local dev)
  if ((req.headers['x-access-code'] || '') === code) return true;
  res.status(401).json({ error: 'Code d’accès incorrect.' });
  return false;
}

export async function readJson(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const s = Buffer.concat(chunks).toString('utf8');
  return s ? JSON.parse(s) : {};
}
