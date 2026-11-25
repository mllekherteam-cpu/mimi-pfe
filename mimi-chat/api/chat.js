import Anthropic from '@anthropic-ai/sdk';
import { checkAuth, getSpent, addSpent, getBudget, readJson } from '../lib/store.js';
import { SYSTEM, TOOLS_NOTE } from '../lib/system.js';
import { hasRepo, clean, badPath, listAll, readFile, writeFile, recentChanges } from '../lib/github.js';

export const config = { maxDuration: 300, api: { bodyParser: { sizeLimit: '4.5mb' } } };

const MODELS = {
  haiku: { id: 'claude-haiku-5-5', in: 0.10, out: 0.50, search: 'web_search_20250305' },
  sonnet: { id: 'claude-sonnet-5-5', in: 2, out: 10, search: 'web_search_20260209', fallback: true },
  opus: { id: 'claude-opus-5-5', in: 4, out: 20, search: 'web_search_20260209', fallback: true },
  fable: { id: 'claude-fable-5-2', in: 8, out: 40, search: 'web_search_20260209', fallback: true },
};
const EFFORTS = ['low', 'medium', 'high'];
const WORK_DIR = 'Travail_Mimi/';
const TEXT_EXT = /\.(md|txt|csv|json|py|tex|bib|html|xml|yml|yaml)$/i;

const PROJECT_TOOLS = [
  {
    name: 'project_history',
    description: "Historique récent du dossier projet partagé : qui a modifié quoi et quand (Omar depuis son ordinateur, Mimi sur le site, ou son assistante IA), avec la liste des fichiers ajoutés (+), modifiés (~) ou supprimés (-). À utiliser quand Mimi demande ce qui a changé, ce qu'Omar a fait, ce qu'elle a fait, ou ce que l'assistante a produit.",
    input_schema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'list_project_files',
    description: "Liste tous les fichiers du dossier projet partagé de Mimi (mémoire, brouillons, sources, notes, transcriptions). À utiliser avant de lire un fichier quand on ne connaît pas son chemin exact.",
    input_schema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'read_project_file',
    description: "Lit un fichier du dossier projet (texte, Markdown, CSV, PDF ou image) à partir de son chemin exact donné par list_project_files.",
    input_schema: { type: 'object', properties: { path: { type: 'string', description: 'Chemin exact du fichier' } }, required: ['path'], additionalProperties: false },
    strict: true,
  },
  {
    name: 'save_project_file',
    description: "Enregistre un texte (Markdown) dans le dossier projet, toujours dans le sous-dossier Travail_Mimi/. Ne modifie jamais les fichiers originaux de Mimi. À utiliser seulement quand Mimi demande d'enregistrer ou de sauvegarder.",
    input_schema: {
      type: 'object',
      properties: {
        filename: { type: 'string', description: 'Nom du fichier, par ex. "Introduction v2.md"' },
        content: { type: 'string', description: 'Contenu complet en Markdown' },
      },
      required: ['filename', 'content'],
      additionalProperties: false,
    },
    strict: true,
  },
];

function priceFor(modelId) {
  if (/haiku/.test(modelId)) return MODELS.haiku;
  if (/sonnet/.test(modelId)) return MODELS.sonnet;
  if (/fable|mythos/.test(modelId)) return MODELS.fable;
  return MODELS.opus;
}
function costOf(msg) {
  const p = priceFor(msg.model || '');
  const u = msg.usage || {};
  const inTok = (u.input_tokens || 0) + 1.25 * (u.cache_creation_input_tokens || 0) + 0.1 * (u.cache_read_input_tokens || 0);
  const searches = u.server_tool_use?.web_search_requests || 0;
  return (inTok * p.in + (u.output_tokens || 0) * p.out) / 1e6 + searches * 0.01;
}

function toApiMessages(messages) {
  return messages.map((m) => {
    if (m.role === 'assistant') return { role: 'assistant', content: m.text || '…' };
    const content = [];
    for (const f of m.files || []) {
      if (!f.data) { content.push({ type: 'text', text: `[Fichier joint auparavant : ${f.name}]` }); continue; }
      if (f.type?.startsWith('image/')) content.push({ type: 'image', source: { type: 'base64', media_type: f.type, data: f.data } });
      else if (f.type === 'application/pdf') content.push({ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: f.data }, title: f.name });
      else content.push({ type: 'text', text: `<fichier nom="${f.name}">\n${Buffer.from(f.data, 'base64').toString('utf8')}\n</fichier>` });
    }
    content.push({ type: 'text', text: m.text || '(voir fichier)' });
    return { role: 'user', content };
  });
}

