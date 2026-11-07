// ===== Música de fons: tema original de "menú de videojoc tranquil" (bossa amb swing), fet en directe amb Web Audio =====
// No fa servir cap cançó existent. Comença amb el primer gest de l'usuari i es controla des del panell de so (botó ♪).
(() => {
  const KEY = 'cervesa-musica', VOL_KEY = 'cervesa-musica-volum';
  const btn = document.getElementById('musicBtn');
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) { btn?.remove(); return; }
  let wanted = true, volume = .6;
  try {
    wanted = localStorage.getItem(KEY) !== 'off';
    const v = parseFloat(localStorage.getItem(VOL_KEY)); if (!Number.isNaN(v)) volume = Math.min(1, Math.max(0, v));
  } catch (e) {}

  let ctx = null, master = null, bus = null, timer = 0, playing = false, noiseBuf = null;
  const BPM = 112, BEAT = 60 / BPM, BAR = BEAT * 4, EIGHTH = BEAT / 2, SWING = .62;
  const N = n => { const m = /^([A-G])(#|b)?(\d)$/.exec(n); const s = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0); return 12 * (+m[3] + 1) + s; };
  const hz = m => 440 * Math.pow(2, (m - 69) / 12);
  const at8 = (t, e) => t + Math.floor(e / 2) * BEAT + (e % 2 ? BEAT * SWING : 0);   // corxeres amb swing

  // Harmonia (16 compassos): dos acords per compàs quan cal
  const PROG = [
    ['Cmaj7'], ['A7'], ['Dm7'], ['G7'], ['Em7'], ['A7'], ['Dm7', 'G7'], ['Cmaj7'],
    ['Fmaj7'], ['Fm6'], ['Em7'], ['A7'], ['Dm7'], ['G7'], ['Dm7', 'G7'], ['C6']
  ];
  const CH = {
    Cmaj7: ['C', ['E4', 'G4', 'B4', 'D5']], A7: ['A', ['C#4', 'G4', 'B4', 'E5']], Dm7: ['D', ['F4', 'A4', 'C5', 'E5']],
    G7: ['G', ['F4', 'B4', 'D5', 'E5']], Em7: ['E', ['G4', 'B4', 'D5', 'F#5']], Fmaj7: ['F', ['A4', 'C5', 'E5', 'G5']],
    Fm6: ['F', ['Ab4', 'C5', 'D5', 'F5']], C6: ['C', ['E4', 'G4', 'A4', 'D5']]
  };
  // Melodia original: [corxera d'inici, nota, durada en corxeres]
  const MEL = [
    [[0, 'E5', 1], [1, 'G5', 1], [3, 'B5', 2], [6, 'A5', 1], [7, 'G5', 1]],
    [[0, 'E5', 2], [3, 'C#5', 1], [4, 'E5', 1], [5, 'G5', 2]],
    [[0, 'F5', 1], [1, 'A5', 1], [3, 'C6', 2], [6, 'B5', 1], [7, 'A5', 1]],
    [[0, 'G5', 3], [4, 'F5', 1], [5, 'D5', 1], [6, 'B4', 2]],
    [[0, 'E5', 1], [1, 'G5', 1], [3, 'B5', 2], [6, 'D6', 1], [7, 'B5', 1]],
    [[0, 'C#6', 2], [3, 'A5', 1], [4, 'G5', 1], [5, 'E5', 2]],
    [[0, 'F5', 1], [1, 'E5', 1], [2, 'D5', 1], [3, 'F5', 1], [4, 'B5', 2], [6, 'A5', 1], [7, 'G5', 1]],
    [[0, 'E5', 4], [5, 'G4', 1], [6, 'A4', 1], [7, 'B4', 1]],
    [[0, 'C5', 1], [1, 'E5', 1], [3, 'A5', 2], [6, 'G5', 1], [7, 'E5', 1]],
    [[0, 'Ab5', 2], [3, 'F5', 1], [4, 'D5', 1], [5, 'C5', 2]],
    [[0, 'B4', 1], [1, 'D5', 1], [3, 'G5', 2], [6, 'F#5', 1], [7, 'E5', 1]],
    [[0, 'G5', 2], [2, 'E5', 1], [3, 'C#5', 1], [4, 'E5', 2], [6, 'A5', 2]],
    [[0, 'A5', 1], [1, 'F5', 1], [3, 'D5', 2], [6, 'E5', 1], [7, 'F5', 1]],
    [[0, 'B5', 1], [1, 'A5', 1], [2, 'G5', 1], [3, 'F5', 1], [4, 'D5', 2], [6, 'G5', 2]],
    [[0, 'F5', 1], [1, 'E5', 1], [2, 'D5', 1], [3, 'C5', 1], [4, 'B4', 1], [5, 'D5', 1], [6, 'G5', 2]],
    [[0, 'C6', 3], [4, 'G5', 1], [5, 'E5', 1], [6, 'C5', 2]]
  ];
  let bar = 0, nextBar = 0;

  function build() {
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0;
    const tone = ctx.createBiquadFilter(); tone.type = 'lowpass'; tone.frequency.value = 5200;
    master.connect(tone); tone.connect(ctx.destination);
    bus = ctx.createGain(); bus.connect(master);
    const rev = ctx.createDelay(1); rev.delayTime.value = BEAT * .5;   // petit eco per a la melodia
    const fb = ctx.createGain(); fb.gain.value = .22;
    const wet = ctx.createGain(); wet.gain.value = .16;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2600;
    bus.connect(rev); rev.connect(lp); lp.connect(fb); fb.connect(rev); lp.connect(wet); wet.connect(master);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }

  // Vibràfon (melodia): fonamental + parcial agut, amb una mica de trèmolo
  function vibes(t, m, len) {
    const g = ctx.createGain(), trem = ctx.createOscillator(), tg = ctx.createGain();
    trem.frequency.value = 5.2; tg.gain.value = .012; trem.connect(tg); tg.connect(g.gain);
    [[1, .07], [4, .012], [2.01, .01]].forEach(([mult, v]) => {
      const o = ctx.createOscillator(), og = ctx.createGain();
      o.type = 'sine'; o.frequency.value = hz(m) * mult;
      og.gain.setValueAtTime(.0001, t); og.gain.exponentialRampToValueAtTime(v, t + .008); og.gain.exponentialRampToValueAtTime(.0001, t + Math.max(.5, len * 1.6));
      o.connect(og); og.connect(g); o.start(t); o.stop(t + Math.max(.5, len * 1.6) + .05);
    });
    g.gain.value = 1; g.connect(bus); trem.start(t); trem.stop(t + len * 1.6 + .1);
  }
  // Piano elèctric (acords curts, amb swing)
  function keys(t, notes, len, vol) {
    notes.forEach((n, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain(), o2 = ctx.createOscillator(), g2 = ctx.createGain();
      o.type = 'triangle'; o.frequency.value = hz(N(n)); o.detune.value = (Math.random() - .5) * 6;
      o2.type = 'sine'; o2.frequency.value = hz(N(n)) * 2;
      const a = t + i * .008;
      g.gain.setValueAtTime(.0001, a); g.gain.exponentialRampToValueAtTime(vol, a + .01); g.gain.exponentialRampToValueAtTime(.0001, a + len);
      g2.gain.setValueAtTime(.0001, a); g2.gain.exponentialRampToValueAtTime(vol * .2, a + .01); g2.gain.exponentialRampToValueAtTime(.0001, a + len * .5);
      o.connect(g); g.connect(master); o2.connect(g2); g2.connect(master);
      o.start(a); o.stop(a + len + .05); o2.start(a); o2.stop(a + len + .05);
    });
  }
  // Contrabaix pizzicato
  function bass(t, m) {
    const o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    o.type = 'triangle'; o.frequency.setValueAtTime(hz(m) * 1.01, t); o.frequency.exponentialRampToValueAtTime(hz(m), t + .04);
    f.type = 'lowpass'; f.frequency.value = 600;
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.2, t + .012); g.gain.exponentialRampToValueAtTime(.0001, t + BEAT * .95);
    o.connect(f); f.connect(g); g.connect(master); o.start(t); o.stop(t + BEAT);
  }
  function noise(t, type, freq, vol, len, q = .8) {
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuf; f.type = type; f.frequency.value = freq; f.Q.value = q;
    g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(vol, t + len * .25); g.gain.exponentialRampToValueAtTime(.0001, t + len);
    s.connect(f); f.connect(g); g.connect(master); s.start(t, Math.random() * .5); s.stop(t + len + .02);
  }
  function rim(t) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'square'; o.frequency.value = 1700;
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.025, t + .002); g.gain.exponentialRampToValueAtTime(.0001, t + .04);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + .05);
  }

  const rootMidi = (name, oct) => N(CH[name][0] + oct);
  function walk(t, chords, nextChord) {
    // 4 negres: fonamental, 3a/5a, 5a/6a i nota cromàtica cap al següent acord
    const r = rootMidi(chords[0], 2);
    const r2 = chords[1] ? rootMidi(chords[1], 2) : null;
    const nextR = rootMidi(nextChord, 2);
    const seq = r2 ? [r, r + 7, r2, r2 + 7 > nextR + 3 ? nextR + 1 : r2 + 4] : [r, r + 4, r + 7, nextR + (Math.random() < .5 ? 1 : -1)];
    seq.forEach((m, i) => bass(t + i * BEAT, m));
  }

  function scheduleBar(t) {
    const i = bar % PROG.length;
    const chords = PROG[i], next = PROG[(i + 1) % PROG.length][0];
    // Acords amb swing: temps 1 i "i" del 2 (o un acord per meitat)
    if (chords.length === 1) { keys(t, CH[chords[0]][1], BEAT * 1.2, .028); keys(at8(t, 3), CH[chords[0]][1], BEAT * 1.6, .024); }
    else { keys(t, CH[chords[0]][1], BEAT * 1.4, .028); keys(at8(t, 4), CH[chords[1]][1], BEAT * 1.6, .026); }
    walk(t, chords, next);
    // Escombretes i baqueta al cèrcol
    for (let b = 0; b < 4; b++) noise(t + b * BEAT, 'bandpass', 3200, b % 2 ? .02 : .012, BEAT * .7, .6);
    rim(t + BEAT); rim(t + BEAT * 3);
    if (bar % 4 === 3) rim(at8(t, 7));
    // Melodia (la segona volta, un pèl més suau i amb alguna nota una octava amunt)
    const lap = Math.floor(bar / PROG.length) % 2;
    MEL[i].forEach(([e, n, dur]) => vibes(at8(t, e), N(n) + (lap && e === 0 && i % 4 === 0 ? 12 : 0), dur * EIGHTH));
    bar++;
  }

  // ===== Tema del concurs: música èpica de plató de televisió (original), en re menor =====
  const QBPM = 128, QB = 60 / QBPM, QBAR = QB * 4, Q16 = QB / 4;
  const QPROG = ['Dm', 'Dm', 'Bb', 'C', 'Gm', 'A', 'Dm', 'A'];
  const QCH = { Dm: [50, 53, 57], Bb: [46, 50, 53], C: [48, 52, 55], Gm: [43, 46, 50], A: [45, 49, 52] };
  const QLEAD = [
    [[0, 'D5', 4], [4, 'F5', 2], [6, 'A5', 2]], [[0, 'D6', 6], [6, 'C6', 1], [7, 'A5', 1]],
    [[0, 'Bb5', 4], [4, 'A5', 2], [6, 'F5', 2]], [[0, 'G5', 6], [6, 'E5', 2]],
    [[0, 'G5', 2], [2, 'Bb5', 2], [4, 'D6', 4]], [[0, 'C#6', 4], [4, 'E6', 4]],
    [[0, 'D6', 4], [4, 'A5', 2], [6, 'F5', 2]], [[0, 'E5', 4], [4, 'C#5', 4]]
  ];
  function synth(t, freq, len, vol, type, cutoff, dest, attack = .005) {
    const o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    o.type = type; o.frequency.value = freq;
    f.type = 'lowpass'; f.frequency.setValueAtTime(cutoff, t); f.frequency.exponentialRampToValueAtTime(Math.max(200, cutoff * .35), t + len);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + attack); g.gain.exponentialRampToValueAtTime(.0001, t + len);
    o.connect(f); f.connect(g); g.connect(dest || master); o.start(t); o.stop(t + len + .05);
    return o;
  }
  function qKick(t, v = .3) { const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(45, t + .14); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .004); g.gain.exponentialRampToValueAtTime(.0001, t + .3); o.connect(g); g.connect(master); o.start(t); o.stop(t + .32); }
  function qTimp(t, v) { const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.setValueAtTime(hz(38) * 1.04, t); o.frequency.exponentialRampToValueAtTime(hz(38), t + .08); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .008); g.gain.exponentialRampToValueAtTime(.0001, t + .6); o.connect(g); g.connect(master); o.start(t); o.stop(t + .65); noise(t, 'lowpass', 400, v * .5, .2); }
  function scheduleQuizBar(t) {
    const i = bar % 16, c = QPROG[i % 8], ch = QCH[c];
    const lead = i >= 8;
    // Pad de cordes
    ch.forEach(n => synth(t, hz(n + 12), QBAR * 1.02, .016, 'sawtooth', 1100, null, .25));
    // Ostinato de cordes en semicorxeres
    const pat = [0, 12, 7, 12];
    for (let s = 0; s < 16; s++) synth(t + s * Q16, hz(ch[0] + pat[s % 4]), Q16 * .9, s % 4 === 0 ? .03 : .02, 'sawtooth', 1600);
    // Baix en corxeres
    for (let e = 0; e < 8; e++) synth(t + e * QB / 2, hz(ch[0] - 12), QB * .45, .09, 'square', 380);
    // Metalls: cops d'acord
    [0, 2.75].forEach(b => ch.forEach(n => synth(t + b * QB, hz(n + 12), QB * .5, .028, 'sawtooth', 2600)));
    if (i % 2 === 1) ch.forEach(n => synth(t + 3.5 * QB, hz(n + 12), QB * .3, .024, 'square', 2200));
    // Bateria
    for (let b = 0; b < 4; b++) qKick(t + b * QB, b % 2 ? .22 : .3);
    [1, 3].forEach(b => { noise(t + b * QB, 'bandpass', 1900, .09, .16, 1); synth(t + b * QB, 190, .1, .05, 'triangle', 900); });
    for (let s = 0; s < 16; s += 2) noise(t + s * Q16, 'highpass', 8000, s % 4 ? .01 : .018, .04);
    if (i % 8 === 0) noise(t, 'highpass', 5000, .06, 1.8, .5);   // plat al començar cada frase
    if (i % 4 === 3) for (let s = 8; s < 16; s++) qTimp(t + s * Q16, .05 + (s - 8) * .02);   // redoble de timbal
    // Melodia heroica (segona meitat)
    if (lead) QLEAD[i % 8].forEach(([e, n, d]) => {
      const o = synth(t + e * QB / 2, hz(N(n)), d * QB / 2 * .95, .032, 'sawtooth', 3000, bus, .02);
      const v = ctx.createOscillator(), vg = ctx.createGain(); v.frequency.value = 5.5; vg.gain.value = 4; v.connect(vg); vg.connect(o.detune); v.start(t + e * QB / 2); v.stop(t + (e + d) * QB / 2);
    });
    bar++;
  }
  let theme = 'menu';
  const barLen = () => theme === 'quiz' ? QBAR : BAR;
  function tick() { while (nextBar < ctx.currentTime + .3) { (theme === 'quiz' ? scheduleQuizBar : scheduleBar)(nextBar); nextBar += barLen(); } }

  const target = () => (theme === 'quiz' ? .42 : .5) * volume;
  function setTheme(next) {
    if (next === theme) return;
    if (!ctx || !playing) { theme = next; bar = 0; return; }
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(0, now + .5);
    setTimeout(() => {
      if (!playing) return;
      theme = next; bar = 0;
      // descarta el que ja estava programat de l'altre tema i torna a començar
      nextBar = ctx.currentTime + .05;
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(0, ctx.currentTime);
      master.gain.linearRampToValueAtTime(target(), ctx.currentTime + 1.2);
    }, 560);
  }
  // Quan el concurs és a la vista, sona el tema del plató
  const quizSection = document.getElementById('quiz');
  if (quizSection && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => setTheme(entry.isIntersecting ? 'quiz' : 'menu'), { rootMargin: '-35% 0px -35% 0px', threshold: 0 }).observe(quizSection);
  }
  function start() {
    if (!ctx) build();
    ctx.resume();
    if (playing) return;
    playing = true;
    nextBar = ctx.currentTime + .1;
    clearInterval(timer); timer = setInterval(tick, 50); tick();
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
    master.gain.linearRampToValueAtTime(target(), ctx.currentTime + 3);
    paint();
  }
  function stop() {
    if (!ctx || !playing) { playing = false; paint(); return; }
    playing = false;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0, ctx.currentTime + .6);
    setTimeout(() => { if (!playing) { clearInterval(timer); ctx.suspend(); } }, 700);
    paint();
  }
  function setVolume(v) {
    volume = Math.min(1, Math.max(0, v));
    try { localStorage.setItem(VOL_KEY, String(volume)); } catch (e) {}
    if (ctx && playing) master.gain.setTargetAtTime(target(), ctx.currentTime, .05);
  }

  // ----- Panell de so: activar/desactivar música i reguladors de volum -----
  const panel = document.createElement('div');
  panel.className = 'sound-panel'; panel.id = 'soundPanel'; panel.hidden = true;
  panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'Opcions de so');
  panel.innerHTML = `
    <p class="sound-title">Àudio</p>
    <button class="sound-toggle" id="musicToggle" type="button" aria-pressed="true"><span class="sound-toggle-dot" aria-hidden="true"></span><span class="sound-toggle-text">Desactiva la música</span></button>
    <label class="sound-row"><span>Música</span><input type="range" id="musicVolume" min="0" max="100" step="1"></label>
    <label class="sound-row"><span>Efectes</span><input type="range" id="fxVolume" min="0" max="100" step="1"></label>`;
  document.body.appendChild(panel);
  const toggle = panel.querySelector('#musicToggle'), toggleText = panel.querySelector('.sound-toggle-text');
  const musicRange = panel.querySelector('#musicVolume'), fxRange = panel.querySelector('#fxVolume');
  musicRange.value = Math.round(volume * 100);
  fxRange.value = Math.round((window.__getFxVolume ? window.__getFxVolume() : .8) * 100);
  const paintRange = r => r.style.setProperty('--val', r.value + '%');
  [musicRange, fxRange].forEach(paintRange);
  musicRange.addEventListener('input', () => { paintRange(musicRange); setVolume(musicRange.value / 100); if (!playing && musicRange.value > 0 && wanted) start(); });
  fxRange.addEventListener('input', () => { paintRange(fxRange); window.__setFxVolume && window.__setFxVolume(fxRange.value / 100); });
  toggle.addEventListener('click', () => {
    wanted = !playing;
    try { localStorage.setItem(KEY, wanted ? 'on' : 'off'); } catch (e) {}
    wanted ? start() : stop();
  });

  const place = () => {
    const r = btn.getBoundingClientRect(), w = panel.offsetWidth, h = panel.offsetHeight;
    const left = Math.min(window.innerWidth - w - 10, Math.max(10, r.left + r.width / 2 - w / 2));
    const above = r.top - h - 12;
    panel.style.left = left + 'px';
    panel.style.top = (above > 10 ? above : r.bottom + 12) + 'px';
    panel.style.transformOrigin = `${r.left + r.width / 2 - left}px ${above > 10 ? '100%' : '0%'}`;
  };
  const open = () => { panel.hidden = false; place(); requestAnimationFrame(() => panel.classList.add('is-open')); btn.setAttribute('aria-expanded', 'true'); };
  const close = () => { panel.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); setTimeout(() => { if (!panel.classList.contains('is-open')) panel.hidden = true; }, 160); };
  btn?.setAttribute('aria-haspopup', 'dialog'); btn?.setAttribute('aria-controls', 'soundPanel'); btn?.setAttribute('aria-expanded', 'false');
  btn?.addEventListener('click', e => { e.stopPropagation(); panel.hidden ? open() : close(); });
  document.addEventListener('click', e => { if (!panel.hidden && !panel.contains(e.target) && e.target !== btn) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) { close(); btn.focus(); } });
  window.addEventListener('resize', () => { if (!panel.hidden) place(); });

  function paint() {
    btn?.classList.toggle('is-playing', playing);
    btn?.setAttribute('aria-label', 'Opcions de so'); if (btn) btn.title = 'Opcions de so';
    toggle.setAttribute('aria-pressed', String(playing));
    toggleText.textContent = playing ? 'Desactiva la música' : 'Activa la música';
  }

  // El primer toc a la pàgina l'engega (si no l'han apagat abans); amb el got, després del raig
  const first = e => {
    if (e.target.closest && e.target.closest('#musicBtn, #soundPanel')) return;
    window.removeEventListener('pointerdown', first, true);
    window.removeEventListener('keydown', first, true);
    if (wanted && volume > 0) setTimeout(start, e.target.closest && e.target.closest('#onboardingGlass') ? 1600 : 0);
  };
  window.addEventListener('pointerdown', first, true);
  window.addEventListener('keydown', first, true);

  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) ctx.suspend();
    else if (playing) ctx.resume();
  });
  paint();
})();
