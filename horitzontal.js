// ===== Vista horitzontal per a ordinador =====
// Vista oficial per a pantalles d'ordinador (1024 px o més). Al mòbil i la tauleta, la web és vertical.
(() => {
  const root = document.documentElement;
  const mq = window.matchMedia('(min-width: 1024px)');
  // Si la finestra creua el límit (p. ex. es fa més petita), es torna a carregar amb la vista que toca
  mq.addEventListener?.('change', () => location.reload());
  if (!root.classList.contains('layout-h')) return;
  const main = document.getElementById('main-content');
  if (!main) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const t = s => (window.__t ? window.__t(s) : s);

  const panels = [...main.children].filter(el => el.matches('header, section'));
  const footer = document.querySelector('body > footer');
  if (footer && panels.length) panels[panels.length - 1].appendChild(footer);
  const label = p => {
    if (p.id === 'inici') return 'Inici';
    const link = document.querySelector(`#desktopNav a[href="#${p.id}"]`);
    return link?.dataset.label || p.querySelector('h1, h2')?.textContent.trim() || '';
  };

  // Controls
  const meter = document.createElement('div');
  meter.className = 'h-meter'; meter.setAttribute('aria-hidden', 'true');
  meter.innerHTML = '<span class="h-meter-count"></span><span class="h-meter-bar"><span class="h-meter-fill"></span></span>';
  const next = document.createElement('button');
  next.type = 'button'; next.className = 'h-next';
  next.innerHTML = '<span><small>Continua</small><span class="h-next-name"></span></span><span class="h-next-arrow" aria-hidden="true">→</span><span class="h-next-fill"></span>';
  document.body.append(meter, next);
  const count = meter.querySelector('.h-meter-count'), fill = meter.querySelector('.h-meter-fill');
  const nextName = next.querySelector('.h-next-name'), nextFill = next.querySelector('.h-next-fill');


  const width = () => main.clientWidth;
  const index = () => Math.round(main.scrollLeft / width());
  const current = () => panels[Math.min(panels.length - 1, Math.max(0, index()))];
  const atEnd = p => p.scrollTop + p.clientHeight >= p.scrollHeight - 2;
  const atStart = p => p.scrollTop <= 1;

  // Lliscament horitzontal amb corba pròpia (el "smooth" del navegador no deixa triar-la)
  let gliding = false;
  const ease = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  function glideTo(i) {
    i = Math.max(0, Math.min(panels.length - 1, i));
    const from = main.scrollLeft, to = panels[i].offsetLeft;
    panels.forEach((p, k) => p.classList.toggle('h-away', k !== i));
    if (reduced || Math.abs(to - from) < 2) { main.scrollLeft = to; update(); return Promise.resolve(); }
    gliding = true; main.classList.add('is-gliding');
    const dur = Math.min(1100, 520 + Math.abs(to - from) / width() * 140);
    const start = performance.now();
    return new Promise(resolve => {
      const step = now => {
        const k = Math.min(1, (now - start) / dur);
        main.scrollLeft = from + (to - from) * ease(k);
        if (k < 1) requestAnimationFrame(step);
        else { gliding = false; main.classList.remove('is-gliding'); update(); resolve(); }
      };
      requestAnimationFrame(step);
    });
  }

  // La roda: primer es llegeix el panell cap avall; al final, cal "empènyer" una mica per passar al següent
  const THRESHOLD = 260;
  let push = 0, pushTimer, lockUntil = 0;
  const nestedCanScroll = (e, dy) => {
    for (const el of e.composedPath()) {
      if (!(el instanceof Element) || panels.includes(el) || el === main) break;
      const s = getComputedStyle(el);
      if (!/(auto|scroll)/.test(s.overflowY) || el.scrollHeight <= el.clientHeight + 1) continue;
      if (dy > 0 ? !atEnd(el) : !atStart(el)) return true;
    }
    return false;
  };
  main.addEventListener('wheel', e => {
    if (!mq.matches || e.ctrlKey) return;
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;           // lliscament lateral del trackpad: natiu
    const dy = e.deltaMode === 1 ? e.deltaY * 32 : e.deltaY;
    const p = current();
    if (gliding || performance.now() < lockUntil) { if ((dy > 0 && atEnd(p)) || (dy < 0 && atStart(p))) e.preventDefault(); return; }
    if (nestedCanScroll(e, dy)) return;
    const edge = dy > 0 ? atEnd(p) : atStart(p);
    if (!edge) { push = 0; paintPush(); return; }
    e.preventDefault();
    push += dy;
    clearTimeout(pushTimer);
    pushTimer = setTimeout(() => { push = 0; paintPush(); }, 380);
    paintPush();
    if (Math.abs(push) >= THRESHOLD) {
      const dir = push > 0 ? 1 : -1;
      push = 0; paintPush();
      const target = index() + dir;
      if (target < 0 || target >= panels.length) return;
      if (dir < 0) panels[target].scrollTop = panels[target].scrollHeight;   // tornes enrere i continues on ho havies deixat
      else panels[target].scrollTop = 0;
      lockUntil = performance.now() + 900;
      glideTo(target);
    }
  }, { passive: false });

  function paintPush() { nextFill.style.transform = `scaleX(${Math.min(1, Math.max(0, push) / THRESHOLD)})`; }

  next.addEventListener('click', () => { const i = index() + 1; if (i < panels.length) { panels[i].scrollTop = 0; glideTo(i); } });

  // Teclat: fletxes laterals per canviar de panell
  document.addEventListener('keydown', e => {
    if (!mq.matches || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.target.closest('input, textarea, select, [contenteditable], .quiz-theatre')) return;
    if (document.documentElement.classList.contains('presenting')) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); glideTo(index() + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); glideTo(index() - 1); }
  });

  // Enllaços interns (moll, botons…): llisca fins al panell i després baixa fins a l'element
  document.addEventListener('click', e => {
    if (!mq.matches) return;
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute('href').length < 2) return;
    const target = document.getElementById(a.getAttribute('href').slice(1));
    const panel = target && panels.find(p => p.contains(target));
    if (!panel) return;
    e.preventDefault(); e.stopImmediatePropagation();
    const i = panels.indexOf(panel);
    const offset = target === panel ? 0 : target.getBoundingClientRect().top - panel.getBoundingClientRect().top + panel.scrollTop - 24;
    if (i !== index()) panel.scrollTop = Math.max(0, offset);
    glideTo(i).then(() => { if (target !== panel) panel.scrollTo({ top: Math.max(0, offset), behavior: reduced ? 'instant' : 'smooth' }); });
    try { history.replaceState(null, '', a.getAttribute('href')); } catch (e) {}   // dins d'una vista prèvia (iframe) no es pot canviar l'adreça
  }, true);

  // La resta de la web escolta el "scroll" de la finestra (línia del temps, efectes…)
  let queued = false;
  function update() {
    queued = false;
    const i = index(), p = current();
    const local = p.scrollHeight > p.clientHeight ? p.scrollTop / (p.scrollHeight - p.clientHeight) : 1;
    fill.style.transform = `scaleX(${(i + local) / panels.length})`;
    count.textContent = `${String(i + 1).padStart(2, '0')} / ${String(panels.length).padStart(2, '0')} · ${t(label(p))}`;
    const bar = document.getElementById('readingProgress');
    if (bar) bar.style.transform = `scaleX(${(i + local) / panels.length})`;
    const nxt = panels[i + 1];
    const show = !!nxt && atEnd(p) && !gliding;
    next.classList.toggle('is-on', show);
    if (nxt) nextName.textContent = t(label(nxt));
    if (!gliding) panels.forEach((q, k) => q.classList.toggle('h-away', k !== i));
  }
  const onScroll = () => {
    window.dispatchEvent(new Event('scroll'));
    if (!queued) { queued = true; requestAnimationFrame(update); }
  };
  main.addEventListener('scroll', onScroll, { passive: true });
  panels.forEach(p => p.addEventListener('scroll', onScroll, { passive: true }));
  window.addEventListener('resize', () => { main.scrollLeft = panels[index()].offsetLeft; update(); });
  // Si l'adreça porta un #, ves-hi
  if (location.hash) { const el = document.getElementById(location.hash.slice(1)); if (el) setTimeout(() => el.scrollIntoView({ block: 'start', inline: 'start' }), 50); }
  update();
})();