async function runTool(name, input, send) {
  try {
    if (name === 'project_history') {
      send({ t: 'status', v: 'listing' });
      const ch = await recentChanges(15);
      return ch.map((c) => c.date.slice(0, 16).replace('T', ' ') + ' · ' + c.who + ' · ' + c.message + '\n' + c.files.map((f) => '   ' + f).join('\n')).join('\n\n') || '(aucun changement)';
    }
    if (name === 'list_project_files') {
      send({ t: 'status', v: 'listing' });
      const all = await listAll();
      return all.slice(0, 400).map((f) => `${f.path}  (${Math.max(1, Math.round(f.size / 1000))} Ko)`).join('\n') || '(dossier vide)';
    }
    if (name === 'read_project_file') {
      const path = clean(input.path);
      if (badPath(path)) return 'Chemin refusé.';
      send({ t: 'status', v: 'reading', file: path.split('/').pop() });
      const f = await readFile(path);
      if (f.dir) return 'Ce chemin est un dossier. Utilise list_project_files.';
      if (/\.pdf$/i.test(path)) {
        if (f.size > 3e6) return 'PDF trop lourd pour être lu ici (plus de 3 Mo).';
        return [{ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: f.content }, title: f.name }];
      }
      if (/\.(png|jpe?g|gif|webp)$/i.test(path)) {
        const mt = 'image/' + path.split('.').pop().toLowerCase().replace('jpg', 'jpeg');
        return [{ type: 'image', source: { type: 'base64', media_type: mt, data: f.content } }];
      }
      if (!TEXT_EXT.test(path)) return `Format non lisible directement (${path.split('.').pop()}). Pour un .docx, lire plutôt la version .md correspondante si elle existe.`;
      const text = Buffer.from(f.content, 'base64').toString('utf8');
      return text.length > 200000 ? text.slice(0, 200000) + '\n\n[… fichier tronqué : trop long]' : text;
    }
    if (name === 'save_project_file') {
      let fn = clean(input.filename).replace(/^Travail_Mimi\//, '').replace(/[\\:*?"<>|]+/g, '');
      if (!fn) return 'Nom de fichier vide.';
      if (!/\.\w+$/.test(fn)) fn += '.md';
      const path = WORK_DIR + fn;
      if (badPath(path)) return 'Chemin refusé.';
      send({ t: 'status', v: 'saving', file: fn });
      const r = await writeFile(path, Buffer.from(String(input.content), 'utf8').toString('base64'), `Assistante : ${fn}`);
      send({ t: 'saved', path });
      return `Enregistré : ${path}${r.updated ? ' (mis à jour)' : ''}`;
    }
    return 'Outil inconnu.';
  } catch (e) {
    return { error: `Erreur : ${e.message}` };
  }
}

// The project's goal file, always in the assistant's head (cached 10 min per server instance).
let goalCache = { at: 0, text: '' };
async function projectGoal() {
  if (!hasRepo) return '';
  if (Date.now() - goalCache.at < 600000) return goalCache.text;
  try {
    const f = await readFile('00_GOAL_PFE.md');
    goalCache = { at: Date.now(), text: Buffer.from(f.content, 'base64').toString('utf8').slice(0, 40000) };
  } catch { goalCache = { at: Date.now(), text: '' }; }
  return goalCache.text;
}

