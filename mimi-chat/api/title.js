// Short auto-title for a new conversation (Haiku, costs a fraction of a cent).
import Anthropic from '@anthropic-ai/sdk';
import { checkAuth, addSpent, readJson } from '../lib/store.js';

export default async function handler(req, res) {
  if (!checkAuth(req, res)) return;
  const { text } = await readJson(req);
  try {
    const client = new Anthropic();
    const msg = await client.messages.create({
      model: 'claude-haiku-5-5',
      max_tokens: 400,
      output_config: { effort: 'low' },
      messages: [{ role: 'user', content: `Donne un titre très court (3 à 6 mots, sans guillemets, dans la langue du message) pour une conversation qui commence par :\n\n${String(text).slice(0, 1500)}` }],
    });
    const u = msg.usage;
    await addSpent(((u.input_tokens || 0) * 0.1 + (u.output_tokens || 0) * 0.5) / 1e6);
    const title = msg.content.filter((b) => b.type === 'text').map((b) => b.text).join('').trim().replace(/^["«]|["»]$/g, '').slice(0, 80);
    res.status(200).json({ title: title || null });
  } catch (e) {
    res.status(200).json({ title: null, error: e.message });
  }
}
