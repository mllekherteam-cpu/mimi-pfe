// The shared project folder = a private GitHub repo that is also the Mimi folder on Omar's PC.
// GET  ?path=dir         -> {type:'dir', items:[{name,path,type,size}]}
// GET  ?path=file        -> {type:'file', name, path, size, encoding:'base64', content}
// PUT  {path, content (base64), message}  -> create or update (commit)
// Env: GITHUB_TOKEN (fine-grained, Contents read/write on that one repo), GITHUB_REPO ("owner/name"), GITHUB_BRANCH (default main)
import { checkAuth, readJson } from '../lib/store.js';

const REPO = process.env.GITHUB_REPO;
const TOKEN = process.env.GITHUB_TOKEN;
const BRANCH = process.env.GITHUB_BRANCH || 'main';
const HIDDEN = /^(mimi-chat|node_modules)(\/|$)|(^|\/)\./;

const gh = (p, opts = {}) => fetch(`https://api.github.com/repos/${REPO}/${p}`, {
  ...opts,
  headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'mimi-chat', ...(opts.headers || {}) },
});
const enc = (p) => p.split('/').map(encodeURIComponent).join('/');
const clean = (p) => String(p || '').replace(/\\/g, '/').replace(/^\/+|\/+$/g, '').replace(/\/{2,}/g, '/');

export default async function handler(req, res) {
  if (!checkAuth(req, res)) return;
  if (!REPO || !TOKEN) return res.status(200).json({ configured: false });
  try {
    if (req.method === 'GET') {
      const path = clean(req.query?.path);
      if (path.split('/').includes('..') || HIDDEN.test(path)) return res.status(400).json({ error: 'chemin refusé' });
      const r = await gh(`contents/${enc(path)}?ref=${BRANCH}`);
      if (!r.ok) return res.status(r.status).json({ error: `GitHub ${r.status}` });
      const j = await r.json();
      if (Array.isArray(j)) {
        const items = j.filter((x) => !HIDDEN.test(x.path)).map((x) => ({ name: x.name, path: x.path, type: x.type, size: x.size }))
          .sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name, 'fr') : a.type === 'dir' ? -1 : 1));
        return res.status(200).json({ configured: true, type: 'dir', path, items });
      }
      let content = j.content;
      if (!content || j.encoding !== 'base64') {
        // files over 1 MB: fetch raw bytes
        const raw = await gh(`contents/${enc(path)}?ref=${BRANCH}`, { headers: { Accept: 'application/vnd.github.raw' } });
        content = Buffer.from(await raw.arrayBuffer()).toString('base64');
      }
      return res.status(200).json({ configured: true, type: 'file', name: j.name, path: j.path, size: j.size, encoding: 'base64', content: content.replace(/\n/g, '') });
    }
    if (req.method === 'PUT') {
      const { path: p, content, message } = await readJson(req);
      const path = clean(p);
      if (!path || path.split('/').includes('..') || HIDDEN.test(path)) return res.status(400).json({ error: 'chemin refusé' });
      const cur = await gh(`contents/${enc(path)}?ref=${BRANCH}`);
      const sha = cur.ok ? (await cur.json()).sha : undefined;
      const r = await gh(`contents/${enc(path)}`, {
        method: 'PUT',
        body: JSON.stringify({ message: message || `Mimi : ${path}`, content, branch: BRANCH, ...(sha ? { sha } : {}) }),
      });
      const j = await r.json();
      if (!r.ok) return res.status(r.status).json({ error: j.message || `GitHub ${r.status}` });
      return res.status(200).json({ ok: true, path, updated: Boolean(sha) });
    }
    res.status(405).json({ error: 'method' });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
}
