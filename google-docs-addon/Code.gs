/**
 * Mimi ✨ — assistant inside the Google Doc.
 * Select text → improve / shorten / fix / add sources… → Replace.
 * Highlight in colours → process all highlights.  Comments → process and resolve.
 */
const API = 'https://mimi-pfe.vercel.app/api/assist';
const CODE = '0000';
const SITE = 'https://mimi-pfe.vercel.app';

function onOpen() {
  DocumentApp.getUi().createMenu('✨ Mimi')
    .addItem('Ouvrir l’assistante', 'showSidebar')
    .addToUi();
}
function onInstall() { onOpen(); }

/** Run ONCE from the editor (Omar): the sidebar then opens by itself every time the doc is opened. */
function installAutoOpen() {
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === 'autoOpen') ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('autoOpen').forDocument(DocumentApp.getActiveDocument()).onOpen().create();
}
function autoOpen() { try { showSidebar(); } catch (e) {} }

function showSidebar() {
  const html = HtmlService.createHtmlOutputFromFile('Sidebar').setTitle('Mimi ✨');
  DocumentApp.getUi().showSidebar(html);
}

// ---------- AI call ----------
function callAssist(payload) {
  const r = UrlFetchApp.fetch(API, {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    headers: { 'x-access-code': CODE }, payload: JSON.stringify(payload),
  });
  const j = JSON.parse(r.getContentText() || '{}');
  if (r.getResponseCode() >= 300 || j.error) throw new Error(j.error || ('Erreur ' + r.getResponseCode()));
  return j;
}

// ---------- selection ----------
function rangeText_(range) {
  return range.getRangeElements().map(function (re) {
    const el = re.getElement();
    if (!el.editAsText) return '';
    const t = el.asText().getText();
    return re.isPartial() ? t.substring(re.getStartOffset(), re.getEndOffsetInclusive() + 1) : t;
  }).join('\n');
}

function contextAround_(range) {
  try {
    const el = range.getRangeElements()[0].getElement();
    let p = el.getType() === DocumentApp.ElementType.TEXT ? el.getParent() : el;
    const parts = [];
    let prev = p.getPreviousSibling(); if (prev && prev.asText) parts.push(prev.asText().getText());
    parts.push(p.asText ? p.asText().getText() : '');
    let next = p.getNextSibling(); if (next && next.asText) parts.push(next.asText().getText());
    return parts.join('\n');
  } catch (e) { return ''; }
}

/** Saves the current selection as a named range and returns its id + text. */
function grabSelection() {
  const doc = DocumentApp.getActiveDocument();
  const sel = doc.getSelection();
  if (!sel) return { error: 'Sélectionne d’abord un passage dans le document.' };
  const text = rangeText_(sel).trim();
  if (!text) return { error: 'La sélection est vide.' };
  const nr = doc.addNamedRange('mimi_sel', sel);
  return { id: nr.getId(), text: text, context: contextAround_(sel) };
}

/** Runs the AI on a saved selection. */
function processSelection(id, mode, instruction, model) {
  const doc = DocumentApp.getActiveDocument();
  const nr = doc.getNamedRangeById(id);
  if (!nr) throw new Error('La sélection a été perdue. Re-sélectionne le passage.');
  const range = nr.getRange();
  return callAssist({ mode: mode, instruction: instruction, model: model, text: rangeText_(range), context: contextAround_(range) });
}

/** Replaces the text of a saved range (keeps paragraph style), or inserts after it. */
function applyToRange(id, newText, how) {
  const doc = DocumentApp.getActiveDocument();
  const nr = doc.getNamedRangeById(id);
  if (!nr) throw new Error('Passage introuvable (il a peut-être été modifié).');
  const els = nr.getRange().getRangeElements();
  if (how === 'after') {
    const last = els[els.length - 1].getElement();
    let para = last.getType() === DocumentApp.ElementType.TEXT ? last.getParent() : last;
    const body = doc.getBody();
    const idx = body.getChildIndex(para);
    const lines = String(newText).split(/\n+/);
    for (let i = lines.length - 1; i >= 0; i--) body.insertParagraph(idx + 1, lines[i]);
    nr.remove();
    return 'ok';
  }
  const lines = String(newText).replace(/\n{2,}/g, '\n');
  let first = true;
  for (let i = 0; i < els.length; i++) {
    const re = els[i];
    const el = re.getElement();
    if (!el.editAsText) continue;
    const t = el.asText();
    if (first) {
      const start = re.isPartial() ? re.getStartOffset() : 0;
      const end = re.isPartial() ? re.getEndOffsetInclusive() : t.getText().length - 1;
      if (end >= start) t.deleteText(start, end);
      if (lines.length) {
        t.insertText(start, lines);
        t.setBackgroundColor(start, start + lines.length - 1, null);
      }
      first = false;
    } else if (re.isPartial()) {
      t.deleteText(re.getStartOffset(), re.getEndOffsetInclusive());
    } else {
      try { (el.getType() === DocumentApp.ElementType.TEXT ? el.getParent() : el).removeFromParent(); }
      catch (e) { t.setText(''); }
    }
  }
  nr.remove();
  return 'ok';
}

