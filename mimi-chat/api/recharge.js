// Mimi asked for more: add another BUDGET_USD to her allowance.
import { checkAuth, topUp } from '../lib/store.js';

export default async function handler(req, res) {
  if (!checkAuth(req, res)) return;
  if (req.method !== 'POST') return res.status(405).end();
  const budget = await topUp();
  res.status(200).json({ ok: true, budget });
}
