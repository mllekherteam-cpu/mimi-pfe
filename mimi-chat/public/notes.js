// ---------- Mimi's sticky notes ----------
// Notes she can put anywhere on the screen, hide, search, tie to one conversation, or keep on their own page.
// Saved in the browser right away and synced to the server a moment later (no AI, nothing spent).
(() => {
  const COLORS = ['#fff4b8', '#ffd9e2', '#dff3d8', '#dbeafe', '#eadcff', '#ffe2c6'];
  const S = (d) => `<svg class="i" viewBox="0 0 24 24">${d}</svg>`;
  const I = {
    note: '<svg class="icon" viewBox="0 0 24 24"><path d="M5 3h14a2 2 0 0 1 2 2v9l-7 7H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M14 21v-5a2 2 0 0 1 2-2h5"/></svg>',
    plus: S('<path d="M12 5v14M5 12h14"/>'),
    search: S('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
    grid: S('<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>'),
    hide: S('<path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.4 5.2A9.8 9.8 0 0 1 12 5c5 0 9 4.5 10 7-.4 1-1.2 2.3-2.4 3.5M6.3 6.3C4.3 7.6 2.8 9.6 2 12c1 2.5 5 7 10 7 1.7 0 3.2-.5 4.6-1.2"/>'),
    min: S('<path d="M6 12h12"/>'),
    expand: S('<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>'),
    x: S('<path d="M6 6l12 12M18 6 6 18"/>'),
    chat: S('<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>'),
    off: S('<path d="M12 3v9M6.3 6.3a8 8 0 1 0 11.4 0"/>'),
    copy: S('<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>'),
    note2: S('<path d="M5 3h14a2 2 0 0 1 2 2v9l-7 7H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M14 21v-5a2 2 0 0 1 2-2h5"/>'),
    back: S('<path d="M15 18l-6-6 6-6"/>'),
  };

  // ---------- data ----------
  let notes = LS.get('notes', []);
  let on = LS.get('notesOn', false);
  let q = '';                                   // on-screen search
  let zTop = Math.max(10, ...notes.map((n) => n.z || 0));
  const live = () => notes.filter((n) => !n.deleted);
  const byId = (id) => notes.find((n) => n.id === id);
  const clean = (h) => DOMPurify.sanitize(h || '', { ALLOWED_TAGS: ['b', 'i', 'u', 's', 'strong', 'em', 'br', 'div', 'p', 'ul', 'ol', 'li', 'span'], ALLOWED_ATTR: [] });
  const plain = (h) => new DOMParser().parseFromString(clean(h).replace(/<(br|\/div|\/p|\/li)[^>]*>/gi, '$&\n'), 'text/html').body.textContent || '';
  const col = (n) => (/^#[0-9a-f]{6}$/i.test(n.color || '') ? n.color : COLORS[0]);
  const matches = (n, s) => !s || plain(n.html).toLowerCase().includes(s);
  const firstLine = (n) => plain(n.html).trim().split('\n')[0].slice(0, 60) || 'Note';
  function when(t) {
    const d = new Date(t), now = new Date();
    const hm = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    if (d.toDateString() === now.toDateString()) return 'aujourd’hui ' + hm;
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  }

  let lsT = 0;
  function save(n) {
    if (n) n.updated = Date.now();
    clearTimeout(lsT); lsT = setTimeout(() => LS.set('notes', notes), 250);
    if (n) schedulePush();
  }

  // ---------- sync (one tiny request a few seconds after she stops typing) ----------
  const call = (opts) => fetch('/api/notes', { ...opts, headers: { 'Content-Type': 'application/json', 'x-access-code': settings.code || '' } });
  let pushT = 0, pushing = false, dirty = false, lastPull = 0;
  function schedulePush() { dirty = true; clearTimeout(pushT); pushT = setTimeout(push, 2000); }
  async function push(keepalive) {
    if (!dirty) return;
    if (pushing) { clearTimeout(pushT); pushT = setTimeout(push, 2000); return; }
    dirty = false; pushing = true;
    try {
      const r = await call({ method: 'PUT', body: JSON.stringify({ notes }), keepalive: !!keepalive });
      const j = await r.json(); if (r.ok && j.sync && j.notes) absorb(j.notes); else if (!r.ok && r.status !== 401) dirty = true;
    } catch { dirty = true; } finally { pushing = false; }
  }
  async function pull() {
    if (Date.now() - lastPull < 15000) return; lastPull = Date.now();
    try { const r = await call({}); if (!r.ok) return; const j = await r.json(); if (j.sync) absorb(j.notes || []); } catch {}
  }
  function absorb(remote) {
    let changed = false; const m = new Map(notes.map((n) => [n.id, n]));
    for (const n of remote) {
      const o = m.get(n.id);
      if (!o || (n.updated || 0) > (o.updated || 0)) { m.set(n.id, n); changed = true; }
    }
    if (remote.length < m.size && [...m.keys()].some((id) => !remote.find((r) => r.id === id))) dirty = true; // she has notes the server lacks
    if (changed) { notes = [...m.values()]; zTop = Math.max(zTop, ...notes.map((n) => n.z || 0)); LS.set('notes', notes); render(); if (pageOpen()) paintPage(); }
    if (dirty) schedulePush();
  }

  // ---------- layer + bar ----------
  const layer = document.createElement('div'); layer.id = 'notesLayer'; document.body.appendChild(layer);
  const bar = document.createElement('div'); bar.id = 'notesBar';
  bar.innerHTML = `<button class="add" data-b="add" title="Nouvelle note (Alt+N)">${I.plus}Note</button>
    <button data-b="search" title="Chercher">${I.search}</button><input placeholder="Chercher dans les notes…"><span class="cnt"></span>
    <button data-b="page" title="Mes notes">${I.grid}<span class="tot"></span></button>
    <button data-b="off" title="Ranger les notes">${I.off}</button>`;
  document.body.appendChild(bar);
  const btn = document.createElement('button'); btn.className = 'iconbtn'; btn.id = 'notesBtn'; btn.title = 'Notes (Alt+N)'; btn.innerHTML = I.note;
  $('#docsBtn').before(btn);

  function setOn(v) {
    on = v; LS.set('notesOn', on);
    document.body.classList.toggle('notes-on', on); btn.classList.toggle('on', on);
    if (!on) { q = ''; bar.classList.remove('searching'); bar.querySelector('input').value = ''; }
    render();
  }
  btn.onclick = () => {
    setOn(!on);
    if (on && !live().some((n) => n.shown)) addNote();
    else if (!on) toast('Notes rangées 📝');
  };

  const els = new Map();
  const place = (n, el) => {
    const W = innerWidth, H = innerHeight, w = Math.min(n.w || 240, W - 16);
    el.style.width = w + 'px'; el.style.height = (n.h || 190) + 'px';
    el.style.left = Math.max(0, Math.min((n.x ?? 0.5) * W, W - Math.min(w, 80))) + 'px';
    el.style.top = Math.max(0, Math.min((n.y ?? 0.3) * H, H - 40)) + 'px';
    el.style.zIndex = n.z || 1;
  };
  function make(n) {
    const el = document.createElement('div'); el.className = 'sn'; el.dataset.id = n.id;
    el.innerHTML = `<span class="tape"></span><div class="nh"><span class="ttl"></span><span class="acts">
      <button data-a="color" title="Couleur"><span class="cdot" style="width:13px;height:13px"></span></button>
      <button data-a="conv">${I.chat}</button>
      <button data-a="page" title="Ouvrir sur sa page">${I.expand}</button>
      <button data-a="min" title="Réduire">${I.min}</button>
      <button data-a="hide" title="Cacher (elle reste dans Mes notes)">${I.hide}</button>
      <button data-a="del" title="Supprimer">${I.x}</button></span></div>
      <div class="nb" contenteditable="true" spellcheck="true" lang="fr" data-ph="Écris ici…"></div>
      <div class="nf"><span class="dt"></span><span class="nr" title="Agrandir"></span></div>`;
    layer.appendChild(el); els.set(n.id, el); return el;
  }
  function render() {
    const cur = typeof conv !== 'undefined' && conv ? conv.id : null;
    let hits = 0;
    const seen = new Set();
    for (const n of live()) {
      const base = n.shown && (!n.conv || n.conv === cur);
      const hit = q && matches(n, q);
      const peek = hit && !base;
      if (!on || (!base && !peek)) continue;
      seen.add(n.id); if (hit) hits++;
      const el = els.get(n.id) || make(n);
      place(n, el);
      el.style.setProperty('--c', col(n));
      el.classList.toggle('collapsed', !!n.collapsed);
      el.classList.toggle('peek', !!peek);
      el.classList.toggle('hit', !!(q && hit && !peek));
      el.classList.toggle('dim', !!(q && !hit));
      el.querySelector('.ttl').textContent = n.collapsed ? firstLine(n) : '';
      el.querySelector('.nh .cdot').style.background = col(n);
      const cb = el.querySelector('[data-a="conv"]'); cb.classList.toggle('on', !!n.conv);
      cb.title = n.conv ? 'Attachée à une conversation (cliquer pour la voir partout)' : 'Montrer seulement dans cette conversation';
      el.querySelector('.dt').textContent = when(n.updated || n.created);
      const nb = el.querySelector('.nb'), h = clean(n.html);
      if (document.activeElement !== nb && nb._h !== h) { nb.innerHTML = h; nb._h = h; }
    }
    for (const [id, el] of els) if (!seen.has(id)) { el.remove(); els.delete(id); }
    const cnt = bar.querySelector('.cnt'); cnt.textContent = q ? (hits ? hits + ' trouvée' + (hits > 1 ? 's' : '') : 'rien') : '';
    const tot = live().length; bar.querySelector('.tot').textContent = tot || '';
  }

  function addNote(extra = {}) {
    const W = innerWidth, H = innerHeight, w = Math.min(240, W - 40);
    const k = live().filter((n) => n.shown).length % 6;
    const ci = LS.get('notesColor', 0); LS.set('notesColor', (ci + 1) % COLORS.length);
    const n = {
      id: uid(), html: '', color: COLORS[ci % COLORS.length],
      x: Math.max(8, W * 0.55 - w / 2 + k * 28 - 40) / W, y: (H * 0.22 + k * 26) / H, w, h: 180,
      z: ++zTop, shown: true, collapsed: false, conv: null, created: Date.now(), updated: Date.now(), ...extra,
    };
    notes.push(n); save(n); render();
    setTimeout(() => els.get(n.id)?.querySelector('.nb').focus(), 30);
    return n;
  }

  // drag, resize, bring to front
  layer.addEventListener('pointerdown', (e) => {
    const el = e.target.closest('.sn'); if (!el) return;
    const n = byId(el.dataset.id); if (!n) return;
    if (n.z !== zTop) { n.z = ++zTop; el.style.zIndex = n.z; save(); }
    const rz = e.target.closest('.nr'), hd = e.target.closest('.nh');
    if (!rz && (!hd || e.target.closest('button'))) return;
    e.preventDefault(); el.setPointerCapture(e.pointerId);
    const r = el.getBoundingClientRect(), sx = e.clientX, sy = e.clientY; let moved = false;
    if (!rz) el.classList.add('drag');
    const move = (ev) => {
      const dx = ev.clientX - sx, dy = ev.clientY - sy; if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
      if (rz) { el.style.width = Math.max(150, r.width + dx) + 'px'; el.style.height = Math.max(90, r.height + dy) + 'px'; }
      else { el.style.left = Math.max(-r.width + 60, Math.min(innerWidth - 60, r.left + dx)) + 'px'; el.style.top = Math.max(0, Math.min(innerHeight - 30, r.top + dy)) + 'px'; }
    };
    const up = () => {
      el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up);
      el.classList.remove('drag'); if (!moved) return;
      if (rz) { n.w = parseFloat(el.style.width); n.h = parseFloat(el.style.height); }
      else { n.x = parseFloat(el.style.left) / innerWidth; n.y = parseFloat(el.style.top) / innerHeight; }
      save(n);
    };
    el.addEventListener('pointermove', move); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  });
  layer.addEventListener('dblclick', (e) => {
    const hd = e.target.closest('.nh'); if (!hd || e.target.closest('button')) return;
    const n = byId(hd.closest('.sn').dataset.id); n.collapsed = !n.collapsed; save(n); render();
  });
  layer.addEventListener('click', (e) => {
    const el = e.target.closest('.sn'); if (!el) return; const n = byId(el.dataset.id);
    const dot = e.target.closest('.cdots .cdot');
    if (dot) { n.color = dot.dataset.c; save(n); el.querySelector('.cdots').remove(); render(); return; }
    const b = e.target.closest('[data-a]'); if (!b) return;
    const a = b.dataset.a;
    if (a === 'color') {
      const old = el.querySelector('.cdots'); if (old) return old.remove();
      const p = document.createElement('div'); p.className = 'cdots';
      p.innerHTML = COLORS.map((c) => `<span class="cdot ${c === col(n) ? 'on' : ''}" data-c="${c}" style="background:${c}"></span>`).join('');
      el.appendChild(p);
    }
    if (a === 'conv') {
      if (n.conv) { n.conv = null; toast('Visible partout'); }
      else if (typeof conv !== 'undefined' && conv) { n.conv = conv.id; toast('Seulement dans cette conversation 💬'); }
      else { toast('Ouvre une conversation d’abord'); return; }
      save(n); render();
    }
    if (a === 'page') openPage(n.id);
    if (a === 'min') { n.collapsed = !n.collapsed; save(n); render(); }
    if (a === 'hide') {
      n.shown = false; save(n); bye(el);
      undoBar('Note cachée, elle t’attend dans Mes notes', () => { n.shown = true; save(n); render(); });
    }
    if (a === 'del') remove(n, el);
  });
  function bye(el) { el.classList.add('bye'); setTimeout(render, 240); }
  function remove(n, el) {
    const empty = !plain(n.html).trim();
    n.deleted = true; save(n); if (el) bye(el); else render();
    if (pageOpen()) paintPage();
    if (!empty) undoBar('Note supprimée', () => { n.deleted = false; save(n); render(); if (pageOpen()) paintPage(); });
  }
  function undoBar(text, fn) {
    $('#notesUndo')?.remove();
    const u = document.createElement('div'); u.id = 'notesUndo'; u.innerHTML = `<span>${esc(text)}</span><button>Annuler</button>`;
    document.body.appendChild(u);
    u.querySelector('button').onclick = () => { fn(); u.remove(); };
    setTimeout(() => u.remove(), 5000);
  }

  // typing
  const onType = (nb, n) => { n.html = nb.innerHTML; nb._h = clean(n.html); save(n); };
  layer.addEventListener('input', (e) => {
    const nb = e.target.closest('.nb'); if (!nb) return; const n = byId(nb.closest('.sn').dataset.id); onType(nb, n);
    nb.closest('.sn').querySelector('.dt').textContent = when(n.updated);
  });
  const pastePlain = (e) => {
    if (!e.target.closest('.nb')) return; e.preventDefault();
    document.execCommand('insertText', false, e.clipboardData.getData('text/plain'));
  };
  layer.addEventListener('paste', pastePlain);
  layer.addEventListener('keydown', (e) => { if (e.key === 'Escape' && e.target.closest('.nb')) e.target.blur(); });
  layer.addEventListener('focusout', (e) => { if (e.target.closest('.nb')) setTimeout(render, 0); });

  // bar
  const qi = bar.querySelector('input');
  bar.addEventListener('click', (e) => {
    const b = e.target.closest('[data-b]'); if (!b) return;
    if (b.dataset.b === 'add') addNote();
    if (b.dataset.b === 'search') {
      const open = !bar.classList.contains('searching'); bar.classList.toggle('searching', open);
      if (open) qi.focus(); else { qi.value = ''; q = ''; render(); }
    }
    if (b.dataset.b === 'page') openPage();
    if (b.dataset.b === 'off') { setOn(false); toast('Notes rangées 📝'); }
  });
  qi.addEventListener('input', () => { q = qi.value.trim().toLowerCase(); render(); });
  qi.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { qi.value = ''; q = ''; bar.classList.remove('searching'); render(); }
    if (e.key === 'Enter') openPage(null, qi.value.trim());
  });

  // ---------- "Mes notes" page ----------
  const page = document.createElement('div'); page.id = 'notesPage';
  page.innerHTML = `<div class="np"><div class="np-bar">
      <button class="ib" data-p="back" title="Retour">${I.back}</button><h2>Mes notes</h2>
      <label class="search">${I.search}<input id="npQ" placeholder="Chercher…"></label>
      <div class="chips"><button class="chip" data-f="all">Toutes</button><button class="chip" data-f="screen">Sur l’écran</button><button class="chip" data-f="hidden">Cachées</button>
      ${COLORS.map((c) => `<span class="cdot" data-fc="${c}" style="background:${c};cursor:var(--cursor-hand)"></span>`).join('')}</div>
      <span class="spacer"></span><button class="solid" data-p="new">+ Nouvelle note</button></div>
    <div class="np-grid"></div><div class="np-ed" hidden></div></div>`;
  document.body.appendChild(page);
  const grid = page.querySelector('.np-grid'), ed = page.querySelector('.np-ed'), pq = page.querySelector('#npQ');
  let filter = 'all', fcolor = null, editing = null;
  const pageOpen = () => page.classList.contains('open');

  function openPage(id, query) {
    page.classList.add('open');
    if (query != null) pq.value = query;
    if (id) openEditor(id); else { closeEditor(); setTimeout(() => innerWidth > 700 && pq.focus(), 50); }
  }
  function closePage() { page.classList.remove('open'); editing = null; ed.hidden = true; render(); }
  function markIn(root, s) {
    if (!s) return;
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); const hits = [];
    while (w.nextNode()) { const i = w.currentNode.data.toLowerCase().indexOf(s); if (i >= 0) hits.push([w.currentNode, i]); }
    for (const [t, i] of hits) { const r = document.createRange(); r.setStart(t, i); r.setEnd(t, i + s.length); const m = document.createElement('mark'); r.surroundContents(m); }
  }
  function paintPage() {
    page.querySelectorAll('[data-f]').forEach((c) => c.classList.toggle('on', c.dataset.f === filter));
    page.querySelectorAll('[data-fc]').forEach((c) => c.classList.toggle('on', c.dataset.fc === fcolor));
    if (editing) return;
    const s = pq.value.trim().toLowerCase();
    const list = live().filter((n) => (filter === 'all' || (filter === 'screen' ? n.shown : !n.shown)) && (!fcolor || n.color === fcolor) && matches(n, s))
      .sort((a, b) => (b.updated || 0) - (a.updated || 0));
    if (!list.length) {
      grid.innerHTML = `<div class="np-empty"><div class="big">📝</div>${live().length ? 'Aucune note ne correspond.' : 'Pas encore de notes. Écris la première !'}</div>`;
      return;
    }
    grid.innerHTML = list.map((n) => `<div class="np-card" data-n="${n.id}" style="--c:${col(n)}"><div class="tx">${clean(n.html)}</div>
      <div class="mt"><span>${when(n.updated || n.created)}</span>${n.shown ? '<span class="b">sur l’écran</span>' : '<span class="b">cachée</span>'}${n.conv ? '<span class="b">💬</span>' : ''}</div></div>`).join('');
    if (s) grid.querySelectorAll('.tx').forEach((t) => markIn(t, s));
  }
  function openEditor(id) {
    const n = byId(id); if (!n) return; editing = n;
    grid.hidden = true; ed.hidden = false;
    ed.innerHTML = `<div class="sheet" style="--c:${col(n)}"><div class="tools">
      ${COLORS.map((c) => `<span class="cdot ${c === col(n) ? 'on' : ''}" data-ec="${c}" style="background:${c};cursor:var(--cursor-hand)"></span>`).join('')}
      <button class="tg ${n.shown ? 'on' : ''}" data-e="shown">📌 Sur l’écran</button>
      ${n.conv ? '<button class="tg on" data-e="conv">💬 Une seule conversation</button>' : ''}
      <button class="tg danger" data-e="del">Supprimer</button><span class="when">${when(n.updated || n.created)}</span></div>
      <div class="nb" contenteditable="true" spellcheck="true" lang="fr" data-ph="Écris ta note…">${clean(n.html)}</div></div>`;
    const nb = ed.querySelector('.nb');
    nb.addEventListener('input', () => { onType(nb, n); ed.querySelector('.when').textContent = when(n.updated); });
    nb.addEventListener('paste', pastePlain);
    setTimeout(() => { nb.focus(); const r = document.createRange(); r.selectNodeContents(nb); r.collapse(false); getSelection().removeAllRanges(); getSelection().addRange(r); }, 30);
  }
  function closeEditor() {
    const n = editing; editing = null; ed.hidden = true; grid.hidden = false;
    if (n && !n.deleted && !plain(n.html).trim() && !n.shown) { n.deleted = true; save(n); } // drop empty page-only notes
    paintPage(); render();
  }
  ed.addEventListener('click', (e) => {
    const n = editing; if (!n) return;
    const c = e.target.closest('[data-ec]');
    if (c) { n.color = c.dataset.ec; save(n); ed.querySelector('.sheet').style.setProperty('--c', n.color); ed.querySelectorAll('[data-ec]').forEach((d) => d.classList.toggle('on', d === c)); render(); return; }
    const b = e.target.closest('[data-e]'); if (!b) return;
    if (b.dataset.e === 'shown') {
      n.shown = !n.shown; b.classList.toggle('on', n.shown); save(n);
      if (n.shown) { n.z = ++zTop; if (!on) setOn(true); toast('Elle est sur ton écran 📌'); } else render();
    }
    if (b.dataset.e === 'conv') { n.conv = null; save(n); b.remove(); toast('Visible partout'); }
    if (b.dataset.e === 'del') { editing = null; remove(n); closeEditor(); }
  });
  page.addEventListener('click', (e) => {
    const card = e.target.closest('[data-n]'); if (card) return openEditor(card.dataset.n);
    const f = e.target.closest('[data-f]'); if (f) { filter = f.dataset.f; return paintPage(); }
    const fc = e.target.closest('[data-fc]'); if (fc) { fcolor = fcolor === fc.dataset.fc ? null : fc.dataset.fc; return paintPage(); }
    const p = e.target.closest('[data-p]');
    if (p?.dataset.p === 'back') return editing ? closeEditor() : closePage();
    if (p?.dataset.p === 'new') { if (editing) closeEditor(); const n = addNote({ shown: false }); return openEditor(n.id); }
    if (e.target === page) closePage();
  });
  pq.addEventListener('input', () => { if (editing) closeEditor(); else paintPage(); });


  // ---------- right-click on selected text: main options + sticky notes ----------
  const asHtml = (t) => t.split('\n').map((l) => `<div>${esc(l) || '<br>'}</div>`).join('');
  addEventListener('contextmenu', (e) => {
    if (e.shiftKey) return;                                    // Shift + right-click = the browser's own menu
    if (e.target.closest('input, textarea, [contenteditable="true"]:not(.sn .nb)')) return; // keep spellcheck/paste where she types
    const sel = String(getSelection()).trim(); if (!sel) return;
    e.preventDefault();
    const at = { getBoundingClientRect: () => ({ left: e.clientX, bottom: e.clientY }) };
    const last = live().filter((n) => !n.deleted).sort((a, b) => (b.updated || 0) - (a.updated || 0))[0];
    const items = [
      [I.copy, 'Copier', () => navigator.clipboard.writeText(sel).then(() => toast('Copié'))],
      [I.chat, 'Demander à l’assistant', () => { const inp = $('#input'); inp.value = `« ${sel} »\n\n` + inp.value; autosize(); inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); }],
      [I.search, 'Chercher sur le web', () => open('https://www.google.com/search?q=' + encodeURIComponent(sel.slice(0, 300)), '_blank', 'noopener')],
      [I.plus, 'Nouvelle note avec ce texte', () => { if (!on) setOn(true); const n = addNote({ html: asHtml(sel) }); render(); toast('Ajouté à une note 📝'); setTimeout(() => els.get(n.id)?.querySelector('.nb').blur(), 60); }],
    ];
    if (last) items.push([I.note2, 'Ajouter à « ' + firstLine(last).slice(0, 22) + ' »', () => {
      last.html = (last.html || '') + asHtml(sel); save(last); render(); if (pageOpen() && !editing) paintPage(); toast('Ajouté à ta note 📝');
    }]);
    showMenu(at, items);
  });

  // keyboard: Alt+N new note, Esc closes the page
  addEventListener('keydown', (e) => {
    if (e.altKey && !e.ctrlKey && (e.key === 'n' || e.key === 'N' || e.code === 'KeyN')) { e.preventDefault(); if (!on) setOn(true); addNote(); }
    if (e.key === 'Escape' && pageOpen() && !e.target.closest?.('#notesBar')) { editing ? closeEditor() : closePage(); }
  });

  // follow the open conversation (notes tied to one conversation appear only there)
  const _renderChat = renderChat;
  renderChat = function (...a) { const r = _renderChat.apply(this, a); render(); return r; };
  addEventListener('resize', () => render());
  addEventListener('focus', pull);
  document.addEventListener('visibilitychange', () => { if (document.hidden) { LS.set('notes', notes); push(true); } else pull(); });

  setOn(on);
  setTimeout(pull, 1200);
})();
