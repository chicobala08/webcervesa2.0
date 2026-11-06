window.__I18N_PATTERNS = (() => {
      const dot = s => s.replace(',', '.');
      const det = (s, t, L) => s.split(' · ').map(p => {
        let m = p.match(/^(\w): (\d+) als reactius i (\d+) als productes$/);
        if (m) return ({ es: `${m[1]}: ${m[2]} en los reactivos y ${m[3]} en los productos`, en: `${m[1]}: ${m[2]} in the reactants and ${m[3]} in the products`, de: `${m[1]}: ${m[2]} in den Edukten und ${m[3]} in den Produkten`, zh: `${m[1]}：反应物中 ${m[2]} 个，产物中 ${m[3]} 个` })[L];
        m = p.match(/^(\w): has escrit (\d+) i (\d+), però el càlcul dona (\d+) i (\d+)$/);
        if (m) return ({ es: `${m[1]}: has escrito ${m[2]} y ${m[3]}, pero el cálculo da ${m[4]} y ${m[5]}`, en: `${m[1]}: you wrote ${m[2]} and ${m[3]}, but the calculation gives ${m[4]} and ${m[5]}`, de: `${m[1]}: Du hast ${m[2]} und ${m[3]} geschrieben, aber die Rechnung ergibt ${m[4]} und ${m[5]}`, zh: `${m[1]}：你写的是 ${m[2]} 和 ${m[3]}，但计算结果是 ${m[4]} 和 ${m[5]}` })[L];
        return p;
      }).join(L === 'zh' ? '；' : ' · ');
      const P = (re, es, en, de, zh) => ({ re, es, en, de, zh });
      return [
        P(/^Pregunta (\d+) de (\d+)$/, m => `Pregunta ${m[1]} de ${m[2]}`, m => `Question ${m[1]} of ${m[2]}`, m => `Frage ${m[1]} von ${m[2]}`, m => `第 ${m[1]} 题，共 ${m[2]} 题`),
        P(/^(\d+) encerts$/, m => `${m[1]} aciertos`, m => `${m[1]} correct`, m => `${m[1]} richtig`, m => `答对 ${m[1]} 题`),
        P(/^(\d+)\/(\d+) encerts$/, m => `${m[1]}/${m[2]} aciertos`, m => `${m[1]}/${m[2]} correct`, m => `${m[1]}/${m[2]} richtig`, m => `答对 ${m[1]}/${m[2]}`),
        P(/^(\d+) de (\d+)$/, m => `${m[1]} de ${m[2]}`, m => `${m[1]} of ${m[2]}`, m => `${m[1]} von ${m[2]}`, m => `${m[1]} / ${m[2]}`),
        P(/^Has encertat (\d+) de (\d+) preguntes\.$/, m => `Has acertado ${m[1]} de ${m[2]} preguntas.`, m => `You got ${m[1]} out of ${m[2]} questions right.`, m => `Du hast ${m[1]} von ${m[2]} Fragen richtig beantwortet.`, m => `你答对了 ${m[2]} 题中的 ${m[1]} 题。`),
        P(/^Correcte\. (.+)$/, (m, t) => `Correcto. ${t(m[1])}`, (m, t) => `Correct. ${t(m[1])}`, (m, t) => `Richtig. ${t(m[1])}`, (m, t) => `正确。${t(m[1])}`),
        P(/^La resposta correcta és «(.+)»\. (.+)$/, (m, t) => `La respuesta correcta es «${t(m[1])}». ${t(m[2])}`, (m, t) => `The correct answer is "${t(m[1])}". ${t(m[2])}`, (m, t) => `Die richtige Antwort ist „${t(m[1])}“. ${t(m[2])}`, (m, t) => `正确答案是“${t(m[1])}”。${t(m[2])}`),
        P(/^(\d+) conceptes?$/, m => `${m[1]} ${m[1] === '1' ? 'concepto' : 'conceptos'}`, m => `${m[1]} ${m[1] === '1' ? 'concept' : 'concepts'}`, m => `${m[1]} ${m[1] === '1' ? 'Begriff' : 'Begriffe'}`, m => `${m[1]} 个概念`),
        P(/^(\d+) de (\d+) històries desplegades$/, m => `${m[1]} de ${m[2]} historias abiertas`, m => `${m[1]} of ${m[2]} stories opened`, m => `${m[1]} von ${m[2]} Geschichten geöffnet`, m => `已展开 ${m[1]}/${m[2]} 个故事`),
        P(/^(\d+) \/ (\d+) consultades$/, m => `${m[1]} / ${m[2]} consultadas`, m => `${m[1]} / ${m[2]} read`, m => `${m[1]} / ${m[2]} gelesen`, m => `已查阅 ${m[1]} / ${m[2]}`),
        P(/^(\d+) de (\d+) trobades$/, m => `${m[1]} de ${m[2]} encontradas`, m => `${m[1]} of ${m[2]} found`, m => `${m[1]} von ${m[2]} gefunden`, m => `已找到 ${m[1]}/${m[2]}`),
        P(/^(.+) · Font consultada$/, (m, t) => `${t(m[1])} · Fuente consultada`, (m, t) => `${t(m[1])} · Source read`, (m, t) => `${t(m[1])} · Quelle gelesen`, (m, t) => `${t(m[1])} · 已查阅`),
        P(/^≈ ([\d,]+) % d'alcohol$/, m => `≈ ${m[1]} % de alcohol`, m => `≈ ${dot(m[1])}% alcohol`, m => `≈ ${m[1]} % Alkohol`, m => `≈ ${dot(m[1])}% 酒精`),
        P(/^Malt: encara no quadra! (.+)\. Revisa el recompte i torna-ho a provar\.$/, m => `Malt: ¡todavía no cuadra! ${det(m[1], 0, 'es')}. Revisa el recuento y vuelve a intentarlo.`, m => `Malt: it doesn't add up yet! ${det(m[1], 0, 'en')}. Check the count and try again.`, m => `Malt: Das geht noch nicht auf! ${det(m[1], 0, 'de')}. Prüf die Zählung und versuch es noch einmal.`, m => `麦芽：还没配平！${det(m[1], 0, 'zh')}。检查计数后再试一次。`),
        P(/^Revisa la taula d'àtoms\. (.+)\. Recorda multiplicar tots els subíndexs pel coeficient\.$/, m => `Revisa la tabla de átomos. ${det(m[1], 0, 'es')}. Recuerda multiplicar todos los subíndices por el coeficiente.`, m => `Check the atom table. ${det(m[1], 0, 'en')}. Remember to multiply every subscript by the coefficient.`, m => `Prüf die Atomtabelle. ${det(m[1], 0, 'de')}. Denk daran, alle Indizes mit dem Koeffizienten zu multiplizieren.`, m => `检查原子表。${det(m[1], 0, 'zh')}。记住要把所有下标乘以系数。`),
        P(/^El recompte de la taula és correcte, però l'equació encara no està equilibrada\. (.+)\. Ajusta els coeficients\.$/, m => `El recuento de la tabla es correcto, pero la ecuación aún no está equilibrada. ${det(m[1], 0, 'es')}. Ajusta los coeficientes.`, m => `The table count is correct, but the equation isn't balanced yet. ${det(m[1], 0, 'en')}. Adjust the coefficients.`, m => `Die Zählung in der Tabelle stimmt, aber die Gleichung ist noch nicht ausgeglichen. ${det(m[1], 0, 'de')}. Passe die Koeffizienten an.`, m => `表中的计数正确，但方程式还没有配平。${det(m[1], 0, 'zh')}。请调整系数。`),
        P(/^La reacció està equilibrada, però els coeficients no estan simplificats\. Tenen un divisor comú \((\d+)\); divideix-los per \d+ per obtenir la proporció en nombres enters més petits\.$/, m => `La reacción está equilibrada, pero los coeficientes no están simplificados. Tienen un divisor común (${m[1]}); divídelos entre ${m[1]} para obtener la proporción con los números enteros más pequeños.`, m => `The reaction is balanced, but the coefficients aren't simplified. They share a common divisor (${m[1]}); divide them by ${m[1]} to get the ratio in the smallest whole numbers.`, m => `Die Reaktion ist ausgeglichen, aber die Koeffizienten sind nicht gekürzt. Sie haben einen gemeinsamen Teiler (${m[1]}); teile sie durch ${m[1]}, um das Verhältnis mit den kleinsten ganzen Zahlen zu erhalten.`, m => `反应已配平，但系数没有化简。它们有公约数（${m[1]}）；把它们都除以 ${m[1]}，得到最小整数比。`),
        P(/^Fórmula preparada: (.+)$/, m => `Fórmula preparada: ${m[1]}`, m => `Formula ready: ${m[1]}`, m => `Formel bereit: ${m[1]}`, m => `化学式已就绪：${m[1]}`),
        P(/^Fórmula generada: (.+)$/, m => `Fórmula generada: ${m[1]}`, m => `Formula built: ${m[1]}`, m => `Formel gebaut: ${m[1]}`, m => `已生成化学式：${m[1]}`),
        P(/^Fórmula generada i comprovació bàsica completada per a (.+)\.$/, m => `Fórmula generada y comprobación básica completada para ${m[1]}.`, m => `Formula built and basic check done for ${m[1]}.`, m => `Formel gebaut und Grundprüfung für ${m[1]} abgeschlossen.`, m => `已生成 ${m[1]} 并完成基本检验。`),
        P(/^S’ha identificat una molècula per a (.+)\.$/, m => `Se ha identificado una molécula para ${m[1]}.`, m => `One molecule identified for ${m[1]}.`, m => `Ein Molekül für ${m[1]} erkannt.`, m => `已为 ${m[1]} 识别出一个分子。`),
        P(/^S’han identificat diverses estructures per a (.+)\.$/, m => `Se han identificado varias estructuras para ${m[1]}.`, m => `Several structures identified for ${m[1]}.`, m => `Mehrere Strukturen für ${m[1]} erkannt.`, m => `已为 ${m[1]} 识别出多种结构。`),
        P(/^No hi ha una molècula identificada amb aquesta fórmula al repertori\. L’índex d’insaturació teòric és (\d+)\. És una comprovació inicial de valència, no una prova que la substància existeixi ni que sigui estable\.$/, m => `No hay ninguna molécula identificada con esta fórmula en el repertorio. El índice de insaturación teórico es ${m[1]}. Es una comprobación inicial de valencia, no una prueba de que la sustancia exista ni de que sea estable.`, m => `No molecule with this formula is listed. The theoretical degree of unsaturation is ${m[1]}. This is only a first valence check, not proof that the substance exists or is stable.`, m => `Für diese Formel ist kein Molekül verzeichnet. Der theoretische Ungesättigtheitsgrad ist ${m[1]}. Das ist nur eine erste Valenzprüfung, kein Beweis, dass der Stoff existiert oder stabil ist.`, m => `列表中没有与此化学式对应的分子。理论不饱和度为 ${m[1]}。这只是初步的价键检验，并不能证明该物质存在或稳定。`),
        P(/^(<b class="atom-dot [\w-]+">\w<\/b><strong>\d+<\/strong><small>)(carbonis|hidrògens|oxígens)(<\/small>)$/, (m, t) => m[1] + t(m[2]) + m[3], (m, t) => m[1] + t(m[2]) + m[3], (m, t) => m[1] + t(m[2]) + m[3], (m, t) => m[1] + t(m[2]) + m[3]),
        P(/^(<i style="--c:#[0-9a-f]+"><\/i>)(.+)$/, (m, t) => m[1] + t(m[2]), (m, t) => m[1] + t(m[2]), (m, t) => m[1] + t(m[2]), (m, t) => m[1] + t(m[2])),
        P(/^<strong>Sabies que…\? <\/strong>(.+)$/, (m, t) => `<strong>${t('Sabies que…?')} </strong>${t(m[1])}`, (m, t) => `<strong>${t('Sabies que…?')} </strong>${t(m[1])}`, (m, t) => `<strong>${t('Sabies que…?')} </strong>${t(m[1])}`, (m, t) => `<strong>${t('Sabies que…?')}</strong>${t(m[1])}`)
      ];
    })();
// ===== Traducció de la pàgina =====
    // El català és l'original. Cada frase es busca al diccionari; les que porten números
    // (comptadors, resultats) passen per patrons. Funciona també amb el text que la pàgina
    // genera quan interactues (concurs, laboratori…).
    (() => {
      const FLAGS = {"ca": "<svg viewBox=\"0 0 9 6\"><rect width=\"9\" height=\"6\" fill=\"#fcdd09\"/><path d=\"M0 1.17h9M0 2.5h9M0 3.83h9M0 5.17h9\" stroke=\"#da121a\" stroke-width=\".67\"/></svg>", "es": "<svg viewBox=\"0 0 3 2\"><rect width=\"3\" height=\"2\" fill=\"#aa151b\"/><rect y=\".5\" width=\"3\" height=\"1\" fill=\"#f1bf00\"/></svg>", "en": "<svg viewBox=\"0 0 60 30\"><clipPath id=\"ukc\"><path d=\"M30 15h30v15zv15H0zH0V0zV0h30z\"/></clipPath><path d=\"M0 0v30h60V0z\" fill=\"#012169\"/><path d=\"M0 0l60 30m0-30L0 30\" stroke=\"#fff\" stroke-width=\"6\"/><path d=\"M0 0l60 30m0-30L0 30\" clip-path=\"url(#ukc)\" stroke=\"#c8102e\" stroke-width=\"4\"/><path d=\"M30 0v30M0 15h60\" stroke=\"#fff\" stroke-width=\"10\"/><path d=\"M30 0v30M0 15h60\" stroke=\"#c8102e\" stroke-width=\"6\"/></svg>", "de": "<svg viewBox=\"0 0 5 3\"><rect width=\"5\" height=\"3\" fill=\"#ffce00\"/><rect width=\"5\" height=\"2\" fill=\"#dd0000\"/><rect width=\"5\" height=\"1\" fill=\"#000\"/></svg>", "zh": "<svg viewBox=\"0 0 30 20\"><rect width=\"30\" height=\"20\" fill=\"#de2910\"/><polygon points=\"5.00,2.00 5.67,4.07 7.85,4.07 6.09,5.35 6.76,7.43 5.00,6.15 3.24,7.43 3.91,5.35 2.15,4.07 4.33,4.07\" fill=\"#ffde00\"/><polygon points=\"9.14,2.51 9.62,1.97 9.25,1.34 9.91,1.63 10.39,1.08 10.33,1.80 11.00,2.09 10.29,2.25 10.22,2.97 9.85,2.35\" fill=\"#ffde00\"/><polygon points=\"11.01,4.14 11.66,3.82 11.56,3.10 12.07,3.62 12.72,3.30 12.38,3.95 12.88,4.47 12.17,4.34 11.83,4.99 11.73,4.27\" fill=\"#ffde00\"/><polygon points=\"11.04,6.73 11.76,6.70 11.96,6.00 12.21,6.68 12.94,6.66 12.37,7.10 12.62,7.79 12.01,7.38 11.44,7.83 11.64,7.13\" fill=\"#ffde00\"/><polygon points=\"9.22,8.38 9.90,8.63 10.35,8.06 10.32,8.79 11.00,9.05 10.30,9.24 10.26,9.96 9.87,9.36 9.16,9.55 9.62,8.98\" fill=\"#ffde00\"/></svg>"};
      const LANGS = [['ca', 'Català'], ['es', 'Castellano'], ['en', 'English'], ['de', 'Deutsch'], ['zh', '中文']];
      const PAT = window.__I18N_PATTERNS || [];
      const RECORD = window.__I18N_RECORD || null;
      const ATTRS = ['aria-label', 'title', 'placeholder', 'alt'];
      const INLINE = new Set(['STRONG', 'B', 'EM', 'I', 'SUB', 'SUP', 'BR', 'SMALL', 'ABBR', 'CODE', 'MARK', 'U']);
      const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'INPUT', 'SELECT', 'OPTION']);
      const norm = s => s.replace(/\s+/g, ' ').trim();
      const hasWords = s => /\p{L}{2}/u.test(s);
      let lang = 'ca';
      let store;
      try { store = localStorage.getItem('cervesa-lang'); } catch (e) { store = null; }

      function lookup(key) {
        if (RECORD) { RECORD.add(key); return key; }
        if (lang === 'ca') return key;
        const d = (window.__I18N_DICT || {})[lang] || {};
        if (Object.prototype.hasOwnProperty.call(d, key)) return d[key];
        for (const p of PAT) {
          const m = key.match(p.re);
          if (m) { const out = p[lang]; if (out) return typeof out === 'function' ? out(m, t) : out; }
        }
        return null;
      }
      // t(): tradueix una frase; si no la troba, la deixa igual
      function t(str) {
        const key = norm(String(str));
        if (!hasWords(key)) return str;
        const r = lookup(key);
        return r == null ? str : r;
      }
      window.__t = t;

      const isInline = el => {
        if (el.id) return false;
        if (INLINE.has(el.tagName)) return true;
        if (el.tagName === 'A') return /^https?:/.test(el.getAttribute('href') || '') && !el.closest('.research-card-actions');
        return false;
      };
      const allInline = el => [...el.querySelectorAll('*')].every(isInline);
      const units = new WeakMap();   // element -> {orig, cur}
      const texts = new WeakMap();   // text node -> {orig, cur}
      const attrs = new WeakMap();   // element -> {attr: {orig, cur}}

      function skipped(node) {
        const el = node.nodeType === 1 ? node : node.parentElement;
        return !el || !!el.closest('[data-i18n-skip], script, style, noscript');
      }
      function unitOf(el) {
        let u = el;
        while (isInline(u) && u.parentElement && u.parentElement !== document.body) u = u.parentElement;
        return u;
      }
      function applyUnit(u) {
        const html = u.innerHTML;
        let st = units.get(u);
        if (!st || html !== st.cur) st = { orig: html };
        const key = norm(st.orig);
        const tr = lang === 'ca' && !RECORD ? st.orig : lookup(key);
        if (tr == null) { units.set(u, st); return false; }
        if (u.innerHTML !== tr) u.innerHTML = tr;
        st.cur = u.innerHTML;
        units.set(u, st);
        return true;
      }
      function applyText(node) {
        const val = node.nodeValue;
        let st = texts.get(node);
        if (!st || val !== st.cur) st = { orig: val };
        const key = norm(st.orig);
        let out = st.orig;
        if (hasWords(key) && (lang !== 'ca' || RECORD)) {
          const tr = lookup(key);
          if (tr != null) {
            const lead = st.orig.match(/^\s*/)[0], trail = st.orig.match(/\s*$/)[0];
            out = lead + tr + trail;
          }
        }
        if (node.nodeValue !== out) node.nodeValue = out;
        st.cur = node.nodeValue;
        texts.set(node, st);
      }
      function applyAttrs(el) {
        let rec = attrs.get(el);
        for (const a of ATTRS) {
          if (!el.hasAttribute(a)) continue;
          const val = el.getAttribute(a);
          rec = rec || {};
          let st = rec[a];
          if (!st || val !== st.cur) st = { orig: val };
          const key = norm(st.orig);
          let out = st.orig;
          if (hasWords(key) && (lang !== 'ca' || RECORD)) { const tr = lookup(key); if (tr != null) out = tr; }
          if (val !== out) el.setAttribute(a, out);
          st.cur = el.getAttribute(a);
          rec[a] = st;
        }
        if (rec) attrs.set(el, rec);
      }

      function apply(root) {
        if (!root || skipped(root)) return;
        const rootEl = root.nodeType === 1 ? root : root.parentElement;
        if (!rootEl) return;
        // Atributs
        [rootEl, ...rootEl.querySelectorAll('*')].forEach(el => { if (!skipped(el)) applyAttrs(el); });
        // Text: agrupat per unitats (frases amb negretes, enllaços…)
        const walker = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT);
        const done = new Set();
        const list = [];
        let n;
        while ((n = walker.nextNode())) list.push(n);
        if (rootEl.nodeType === 1 && root.nodeType === 3) list.push(root);
        for (const node of list) {
          if (!node.isConnected || skipped(node) || SKIP.has(node.parentElement.tagName)) continue;
          if (!hasWords(node.nodeValue) && !texts.has(node)) continue;
          const u = unitOf(node.parentElement);
          if (done.has(u)) continue;
          if (u.childElementCount && allInline(u)) {
            done.add(u);
            if (applyUnit(u)) continue;
          }
          applyText(node);
        }
      }

      // Contingut que la pàgina canvia mentre l'usuari interactua
      let observer;
      function startObserver() {
        if (observer) return;
        observer = new MutationObserver(records => {
          const roots = new Set();
          for (const r of records) {
            if (r.type === 'characterData') roots.add(r.target.parentElement && unitOf(r.target.parentElement));
            else if (r.type === 'attributes') roots.add(r.target);
            else roots.add(r.target.nodeType === 1 ? unitOf(r.target) : r.target.parentElement);
          }
          roots.forEach(el => el && el.isConnected && apply(el));
          observer.takeRecords();
        });
        observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
      }

      const meta = {
        title: document.title,
        desc: document.querySelector('meta[name="description"]')?.getAttribute('content') || ''
      };
      // Les traduccions es carreguen només quan cal (qui llegeix en català no les baixa)
      let loading = null;
      function ensureDict(cb) {
        if (window.__I18N_DICT || RECORD) return cb();
        if (!loading) {
          loading = new Promise(resolve => {
            const sc = document.createElement('script');
            sc.src = 'i18n-data.js?v=5';
            sc.onload = resolve; sc.onerror = resolve;
            document.head.appendChild(sc);
          });
        }
        loading.then(cb);
      }
      function setLang(code, save) {
        code = LANGS.some(([c]) => c === code) ? code : 'ca';
        if (code !== 'ca' && !window.__I18N_DICT && !RECORD) {
          document.documentElement.classList.add('i18n-pending');
          ensureDict(() => { document.documentElement.classList.remove('i18n-pending'); setLang(code, save); });
          return;
        }
        lang = code;
        document.documentElement.lang = lang === 'zh' ? 'zh-Hans' : lang;
        if (observer) observer.disconnect(), observer = null;
        apply(document.body);
        document.title = t(meta.title);
        const md = document.querySelector('meta[name="description"]');
        if (md) md.setAttribute('content', t(meta.desc));
        const guide = document.getElementById('guideMessage');
        if (guide && guide.dataset.i18nOrig) guide.textContent = t(guide.dataset.i18nOrig);
        startObserver();
        if (save) { try { localStorage.setItem('cervesa-lang', lang); } catch (e) {} }
        if (btn) { btn.textContent = lang === 'zh' ? '中' : lang.toUpperCase(); btn.setAttribute('aria-label', t('Canvia l’idioma') + ': ' + LANGS.find(([c]) => c === lang)[1]); }
        menu && menu.querySelectorAll('button').forEach(b => b.setAttribute('aria-checked', String(b.dataset.lang === lang)));
      }

      // Selector d'idioma, al costat del botó A+
      let btn, menu;
      const actions = document.querySelector('.nav-actions');
      if (actions && !RECORD) {
        btn = document.createElement('button');
        btn.type = 'button'; btn.className = 'icon-btn lang-btn'; btn.id = 'langBtn';
        btn.setAttribute('aria-haspopup', 'true'); btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', 'langMenu');
        btn.dataset.i18nSkip = '';
        menu = document.createElement('div');
        menu.className = 'lang-menu'; menu.id = 'langMenu'; menu.setAttribute('role', 'menu'); menu.hidden = true; menu.dataset.i18nSkip = '';
        LANGS.forEach(([code, name]) => {
          const b = document.createElement('button');
          b.type = 'button'; b.setAttribute('role', 'menuitemradio'); b.dataset.lang = code;
          b.lang = code === 'zh' ? 'zh-Hans' : code;
          const flag = document.createElement('span'); flag.className = 'lang-flag'; flag.setAttribute('aria-hidden', 'true');
          flag.innerHTML = FLAGS[code];
          b.append(flag, document.createTextNode(name));
          b.addEventListener('click', () => { setLang(code, true); close(); btn.focus(); });
          menu.appendChild(b);
        });
        actions.insertBefore(btn, actions.firstChild);
        document.body.appendChild(menu);
        const place = () => {
          const r = btn.getBoundingClientRect();
          const mw = menu.offsetWidth || 180, mh = menu.offsetHeight || 220;
          let left = Math.min(window.innerWidth - mw - 8, Math.max(8, r.right - mw));
          let top = r.bottom + 8;
          if (top + mh > window.innerHeight - 8) top = Math.max(8, r.top - mh - 8);
          if (r.left > window.innerWidth * .6 && r.top > 120) { left = Math.max(8, r.left - mw - 10); top = Math.min(window.innerHeight - mh - 8, Math.max(8, r.top + r.height / 2 - mh / 2)); }
          menu.style.left = left + 'px'; menu.style.top = top + 'px';
        };
        const open = () => { menu.hidden = false; place(); btn.setAttribute('aria-expanded', 'true'); (menu.querySelector('[aria-checked="true"]') || menu.firstChild).focus(); };
        const close = () => { menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); };
        btn.addEventListener('click', () => (menu.hidden ? open() : close()));
        document.addEventListener('click', e => { if (!menu.hidden && !menu.contains(e.target) && e.target !== btn) close(); });
        document.addEventListener('keydown', e => {
          if (menu.hidden) return;
          if (e.key === 'Escape') { close(); btn.focus(); }
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            const items = [...menu.querySelectorAll('button')];
            const i = items.indexOf(document.activeElement);
            items[(i + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length].focus();
            e.preventDefault();
          }
        });
        window.addEventListener('resize', () => { if (!menu.hidden) place(); });
        window.addEventListener('scroll', () => { if (!menu.hidden) place(); }, { passive: true });
      }

      window.__setLang = code => setLang(code, false);
      setLang(store || 'ca', false);
    })();
