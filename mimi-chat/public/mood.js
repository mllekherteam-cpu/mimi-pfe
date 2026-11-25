// ---------- Mimi l'ghzala: how happy is she with the work so far ----------
// A little gazelle on a slider in the sidebar. Very happy -> flowers and "yaaay".
// Not happy -> we tell her Omar is being told right now (phone alert via /api/mood) and gently ask why.
(() => {
  const LOW = 40, HAPPY = 80;
  const FACES = [[0, '😢', 'pas bien du tout'], [20, '😟', 'pas trop bien'], [40, '😐', 'ça va'], [60, '🙂', 'contente'], [80, '😊', 'très heureuse'], [95, '🥰', 'aux anges']];
  const face = (v) => FACES.filter((f) => v >= f[0]).pop();
  const send = (body) => fetch('/api/mood', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-access-code': settings.code || '' }, body: JSON.stringify(body) }).catch(() => {});

  const DEER_VARS = '--d-coat:#c98a5e;--d-cream:#fdf1e6;--d-inner:#f3b9ae;--d-nose:#4a3030;--d-hoof:#6b4a3a;--d-antler:#ecdcc0;--d-acc:#e88ea3;--d-acc2:#ba7182';
  const deerStyle = () => document.querySelector('#fawn')?.getAttribute('style') || DEER_VARS;
  const deerHtml = (cls) => `<span class="${cls}" style="${deerStyle()}" aria-hidden="true">${window.Deer?.svg ? window.Deer.svg() : '🦌'}</span>`;

  const THANKS = [
    ['Message envoyé au QG d’Omar 💌', 'Il a tout reçu sur son téléphone (mode super-héros activé). Respire un grand coup, ma ghzala — on démonte ce stress ensemble.'],
    ['Bien reçu, chef Mimi l’ghzala ✨', 'Omar est déjà en train de lire ça avec son air sérieux. Tu n’es pas seule là-dedans, on règle ça étape par étape.'],
    ['C’est dans la boîte, ma petite gazelle 🌷', 'Omar a tout reçu. Lâche les épaules, bois une gorgée d’eau — on remet tout ça sur les rails ensemble.'],
    ['Alerte ghzala transmise à Omar 📡💗', 'C’est bon, il sait tout. T’as le droit d’avoir un coup de mou — on respire, on s’ajuste, et ça va le faire.'],
  ];

  // ---- the widget ----
  const box = document.createElement('div');
  box.id = 'ghzala';
  box.innerHTML = `
    <div class="gz-top"><b>Mimi l’ghzala</b><span class="gz-face"></span></div>
    <small class="gz-q">Tu es contente du travail jusqu’ici ?</small>
    <div class="gz-track">
      <div class="gz-fill"></div>
      ${deerHtml('gz-deer')}
      <input type="range" min="0" max="100" step="1" aria-label="À quel point tu es contente du travail">
    </div>
    <div class="gz-ends"><span>😢</span><small class="gz-lbl"></small><span>🥰</span></div>`;
  const foot = document.querySelector('#side .side-foot');
  foot.insertBefore(box, foot.firstChild);

  const range = box.querySelector('input');
  let val = LS.get('mood', 70);
  range.value = val;
  function paint() {
    const v = Number(range.value), f = face(v);
    box.style.setProperty('--v', v);
    box.querySelector('.gz-face').textContent = f[1];
    box.querySelector('.gz-lbl').textContent = `${f[2]} · ${v}`;
    box.classList.toggle('low', v < LOW);
    box.classList.toggle('happy', v >= HAPPY);
  }
  paint();
  range.addEventListener('input', paint);
  range.addEventListener('change', () => {
    const v = Number(range.value), before = val;
    val = v; LS.set('mood', v);
    if (v < LOW) {
      // one phone alert per 10 min while she slides around down there
      if (Date.now() - LS.get('moodAlertAt', 0) > 10 * 60000) { LS.set('moodAlertAt', Date.now()); send({ score: v }); }
      else send({ score: v, quiet: true });
      askWhy(v);
    } else {
      send({ score: v });
      if (v >= HAPPY && (before < HAPPY || v === 100)) celebrate();
      else if (v >= HAPPY) celebrate(true);
      else toast('Merci 🤍 on continue doucement, ensemble');
    }
  });

  // ---- very happy: flowers everywhere ----
  function celebrate(small) {
    document.querySelector('#yay')?.remove();
    const FL = ['🌸', '🌷', '🌼', '🌹', '💐', '🌺', '💖', '✨'];
    const y = document.createElement('div'); y.id = 'yay';
    let rain = '';
    const n = small ? 26 : 60;
    for (let i = 0; i < n; i++) {
      rain += `<i style="left:${Math.random() * 100}%;--d:${(2.6 + Math.random() * 2.4).toFixed(2)}s;--w:${(Math.random() * 1.6).toFixed(2)}s;--s:${(18 + Math.random() * 22) | 0}px;--x:${((Math.random() - .5) * 160) | 0}px;--r:${((Math.random() - .5) * 720) | 0}deg">${FL[(Math.random() * FL.length) | 0]}</i>`;
    }
    y.innerHTML = `<div class="yrain">${rain}</div>
      <div class="ycard">${deerHtml('ydeer')}
      <div class="ybig">Yaaaay ! 🎉</div><div class="ysub">On est heureux, Mimi l’ghzala 🌸</div>
      <small>Omar va être trop fier de toi 🤍</small></div>`;
    document.body.appendChild(y);
    // a burst of flowers from the slider too
    const r = box.querySelector('.gz-deer').getBoundingClientRect();
    for (let i = 0; i < 18; i++) {
      const s = document.createElement('span'); s.className = 'gz-burst';
      s.textContent = FL[(Math.random() * FL.length) | 0];
      s.style.left = r.left + r.width / 2 + 'px'; s.style.top = r.top + r.height / 2 + 'px';
      const a = Math.random() * Math.PI * 2, d = 50 + Math.random() * 90;
      s.style.setProperty('--bx', Math.cos(a) * d + 'px'); s.style.setProperty('--by', Math.sin(a) * d - 40 + 'px');
      document.body.appendChild(s); setTimeout(() => s.remove(), 1400);
    }
    y.onclick = () => y.remove();
    setTimeout(() => { y.classList.add('out'); setTimeout(() => y.remove(), 600); }, small ? 3200 : 5500);
  }

  // ---- not happy: tell her Omar knows, ask why ----
  function askWhy(v) {
    document.querySelector('#gzSad')?.remove();
    const w = document.createElement('div'); w.id = 'gzSad';
    w.innerHTML = `<div class="gzcard">
      <button class="gx" title="Fermer">✕</button>
      <div class="gzhead">🥺💌</div>
      <h3>Je préviens Omar tout de suite</h3>
      <p class="gzsub">Il est au courant maintenant. Dis-nous ce qui ne va pas, on va arranger ça ensemble 🤍</p>
      <label>Pourquoi tu n’es pas contente ?<textarea data-k="why" rows="2" placeholder="Ce qui te dérange en ce moment…"></textarea></label>
      <label>D’où vient ton anxiété ?<textarea data-k="anxiety" rows="2" placeholder="Le temps, l’encadrant, une partie du mémoire, autre chose…"></textarea></label>
      <label>Qu’est-ce qu’il faut améliorer ?<textarea data-k="improve" rows="2" placeholder="Dans le travail, dans le site, dans l’aide…"></textarea></label>
      <div class="gzbtns"><button class="gzlater">Plus tard</button><button class="gzsend">Envoyer à Omar 💌</button></div>
    </div>`;
    document.body.appendChild(w);
    const close = () => w.remove();
    w.querySelector('.gx').onclick = close;
    w.querySelector('.gzlater').onclick = close;
    w.querySelector('textarea').focus();
    w.querySelector('.gzsend').onclick = () => {
      const a = { score: v, stage: 'answers' };
      w.querySelectorAll('textarea').forEach((t) => { a[t.dataset.k] = t.value; });
      if (!a.why.trim() && !a.anxiety.trim() && !a.improve.trim()) { w.querySelector('textarea').focus(); return; }
      send(a);
      const [h, p] = THANKS[(Math.random() * THANKS.length) | 0];
      w.querySelector('.gzcard').innerHTML = `<div class="gzhead">🤍</div><h3>${h}</h3>
        <p class="gzsub">${p}</p>
        <div class="gzbtns"><button class="gzsend">D’accord 🌷</button></div>`;
      w.querySelector('.gzsend').onclick = close;
    };
  }
})();
