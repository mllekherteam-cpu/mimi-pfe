// Serves the Google Docs add-on files (for installing them into Apps Script). Needs the access code.
import fs from 'node:fs';
import path from 'node:path';

const FILES = { code: 'Code.gs', sidebar: 'Sidebar.html' };

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'x-access-code');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if ((req.headers['x-access-code'] || '') !== process.env.ACCESS_CODE) return res.status(401).json({ error: 'code' });
  const f = FILES[req.query?.f];
  if (!f) return res.status(404).end();
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.status(200).send(fs.readFileSync(path.join(process.cwd(), 'lib', 'addon', f), 'utf8'));
}
