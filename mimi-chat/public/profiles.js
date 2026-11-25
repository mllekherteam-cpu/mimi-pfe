// ---------- Multi-user profiles & live online presence ----------
(() => {
  const GUEST_AVATARS = [
    '/avatars/guest-1.svg',
    '/avatars/guest-2.svg',
    '/avatars/guest-3.svg',
    '/avatars/guest-4.svg',
    '/avatars/guest-5.svg',
    '/avatars/guest-6.svg',
  ];
  const randomGuestAvatar = (exclude) => {
    const pool = GUEST_AVATARS.filter((a) => a !== exclude);
    return pool[Math.floor(Math.random() * pool.length)];
  };

  // Unique ID per browser tab so multi-tab presence is accurate
  const TAB_ID = 't' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const COOKIE_KEY = 'mimi_profile';

  function readCookieProfile() {
    try {
      const m = document.cookie.match(/(?:^|;\s*)mimi_profile=([^;]+)/);
      if (!m) return null;
      const p = JSON.parse(decodeURIComponent(m[1]));
      if (p && p.id && p.role && p.avatar) return p;
    } catch {}
    return null;
  }

  function writeCookieProfile(p) {
    try {
      if (!p) return;
      const val = encodeURIComponent(JSON.stringify({ id: p.id, name: p.name, role: p.role, avatar: p.avatar }));
      document.cookie = `${COOKIE_KEY}=${val}; max-age=31536000; path=/; SameSite=Lax`;
    } catch {}
  }

  function saveProfile(p) {
    settings.profile = p;
    LS.set('settings', settings);
    writeCookieProfile(p);
  }

  // Auto-restore from cookie if localStorage was cleared, or from ?as=mimi / ?as=omar magic link
  function initStoredProfile() {
    try {
      const params = new URLSearchParams(location.search);
      const as = (params.get('as') || '').toLowerCase();
      if (as === 'mimi') {
        saveProfile({ id: 'mimi', name: 'Mimi', role: 'mimi', avatar: '/avatars/mimi.jpg' });
        params.delete('as');
        const q = params.toString();
        history.replaceState(null, '', location.pathname + (q ? '?' + q : '') + location.hash);
        return;
      }
      if (as === 'omar') {
        saveProfile({ id: 'omar', name: 'Omar', role: 'omar', avatar: '/avatars/omar.jpg' });
        params.delete('as');
        const q = params.toString();
        history.replaceState(null, '', location.pathname + (q ? '?' + q : '') + location.hash);
        return;
      }
    } catch {}

    if (settings.profile?.id) {
      writeCookieProfile(settings.profile); // refresh 1-year cookie
    } else {
      const fromCookie = readCookieProfile();
      if (fromCookie) {
        settings.profile = fromCookie;
        LS.set('settings', settings);
      }
    }
  }
  initStoredProfile();

  let presenceList = [
    { id: 'mimi', name: 'Mimi', role: 'mimi', avatar: '/avatars/mimi.jpg', online: false, lastSeen: 0 },
    { id: 'omar', name: 'Omar', role: 'omar', avatar: '/avatars/omar.jpg', online: false, lastSeen: 0 },
  ];
  let hbTimer = 0;

  function getProfile() {
    return settings.profile || null;
  }

  function applyProfileUI() {
    const p = getProfile();
    const hello = $('#hello');
    if (hello && p) {
      if (p.role === 'mimi') {
        hello.innerHTML = 'Bonjour <span id="helloName">Mimi</span> ❤️';
      } else if (p.role === 'omar') {
        hello.innerHTML = 'Salut <span id="helloName">Omar</span> 👋';
      } else {
        hello.innerHTML = `Bonjour <span id="helloName">${esc(p.name)}</span> 👋`;
      }
    }
    renderPresence();
  }

  function fmtAgo(ts) {
    if (!ts) return 'Hors ligne';
    const sec = Math.max(1, Math.round((Date.now() - ts) / 1000));
    if (sec < 60) return 'Vu à l’instant';
    const min = Math.round(sec / 60);
    if (min < 60) return `Vu il y a ${min} min`;
    const hr = Math.round(min / 60);
    if (hr < 24) return `Vu il y a ${hr} h`;
    return `Vu il y a ${Math.round(hr / 24)} j`;
  }

  function renderPresence() {
    const bar = $('#presenceBar');
    if (!bar) return;
    const me = getProfile();
    const shown = [];
    const byId = new Map(presenceList.map((u) => [u.id, u]));

    const mimi = byId.get('mimi') || { id: 'mimi', name: 'Mimi', role: 'mimi', avatar: '/avatars/mimi.jpg', online: false, lastSeen: 0 };
    const omar = byId.get('omar') || { id: 'omar', name: 'Omar', role: 'omar', avatar: '/avatars/omar.jpg', online: false, lastSeen: 0 };
    shown.push({ ...mimi, online: mimi.online || me?.id === 'mimi' });
    shown.push({ ...omar, online: omar.online || me?.id === 'omar' });

    for (const u of presenceList) {
      if (u.role === 'guest' && (u.online || u.id === me?.id)) {
        shown.push({ ...u, online: u.online || u.id === me?.id });
      }
    }
    if (me?.role === 'guest' && !shown.some((u) => u.id === me.id)) {
      shown.push({ ...me, online: true, lastSeen: Date.now() });
    }

    const aiThinking = typeof busy !== 'undefined' && Boolean(busy);
    const html = shown.map((u) => {
      const isMe = me?.id === u.id;
      const cls = `pcirc ${u.online ? 'online' : 'offline'}${isMe ? ' me' : ''}`;
      const title = `${u.name}${isMe ? ' (toi)' : ''} · ${u.online ? 'En ligne' : fmtAgo(u.lastSeen)}`;
      return `<button class="${cls}" data-pid="${esc(u.id)}" title="${esc(title)}"><img src="${esc(u.avatar)}" alt="${esc(u.name)}"><span class="pdot"></span></button>`;
    }).join('') +
      `<button class="pcirc online ai${aiThinking ? ' thinking' : ''}" data-pid="ai" title="Assistante IA · Toujours en ligne"><img src="/avatars/ai.svg" alt="IA"><span class="pdot"></span></button>`;

    bar.innerHTML = html;
  }

  function closePop() { $('#presencePop')?.remove(); }

  function openPop(anchor) {
    if ($('#presencePop')) { closePop(); return; }
    const me = getProfile();
    const pop = document.createElement('div');
    pop.id = 'presencePop';

    const byId = new Map(presenceList.map((u) => [u.id, u]));
    const rows = [
      byId.get('mimi') || { id: 'mimi', name: 'Mimi', role: 'mimi', avatar: '/avatars/mimi.jpg', online: false, lastSeen: 0 },
      byId.get('omar') || { id: 'omar', name: 'Omar', role: 'omar', avatar: '/avatars/omar.jpg', online: false, lastSeen: 0 },
      ...presenceList.filter((u) => u.role === 'guest' && (u.online || u.id === me?.id)),
    ];
    if (me?.role === 'guest' && !rows.some((u) => u.id === me.id)) {
      rows.push({ ...me, online: true, lastSeen: Date.now() });
    }

    pop.innerHTML = rows.map((u) => {
      const isMe = me?.id === u.id;
      const online = u.online || isMe;
      return `<div class="pp-row">
        <div class="pp-av ${online ? 'online' : 'offline'}"><img src="${esc(u.avatar)}" alt="${esc(u.name)}"><span class="pdot"></span></div>
        <div class="pp-info"><b>${esc(u.name)}${isMe ? ' (toi)' : ''}</b><small class="${online ? 'on' : ''}">${online ? 'En ligne' : fmtAgo(u.lastSeen)}</small></div>
      </div>`;
    }).join('') +
      `<div class="pp-row">
        <div class="pp-av online ai"><img src="/avatars/ai.svg" alt="IA"><span class="pdot"></span></div>
        <div class="pp-info"><b>Assistante IA</b><small class="on">Toujours disponible</small></div>
      </div>
      <div class="pp-foot"><button id="ppSwitch">Changer de profil</button></div>`;

    document.body.appendChild(pop);
    const r = anchor.getBoundingClientRect();
    pop.style.left = Math.max(8, Math.min(r.right - pop.offsetWidth, innerWidth - pop.offsetWidth - 8)) + 'px';
    pop.style.top = (r.bottom + 8) + 'px';
    pop.querySelector('#ppSwitch').onclick = () => { closePop(); openProfilePicker({ requireCode: false, closable: true }); };
    setTimeout(() => document.addEventListener('click', (e) => {
      if (!e.target.closest('#presencePop') && !e.target.closest('#presenceBar')) closePop();
    }, { once: true }));
  }

  async function pingPresence(offline = false, profileOverride = null) {
    const p = profileOverride || getProfile();
    if (!p) return;
    try {
      const r = await fetch('/api/presence', {
        method: 'POST',
        keepalive: offline,
        headers: { 'Content-Type': 'application/json', 'x-access-code': settings.code || '' },
        body: JSON.stringify({ id: p.id, name: p.name, role: p.role, avatar: p.avatar, tabId: TAB_ID, offline }),
      });
      if (!r.ok) return;
      const j = await r.json();
      if (Array.isArray(j.users)) { presenceList = j.users; renderPresence(); }
    } catch {}
  }

  async function fetchPresence() {
    try {
      const r = await fetch('/api/presence', {
        headers: { 'x-access-code': settings.code || '' },
      });
      if (!r.ok) return;
      const j = await r.json();
      if (Array.isArray(j.users)) { presenceList = j.users; renderPresence(); }
    } catch {}
  }

  function startHeartbeat() {
    clearInterval(hbTimer);
    if (getProfile()) pingPresence(false); else fetchPresence();
    hbTimer = setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      if (getProfile()) pingPresence(false); else fetchPresence();
    }, 15_000);
  }

  // ---------- Netflix-style profile picker ----------
  function openProfilePicker({ requireCode = false, closable = false } = {}) {
    if (document.querySelector('[data-whomodal]')) return;
    const cur = getProfile();
    let picked = cur?.role || 'mimi';
    let guestAvatar = (cur?.role === 'guest' && cur.avatar) ? cur.avatar : randomGuestAvatar();
    let guestName = cur?.role === 'guest' ? cur.name : '';

    const bg = modal(`<div data-whomodal>
      <h2 class="who-title">Qui est là ?</h2>
      <p class="who-sub">${requireCode ? 'Choisis ton profil et entre le code d’accès.' : 'Choisis ton profil une seule fois — le site s’en souviendra.'}</p>
      <div class="who-grid">
        <button type="button" class="who-card ${picked === 'mimi' ? 'sel' : ''}" data-role="mimi">
          <div class="who-pic"><img src="/avatars/mimi.jpg" alt="Mimi"></div>
          <b>Mimi</b>
          <small>Cua cuaaa</small>
        </button>
        <button type="button" class="who-card ${picked === 'omar' ? 'sel' : ''}" data-role="omar">
          <div class="who-pic"><img src="/avatars/omar.jpg" alt="Omar"></div>
          <b>Omar</b>
          <small>Le p’tit gars</small>
        </button>
        <button type="button" class="who-card ${picked === 'guest' ? 'sel' : ''}" data-role="guest">
          <div class="who-pic"><img id="whoGuestImg" src="${guestAvatar}" alt="Invité"></div>
          <b>Invité</b>
          <small>Avatar aléatoire</small>
        </button>
      </div>
      <div class="who-guest ${picked === 'guest' ? 'show' : ''}" id="whoGuestBox">
        <div class="who-guest-row">
          <input id="whoGuestName" placeholder="Ton prénom (optionnel)" maxlength="28" value="${esc(guestName)}">
          <button type="button" class="who-reroll" id="whoReroll" title="Changer d’avatar">🎲 Autre</button>
        </div>
      </div>
      ${requireCode ? `<label>Code d’accès</label><input id="cCode" type="password" value="${esc(settings.code || '')}" autofocus>` : ''}
      <div class="row" style="justify-content:center;margin-top:18px">
        ${closable ? '<button type="button" class="ghost" data-cancel>Annuler</button>' : ''}
        <button type="button" class="solid" data-ok>Entrer</button>
      </div>
    </div>`, (bgEl) => {
      if (requireCode) {
        const code = bgEl.querySelector('#cCode').value.trim();
        if (!code) { toast('Entre le code d’accès'); return false; }
        settings.code = code;
      }
      const prev = getProfile();
      let next;
      if (picked === 'mimi') {
        next = { id: 'mimi', name: 'Mimi', role: 'mimi', avatar: '/avatars/mimi.jpg' };
      } else if (picked === 'omar') {
        next = { id: 'omar', name: 'Omar', role: 'omar', avatar: '/avatars/omar.jpg' };
      } else {
        const nm = (bgEl.querySelector('#whoGuestName')?.value || '').trim() || 'Invité';
        const gid = prev?.role === 'guest' ? prev.id : ('guest:' + uid());
        next = { id: gid, name: nm, role: 'guest', avatar: guestAvatar };
      }
      if (prev && prev.id !== next.id) {
        pingPresence(true, prev);
      }
      saveProfile(next);
      applyProfileUI();
      if (requireCode) boot();
      else pingPresence(false);
    });

    if (!closable) bg.dataset.lock = 1;

    const cards = bg.querySelectorAll('.who-card');
    const guestBox = bg.querySelector('#whoGuestBox');
    cards.forEach((c) => {
      c.onclick = () => {
        picked = c.dataset.role;
        cards.forEach((x) => x.classList.toggle('sel', x === c));
        guestBox.classList.toggle('show', picked === 'guest');
        if (picked === 'guest') {
          guestAvatar = randomGuestAvatar(guestAvatar);
          bg.querySelector('#whoGuestImg').src = guestAvatar;
        }
      };
    });
    bg.querySelector('#whoReroll').onclick = () => {
      guestAvatar = randomGuestAvatar(guestAvatar);
      bg.querySelector('#whoGuestImg').src = guestAvatar;
    };
    const codeInp = bg.querySelector('#cCode');
    if (codeInp) codeInp.addEventListener('keydown', (e) => { if (e.key === 'Enter') bg.querySelector('[data-ok]').click(); });
  }

  // Click handler on topbar presence bar
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('#presenceBar .pcirc');
    if (btn) { e.stopPropagation(); openPop(btn); }
  });

  // Accurate online/offline lifecycle
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      if (getProfile()) pingPresence(false); else fetchPresence();
    }
  });
  addEventListener('focus', () => { if (getProfile()) pingPresence(false); else fetchPresence(); });
  addEventListener('online', () => { if (getProfile()) pingPresence(false); else fetchPresence(); });
  addEventListener('pagehide', () => { if (getProfile()) pingPresence(true); });

  // Expose hooks for index.html
  window.MimiProfiles = {
    getProfile,
    openProfilePicker,
    renderPresence,
    applyProfileUI,
    startHeartbeat,
    onBootSuccess() {
      applyProfileUI();
      startHeartbeat();
      if (!getProfile()) openProfilePicker({ requireCode: false, closable: false });
    },
  };

  // Override askCode so 401 shows the unified profile + access code modal
  window.askCode = () => openProfilePicker({ requireCode: true, closable: false });

  renderPresence();
})();
