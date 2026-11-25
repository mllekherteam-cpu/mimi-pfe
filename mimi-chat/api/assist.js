// One-shot helper used by the Google Docs sidebar (Apps Script) and the web editor.
// POST {mode, text, instruction, context, model, web} -> {result, notes}
import Anthropic from '@anthropic-ai/sdk';
import { checkAuth, getSpent, addSpent, BUDGET, readJson } from '../lib/store.js';
import { SYSTEM } from '../lib/system.js';

export const config = { maxDuration: 120 };

const MODELS = {
  haiku: { id: 'claude-haiku-5-5', in: 0.1, out: 0.5, search: 'web_search_20250305' },
  sonnet: { id: 'claude-sonnet-5-5', in: 2, out: 10, search: 'web_search_20260209' },
  opus: { id: 'claude-opus-5-5', in: 4, out: 20, search: 'web_search_20260209' },
};

const MODES = {
  improve: 'Améliore ce passage pour un mémoire de Master : style académique impersonnel, clair, fluide, sans changer le sens ni les chiffres.',
  shorten: 'Raccourcis ce passage d’environ un tiers en gardant toutes les idées importantes et les chiffres.',
  expand: 'Développe ce passage (environ deux fois plus long) avec des explications scientifiques justes, sans inventer de chiffres ni de références.',
  fix: 'Corrige uniquement l’orthographe, la grammaire, la ponctuation et les accords. Ne change pas le style ni le contenu.',
  rephrase: 'Reformule ce passage avec d’autres mots et une autre structure de phrases, même sens, style académique.',
  source: 'Ajoute à ce passage des citations dans le texte (Auteur, année) appuyées sur des articles réels 2021–2026 trouvés par la recherche web. Dans notes, donne les références complètes au format ISO 690 avec DOI ou lien.',
  check: 'Vérifie l’exactitude scientifique de ce passage. Corrige ce qui est faux ou imprécis. Dans notes, explique brièvement chaque correction.',
  en: 'Traduis ce passage en anglais académique.',
  ar: 'Traduis ce passage en arabe standard académique.',
  explain: 'N’écris pas de nouvelle version : explique simplement ce passage à Mimi pour qu’elle puisse le défendre à l’oral (dans notes). result doit être vide.',
};

export default async function handler(req, res) {
  if (!checkAuth(req, res)) return;
  if (req.method !== 'POST') return res.status(405).end();
  if (!process.env.ANTHROPIC_API_KEY) return res.status(500).json({ error: 'Clé manquante sur le serveur.' });
  if ((await getSpent()) >= BUDGET) return res.status(402).json({ error: 'L’assistante fait une petite pause. Préviens Omar 🤍' });

  const b = await readJson(req);
  const m = MODELS[b.model] || MODELS.sonnet;
  const task = [MODES[b.mode], b.instruction].filter(Boolean).join('\n\nConsigne de Mimi : ') || 'Améliore ce passage.';
  const web = b.web || b.mode === 'source' || b.mode === 'check';

  const prompt = `${task}

${b.context ? `<contexte_autour>\n${String(b.context).slice(0, 6000)}\n</contexte_autour>\n\n` : ''}<passage>
${String(b.text || '').slice(0, 30000)}
</passage>

Réponds UNIQUEMENT avec ce format :
<result>le nouveau texte, prêt à remplacer le passage, sans guillemets ni commentaire, même langue que demandé, en texte simple (pas de Markdown, pas de ** ni de #)</result>
<notes>une à trois lignes pour Mimi : ce qui a changé, ce qu'elle doit vérifier (optionnel)</notes>`;

  try {
    const client = new Anthropic();
    let messages = [{ role: 'user', content: prompt }];
    let final, total = 0;
    for (let i = 0; i < 4; i++) {
      final = await client.messages.create({
        model: m.id,
        max_tokens: 16000,
        system: SYSTEM,
        messages,
        output_config: { effort: 'low' },
        ...(web ? { tools: [{ type: m.search, name: 'web_search', max_uses: 4 }] } : {}),
      });
      const u = final.usage || {};
      total += ((u.input_tokens || 0) * m.in + (u.output_tokens || 0) * m.out) / 1e6 + (u.server_tool_use?.web_search_requests || 0) * 0.01;
      if (final.stop_reason !== 'pause_turn') break;
      messages = [...messages, { role: 'assistant', content: final.content }];
    }
    await addSpent(total);
    const text = final.content.filter((x) => x.type === 'text').map((x) => x.text).join('');
    const pick = (tag) => (text.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`)) || [])[1]?.trim() || '';
    let result = pick('result');
    if (!result && !/<result>/.test(text) && b.mode !== 'explain') result = text.trim();
    res.status(200).json({ result, notes: pick('notes') });
  } catch (e) {
    res.status(500).json({ error: e?.error?.error?.message || e.message });
  }
}
