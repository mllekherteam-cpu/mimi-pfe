// GET  ?path=dir   -> {type:'dir', items}
// GET  ?path=file  -> {type:'file', name, path, size, content (base64)}
// PUT  {path, content (base64), message} -> create or update (commit)
import { checkAuth, readJson } from '../lib/store.js';
import { hasRepo, clean, badPath, listDir, readFile, writeFile } from '../lib/github.js';

export const config = { api: { bodyParser: { sizeLimit: '4.5mb' } } };

export default async function handler(req, res) {
  if (!checkAuth(req, res)) return;
  if (!hasRepo) return res.status(200).json({ configured: false });
  try {
    if (req.method === 'GET') {
      const path = clean(req.query?.path);
      if (badPath(path)) return res.status(400).json({ error: 'chemin refusé' });
      const items = await listDir(path);
      if (items) return res.status(200).json({ configured: true, type: 'dir', path, items });
      const f = await readFile(path);
      return res.status(200).json({ configured: true, type: 'file', ...f });
    }
    if (req.method === 'PUT') {
      const { path: p, content, message } = await readJson(req);
      const path = clean(p);
      if (!path || badPath(path)) return res.status(400).json({ error: 'chemin refusé' });
      // Never overwrite Omar's files: outside Travail_Mimi/ an existing name gets a '(Mimi date)' copy instead.
      let target = path;
      if (!path.startsWith('Travail_Mimi/')) {
        let exists = false;
        try { await readFile(path); exists = true; } catch {}
        if (exists) {
          const d = new Date().toISOString().slice(0, 10);
          const m = path.match(/^(.*?)(\.[^./]+)?$/);
          target = `${m[1]} (Mimi ${d})${m[2] || ''}`;
        }
      }
      const r = await writeFile(target, content, message);
      return res.status(200).json({ ok: true, path: target, copy: target !== path, ...r });
    }
    res.status(405).json({ error: 'method' });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
}
