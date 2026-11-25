// Shared project folder = private GitHub repo (also Omar's local Mimi folder).
const REPO = process.env.GITHUB_REPO;
const TOKEN = process.env.GITHUB_TOKEN;
const BRANCH = process.env.GITHUB_BRANCH || 'main';
export const HIDDEN = /^(mimi-chat|node_modules)(\/|$)|(^|\/)\./;
export const hasRepo = Boolean(REPO && TOKEN);

const enc = (p) => p.split('/').map(encodeURIComponent).join('/');
export const clean = (p) => String(p || '').replace(/\\/g, '/').replace(/^\/+|\/+$/g, '').replace(/\/{2,}/g, '/');
export const badPath = (p) => p.split('/').includes('..') || HIDDEN.test(p);

const gh = (p, opts = {}) => fetch(`https://api.github.com/repos/${REPO}/${p}`, {
  ...opts,
  headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'mimi-chat', ...(opts.headers || {}) },
});

export async function listDir(path) {
  const r = await gh(`contents/${enc(path)}?ref=${BRANCH}`);
  if (!r.ok) throw new Error(`GitHub ${r.status}`);
  const j = await r.json();
  if (!Array.isArray(j)) return null;
  return j.filter((x) => !HIDDEN.test(x.path)).map((x) => ({ name: x.name, path: x.path, type: x.type, size: x.size }))
    .sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name, 'fr') : a.type === 'dir' ? -1 : 1));
}

export async function listAll() {
  const r = await gh(`git/trees/${BRANCH}?recursive=1`);
  if (!r.ok) throw new Error(`GitHub ${r.status}`);
  const j = await r.json();
  return j.tree.filter((x) => x.type === 'blob' && !HIDDEN.test(x.path)).map((x) => ({ path: x.path, size: x.size }));
}

export async function readFile(path) {
  const r = await gh(`contents/${enc(path)}?ref=${BRANCH}`);
  if (!r.ok) throw new Error(r.status === 404 ? 'fichier introuvable' : `GitHub ${r.status}`);
  const j = await r.json();
  if (Array.isArray(j)) return { dir: true };
  let content = j.content;
  if (!content || j.encoding !== 'base64') {
    const raw = await gh(`contents/${enc(path)}?ref=${BRANCH}`, { headers: { Accept: 'application/vnd.github.raw' } });
    content = Buffer.from(await raw.arrayBuffer()).toString('base64');
  }
  return { name: j.name, path: j.path, size: j.size, content: content.replace(/\n/g, '') };
}

export async function writeFile(path, base64, message) {
  const cur = await gh(`contents/${enc(path)}?ref=${BRANCH}`);
  const sha = cur.ok ? (await cur.json()).sha : undefined;
  const r = await gh(`contents/${enc(path)}`, {
    method: 'PUT',
    body: JSON.stringify({ message: message || `Mimi : ${path}`, content: base64, branch: BRANCH, ...(sha ? { sha } : {}) }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j.message || `GitHub ${r.status}`);
  return { updated: Boolean(sha) };
}


/** Recent changes in the shared folder: who did what (Omar's PC sync, Mimi on the site, her assistant). */
export async function recentChanges(limit = 15) {
  const r = await gh(`commits?sha=${BRANCH}&per_page=${Math.min(limit, 30)}`);
  if (!r.ok) throw new Error(`GitHub ${r.status}`);
  const list = await r.json();
  const out = [];
  for (const c of list.slice(0, limit)) {
    const msg = c.commit.message.split('\n')[0];
    const who = /^Assistante :/.test(msg) ? 'son assistante (IA)' : /^Mimi :/.test(msg) ? 'Mimi (sur le site)' : 'Omar (depuis son ordinateur)';
    let files = [];
    try {
      const d = await (await gh(`commits/${c.sha}`)).json();
      files = (d.files || []).filter((f) => !HIDDEN.test(f.filename))
        .map((f) => `${f.status === 'added' ? '+' : f.status === 'removed' ? '-' : '~'} ${f.filename}`).slice(0, 25);
    } catch {}
    out.push({ date: c.commit.author.date, who, message: msg, files });
  }
  return out;
}
