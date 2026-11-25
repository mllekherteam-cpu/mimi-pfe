// Local test server that mimics Vercel (static public/ + api/*.js handlers).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const PORT = process.env.PORT || 3456;
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };

http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://x');
  res.status = (c) => { res.statusCode = c; return res; };
  res.json = (o) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(o)); };
  req.query = Object.fromEntries(u.searchParams);
  try {
    if (u.pathname.startsWith('/api/')) {
      const name = u.pathname.slice(5).replace(/[^\w-]/g, '');
      const mod = await import('./api/' + name + '.js');
      return await mod.default(req, res);
    }
    const f = path.join('public', u.pathname === '/' ? 'index.html' : u.pathname);
    if (!fs.existsSync(f)) { res.statusCode = 404; return res.end('404'); }
    res.setHeader('Content-Type', TYPES[path.extname(f)] || 'application/octet-stream');
    fs.createReadStream(f).pipe(res);
  } catch (e) {
    console.error(e); if (!res.headersSent) res.status(500).json({ error: String(e.message) }); else res.end();
  }
}).listen(PORT, () => console.log('http://localhost:' + PORT));