export default async function handler(req, res) {
  if (!checkAuth(req, res)) return;
  if (req.method !== 'POST') return res.status(405).end();
  if (!process.env.ANTHROPIC_API_KEY) return res.status(500).json({ error: 'Le serveur n’a pas encore sa clé. Préviens Omar 🤍' });

  const body = await readJson(req);
  const m = MODELS[body.model] || MODELS.opus;
  const effort = EFFORTS.includes(body.effort) ? body.effort : 'low';

  const spent = await getSpent();
  const BUDGET = await getBudget();
  if (spent >= BUDGET) return res.status(402).json({ error: 'L’assistante fait une petite pause. Préviens Omar 🤍', code: 'empty' });

  res.writeHead(200, { 'Content-Type': 'application/x-ndjson; charset=utf-8', 'Cache-Control': 'no-cache, no-transform', 'X-Accel-Buffering': 'no' });
  const send = (o) => res.write(JSON.stringify(o) + '\n');

  const client = new Anthropic();
  const goal = await projectGoal();
  const system = SYSTEM + (hasRepo ? TOOLS_NOTE : '') + (goal ? `\n\n<fichier_objectifs_du_projet chemin="00_GOAL_PFE.md">\n${goal}\n</fichier_objectifs_du_projet>` : '') + (body.projectNotes ? `\n\n<notes_de_mimi>\n${body.projectNotes}\n</notes_de_mimi>` : '');
  let messages = toApiMessages(body.messages || []);
  // about one reply in ten ends with a soft, short sign-off
  if (Math.random() < 0.1 && messages.length) {
    messages.push({ role: 'system', content: 'Pour cette réponse seulement : termine, sur une dernière ligne à part, par une formule courte, douce et sobre adressée à Mimi, par exemple « Avec tout l’amour 🤍 », « Courage, tu y es presque 🤍 » ou « Fière de toi 🤍 ». Une seule, sans rien ajouter.' });
  }
  const tools = [
    ...(hasRepo ? PROJECT_TOOLS : []),
    ...(body.web !== false ? [{ type: m.search, name: 'web_search', max_uses: 5 }] : []),
    ...(body.web !== false && m.search === 'web_search_20260209' ? [{ type: 'web_fetch_20260209', name: 'web_fetch', max_uses: 5 }] : []),
  ];

  let total = 0;
  const sources = new Map();
  const cited = new Map();
  try {
    for (let round = 0; round < 10; round++) {
      const params = {
        model: m.id,
        max_tokens: m === MODELS.fable ? 64000 : 32000,
        system,
        messages,
        output_config: { effort },
        cache_control: { type: 'ephemeral' },
        ...(tools.length ? { tools } : {}),
      };
      const stream = m.fallback
        ? client.beta.messages.stream({ ...params, betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' })
        : client.messages.stream(params);
      let thinkingShown = false;
      for await (const ev of stream) {
        if (ev.type === 'content_block_start') {
          const b = ev.content_block;
          if (b.type === 'thinking' && !thinkingShown) { send({ t: 'status', v: 'thinking' }); thinkingShown = true; }
          if (b.type === 'server_tool_use') send({ t: 'status', v: 'searching' });
          if (b.type === 'web_search_tool_result' && Array.isArray(b.content)) for (const r of b.content) if (r.url) sources.set(r.url, r.title || r.url);
        } else if (ev.type === 'content_block_delta' && ev.delta.type === 'text_delta') {
          send({ t: 'text', v: ev.delta.text });
        } else if (ev.type === 'content_block_delta' && ev.delta.type === 'citations_delta') {
          const c = ev.delta.citation; if (c?.url) cited.set(c.url, c.title || c.url);
        }
      }
      const final = await stream.finalMessage();
      total += costOf(final);
      if (final.stop_reason === 'refusal') { send({ t: 'text', v: '\n\n_(Le modèle a refusé de répondre à cette demande.)_' }); break; }
      if (final.stop_reason === 'max_tokens') { send({ t: 'text', v: '\n\n_(Réponse coupée : trop longue. Écris « continue ».)_' }); break; }
      if (final.stop_reason === 'pause_turn') { messages = [...messages, { role: 'assistant', content: final.content }]; continue; }
      if (final.stop_reason === 'tool_use') {
        const uses = final.content.filter((b) => b.type === 'tool_use');
        const results = [];
        for (const u of uses) {
          const out = await runTool(u.name, u.input || {}, send);
          if (out && out.error) results.push({ type: 'tool_result', tool_use_id: u.id, content: out.error, is_error: true });
          else results.push({ type: 'tool_result', tool_use_id: u.id, content: out });
        }
        messages = [...messages, { role: 'assistant', content: final.content }, { role: 'user', content: results }];
        if (final.content.some((b) => b.type === 'text' && b.text.trim())) send({ t: 'text', v: '\n\n' });
        continue;
      }
      send({ t: 'model', v: final.model });
      break;
    }
    const list = cited.size ? cited : sources;
    if (list.size) send({ t: 'sources', v: [...list].slice(0, 8).map(([url, title]) => ({ url, title })) });
  } catch (e) {
    send({ t: 'error', v: e?.error?.error?.message || e.message || String(e) });
  }
  const nowSpent = total ? await addSpent(total) : await getSpent();
  send({ t: 'done', cost: total, spent: nowSpent, budget: BUDGET });
  res.end();
}
