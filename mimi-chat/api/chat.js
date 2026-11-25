import Anthropic from '@anthropic-ai/sdk';
import { checkAuth, getSpent, addSpent, BUDGET, readJson } from '../lib/store.js';
import { SYSTEM } from '../lib/system.js';

export const config = { maxDuration: 300 };

const MODELS = {
  haiku: { id: 'claude-haiku-5-5', in: 0.10, out: 0.50, search: 'web_search_20250305' },
  sonnet: { id: 'claude-sonnet-5-5', in: 2, out: 10, search: 'web_search_20260209', fallback: true },
  opus: { id: 'claude-opus-5-5', in: 4, out: 20, search: 'web_search_20260209', fallback: true },
};
const EFFORTS = ['low', 'medium', 'high'];

function priceFor(modelId) {
  if (/haiku/.test(modelId)) return MODELS.haiku;
  if (/sonnet/.test(modelId)) return MODELS.sonnet;
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
      if (f.type?.startsWith('image/')) {
        content.push({ type: 'image', source: { type: 'base64', media_type: f.type, data: f.data } });
      } else if (f.type === 'application/pdf') {
        content.push({ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: f.data }, title: f.name });
      } else {
        const txt = Buffer.from(f.data, 'base64').toString('utf8');
        content.push({ type: 'text', text: `<fichier nom="${f.name}">\n${txt}\n</fichier>` });
      }
    }
    content.push({ type: 'text', text: m.text || '(voir fichier)' });
    return { role: 'user', content };
  });
}

export default async function handler(req, res) {
  if (!checkAuth(req, res)) return;
  if (req.method !== 'POST') return res.status(405).end();
  if (!process.env.ANTHROPIC_API_KEY) return res.status(500).json({ error: 'ANTHROPIC_API_KEY manquante sur le serveur.' });

  const body = await readJson(req);
  const m = MODELS[body.model] || MODELS.sonnet;
  const effort = EFFORTS.includes(body.effort) ? body.effort : 'low';

  const spent = await getSpent();
  if (spent >= BUDGET) return res.status(402).json({ error: 'L’assistante fait une petite pause. Préviens Omar 🤍' });

  res.writeHead(200, { 'Content-Type': 'application/x-ndjson; charset=utf-8', 'Cache-Control': 'no-cache, no-transform', 'X-Accel-Buffering': 'no' });
  const send = (o) => res.write(JSON.stringify(o) + '\n');

  const client = new Anthropic();
  const system = SYSTEM + (body.projectNotes ? `\n\n<notes_de_mimi>\n${body.projectNotes}\n</notes_de_mimi>` : '');
  let messages = toApiMessages(body.messages || []);
  const tools = body.web ? [{ type: m.search, name: 'web_search', max_uses: 5 }] : undefined;

  let total = 0;
  const sources = new Map();
  const cited = new Map();
  try {
    for (let round = 0; round < 4; round++) {
      const params = {
        model: m.id,
        max_tokens: 16000,
        system,
        messages,
        output_config: { effort },
        cache_control: { type: 'ephemeral' },
        ...(tools ? { tools } : {}),
      };
      let stream;
      if (m.fallback) {
        stream = client.beta.messages.stream({ ...params, betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' });
      } else {
        stream = client.messages.stream(params);
      }
      let thinkingShown = false;
      for await (const ev of stream) {
        if (ev.type === 'content_block_start') {
          const b = ev.content_block;
          if (b.type === 'thinking' && !thinkingShown) { send({ t: 'status', v: 'thinking' }); thinkingShown = true; }
          if (b.type === 'server_tool_use') send({ t: 'status', v: 'searching' });
          if (b.type === 'web_search_tool_result' && Array.isArray(b.content)) {
            for (const r of b.content) if (r.url) sources.set(r.url, r.title || r.url);
          }
          if (b.type === 'text') send({ t: 'status', v: 'writing' });
        } else if (ev.type === 'content_block_delta' && ev.delta.type === 'text_delta') {
          send({ t: 'text', v: ev.delta.text });
        } else if (ev.type === 'content_block_delta' && ev.delta.type === 'citations_delta') {
          const c = ev.delta.citation;
          if (c?.url) cited.set(c.url, c.title || c.url);
        }
      }
      const final = await stream.finalMessage();
      const usd = costOf(final);
      total += usd;
      if (final.stop_reason === 'refusal') send({ t: 'text', v: '\n\n_(Le modèle a refusé de répondre à cette demande.)_' });
      if (final.stop_reason === 'max_tokens') send({ t: 'text', v: '\n\n_(Réponse coupée : trop longue. Écris « continue ».)_' });
      if (final.stop_reason === 'pause_turn') {
        messages = [...messages, { role: 'assistant', content: final.content }];
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
