import { checkAuth, getSpent, getBudget, hasStore } from '../lib/store.js';

const DEFAULT_DOCS = [
  {
    title: 'Mémoire PFE (Google Doc)',
    url: 'https://docs.google.com/document/d/1lICUj22QaWa8SCEdLOWhNshVTFGw_fY8PGG3hGhRA2w/edit',
  },
  { title: 'Google Scholar', url: 'https://scholar.google.com/' },
  { title: 'ScienceDirect', url: 'https://www.sciencedirect.com/' },
  { title: 'PubMed', url: 'https://pubmed.ncbi.nlm.nih.gov/' },
  { title: 'IWA Publishing', url: 'https://iwaponline.com/' },
];

export default async function handler(req, res) {
  if (!checkAuth(req, res)) return;
  let docs = DEFAULT_DOCS;
  try { if (process.env.DOCS_JSON) docs = JSON.parse(process.env.DOCS_JSON); } catch {}
  const spent = await getSpent();
  res.status(200).json({ budget: await getBudget(), spent, docs, sync: hasStore, hasKey: Boolean(process.env.ANTHROPIC_API_KEY) });
}
