// Mimi's deer companion: hand-drawn SVG, fully customizable (character, coat, accessories, display).
// Replaces the old ellipse fawn. Settings live in localStorage 'mimi:deer'.
(() => {
  const KEY = 'mimi:deer';
  const MIRROR = 'matrix(-1 0 0 1 200 0)';

  const STYLES = {
    faon:  { label: 'Faon',  sub: 'tout petit, tacheté', spots: true,  lashes: false, antlers: null },
    biche: { label: 'Biche', sub: 'douce, grands cils',   spots: false, lashes: true,  antlers: null },
    cerf:  { label: 'Cerf',  sub: 'fier, avec ses bois',  spots: false, lashes: false, antlers: 'stag', fluff: true },
    renne: { label: 'Renne', sub: 'nez rouge, grands bois', spots: true, lashes: false, antlers: 'reindeer', fluff: true, redNose: true },
  };

  const COATS = {
    caramel:  { label: 'Caramel',     coat: '#c98a5e', cream: '#fdf1e6', inner: '#f3b9ae', nose: '#4a3030', hoof: '#6b4a3a', antler: '#ecdcc0' },
    cannelle: { label: 'Cannelle',    coat: '#ad6544', cream: '#fbeadc', inner: '#f0aea3', nose: '#3f2626', hoof: '#5a3a2d', antler: '#efdfc4' },
    chocolat: { label: 'Chocolat',    coat: '#7b5242', cream: '#f4e4d4', inner: '#e8a59d', nose: '#2e1e1e', hoof: '#3e2a22', antler: '#eadbbd' },
    dore:     { label: 'Doré',        coat: '#dba65c', cream: '#fff4de', inner: '#f5bfa8', nose: '#5a3a2a', hoof: '#7a5636', antler: '#f3e6cc' },
    rose:     { label: 'Rose poudré', coat: '#e2a3a7', cream: '#fff5f2', inner: '#f8cdd3', nose: '#7a3f4b', hoof: '#b0757f', antler: '#f6e6dc' },
    lavande:  { label: 'Lavande',     coat: '#b7a0d6', cream: '#f8f2ff', inner: '#efc6dc', nose: '#4f3a66', hoof: '#86709f', antler: '#efe6f6' },
    neige:    { label: 'Neige',       coat: '#efe6e1', cream: '#ffffff', inner: '#f6c7cd', nose: '#6b4e55', hoof: '#b9a8a3', antler: '#d9c6a8' },
  };

  const ACCS = {
    crown:   { label: 'Couronne de fleurs', ico: '🌸' },
    bow:     { label: 'Nœud',               ico: '🎀' },
    scarf:   { label: 'Écharpe',            ico: '🧣' },
    glasses: { label: 'Lunettes',           ico: '👓' },
    cap:     { label: 'Toque de diplômée',  ico: '🎓' },
    helmet:  { label: 'Casque moto',        ico: '🏍️' },
    heart:   { label: 'Petit cœur',         ico: '💗' },
  };
  const ACC_COLORS = ['#e88ea3', '#b85c74', '#f4b860', '#8fbf9f', '#7fa8d9', '#b39ddb', '#ffffff'];

  const PHRASES = [
    'Courage Mimi, tu avances super bien ✨', 'Une petite pause thé ? 🍵', 'Je crois en toi 💗',
    'Ton mémoire va être magnifique 🌿', 'Un paragraphe à la fois 🐾', 'Fière de toi 🥹',
    'N’oublie pas de boire de l’eau 💧', 'Tu es plus forte que tu ne le crois 🌸', 'Omar pense à toi ❤️',
  ];
  const PHRASES_PRO = [
    'Bon courage pour le mémoire ✨', 'Une petite pause thé ? 🍵', 'Un paragraphe à la fois 🐾',
    'N’oublie pas de boire de l’eau 💧', 'Tu avances super bien 🌿', 'Reste concentrée, ça avance bien ✨',
  ];

  const DEFAULTS = { style: 'faon', coat: 'caramel', custom: '', accs: ['crown', 'heart'], accColor: '#e88ea3', mode: 'color', side: 'right', size: 115, name: 'Noisette' };
  const load = () => { try { return Object.assign({}, DEFAULTS, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch { return { ...DEFAULTS }; } };
  const save = (c) => { try { localStorage.setItem(KEY, JSON.stringify(c)); } catch {} };
  let cfg = load();

  // ---------- color helpers ----------
  const hex = (h) => { h = h.replace('#', ''); if (h.length === 3) h = h.replace(/./g, '$&$&'); const n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  const toHex = (r, g, b) => '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  const mix = (a, b, t) => { const A = hex(a), B = hex(b); return toHex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t); };
  function palette(c) {
    if (c.custom) {
      const k = c.custom;
      return { coat: k, cream: mix(k, '#ffffff', .85), inner: mix(mix(k, '#f4a7b4', .6), '#ffffff', .25), nose: mix(k, '#1e1416', .78), hoof: mix(k, '#1e1416', .55), antler: '#ecdcc0' };
    }
    return COATS[c.coat] || COATS.caramel;
  }
  function vars(c) {
    const p = palette(c), st = STYLES[c.style] || STYLES.faon;
    return `--d-coat:${p.coat};--d-cream:${p.cream};--d-inner:${p.inner};--d-nose:${st.redNose ? '#d8433f' : p.nose};--d-hoof:${p.hoof};--d-antler:${p.antler};--d-acc:${c.accColor};--d-acc2:${mix(c.accColor, '#000000', .18)}`;
  }

  // ---------- drawing ----------
  const both = (s) => s + `<g transform="${MIRROR}">${s}</g>`;

  const ANTLERS = {
    stag: `<path d="M86 46C82 34 78 25 71 15M80 32C73 31 67 27 63 20M75 24C77 17 78 11 77 5"/>`,
    reindeer: `<path d="M84 46C78 31 66 21 51 15M72 30C69 22 69 15 72 7M61 22C57 16 55 10 56 3M55 18C47 18 39 22 35 29"/>`,
  };

  function ear() {
    return `<g class="d-ear"><path class="d-coat" d="M68 66C54 49 27 44 14 52C22 69 47 77 68 73Z"/>`
      + `<path class="d-inner" d="M63 67C51 56 33 53 24 56C32 66 47 71 63 71Z"/>`
      + `<path class="d-shade" d="M68 73C47 77 22 69 14 52C26 63 48 69 68 68Z"/></g>`;
  }

  function flower(x, y, r, petal, center) {
    let s = '';
    for (let i = 0; i < 5; i++) { const a = (i * 72 - 90) * Math.PI / 180; s += `<circle cx="${(x + Math.cos(a) * r).toFixed(1)}" cy="${(y + Math.sin(a) * r).toFixed(1)}" r="${(r * .92).toFixed(1)}" fill="${petal}"/>`; }
    return s + `<circle cx="${x}" cy="${y}" r="${(r * .7).toFixed(1)}" fill="${center}"/>`;
  }

  function accessories(c) {
    const a = new Set(c.accs || []), o = { back: '', neck: '', head: '', top: '' };
    if (a.has('scarf')) o.neck = `<path class="d-acc" d="M66 118C84 132 116 132 134 118L136 129C116 143 84 143 64 129Z"/>`
      + `<path class="d-acc2" d="M110 133L119 163L106 161L102 135Z"/><path class="d-acc" d="M104 134L114 164L101 163L97 135Z"/>`
      + `<path d="M74 126C90 136 110 136 126 126" stroke="#fff" stroke-opacity=".45" stroke-width="2" stroke-dasharray="3 5" fill="none"/>`;
    if (a.has('crown')) {
      o.head += `<path d="M66 58C76 44 124 44 134 58" stroke="#7fae7a" stroke-width="3" fill="none" stroke-linecap="round"/>`;
      [[73, 52, -40], [91, 44, -15], [109, 44, 15], [127, 52, 40]].forEach(([x, y, r]) => { o.head += `<ellipse cx="${x}" cy="${y}" rx="5" ry="2.4" fill="#8fbf7f" transform="rotate(${r} ${x} ${y})"/>`; });
      o.head += flower(67, 58, 4.2, c.accColor, '#ffe08a') + flower(82, 47, 4.6, '#ffffff', '#ffd36e') + flower(100, 42, 5.4, c.accColor, '#ffe08a') + flower(118, 47, 4.6, '#ffffff', '#ffd36e') + flower(133, 58, 4.2, c.accColor, '#ffe08a');
    }
    if (a.has('bow')) o.head += `<g transform="translate(139 58) rotate(26)"><path class="d-acc" d="M0 0C-9-11-21-9-19 0C-21 9-9 11 0 0Z"/><path class="d-acc" d="M0 0C9-11 21-9 19 0C21 9 9 11 0 0Z"/>`
      + `<path class="d-acc2" d="M-2 2L-7 14L-2 12L1 15L2 3Z"/><circle class="d-acc2" r="4.6"/><circle r="1.6" cx="-1.2" cy="-1.4" fill="#fff" opacity=".6"/></g>`;
    if (a.has('glasses')) o.top += `<g fill="#fff" fill-opacity=".14" stroke="#3b2a2a" stroke-width="2.8"><circle cx="80" cy="85" r="15"/><circle cx="120" cy="85" r="15"/></g>`
      + `<path d="M95 83C98 80 102 80 105 83M65 82L58 78M135 82L142 78" stroke="#3b2a2a" stroke-width="2.8" fill="none" stroke-linecap="round"/>`;
    if (a.has('cap')) o.top += `<path d="M78 34V45C90 52 110 52 122 45V34Z" fill="#3a2e33"/><path d="M100 18L144 31L100 44L56 31Z" fill="#2e2427"/>`
      + `<path d="M100 18L144 31L100 44L56 31Z" fill="#fff" opacity=".07"/><path d="M100 31L136 36V54" stroke="${c.accColor}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`
      + `<path d="M133 53H139L140 62H132Z" fill="${c.accColor}"/><circle cx="100" cy="31" r="2.6" fill="${c.accColor}"/>`;
    if (a.has('helmet')) o.head += `<g class="d-helmet">`
      + `<path d="M64 74C75 66 125 66 136 74C141 82 140 98 134 105C122 109 78 109 66 105C60 98 59 82 64 74Z" fill="none" stroke="#6d6973" stroke-width="4.5"/>`
      + `<path fill-rule="evenodd" fill="#1e1c22" d="M100 26C136 26 156 50 154 86C153 109 137 128 100 131C63 128 47 109 46 86C44 50 64 26 100 26ZM64 74C59 82 60 98 66 105C78 109 122 109 134 105C140 98 141 82 136 74C125 66 75 66 64 74Z"/>`
      + `<path d="M56 64C70 50 130 50 144 64" fill="none" stroke="${c.accColor}" stroke-width="3.2" stroke-linecap="round" opacity=".9"/>`
      + `<path d="M64 74C75 66 125 66 136 74C141 82 140 98 134 105C122 109 78 109 66 105C60 98 59 82 64 74Z" fill="none" stroke="#36333d" stroke-width="2.2"/>`
      + `<path d="M62 46C74 34 94 31 110 34C96 36 80 41 68 51Z" fill="#fff" opacity=".18"/>`
      + `<rect x="89" y="114" width="22" height="7" rx="3.5" fill="#322f38"/><path d="M93 117.5H107" stroke="#524e5b" stroke-width="1.6" stroke-linecap="round"/>`
      + `${both(`<circle cx="50" cy="84" r="4.6" fill="#33303a" stroke="#141217" stroke-width="1.2"/><circle cx="50" cy="84" r="1.6" fill="#6b6775"/>`)}`
      + `</g>`;
    if (a.has('heart')) o.back += `<path class="d-heart" fill="#e88ea3" d="M172 36C169 32 162 34 164 40C165 43 172 47 172 47S179 43 180 40C182 34 175 32 172 36Z"/>`
      + `<path class="d-heart d-heart2" fill="#f3b3c2" d="M28 104C26 101.5 21.5 103 23 107C23.7 109 28 111.5 28 111.5S32.3 109 33 107C34.5 103 30 101.5 28 104Z"/>`;
    return o;
  }

  function svg(c = cfg) {
    const st = STYLES[c.style] || STYLES.faon, acc = accessories(c);
    const spots = st.spots ? both(`<circle cx="58" cy="168" r="3.2"/><circle cx="68" cy="161" r="2.4"/><circle cx="62" cy="178" r="2.2"/>`) : '';
    const headSpots = st.spots ? `<circle cx="91" cy="55" r="2.6"/><circle cx="103" cy="50" r="2.1"/><circle cx="112" cy="58" r="1.9"/>` : '';
    const lashes = st.lashes ? both(`<path class="d-line" d="M69.2 82.2L63.5 78.6M68.8 84.4L63.8 84" stroke-width="2.1"/>`) : '';
    return `<svg class="d-art" viewBox="0 0 200 200" aria-hidden="true">
  <ellipse cx="100" cy="190" rx="52" ry="6" fill="#000" opacity=".07"/>
  ${acc.back}
  ${st.antlers ? `<g class="d-antler" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round">${both(ANTLERS[st.antlers])}</g>` : ''}
  <g class="d-body">
    ${both(`<ellipse class="d-coat" cx="66" cy="174" rx="23" ry="15"/><path class="d-shade" d="M43 176C46 186 62 190 80 186C66 186 52 183 43 176Z"/>`)}
    <path class="d-coat" d="M70 187C61 158 72 127 100 125C128 127 139 158 130 187Z"/>
    <path class="d-shade" d="M70 187C63 165 66 142 80 132C74 150 76 170 84 187Z"/><path class="d-shade" d="M130 187C137 165 134 142 120 132C126 150 124 170 116 187Z"/>
    <ellipse class="d-cream" cx="100" cy="161" rx="18" ry="23"/>
    ${st.fluff ? `<path class="d-cream" d="M82 126L88 137L94 129L100 140L106 129L112 137L118 126Z"/>` : ''}
    <g class="d-cream">${spots}</g>
    ${both(`<rect class="d-coat" x="85" y="146" width="13" height="41" rx="6.5"/><path class="d-hoof" d="M85 179H98V182.5A4.5 4.5 0 0 1 93.5 187H89.5A4.5 4.5 0 0 1 85 182.5Z"/><path class="d-shade" d="M85 152C85 160 86 170 85 179H88C88 170 88 160 85 152Z"/>`)}
  </g>
  ${acc.neck}
  <g class="d-head">
    <g class="d-ears">${ear()}<g transform="${MIRROR}">${ear()}</g></g>
    <path class="d-coat" d="M100 38C132 38 148 60 146 86C144 110 124 124 100 124C76 124 56 110 54 86C52 60 68 38 100 38Z"/>
    <path class="d-shade" d="M54 86C56 110 76 124 100 124C124 124 144 110 146 86C140 104 122 116 100 116C78 116 60 104 54 86Z"/>
    <path class="d-coat" d="M90 42C93 32 101 31 104 38C107 33 113 35 112 42Z"/>
    <g class="d-cream">${headSpots}</g>
    <ellipse class="d-cream" cx="100" cy="105" rx="24" ry="17"/>
    <g class="d-eyes">
      ${both(`<ellipse cx="80" cy="87" rx="9.8" ry="9.5" fill="#5ec93c" stroke="#254423" stroke-width="1.8"/><ellipse cx="80" cy="91" rx="6.8" ry="3.9" fill="#b8f259" opacity=".92"/><ellipse cx="81.2" cy="85.2" rx="4.9" ry="5.2" fill="#22191c"/><circle cx="84.2" cy="83.6" r="2.7" fill="#fff"/><circle cx="77.2" cy="89.8" r="1.4" fill="#fff" opacity=".92"/><path class="d-coat" d="M68 83.2C73 80.5 85 80.4 91.5 83.2V73H68Z"/><path d="M69 82.8C74 79.8 85 79.8 91 82.8C88 76.2 72.5 76.2 69 82.8Z" fill="#3b1f14" opacity=".13"/><path d="M69.2 82.8C74.5 80.3 85 80.3 90.6 82.8" fill="none" stroke="#2d2024" stroke-width="2.2" stroke-linecap="round"/><path d="M69.8 82.4L66.2 80.2M69.3 84.1L66.4 83.2" fill="none" stroke="#2d2024" stroke-width="1.7" stroke-linecap="round"/>`)}
      ${lashes}
    </g>
    ${both(`<ellipse cx="66" cy="101" rx="8" ry="4.5" fill="#ff8ea8" opacity=".42"/>`)}
    <path class="d-nose" d="M92 97C92 92.5 108 92.5 108 97C108 102 103 105 100 105C97 105 92 102 92 97Z"/>
    <ellipse cx="96.6" cy="96" rx="2.8" ry="1.5" fill="#fff" opacity=".55"/>
    <path class="d-line" d="M100 105V109M100 109C98 112.5 94 112.5 92.5 110M100 109C102 112.5 106 112.5 107.5 110" stroke-width="2"/>
    ${acc.head}
  </g>
  ${acc.top}
</svg>`;
  }

  // ---------- mounting ----------
  const nodes = () => [document.getElementById('fawn'), ...document.querySelectorAll('.fawn-hero')].filter(Boolean);
  function apply(c = cfg) {
    const v = vars(c);
    nodes().forEach((n) => { n.innerHTML = svg(c); n.setAttribute('style', v + `;--d-size:${c.size}px`); });
    const f = document.getElementById('fawn');
    if (f) {
      f.className = `mode-${c.mode} side-${c.side}`;
      f.title = c.mode === 'color' ? (c.name || '') : '';
      if (c.mode === 'color') f.insertAdjacentHTML('beforeend', `<div class="d-bubble" hidden><span></span><button type="button" class="d-edit" title="Personnaliser">✏️</button></div>`);
    }
    document.querySelectorAll('.fawn-hero').forEach((h) => { h.title = `${c.name || 'Ton faon'} · clique pour le personnaliser`; });
  }

  function hearts(el) {
    const r = el.getBoundingClientRect();
    for (let i = 0; i < 7; i++) {
      const h = document.createElement('span'); h.className = 'd-pop'; h.textContent = ['💗', '💕', '🤍', '✨'][i % 4];
      h.style.left = (r.left + r.width * (.3 + Math.random() * .4)) + 'px'; h.style.top = (r.top + r.height * .25) + 'px';
      h.style.setProperty('--dx', (Math.random() * 90 - 45) + 'px'); h.style.animationDelay = (i * 45) + 'ms';
      document.body.appendChild(h); setTimeout(() => h.remove(), 1500);
    }
  }
  function poke(el) {
    const art = el.querySelector('.d-art'); if (!art) return;
    art.classList.remove('hop'); void art.getBoundingClientRect(); art.classList.add('hop');
    hearts(art);
  }

  document.addEventListener('click', (e) => {
    const f = document.getElementById('fawn');
    if (e.target.closest('.d-edit')) { e.stopPropagation(); return open(); }
    if (e.target.closest('.fawn-hero')) { poke(e.target.closest('.fawn-hero')); return open(); }
    if (f && f.classList.contains('mode-color') && e.target.closest('#fawn .d-art')) {
      poke(f);
      const b = f.querySelector('.d-bubble');
      if (b) {
        const pool = window.isNoLove?.() ? PHRASES_PRO : PHRASES;
        b.querySelector('span').textContent = (cfg.name ? cfg.name + ' : ' : '') + pool[Math.floor(Math.random() * pool.length)];
        b.hidden = false; clearTimeout(poke.t); poke.t = setTimeout(() => { b.hidden = true; }, 4500);
      }
    }
  });

  // occasional ear twitch so it feels alive
  setInterval(() => {
    if (document.hidden) return;
    nodes().forEach((n) => { const e = n.querySelector('.d-ears'); if (!e || Math.random() > .5) return; e.classList.remove('twitch'); void e.getBoundingClientRect(); e.classList.add('twitch'); });
  }, 6500);

  // ---------- customizer ----------
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  function open() {
    if (document.querySelector('.d-modal')) return;
    const before = JSON.stringify(cfg);
    let draft = JSON.parse(before);
    const bg = document.createElement('div'); bg.className = 'modal-bg d-modal';
    const mini = (patch) => { const c = { ...draft, ...patch }; return `<span class="d-mini" style="${vars(c)}">${svg(c)}</span>`; };
    const render = () => {
      bg.innerHTML = `<div class="modal d-panel">
        <div class="d-preview" style="${vars(draft)}">${svg(draft)}<div class="d-name">${esc(draft.name || '')}</div></div>
        <div class="d-opts"><div class="d-scroll">
          <h2>Ton faon 🦌</h2>
          <label>Son nom</label><input id="dName" maxlength="24" value="${esc(draft.name)}" placeholder="Noisette, Bambi, Caramel…">
          <label>Personnage</label>
          <div class="d-grid">${Object.entries(STYLES).map(([k, s]) => `<button type="button" data-style="${k}" class="${draft.style === k ? 'on' : ''}">${mini({ style: k, accs: [] })}<b>${s.label}</b><small>${s.sub}</small></button>`).join('')}</div>
          <label>Pelage</label>
          <div class="d-sw">${Object.entries(COATS).map(([k, p]) => `<button type="button" data-coat="${k}" title="${p.label}" class="${!draft.custom && draft.coat === k ? 'on' : ''}" style="background:${p.coat}"></button>`).join('')}
            <label class="d-pick ${draft.custom ? 'on' : ''}" title="Ta couleur"><input type="color" id="dCustom" value="${draft.custom || palette(draft).coat}">🎨</label></div>
          <label>Accessoires</label>
          <div class="d-chips">${Object.entries(ACCS).map(([k, a]) => `<button type="button" data-acc="${k}" class="${draft.accs.includes(k) ? 'on' : ''}">${a.ico} ${a.label}</button>`).join('')}</div>
          <div class="d-sw d-sw-sm">${ACC_COLORS.map((col) => `<button type="button" data-accc="${col}" class="${draft.accColor === col ? 'on' : ''}" style="background:${col}"></button>`).join('')}
            <label class="d-pick" title="Couleur des accessoires"><input type="color" id="dAccC" value="${draft.accColor}">🎨</label></div>
          <label>Sur l’écran</label>
          <div class="d-seg">${[['color', 'En couleur (on peut le caresser)'], ['ghost', 'Discret, en filigrane'], ['hidden', 'Caché']].map(([k, t]) => `<button type="button" data-mode="${k}" class="${draft.mode === k ? 'on' : ''}">${t}</button>`).join('')}</div>
          <div class="d-seg">${[['left', '⬅ À gauche'], ['right', 'À droite ➡']].map(([k, t]) => `<button type="button" data-side="${k}" class="${draft.side === k ? 'on' : ''}">${t}</button>`).join('')}</div>
          <label>Taille</label><input type="range" id="dSize" min="80" max="200" step="5" value="${draft.size}">
          </div><div class="row d-foot"><button class="ghost" data-rand type="button">🎲 Surprise</button><span style="flex:1"></span><button class="ghost" data-cancel type="button">Annuler</button><button class="solid" data-ok type="button">Enregistrer</button></div>
        </div></div>`;
    };
    const update = (patch, rerender = true) => { Object.assign(draft, patch); apply(draft); if (rerender) { const st = bg.querySelector('.d-scroll')?.scrollTop; render(); const o = bg.querySelector('.d-scroll'); if (o) o.scrollTop = st; } else { const p = bg.querySelector('.d-preview'); p.setAttribute('style', vars(draft)); p.innerHTML = svg(draft) + `<div class="d-name">${esc(draft.name || '')}</div>`; } };
    render(); document.body.appendChild(bg);
    const close = (keep) => { if (!keep) { cfg = JSON.parse(before); apply(cfg); } bg.remove(); };
    bg.addEventListener('click', (e) => {
      if (e.target === bg) return close(false);
      const t = e.target.closest('button'); if (!t) return;
      const d = t.dataset;
      if ('cancel' in d) return close(false);
      if ('ok' in d) { cfg = draft; save(cfg); apply(cfg); close(true); return; }
      if (d.style) update({ style: d.style });
      else if (d.coat) update({ coat: d.coat, custom: '' });
      else if (d.acc) update({ accs: draft.accs.includes(d.acc) ? draft.accs.filter((x) => x !== d.acc) : [...draft.accs, d.acc] });
      else if (d.accc) update({ accColor: d.accc });
      else if (d.mode) update({ mode: d.mode });
      else if (d.side) update({ side: d.side });
      else if ('rand' in d) {
        const pick = (o) => o[Math.floor(Math.random() * o.length)];
        const accs = Object.keys(ACCS).filter(() => Math.random() < .3);
        update({ style: pick(Object.keys(STYLES)), coat: pick(Object.keys(COATS)), custom: '', accColor: pick(ACC_COLORS), accs });
      }
    });
    bg.addEventListener('input', (e) => {
      const id = e.target.id;
      if (id === 'dName') update({ name: e.target.value }, false);
      else if (id === 'dSize') update({ size: +e.target.value }, false);
      else if (id === 'dCustom') update({ custom: e.target.value }, false);
      else if (id === 'dAccC') update({ accColor: e.target.value }, false);
    });
    bg.addEventListener('change', (e) => { if (['dCustom', 'dAccC'].includes(e.target.id)) update({}); });
  }

  window.Deer = { open, apply, svg, get config() { return { ...cfg }; } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => apply()); else apply();
})();