function forgetRange(id) {
  const nr = DocumentApp.getActiveDocument().getNamedRangeById(id);
  if (nr) nr.remove();
}

// ---------- highlights ----------
function colorKind_(hex) {
  if (!hex) return null;
  const n = parseInt(hex.replace('#', ''), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  if (max - min < 25) return null; // white/grey
  let h;
  if (max === r) h = ((g - b) / (max - min)) * 60; else if (max === g) h = (2 + (b - r) / (max - min)) * 60; else h = (4 + (r - g) / (max - min)) * 60;
  if (h < 0) h += 360;
  if (h >= 40 && h < 70) return 'yellow';
  if (h >= 70 && h < 170) return 'green';
  if (h >= 170 && h < 260) return 'blue';
  return 'red'; // red, pink, orange, purple
}
const KIND_MODE = { yellow: 'improve', red: 'check', green: 'expand', blue: 'source' };

function scanHighlights() {
  const doc = DocumentApp.getActiveDocument();
  doc.getNamedRanges('mimi_hl').forEach(function (r) { r.remove(); });
  const out = [];
  const body = doc.getBody();
  let found = body.findElement(DocumentApp.ElementType.TEXT);
  while (found) {
    const t = found.getElement().asText();
    const s = t.getText();
    const idx = t.getTextAttributeIndices();
    for (let i = 0; i < idx.length; i++) {
      const start = idx[i], end = (i + 1 < idx.length ? idx[i + 1] : s.length) - 1;
      if (end < start) continue;
      const kind = colorKind_(t.getBackgroundColor(start));
      if (!kind) continue;
      const prev = out[out.length - 1];
      if (prev && prev._el === t && prev.kind === kind && prev._end === start - 1) { prev._end = end; continue; }
      out.push({ kind: kind, _el: t, _start: start, _end: end });
    }
    found = body.findElement(DocumentApp.ElementType.TEXT, found);
  }
  return out.map(function (h) {
    const nr = doc.addNamedRange('mimi_hl', doc.newRange().addElement(h._el, h._start, h._end).build());
    return { id: nr.getId(), kind: h.kind, mode: KIND_MODE[h.kind], text: h._el.getText().substring(h._start, h._end + 1), context: h._el.getText() };
  }).filter(function (h) { return h.text.trim().length > 1; }).slice(0, 40);
}

function processRange(id, mode, instruction, model) {
  const doc = DocumentApp.getActiveDocument();
  const nr = doc.getNamedRangeById(id);
  if (!nr) throw new Error('Passage introuvable.');
  const range = nr.getRange();
  return callAssist({ mode: mode, instruction: instruction, model: model, text: rangeText_(range), context: contextAround_(range) });
}

function clearHighlight(id) {
  const nr = DocumentApp.getActiveDocument().getNamedRangeById(id);
  if (!nr) return;
  nr.getRange().getRangeElements().forEach(function (re) {
    const el = re.getElement(); if (!el.editAsText) return;
    if (re.isPartial()) el.asText().setBackgroundColor(re.getStartOffset(), re.getEndOffsetInclusive(), null); else el.asText().setBackgroundColor(null);
  });
  nr.remove();
}

// ---------- comments (needs the Drive API service: Services ＋ → Drive API) ----------
function listComments() {
  if (typeof Drive === 'undefined') return { error: 'Pour lire les commentaires, Omar doit activer le service « Drive API » dans Apps Script.' };
  const id = DocumentApp.getActiveDocument().getId();
  const res = Drive.Comments.list(id, { fields: 'comments(id,content,quotedFileContent,resolved,author(displayName))', pageSize: 100 });
  return (res.comments || []).filter(function (c) { return !c.resolved; }).map(function (c) {
    return { id: c.id, content: c.content, quote: (c.quotedFileContent && c.quotedFileContent.value) || '', author: c.author && c.author.displayName };
  });
}

function escRe_(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

/** Finds the commented passage in the doc and saves it as a range. */
function rangeForQuote(quote) {
  const doc = DocumentApp.getActiveDocument();
  const q = String(quote).split('\n')[0].slice(0, 200);
  if (!q.trim()) return null;
  const f = doc.getBody().findText(escRe_(q));
  if (!f) return null;
  const nr = doc.addNamedRange('mimi_cm', doc.newRange().addElement(f.getElement(), f.getStartOffset(), f.getEndOffsetInclusive()).build());
  return nr.getId();
}

function resolveComment(commentId, note) {
  if (typeof Drive === 'undefined') return;
  const id = DocumentApp.getActiveDocument().getId();
  Drive.Replies.create({ content: note || '✓ Fait avec Mimi ✨', action: 'resolve' }, id, commentId, { fields: 'id' });
}

function siteUrl() { return SITE; }
