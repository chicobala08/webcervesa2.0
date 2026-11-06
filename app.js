// Menú mòbil
    const heroArt = document.querySelector('.hero-art');
    heroArt.addEventListener('pointerenter', () => {
      heroArt.classList.remove('is-hovered');
      void heroArt.offsetWidth;
      heroArt.classList.add('is-hovered');
    });
    heroArt.addEventListener('pointerleave', () => heroArt.classList.remove('is-hovered'));
    heroArt.addEventListener('focus', () => { heroArt.classList.add('is-hovered'); });
    heroArt.addEventListener('blur', () => heroArt.classList.remove('is-hovered'));

    const menuBtn = document.getElementById('menuBtn');
    const mobileNav = document.getElementById('mobileNav');
    menuBtn.addEventListener('click', () => {
      const open = mobileNav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Tancar el menú' : 'Obrir el menú');
      menuBtn.textContent = open ? '×' : '☰';
    });
    mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      mobileNav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.setAttribute('aria-label', 'Obrir el menú'); menuBtn.textContent = '☰';
    }));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && mobileNav.classList.contains('open')) {
        mobileNav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.setAttribute('aria-label', 'Obrir el menú'); menuBtn.textContent = '☰'; menuBtn.focus();
      }
    });


    // Ressalta la icona de navegació de la secció que es veu a la pantalla.
    const sectionLinks = [...document.querySelectorAll('#desktopNav a[href^="#"]')];
    const sectionsForNav = sectionLinks.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
    if ('IntersectionObserver' in window && sectionsForNav.length) {
      const activeObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          sectionLinks.forEach(link => {
            const active = link.getAttribute('href') === `#${entry.target.id}`;
            link.classList.toggle('active', active);
            if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
          });
        });
      }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });
      sectionsForNav.forEach(section => activeObserver.observe(section));
    }

    // Indicador de lectura
    const progressBar = document.getElementById('readingProgress');
    function updateProgress() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      const value = Math.round(ratio * 100);
      progressBar.style.transform = `scaleX(${ratio})`;
      progressBar.setAttribute('aria-valuenow', String(value));
    }
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();

    // Augment de mida del text
    let largerText = false;
    document.getElementById('textSizeBtn').addEventListener('click', (event) => {
      largerText = !largerText;
      document.documentElement.style.fontSize = largerText ? '18px' : '';
      event.currentTarget.textContent = largerText ? 'A−' : 'A+';
      event.currentTarget.setAttribute('aria-label', largerText ? 'Restablir la mida del text' : 'Augmentar la mida del text');
    });

    // Animacions discretes d'entrada (desactivades si l'usuari redueix el moviment)
    const revealItems = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const observer = new IntersectionObserver(entries => {
        let step = 0; // escalonado corto entre elementos que entran a la vez
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.setProperty('--reveal-delay', Math.min(step++, 5) * 60 + 'ms');
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });
      revealItems.forEach(item => observer.observe(item));
    } else revealItems.forEach(item => item.classList.add('visible'));

    // Repte de balanç químic de la glucosa: dos nivells de dificultat.
    const $ = id => document.getElementById(id);
    const easyFields = {
      ethanol: $('easyEthanolCoefficient'),
      carbonDioxide: $('easyCarbonDioxideCoefficient')
    };
    const hardFields = {
      glucose: $('hardGlucoseCoefficient'),
      ethanol: $('hardEthanolCoefficient'),
      carbonDioxide: $('hardCarbonDioxideCoefficient'),
      leftCarbon: $('hardLeftCarbon'), leftHydrogen: $('hardLeftHydrogen'), leftOxygen: $('hardLeftOxygen'),
      rightCarbon: $('hardRightCarbon'), rightHydrogen: $('hardRightHydrogen'), rightOxygen: $('hardRightOxygen')
    };
    const easyFeedback = $('easyReactionFeedback');
    const hardFeedback = $('hardReactionFeedback');
    const easyHint = $('easyReactionHint');
    const hardHint = $('hardReactionHint');

    function readPositiveInteger(input) {
      if (!input || input.value.trim() === '') return null;
      const value = Number(input.value);
      return Number.isInteger(value) && value > 0 ? value : null;
    }
    function readNonNegativeInteger(input) {
      if (!input || input.value.trim() === '') return null;
      const value = Number(input.value);
      return Number.isInteger(value) && value >= 0 ? value : null;
    }
    function setReactionMessage(target, type, message) {
      target.className = `reaction-feedback${type ? ` ${type}` : ''}`;
      target.textContent = message;
    }
    function getProductsCount(ethanol, carbonDioxide) {
      return {
        Carbon: 2 * ethanol + carbonDioxide,
        Hydrogen: 6 * ethanol,
        Oxygen: ethanol + 2 * carbonDioxide
      };
    }
    function greatestCommonDivisor(a, b) {
      return b === 0 ? a : greatestCommonDivisor(b, a % b);
    }
    function updateEasyPreview() {
      const ethanol = readPositiveInteger(easyFields.ethanol);
      const carbonDioxide = readPositiveInteger(easyFields.carbonDioxide);
      const previewIds = ['easyRightCarbon', 'easyRightHydrogen', 'easyRightOxygen'];
      if (ethanol === null || carbonDioxide === null) {
        previewIds.forEach(id => $(id).textContent = '—');
        return;
      }
      const totals = getProductsCount(ethanol, carbonDioxide);
      $('easyRightCarbon').textContent = totals.Carbon;
      $('easyRightHydrogen').textContent = totals.Hydrogen;
      $('easyRightOxygen').textContent = totals.Oxygen;
    }
    easyFields.ethanol.addEventListener('input', updateEasyPreview);
    easyFields.carbonDioxide.addEventListener('input', updateEasyPreview);

    function checkEasyReaction() {
      const ethanol = readPositiveInteger(easyFields.ethanol);
      const carbonDioxide = readPositiveInteger(easyFields.carbonDioxide);
      if (ethanol === null || carbonDioxide === null) {
        setReactionMessage(easyFeedback, 'error', 'Malt: introdueix dos coeficients amb nombres enters positius. Pots fer-ho!');
        return;
      }
      const products = getProductsCount(ethanol, carbonDioxide);
      const mismatches = [
        ['C', 6, products.Carbon],
        ['H', 12, products.Hydrogen],
        ['O', 6, products.Oxygen]
      ].filter(([, left, right]) => left !== right);
      if (mismatches.length) {
        const details = mismatches.map(([element, left, right]) => `${element}: ${left} als reactius i ${right} als productes`).join(' · ');
        setReactionMessage(easyFeedback, 'error', `Malt: encara no quadra! ${details}. Revisa el recompte i torna-ho a provar.`);
        return;
      }
      setReactionMessage(easyFeedback, 'success', 'Molt bé! Has equilibrat la reacció: C₆H₁₂O₆ → 2 C₂H₅OH + 2 CO₂. A cada costat hi ha C = 6, H = 12 i O = 6.');
    }
    $('checkEasyReactionBtn').addEventListener('click', checkEasyReaction);
    $('resetEasyReactionBtn').addEventListener('click', () => {
      Object.values(easyFields).forEach(input => input.value = '');
      updateEasyPreview();
      setReactionMessage(easyFeedback, '', 'Malt: pas a pas! Ajusta els dos coeficients fins que els tres elements tinguin el mateix recompte als dos costats.');
      easyHint.hidden = true;
      $('easyReactionHintBtn').setAttribute('aria-expanded', 'false');
      $('easyReactionHintBtn').textContent = 'Demanar una pista';
    });
    $('easyReactionHintBtn').addEventListener('click', event => {
      const opening = easyHint.hidden;
      easyHint.hidden = !opening;
      event.currentTarget.setAttribute('aria-expanded', String(opening));
      event.currentTarget.textContent = opening ? 'Amagar la pista' : 'Demanar una pista';
    });

    function checkHardReaction() {
      const glucose = readPositiveInteger(hardFields.glucose);
      const ethanol = readPositiveInteger(hardFields.ethanol);
      const carbonDioxide = readPositiveInteger(hardFields.carbonDioxide);
      if ([glucose, ethanol, carbonDioxide].some(value => value === null)) {
        setReactionMessage(hardFeedback, 'error', 'Malt: completa els tres coeficients amb nombres enters positius abans de continuar.');
        return;
      }
      const atomKeys = ['leftCarbon', 'leftHydrogen', 'leftOxygen', 'rightCarbon', 'rightHydrogen', 'rightOxygen'];
      const entered = Object.fromEntries(atomKeys.map(key => [key, readNonNegativeInteger(hardFields[key])]));
      if (atomKeys.some(key => entered[key] === null)) {
        setReactionMessage(hardFeedback, 'error', 'Encara falten valors a la taula. Calcula els àtoms de C, H i O als dos costats.');
        return;
      }
      const expectedLeft = { Carbon: 6 * glucose, Hydrogen: 12 * glucose, Oxygen: 6 * glucose };
      const expectedRight = getProductsCount(ethanol, carbonDioxide);
      const rowPairs = [
        ['Carbon', 'leftCarbon', 'rightCarbon', 'C'],
        ['Hydrogen', 'leftHydrogen', 'rightHydrogen', 'H'],
        ['Oxygen', 'leftOxygen', 'rightOxygen', 'O']
      ];
      const wrongCounts = rowPairs.filter(([element, leftKey, rightKey]) =>
        entered[leftKey] !== expectedLeft[element] || entered[rightKey] !== expectedRight[element]
      );
      if (wrongCounts.length) {
        const labels = wrongCounts.map(([element, leftKey, rightKey, symbol]) =>
          `${symbol}: has escrit ${entered[leftKey]} i ${entered[rightKey]}, però el càlcul dona ${expectedLeft[element]} i ${expectedRight[element]}`
        ).join(' · ');
        setReactionMessage(hardFeedback, 'error', `Revisa la taula d'àtoms. ${labels}. Recorda multiplicar tots els subíndexs pel coeficient.`);
        return;
      }
      const unbalanced = rowPairs.filter(([element]) => expectedLeft[element] !== expectedRight[element]);
      if (unbalanced.length) {
        const details = unbalanced.map(([element, , , symbol]) =>
          `${symbol}: ${expectedLeft[element]} als reactius i ${expectedRight[element]} als productes`
        ).join(' · ');
        setReactionMessage(hardFeedback, 'error', `El recompte de la taula és correcte, però l'equació encara no està equilibrada. ${details}. Ajusta els coeficients.`);
        return;
      }
      if (glucose !== 1 || ethanol !== 2 || carbonDioxide !== 2) {
        const commonDivisor = greatestCommonDivisor(greatestCommonDivisor(glucose, ethanol), carbonDioxide);
        setReactionMessage(hardFeedback, 'error', `La reacció està equilibrada, però els coeficients no estan simplificats. Tenen un divisor comú (${commonDivisor}); divideix-los per ${commonDivisor} per obtenir la proporció en nombres enters més petits.`);
        return;
      }
      setReactionMessage(hardFeedback, 'success', 'Repte superat! Has trobat la proporció mínima 1 : 2 : 2 i has verificat tots els àtoms: C = 6, H = 12 i O = 6 a cada costat. Malt et felicita per aquest balanç!');
    }
    $('checkHardReactionBtn').addEventListener('click', checkHardReaction);
    $('resetHardReactionBtn').addEventListener('click', () => {
      Object.values(hardFields).forEach(input => input.value = '');
      setReactionMessage(hardFeedback, '', 'Malt: aquest és el repte difícil. Calcula cada costat de l\'equació i busca la proporció més senzilla!');
      hardHint.hidden = true;
      $('hardReactionHintBtn').setAttribute('aria-expanded', 'false');
      $('hardReactionHintBtn').textContent = 'Demanar una pista';
    });
    $('hardReactionHintBtn').addEventListener('click', event => {
      const opening = hardHint.hidden;
      hardHint.hidden = !opening;
      event.currentTarget.setAttribute('aria-expanded', String(opening));
      event.currentTarget.textContent = opening ? 'Amagar la pista' : 'Demanar una pista';
    });

    function selectReactionLevel(level) {
      const easy = level === 'easy';
      $('easyReactionPanel').hidden = !easy;
      $('hardReactionPanel').hidden = easy;
      $('easyReactionTab').setAttribute('aria-selected', String(easy));
      $('hardReactionTab').setAttribute('aria-selected', String(!easy));
      $('easyReactionTab').classList.toggle('active', easy);
      $('hardReactionTab').classList.toggle('active', !easy);
    }
    $('easyReactionTab').addEventListener('click', () => selectReactionLevel('easy'));
    $('hardReactionTab').addEventListener('click', () => selectReactionLevel('hard'));

    // Densímetre: de la densitat inicial i final al percentatge d'alcohol
    const densityStartInput = document.getElementById('densityStart');
    const densityEndInput = document.getElementById('densityEnd');
    const densityResult = document.getElementById('densityResult');
    const fmt = (value, digits) => value.toLocaleString('ca-ES', { minimumFractionDigits: digits, maximumFractionDigits: digits });
    function calculateDensity() {
      const start = Number(densityStartInput.value);
      const end = Number(densityEndInput.value);
      densityResult.classList.remove('error');
      if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0.98 || end < 0.98 || start > 1.2 || end > 1.2) {
        densityResult.classList.add('error');
        densityResult.textContent = 'Escriu densitats entre 0,980 i 1,200 g/mL. Un most típic fa entre 1,030 i 1,080.';
        return;
      }
      if (end >= start) {
        densityResult.classList.add('error');
        densityResult.textContent = 'La densitat final ha de ser més baixa que la inicial: en fermentar, el sucre es converteix en alcohol, que és menys dens.';
        return;
      }
      const abv = (start - end) * 131.25;
      densityResult.innerHTML = `<span class="density-equation">(${fmt(start, 3)} − ${fmt(end, 3)}) × 131,25</span><strong>≈ ${fmt(abv, 1)} % d'alcohol</strong>`;
    }
    document.getElementById('densityBtn').addEventListener('click', calculateDensity);
    [densityStartInput, densityEndInput].forEach(input => input.addEventListener('keydown', event => { if (event.key === 'Enter') calculateDensity(); }));

    // Laboratori molecular: exploració de molècules i conservació dels àtoms.
    const moleculeData = {
      glucose: {
        name: 'Glucosa', category: 'Molècula inicial', formula: 'C₆H₁₂O₆', counts: { C: 6, H: 12, O: 6 },
        description: 'La glucosa és un sucre de sis carbonis. Durant la fermentació alcohòlica, els llevats la transformen i els seus àtoms es reorganitzen en altres molècules.',
        structure: `<svg class="mol-structure glucose-structure" viewBox="0 0 650 150" role="img" aria-labelledby="glucoseStructTitle glucoseStructDesc"><title id="glucoseStructTitle">Representació simplificada de la glucosa</title><desc id="glucoseStructDesc">Cadena oberta de glucosa representada com CHO, quatre grups CHOH i un grup CH2OH connectats.</desc><g class="mol-bonds" stroke="#26354a" stroke-width="5" stroke-linecap="round"><path class="bond-line" d="M91 67H119M190 67H218M289 67H317M388 67H416M487 67H515"/></g><g class="mol-nodes" font-family="Arial,sans-serif" font-weight="800" text-anchor="middle"><rect x="20" y="34" width="72" height="66" rx="18" fill="#f3ead6"/><text x="56" y="74" fill="#26354a" font-size="19">CHO</text><rect x="119" y="34" width="71" height="66" rx="18" fill="#f3ead6"/><text x="154" y="74" fill="#26354a" font-size="18">CHOH</text><rect x="218" y="34" width="71" height="66" rx="18" fill="#f3ead6"/><text x="253" y="74" fill="#26354a" font-size="18">CHOH</text><rect x="317" y="34" width="71" height="66" rx="18" fill="#f3ead6"/><text x="352" y="74" fill="#26354a" font-size="18">CHOH</text><rect x="416" y="34" width="71" height="66" rx="18" fill="#f3ead6"/><text x="451" y="74" fill="#26354a" font-size="18">CHOH</text><rect x="515" y="34" width="115" height="66" rx="18" fill="#f3ead6"/><text x="572" y="74" fill="#26354a" font-size="18">CH₂OH</text></g><text x="325" y="130" text-anchor="middle" fill="#52665f" font-size="13" font-weight="700">Cadena oberta simplificada</text></svg>`
      },
      ethanol: {
        name: 'Etanol', category: 'Producte de la fermentació', formula: 'C₂H₆O', counts: { C: 2, H: 6, O: 1 },
        description: 'L’etanol és una molècula formada per dos carbonis, sis hidrògens i un oxigen. També es pot escriure com C₂H₅OH, una fórmula que mostra el grup hidroxil –OH.',
        structure: `<svg class="mol-structure ethanol-structure" viewBox="0 0 470 150" role="img" aria-labelledby="ethanolStructTitle ethanolStructDesc"><title id="ethanolStructTitle">Representació simplificada de l’etanol</title><desc id="ethanolStructDesc">Fórmula estructural condensada CH3, CH2 i OH connectats en cadena.</desc><g class="mol-bonds" stroke="#26354a" stroke-width="6" stroke-linecap="round"><path class="bond-line" d="M132 68H168M292 68H328"/></g><g text-anchor="middle" font-family="Arial,sans-serif" font-weight="900"><rect x="38" y="31" width="94" height="74" rx="20" fill="#f3ead6"/><text x="85" y="75" fill="#26354a" font-size="25">CH₃</text><rect x="168" y="31" width="124" height="74" rx="20" fill="#f3ead6"/><text x="230" y="75" fill="#26354a" font-size="25">CH₂</text><rect x="328" y="31" width="94" height="74" rx="20" fill="#f3ead6"/><text x="375" y="75" fill="#26354a" font-size="25">OH</text></g><text x="235" y="132" fill="#52665f" text-anchor="middle" font-size="13" font-weight="700">Fórmula estructural condensada</text></svg>`
      },
      co2: {
        name: 'Diòxid de carboni', category: 'Producte de la fermentació', formula: 'CO₂', counts: { C: 1, H: 0, O: 2 },
        description: 'El diòxid de carboni és una molècula lineal: un àtom de carboni queda unit a dos àtoms d’oxigen mitjançant dos enllaços dobles. La seva fórmula és CO₂.',
        structure: `<svg class="mol-structure co2-structure" viewBox="0 0 470 150" role="img" aria-labelledby="co2StructTitle co2StructDesc"><title id="co2StructTitle">Representació de la molècula de diòxid de carboni</title><desc id="co2StructDesc">Molècula lineal O igual C igual O amb dos enllaços dobles.</desc><g class="mol-bonds" stroke="#26354a" stroke-width="5" stroke-linecap="round"><path class="bond-line" d="M123 62H170M123 77H170M300 62H347M300 77H347"/></g><g text-anchor="middle" font-family="Arial,sans-serif" font-weight="950"><circle cx="85" cy="70" r="38" fill="#d64530"/><text x="85" y="79" fill="#fff" font-size="29">O</text><circle cx="235" cy="70" r="38" fill="#2b2b2b"/><text x="235" y="79" fill="#fff" font-size="29">C</text><circle cx="385" cy="70" r="38" fill="#d64530"/><text x="385" y="79" fill="#fff" font-size="29">O</text></g><text x="235" y="132" fill="#52665f" text-anchor="middle" font-size="13" font-weight="700">Estructura lineal: O=C=O</text></svg>`
      }
    };
    const moleculeChoices = [...document.querySelectorAll('.molecule-choice')];
    const molCategory = document.getElementById('molCategory');
    const molFormulaBadge = document.getElementById('molFormulaBadge');
    const molName = document.getElementById('molName');
    const molStructureCanvas = document.getElementById('molStructureCanvas');
    const molDescription = document.getElementById('molDescription');
    const molComposition = document.getElementById('molComposition');
    function renderMolecule(key) {
      const molecule = moleculeData[key];
      if (!molecule) return;
      moleculeChoices.forEach(button => {
        const active = button.dataset.molecule === key;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
      });
      molCategory.textContent = molecule.category;
      molFormulaBadge.textContent = molecule.formula;
      molName.textContent = molecule.name;
      molStructureCanvas.innerHTML = molecule.structure;
      molDescription.textContent = molecule.description;
      molComposition.innerHTML = [
        ['C', molecule.counts.C, 'carbonis', 'atom-carbon'],
        ['H', molecule.counts.H, 'hidrògens', 'atom-hydrogen'],
        ['O', molecule.counts.O, 'oxígens', 'atom-oxygen']
      ].map(([symbol, count, label, className]) => `<span><b class="atom-dot ${className}">${symbol}</b><strong>${count}</strong><small>${label}</small></span>`).join('');
    }
    moleculeChoices.forEach(button => button.addEventListener('click', () => renderMolecule(button.dataset.molecule)));

    // Constructor intern de fórmules moleculars C-H-O.
    // Les dades només es mostren quan l'usuari consulta una fórmula concreta.
    (() => {
      const fields = {
        C: document.getElementById('builderCarbon'),
        H: document.getElementById('builderHydrogen'),
        O: document.getElementById('builderOxygen')
      };
      const formulaOutput = document.getElementById('builderFormula');
      const statusOutput = document.getElementById('builderStatus');
      const resultsOutput = document.getElementById('molBuilderResults');
      const subscriptDigits = {'0':'₀','1':'₁','2':'₂','3':'₃','4':'₄','5':'₅','6':'₆','7':'₇','8':'₈','9':'₉'};

      // Repertori centrat en la cervesa: només les molècules que apareixen en fer-la.
      const catalogue = {};
      Object.assign(catalogue, {
        '0-2-1': [{name:'Aigua',family:'Compost inorgànic',description:'És la major part de la cervesa. Dissol els sucres i és el medi on treballa el llevat.'}],
        '1-0-2': [{name:'Diòxid de carboni',family:'Gas de la fermentació',description:'El llevat el produeix alhora que l’etanol. És el gas de les bombolles.'}],
        '2-4-1': [{name:'Acetaldehid (etanal)',family:'Aldehid',description:'Apareix durant la fermentació, just abans de convertir-se en etanol. Si en queda massa, fa olor de poma verda.'}],
        '2-6-1': [{name:'Etanol',family:'Alcohol',description:'L’alcohol de la cervesa. La mateixa fórmula correspon a l’èter dimetílic, que no es forma en la fermentació.'}],
        '4-8-2': [{name:'Acetat d’etil',family:'Èster',description:'Un dels èsters que fa el llevat. Aporta aromes afruitades.'}],
        '6-12-6': [{name:'Glucosa',family:'Sucre simple',description:'Sucre de sis carbonis. És l’aliment directe del llevat. La fructosa té la mateixa fórmula.'}],
        '7-14-2': [{name:'Acetat d’isoamil',family:'Èster',description:'Èster amb aroma de plàtan, típic d’algunes cerveses de blat.'}],
        '12-22-11': [{name:'Maltosa',family:'Sucre doble',description:'Dues glucoses unides. És el sucre més abundant del most de cervesa.'}]
      });
      const discoveryGrid = document.getElementById('discoveryGrid');
      const discoveryProgress = document.getElementById('discoveryProgress');
      let discoveredFormulaKeys = new Set();
      const formulaRows = Object.entries(catalogue).filter(([,items]) => items && items.length)
        .sort(([a],[b]) => a.localeCompare(b, 'en', {numeric:true}));
      function paintDiscoveries(newlyDiscoveredKey = null) {
        discoveryGrid.replaceChildren();
        formulaRows.forEach(([key, items]) => {
          const [c,h,o] = key.split('-').map(Number);
          const formula = makeFormula({C:c,H:h,O:o});
          const label = makeElement('label', 'discovery-item' + (discoveredFormulaKeys.has(key) ? ' is-discovered' : '') + (key === newlyDiscoveredKey ? ' just-discovered' : ''));
          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox'; checkbox.checked = discoveredFormulaKeys.has(key); checkbox.disabled = true;
          const copy = makeElement('span');
          copy.append(makeElement('strong', '', formula));
          copy.append(makeElement('span', '', items.map(item => item.name).join(' · ')));
          label.append(checkbox, copy);
          discoveryGrid.append(label);
        });
        discoveryProgress.textContent = `${discoveredFormulaKeys.size} de ${formulaRows.length} trobades`;
      }
      function markFormulaDiscovered(key) {
        if (!discoveredFormulaKeys.has(key)) {
          discoveredFormulaKeys.add(key);
          paintDiscoveries(key);
        }
      }
      document.getElementById('resetDiscoveries').addEventListener('click', () => {
        discoveredFormulaKeys.clear(); paintDiscoveries();
      });
      paintDiscoveries();

      function readCounts() {
        const counts = {};
        for (const [symbol, input] of Object.entries(fields)) {
          const value = Number(input.value);
          const max = Number(input.max);
          if (!Number.isInteger(value) || value < 0 || value > max) return null;
          counts[symbol] = value;
        }
        if (counts.C + counts.H + counts.O === 0) return null;
        return counts;
      }
      function makeFormula(counts) {
        let formula = '';
        ['C','H','O'].forEach(symbol => {
          const count = counts[symbol];
          if (count > 0) formula += symbol + (count === 1 ? '' : String(count).replace(/[0-9]/g, digit => subscriptDigits[digit]));
        });
        return formula || '—';
      }
      function makeElement(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
      }
      function showEmpty(message, detail) {
        resultsOutput.replaceChildren();
        const empty = makeElement('div', 'mol-builder-empty');
        empty.append(makeElement('span', '', '🧬'));
        const copy = makeElement('div');
        copy.append(makeElement('strong', '', message));
        if (detail) copy.append(makeElement('p', '', detail));
        empty.append(copy);
        resultsOutput.append(empty);
      }
      function updateFormulaPreview() {
        const counts = readCounts();
        if (!counts) {
          formulaOutput.textContent = '—';
          statusOutput.textContent = 'Introdueix nombres enters dins dels límits indicats.';
          showEmpty('Construeix una fórmula.', 'Pots generar qualsevol combinació dins dels límits dels comptadors; el resultat diferencia les molècules identificades de les fórmules encara no identificades.');
          return;
        }
        const formula = makeFormula(counts);
        formulaOutput.textContent = formula;
        statusOutput.textContent = 'Fórmula preparada. Ja pots consultar quines molècules comparteixen aquesta composició.';
        showEmpty('Fórmula preparada: ' + formula, 'Prem «Cerca la molècula» per consultar els resultats.');
      }
      function renderBuilderResults(counts) {
        const key = `${counts.C}-${counts.H}-${counts.O}`;
        const formula = makeFormula(counts);
        const matches = catalogue[key] || [];
        if (matches.length) markFormulaDiscovered(key);
        resultsOutput.replaceChildren();
        if (!matches.length) {
          resultsOutput.replaceChildren();
          const empty = makeElement('div', 'mol-builder-empty');
          empty.append(makeElement('span', '', '🧪'));
          const copy = makeElement('div');
          copy.append(makeElement('strong', '', 'Fórmula generada: ' + formula));
          let detail = '';
          if (counts.C > 0) {
            const unsaturationNumerator = 2 * counts.C + 2 - counts.H;
            if (unsaturationNumerator >= 0 && unsaturationNumerator % 2 === 0) {
              const dbe = unsaturationNumerator / 2;
              detail = 'No hi ha una molècula identificada amb aquesta fórmula al repertori. L’índex d’insaturació teòric és ' + dbe + '. És una comprovació inicial de valència, no una prova que la substància existeixi ni que sigui estable.';
            } else {
              detail = 'No hi ha una molècula identificada amb aquesta fórmula al repertori. La composició no passa el filtre bàsic de valència per a una molècula orgànica neutra habitual; ions i radicals no formen part d’aquest model.';
            }
          } else {
            detail = 'No hi ha cap compost identificat amb aquesta fórmula al repertori. Sense carboni, el filtre d’insaturació orgànica no és aplicable.';
          }
          copy.append(makeElement('p', '', detail));
          empty.append(copy);
          resultsOutput.append(empty);
          statusOutput.textContent = 'Fórmula generada i comprovació bàsica completada per a ' + formula + '.';
          return;
        }
        const head = makeElement('div', 'mol-builder-results-head');
        head.append(makeElement('strong', '', matches.length === 1 ? 'Molècula identificada' : 'Estructures amb aquesta fórmula'));
        head.append(makeElement('span', '', formula));
        resultsOutput.append(head);
        const grid = makeElement('div', 'mol-builder-result-grid');
        matches.forEach(item => {
          const card = makeElement('article', 'mol-builder-result');
          const top = makeElement('div', 'mol-builder-result-top');
          top.append(makeElement('h5', '', item.name));
          top.append(makeElement('span', 'result-formula', formula));
          card.append(top);
          card.append(makeElement('span', 'result-family', item.family));
          card.append(makeElement('p', '', item.description));
          grid.append(card);
        });
        resultsOutput.append(grid);
        statusOutput.textContent = matches.length === 1 ? 'S’ha identificat una molècula per a ' + formula + '.' : 'S’han identificat diverses estructures per a ' + formula + '.';
      }
      Object.values(fields).forEach(input => input.addEventListener('input', updateFormulaPreview));
      document.querySelectorAll('[data-builder-step]').forEach(button => {
        button.addEventListener('click', () => {
          const input = fields[button.dataset.builderStep];
          const step = Number(button.dataset.step);
          const min = Number(input.min), max = Number(input.max);
          input.value = String(Math.max(min, Math.min(max, Number(input.value || 0) + step)));
          updateFormulaPreview();
        });
      });
      document.getElementById('findMoleculeBtn').addEventListener('click', () => {
        const counts = readCounts();
        if (!counts) { updateFormulaPreview(); return; }
        renderBuilderResults(counts);
      });
      Object.entries(fields).forEach(([symbol, input]) => input.addEventListener('keydown', event => {
        if (event.key === 'Enter') document.getElementById('findMoleculeBtn').click();
      }));
      // No es mostra cap llistat de molècules en carregar la pàgina.
      formulaOutput.textContent = '—';
      statusOutput.textContent = 'Afegeix àtoms i prem «Cerca la molècula».';
      showEmpty('Encara no has construït cap fórmula.', 'Prova amb l’aigua: 2 hidrògens i 1 oxigen.');
    })();


    // Qüestionari: història, química i biologia (sense instruccions pràctiques)
    const QUIZ_POOLS = {
      inicial: [
      { q: 'Quina civilització està especialment vinculada a les primeres fonts escrites sobre cervesa?', a: ['La sumeriana', 'La romana imperial', 'La vikinga'], c: 0, e: 'Les fonts mesopotàmiques inclouen referències a la cervesa i a la figura de Ninkasi.' },
      { q: 'Quin tipus d’organisme és el llevat?', a: ['Un bacteri', 'Un fong', 'Un virus'], c: 1, e: 'Els llevats són fongs unicel·lulars, tot i que sovint es confonen amb els bacteris.' },
      { q: 'Què és un enzim?', a: ['Una proteïna que accelera reaccions', 'Un tipus de mineral', 'Un gas atmosfèric'], c: 0, e: 'Els enzims actuen com a catalitzadors biològics i faciliten reaccions químiques.' },
      { q: 'Quina és la fórmula molecular de la glucosa?', a: ['CO₂', 'C₆H₁₂O₆', 'H₂O₂'], c: 1, e: 'La glucosa és un monosacàrid amb fórmula molecular C₆H₁₂O₆.' },
      { q: 'Quina aportació científica s’associa als estudis de Louis Pasteur?', a: ['Va descobrir els raigs X', 'Va relacionar la fermentació amb microorganismes', 'Va formular la teoria atòmica'], c: 1, e: 'Les investigacions de Pasteur van contribuir a demostrar que la fermentació està relacionada amb l’activitat dels microorganismes.' },
      { q: 'Què mesura el pH?', a: ['La massa', 'L’acidesa o basicitat', 'La temperatura'], c: 1, e: 'El pH indica el grau d’acidesa o basicitat d’una dissolució aquosa.' },
      { q: 'Quin any es va promulgar la coneguda disposició bavaresa Reinheitsgebot?', a: ['1215', '1516', '1815'], c: 1, e: 'La disposició bavaresa coneguda com a Reinheitsgebot data de 1516.' },
      { q: 'Quina d’aquestes afirmacions sobre la densitat és correcta?', a: ['És massa dividida pel volum', 'És volum dividit per temperatura', 'No depèn de la massa ni del volum'], c: 0, e: 'La densitat es calcula dividint la massa d’una mostra pel volum que ocupa.' }
      ],
      expert: [
        { q: 'Quin llevat s’utilitza en les cerveses lager?', a: ['Saccharomyces cerevisiae', 'Saccharomyces pastorianus', 'Lactobacillus'], c: 1, e: 'El Saccharomyces pastorianus fermenta a baixa temperatura (8–14 °C) i dona cerveses lager de sabor net.' },
        { q: 'Què era el gruit?', a: ['Una barreja d’herbes per donar gust a la cervesa', 'Un tipus de llevat', 'Un recipient per fermentar'], c: 0, e: 'Abans del llúpol, la cervesa es condimentava amb gruit, una barreja d’herbes com el romaní, la murta o el ginebre.' },
        { q: 'Entre quines temperatures se sol fer la maceració?', a: ['Entre 20 i 30 °C', 'Entre 62 i 72 °C', 'Entre 95 i 100 °C'], c: 1, e: 'Entre 62 i 72 °C, els enzims de la malta transformen el midó en sucres fermentables.' },
        { q: 'Què passa amb els alfa-àcids del llúpol durant la cocció?', a: ['Es transformen en isoalfaàcids, que donen amargor', 'Es converteixen en alcohol', 'Desapareixen sense deixar rastre'], c: 0, e: 'En escalfar-se, els alfa-àcids s’isomeritzen i es tornen solubles: són els responsables de l’amargor.' },
        { q: 'Quins ingredients permetia la llei bavaresa de 1516?', a: ['Aigua, ordi i llúpol', 'Aigua, blat i mel', 'Ordi, sucre i llevat'], c: 0, e: 'La llei només permetia aigua, ordi i llúpol; el paper del llevat encara no es coneixia.' },
        { q: 'Quina part de la cervesa és aigua, aproximadament?', a: ['Entre el 50 i el 60 %', 'Entre el 90 i el 95 %', 'Menys del 30 %'], c: 1, e: 'L’aigua és l’ingredient més abundant: representa aproximadament entre el 90 i el 95 % de la cervesa.' },
        { q: 'Per què baixa la densitat durant la fermentació?', a: ['Perquè el llevat transforma els sucres en alcohol i CO₂', 'Perquè s’hi afegeix aigua', 'Perquè augmenta la temperatura'], c: 0, e: 'Els sucres dissolts fan el most dens; quan es converteixen en alcohol i CO₂, la densitat baixa.' },
        { q: 'Com cobraven sovint els treballadors sumeris una part del sou?', a: ['En cervesa', 'En vi', 'En sal'], c: 0, e: 'Els treballadors sumeris sovint cobraven una part del sou en cervesa, una prova del seu gran valor.' }
      ]
    };
    let quizLevel = 'inicial';
    const shuffleQuiz = list => { const a = list.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    let questions = shuffleQuiz(QUIZ_POOLS[quizLevel]);
    let quizIndex = 0;
    let quizScore = 0;
    let quizAnswered = false;
    let quizFinished = false;
    const questionText = document.getElementById('questionText');
    const answerList = document.getElementById('answerList');
    const quizFeedback = document.getElementById('quizFeedback');
    const nextQuestion = document.getElementById('nextQuestion');
    const questionCount = document.getElementById('questionCount');
    const scoreLabel = document.getElementById('scoreLabel');
    const quizProgress = document.getElementById('quizProgress');
    const scoreValue = document.getElementById('scoreValue');
    const scoreMessage = document.getElementById('scoreMessage');
    const quizGuide = document.getElementById('quizGuide');
    const guideMessage = document.getElementById('guideMessage');

    const guideMessages = {
      idle: [
        'Nova pregunta! Pensa com una persona investigadora: observa les pistes i tria amb criteri.',
        'Som-hi! Cada pregunta és una nova peça del trencaclosques de la història i la ciència.',
        'La curiositat és el millor ingredient d’una bona investigació. Endavant!'
      ],
      correct: [
        'Molt bé! Has trobat la peça que faltava a la història de la cervesa.',
        'Resposta encertada! Tens ull de microbiòleg: has detectat el detall important.',
        'Clavat! La ciència també es construeix pregunta a pregunta.',
        'Excel·lent! Aquesta dada ja queda ben arxivada al teu laboratori mental.',
        'Bravíssim! Vas pel bon camí: teoria, observació i curiositat.'
      ],
      incorrect: [
        'Aquesta se’ns ha escapat! Cap problema: cada error és una pista nova. Revisa l’explicació!',
        'Gairebé! Fins i tot les persones expertes revisen les seves hipòtesis. Seguim aprenent!',
        'No passa res: una bona investigació també avança quan detectem què cal repassar.',
        'Avui aquesta dada s’ha resistit, però ja tens una pista per recordar-la la pròxima vegada.'
      ]
    };

    let guideTypingTimer = null;
    let guideAudioContext = null;

    function unlockMaltAudio() {
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        if (!guideAudioContext) guideAudioContext = new AudioContextClass();
        if (guideAudioContext.state === 'suspended') guideAudioContext.resume().catch(() => {});
      } catch (error) { guideAudioContext = null; }
    }

    document.addEventListener('pointerdown', unlockMaltAudio, { once:true, capture:true });

    function withMaltAudio(callback) {
      if (!guideAudioContext) unlockMaltAudio();
      const context = guideAudioContext;
      if (!context) return;
      if (context.state === 'running') callback(context);
      else context.resume().then(() => {
        if (guideAudioContext === context && context.state === 'running') callback(context);
      }).catch(() => {});
    }

    function makeAudienceNoise(context, duration) {
      const length = Math.max(1, Math.floor(context.sampleRate * duration));
      const buffer = context.createBuffer(1, length, context.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i=0; i<length; i++) data[i]=(Math.random()*2-1)*(1-i/length);
      return buffer;
    }

    function playMaltBlip(character) {
      if (!guideAudioContext || /\\s/.test(character) || /[.,;:!?¿¡]/.test(character)) return;
      withMaltAudio(context => {
        try {
          const now=context.currentTime;
          const vowel=/[aeiouàèéíïòóúü]/i.test(character);
          const pitch=470+((character.toLocaleLowerCase('ca').charCodeAt(0)*23)%180)+(vowel?105:0);
          const oscillator=context.createOscillator(), gain=context.createGain();
          oscillator.type='triangle';
          oscillator.frequency.setValueAtTime(pitch*1.08,now);
          oscillator.frequency.exponentialRampToValueAtTime(pitch*.86,now+.045);
          gain.gain.setValueAtTime(.0001,now);
          gain.gain.exponentialRampToValueAtTime(.018,now+.006);
          gain.gain.exponentialRampToValueAtTime(.0001,now+.052);
          oscillator.connect(gain); gain.connect(context.destination);
          oscillator.start(now); oscillator.stop(now+.055);
        } catch(error) {}
      });
    }

    function playPageFlip() {
      withMaltAudio(context => {
        try {
          const now=context.currentTime;
          const source=context.createBufferSource(), filter=context.createBiquadFilter(), gain=context.createGain();
          source.buffer=makeAudienceNoise(context,.34);
          filter.type='bandpass';
          filter.frequency.setValueAtTime(1500,now);
          filter.frequency.exponentialRampToValueAtTime(430,now+.31);
          filter.Q.value=.65;
          gain.gain.setValueAtTime(.0001,now);
          gain.gain.exponentialRampToValueAtTime(.075,now+.035);
          gain.gain.exponentialRampToValueAtTime(.0001,now+.32);
          source.connect(filter); filter.connect(gain); gain.connect(context.destination);
          source.start(now); source.stop(now+.34);

          const tick=context.createOscillator(), tickGain=context.createGain();
          tick.type='sine';
          tick.frequency.setValueAtTime(520,now+.025);
          tick.frequency.exponentialRampToValueAtTime(260,now+.095);
          tickGain.gain.setValueAtTime(.0001,now);
          tickGain.gain.exponentialRampToValueAtTime(.018,now+.03);
          tickGain.gain.exponentialRampToValueAtTime(.0001,now+.12);
          tick.connect(tickGain); tickGain.connect(context.destination);
          tick.start(now+.02); tick.stop(now+.13);
        } catch(error) {}
      });
    }

    function playAudienceReaction(reaction) {
      withMaltAudio(context => {
        const now=context.currentTime;
        if(reaction==='applause') {
          try {
            const noise=makeAudienceNoise(context,.085);
            for(let i=0;i<27;i++) {
              const source=context.createBufferSource(), filter=context.createBiquadFilter(), gain=context.createGain();
              source.buffer=noise;
              filter.type='bandpass';
              filter.frequency.value=1150+Math.random()*1450;
              filter.Q.value=.8+Math.random()*.7;
              const at=now+Math.random()*1.05, volume=.035+Math.random()*.045;
              gain.gain.setValueAtTime(.0001,at);
              gain.gain.exponentialRampToValueAtTime(volume,at+.006);
              gain.gain.exponentialRampToValueAtTime(.0001,at+.075);
              source.connect(filter); filter.connect(gain); gain.connect(context.destination);
              source.start(at); source.stop(at+.09);
            }
          } catch(error) {}
        } else {
          try {
            [148,163,177].forEach((frequency,index)=>{
              const oscillator=context.createOscillator(), gain=context.createGain(), filter=context.createBiquadFilter();
              oscillator.type=index===1?'sawtooth':'triangle';
              oscillator.frequency.setValueAtTime(frequency,now);
              oscillator.frequency.linearRampToValueAtTime(frequency*.84,now+.42);
              oscillator.frequency.linearRampToValueAtTime(frequency*1.08,now+.88);
              filter.type='lowpass'; filter.frequency.value=720;
              gain.gain.setValueAtTime(.0001,now);
              gain.gain.exponentialRampToValueAtTime(index===1?.018:.013,now+.12);
              gain.gain.setValueAtTime(index===1?.018:.013,now+.72);
              gain.gain.exponentialRampToValueAtTime(.0001,now+1.12);
              oscillator.connect(filter); filter.connect(gain); gain.connect(context.destination);
              oscillator.start(now); oscillator.stop(now+1.14);
            });
          } catch(error) {}
        }
      });
    }

    function playDayEndJingle() {
      withMaltAudio(context => {
        try {
          const now=context.currentTime+.03;
          // Melodia original de final de concurs, amb un cor electrònic alegre.
          const notes=[
            {f:523.25,t:0,d:.56},{f:659.25,t:.2,d:.58},
            {f:783.99,t:.42,d:.7},{f:987.77,t:.72,d:.82},
            {f:783.99,t:1.08,d:.62},{f:659.25,t:1.34,d:.82}
          ];
          notes.forEach(note=>{
            const osc=context.createOscillator();
            const overtone=context.createOscillator();
            const gain=context.createGain();
            const overtoneGain=context.createGain();
            osc.type='sine'; osc.frequency.value=note.f;
            overtone.type='sine'; overtone.frequency.value=note.f*2.01;
            const start=now+note.t, end=start+note.d;
            gain.gain.setValueAtTime(.0001,start);
            gain.gain.exponentialRampToValueAtTime(.052,start+.045);
            gain.gain.exponentialRampToValueAtTime(.0001,end);
            overtoneGain.gain.setValueAtTime(.0001,start);
            overtoneGain.gain.exponentialRampToValueAtTime(.009,start+.04);
            overtoneGain.gain.exponentialRampToValueAtTime(.0001,end-.001);
            osc.connect(gain); gain.connect(context.destination);
            overtone.connect(overtoneGain); overtoneGain.connect(context.destination);
            osc.start(start); osc.stop(end+.02);
            overtone.start(start); overtone.stop(end+.02);
          });
          const chordStart=now+1.78;
          [523.25,659.25,783.99].forEach((frequency,index)=>{
            const osc=context.createOscillator(), gain=context.createGain();
            osc.type='sine'; osc.frequency.value=frequency;
            gain.gain.setValueAtTime(.0001,chordStart);
            gain.gain.exponentialRampToValueAtTime(index===0?.026:.018,chordStart+.1);
            gain.gain.exponentialRampToValueAtTime(.0001,chordStart+1.25);
            osc.connect(gain); gain.connect(context.destination);
            osc.start(chordStart); osc.stop(chordStart+1.28);
          });
        } catch(error) {}
      });
    }

    function playVictoryCrowdCheer() {
      withMaltAudio(context => {
        try {
          const now=context.currentTime+.08;
          // Veus artificials superposades: una celebració alegre original, no una mostra del videojoc.
          const voices=[
            {f:480,t:0,formant:920,volume:.016},
            {f:575,t:.08,formant:1120,volume:.014},
            {f:655,t:.16,formant:1350,volume:.013},
            {f:535,t:.28,formant:1020,volume:.014},
            {f:735,t:.38,formant:1480,volume:.012}
          ];
          voices.forEach((voice,index)=>{
            const start=now+voice.t;
            const osc=context.createOscillator();
            const vibrato=context.createOscillator();
            const vibratoDepth=context.createGain();
            const formant=context.createBiquadFilter();
            const gain=context.createGain();
            osc.type='sawtooth';
            osc.frequency.setValueAtTime(voice.f,start);
            osc.frequency.exponentialRampToValueAtTime(voice.f*1.32,start+.48);
            osc.frequency.exponentialRampToValueAtTime(voice.f*1.19,start+1.12);
            vibrato.type='sine';
            vibrato.frequency.value=5.2+index*.35;
            vibratoDepth.gain.value=7+index;
            vibrato.connect(vibratoDepth);
            vibratoDepth.connect(osc.frequency);
            formant.type='bandpass';
            formant.frequency.setValueAtTime(voice.formant,start);
            formant.Q.value=1.25;
            gain.gain.setValueAtTime(.0001,start);
            gain.gain.exponentialRampToValueAtTime(voice.volume,start+.16);
            gain.gain.setValueAtTime(voice.volume,start+.72);
            gain.gain.exponentialRampToValueAtTime(.0001,start+1.38);
            osc.connect(formant);
            formant.connect(gain);
            gain.connect(context.destination);
            osc.start(start);
            vibrato.start(start);
            osc.stop(start+1.4);
            vibrato.stop(start+1.4);
          });

          // Petita remor de públic, suau i breu, per donar sensació de celebració.
          const noise=context.createBufferSource();
          const filter=context.createBiquadFilter();
          const crowdGain=context.createGain();
          noise.buffer=makeAudienceNoise(context,1.05);
          filter.type='bandpass';
          filter.frequency.value=1750;
          filter.Q.value=.55;
          crowdGain.gain.setValueAtTime(.0001,now);
          crowdGain.gain.exponentialRampToValueAtTime(.012,now+.18);
          crowdGain.gain.setValueAtTime(.012,now+.62);
          crowdGain.gain.exponentialRampToValueAtTime(.0001,now+1.08);
          noise.connect(filter);
          filter.connect(crowdGain);
          crowdGain.connect(context.destination);
          noise.start(now);
          noise.stop(now+1.1);
        } catch(error) {}
      });
    }

    const quizVictoryOverlay=document.getElementById('quizVictoryOverlay');
    const victoryScore=document.getElementById('victoryScore');
    const closeVictoryButton=document.getElementById('closeVictory');

    function showQuizVictory() {
      if(!quizVictoryOverlay) return;
      if(victoryScore) victoryScore.textContent=`${quizScore}/${questions.length} encerts`;
      quizVictoryOverlay.hidden=false;
      document.body.classList.add('quiz-victory-open');
      playDayEndJingle();
      playVictoryCrowdCheer();
      if(closeVictoryButton) closeVictoryButton.focus();
    }

    function closeQuizVictory() {
      if(!quizVictoryOverlay || quizVictoryOverlay.hidden) return;
      quizVictoryOverlay.hidden=true;
      document.body.classList.remove('quiz-victory-open');
      if(nextQuestion) nextQuestion.focus();
    }

    if(closeVictoryButton) closeVictoryButton.addEventListener('click',closeQuizVictory);
    document.addEventListener('keydown',event=>{
      if(event.key==='Escape' && quizVictoryOverlay && !quizVictoryOverlay.hidden) closeQuizVictory();
    });


    // ===== Sons del concurs: campanetes quan l'encertes, trombó trist quan falles =====
    function playCorrectSound() {
      withMaltAudio(context => {
        try {
          const now = context.currentTime + .01;
          const master = context.createGain();
          master.gain.value = .9;
          master.connect(context.destination);
          // Arpegi brillant tipus "ding-ding-ding!" (Do major que puja)
          [[1046.5, 0], [1318.5, .085], [1568, .17], [2093, .255]].forEach(([freq, at], i) => {
            [1, 2.01, 3.02].forEach((mult, h) => {
              const osc = context.createOscillator(), gain = context.createGain();
              osc.type = h === 0 ? 'triangle' : 'sine';
              osc.frequency.setValueAtTime(freq * mult, now + at);
              const peak = (h === 0 ? .07 : h === 1 ? .022 : .01) * (i === 3 ? 1.25 : 1);
              const len = i === 3 ? .9 : .38;
              gain.gain.setValueAtTime(.0001, now + at);
              gain.gain.exponentialRampToValueAtTime(peak, now + at + .008);
              gain.gain.exponentialRampToValueAtTime(.0001, now + at + len);
              osc.connect(gain); gain.connect(master);
              osc.start(now + at); osc.stop(now + at + len + .02);
            });
          });
          // Espurneig per sobre
          const source = context.createBufferSource(), filter = context.createBiquadFilter(), gain = context.createGain();
          source.buffer = makeAudienceNoise(context, .7);
          filter.type = 'highpass'; filter.frequency.value = 6500;
          gain.gain.setValueAtTime(.0001, now + .22);
          gain.gain.exponentialRampToValueAtTime(.05, now + .28);
          gain.gain.exponentialRampToValueAtTime(.0001, now + .9);
          source.connect(filter); filter.connect(gain); gain.connect(master);
          source.start(now + .22); source.stop(now + .92);
          // Picarols de públic content
          const noise = makeAudienceNoise(context, .07);
          for (let i = 0; i < 16; i++) {
            const clap = context.createBufferSource(), bp = context.createBiquadFilter(), g = context.createGain();
            clap.buffer = noise; bp.type = 'bandpass'; bp.frequency.value = 1300 + Math.random() * 1200; bp.Q.value = 1;
            const at = now + .3 + Math.random() * .8;
            g.gain.setValueAtTime(.0001, at); g.gain.exponentialRampToValueAtTime(.03 + Math.random() * .025, at + .005); g.gain.exponentialRampToValueAtTime(.0001, at + .06);
            clap.connect(bp); bp.connect(g); g.connect(master); clap.start(at); clap.stop(at + .08);
          }
        } catch (error) {}
      });
    }

    function playWrongSound() {
      withMaltAudio(context => {
        try {
          const now = context.currentTime + .01;
          const filter = context.createBiquadFilter();
          filter.type = 'lowpass'; filter.frequency.value = 1100; filter.Q.value = 2;
          const master = context.createGain(); master.gain.value = .9;
          filter.connect(master); master.connect(context.destination);
          // "Uah-uah-uah-uaaah": quatre notes que baixen, l'última amb vibrato
          const notes = [[392, 0, .3], [370, .32, .3], [349, .64, .3], [330, .96, .9]];
          notes.forEach(([freq, at, len], i) => {
            const osc = context.createOscillator(), gain = context.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq * 1.03, now + at);
            osc.frequency.exponentialRampToValueAtTime(freq, now + at + .06);
            if (i === 3) {
              const lfo = context.createOscillator(), depth = context.createGain();
              lfo.frequency.value = 6.5; depth.gain.value = 9;
              lfo.connect(depth); depth.connect(osc.frequency);
              lfo.start(now + at + .15); lfo.stop(now + at + len);
              osc.frequency.exponentialRampToValueAtTime(freq * .9, now + at + len);
            }
            gain.gain.setValueAtTime(.0001, now + at);
            gain.gain.exponentialRampToValueAtTime(.06, now + at + .03);
            gain.gain.setValueAtTime(.06, now + at + len - .08);
            gain.gain.exponentialRampToValueAtTime(.0001, now + at + len);
            // Sordina de trompeta: el filtre s'obre i es tanca a cada nota
            filter.frequency.setValueAtTime(500, now + at);
            filter.frequency.linearRampToValueAtTime(1300, now + at + .12);
            filter.frequency.linearRampToValueAtTime(600, now + at + len);
            osc.connect(gain); gain.connect(filter);
            osc.start(now + at); osc.stop(now + at + len + .02);
          });
        } catch (error) {}
      });
    }

    function playSplat(delay) {
      withMaltAudio(context => {
        try {
          const at = context.currentTime + delay;
          const source = context.createBufferSource(), filter = context.createBiquadFilter(), gain = context.createGain();
          source.buffer = makeAudienceNoise(context, .25);
          filter.type = 'lowpass'; filter.frequency.setValueAtTime(1800, at); filter.frequency.exponentialRampToValueAtTime(180, at + .2);
          gain.gain.setValueAtTime(.0001, at); gain.gain.exponentialRampToValueAtTime(.22, at + .006); gain.gain.exponentialRampToValueAtTime(.0001, at + .22);
          source.connect(filter); filter.connect(gain); gain.connect(context.destination);
          source.start(at); source.stop(at + .25);
          const thump = context.createOscillator(), tg = context.createGain();
          thump.frequency.setValueAtTime(140, at); thump.frequency.exponentialRampToValueAtTime(55, at + .12);
          tg.gain.setValueAtTime(.0001, at); tg.gain.exponentialRampToValueAtTime(.12, at + .005); tg.gain.exponentialRampToValueAtTime(.0001, at + .14);
          thump.connect(tg); tg.connect(context.destination); thump.start(at); thump.stop(at + .15);
        } catch (error) {}
      });
    }

    // Capa d'efectes a pantalla completa (només transform i opacity: van fluids al mòbil)
    function fxLayer() {
      let layer = document.getElementById('fxLayer');
      if (!layer) {
        layer = document.createElement('div');
        layer.id = 'fxLayer'; layer.className = 'fx-layer'; layer.setAttribute('aria-hidden', 'true');
        document.body.appendChild(layer);
      }
      return layer;
    }
    const fxReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fxSmall = () => window.matchMedia('(max-width: 700px)').matches;

    // ===== Confeti: esclata des de la resposta correcta, amb gravetat i fregament de l'aire =====
    function launchConfetti(originEl) {
      if (fxReduced() || !Element.prototype.animate) return;
      const layer = fxLayer();
      const r = originEl ? originEl.getBoundingClientRect() : { left: innerWidth / 2 - 40, top: innerHeight / 2, width: 80, height: 0 };
      const ox = r.left + r.width / 2, oy = r.top + r.height / 2;
      const colors = ['#edbf56', '#f39320', '#fff3c4', '#438f86', '#e87964', '#8ebc84', '#ffd25a'];
      const shapes = ['', 'is-dot', 'is-star', 'is-ribbon', '', 'is-star'];
      const count = fxSmall() ? 30 : 56;
      const ring = document.createElement('span');
      ring.className = 'fx-ring'; layer.appendChild(ring);
      ring.animate([{ transform: `translate(${ox}px,${oy}px) scale(.2)`, opacity: .9 }, { transform: `translate(${ox}px,${oy}px) scale(1.6)`, opacity: 0 }], { duration: 520, easing: 'cubic-bezier(.23,1,.32,1)' }).finished.then(() => ring.remove());
      const k = 2.4, g = 1700, steps = 14;
      for (let i = 0; i < count; i++) {
        const p = document.createElement('span');
        p.className = 'fx-confetti ' + shapes[i % shapes.length];
        p.style.background = colors[i % colors.length];
        layer.appendChild(p);
        const angle = (-90 + (Math.random() * 2 - 1) * 62) * Math.PI / 180;
        const speed = 650 + Math.random() * 900;
        const vx = Math.cos(angle) * speed, vy = Math.sin(angle) * speed;
        const life = 1.5 + Math.random() * .9;
        const spin = (Math.random() < .5 ? -1 : 1) * (360 + Math.random() * 900);
        const flip = 360 + Math.random() * 1080;
        const sway = 20 + Math.random() * 40, swayF = 2 + Math.random() * 3;
        const sx = ox + (Math.random() - .5) * r.width * .6;
        const frames = [];
        for (let s = 0; s <= steps; s++) {
          const t = life * s / steps, e = (1 - Math.exp(-k * t)) / k;
          const x = sx + vx * e + Math.sin(t * swayF) * sway * (t / life);
          const y = oy + vy * e + g / k * (t - e);
          frames.push({ transform: `translate(${x}px,${y}px) rotate(${spin * s / steps}deg) rotateX(${flip * s / steps}deg)`, opacity: s / steps > .72 ? 1 - (s / steps - .72) / .28 : 1 });
        }
        p.animate(frames, { duration: life * 1000, easing: 'linear', delay: Math.random() * 60, fill: 'backwards' }).finished.then(() => p.remove());
      }
    }

    // ===== Tomàquets: surten del públic, volen cap a la càmera i s'esclafen a la pantalla =====
    const TOMATO_SVG = '<svg viewBox="0 0 64 64"><ellipse cx="32" cy="37" rx="25" ry="22" fill="#e1352b" stroke="#2b2118" stroke-width="3"/><ellipse cx="22" cy="29" rx="7" ry="4.5" fill="#ff8a73" transform="rotate(-25 22 29)"/><path d="M32 17c-4-6-12-6-14-2 6 0 9 2 10 5-6-1-10 2-10 5 5-3 9-3 14-2 5-1 9-1 14 2 0-3-4-6-10-5 1-3 4-5 10-5-2-4-10-4-14 2z" fill="#3f9b4b" stroke="#2b2118" stroke-width="2.4" stroke-linejoin="round"/></svg>';
    function splatSvg(seed) {
      const blobs = [];
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * Math.PI * 2 + seed, d = 34 + ((i * 37 + seed * 100) % 14), rr = 7 + ((i * 13 + seed * 50) % 9);
        blobs.push(`<circle cx="${(75 + Math.cos(a) * d).toFixed(1)}" cy="${(75 + Math.sin(a) * d).toFixed(1)}" r="${rr}"/>`);
      }
      return `<svg viewBox="0 0 150 150"><g fill="#d42c22">${blobs.join('')}<path d="M75 36c22 0 40 16 40 38s-18 40-40 40-40-18-40-40 18-38 40-38z"/><path class="fx-drip" d="M58 108q-2 26 3 34 4 6 8 0 3-10 1-34zM92 104q2 16-1 22-3 5-6 0-2-8 0-22z"/></g><g fill="#ff7a62" opacity=".85"><ellipse cx="62" cy="62" rx="12" ry="7" transform="rotate(-30 62 62)"/></g><g fill="#ffd9a8"><ellipse cx="80" cy="80" rx="3" ry="2"/><ellipse cx="70" cy="88" rx="3" ry="2" transform="rotate(40 70 88)"/><ellipse cx="88" cy="70" rx="3" ry="2" transform="rotate(-20 88 70)"/></g><path d="M68 74l6-6 4 5 6-5" fill="none" stroke="#3f9b4b" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    }
    function throwTomatoes() {
      if (fxReduced() || !Element.prototype.animate) return;
      const layer = fxLayer();
      const n = fxSmall() ? 3 : 4;
      const theatre = document.querySelector('.quiz-theatre');
      for (let i = 0; i < n; i++) {
        const delay = i * 170 + Math.random() * 60;
        const tx = innerWidth * (.22 + .56 * ((i + .5) / n)) + (Math.random() - .5) * 60;
        const ty = innerHeight * (.28 + Math.random() * .34);
        const sx = tx + (Math.random() - .5) * innerWidth * .5, sy = innerHeight + 60;
        const peak = Math.min(ty, sy) - innerHeight * (.12 + Math.random() * .1);
        const spin = (Math.random() < .5 ? -1 : 1) * (300 + Math.random() * 400);
        const tomato = document.createElement('span');
        tomato.className = 'fx-tomato'; tomato.innerHTML = TOMATO_SVG;
        layer.appendChild(tomato);
        const flight = tomato.animate([
          { transform: `translate(${sx}px,${sy}px) scale(.35) rotate(0deg)` },
          { transform: `translate(${(sx + tx) / 2}px,${peak}px) scale(.75) rotate(${spin * .6}deg)`, offset: .55, easing: 'cubic-bezier(.4,0,1,1)' },
          { transform: `translate(${tx}px,${ty}px) scale(1.5) rotate(${spin}deg)` }
        ], { duration: 560, delay, easing: 'cubic-bezier(0,0,.6,1)', fill: 'both' });
        playSplat((delay + 560) / 1000);
        flight.finished.then(() => {
          tomato.remove();
          const splat = document.createElement('span');
          splat.className = 'fx-splat'; splat.innerHTML = splatSvg(Math.random() * 6);
          layer.appendChild(splat);
          const rot = Math.round((Math.random() - .5) * 40);
          const base = `translate(${tx}px,${ty}px) rotate(${rot}deg)`;
          splat.animate([
            { transform: `${base} scale(.3,.3)`, opacity: 1 },
            { transform: `${base} scale(1.18,1.05)`, opacity: 1, offset: .12 },
            { transform: `${base} scale(.96,1)`, opacity: 1, offset: .2 },
            { transform: `${base} scale(1)`, opacity: 1, offset: .55 },
            { transform: `translate(${tx}px,${ty + 46}px) rotate(${rot}deg) scale(1,1.12)`, opacity: 0 }
          ], { duration: 1500, easing: 'cubic-bezier(.23,1,.32,1)' }).finished.then(() => splat.remove());
          if (theatre) theatre.animate([{ transform: 'none' }, { transform: `translate(${(Math.random() - .5) * 10}px,4px)` }, { transform: 'none' }], { duration: 180, easing: 'ease-out' });
        });
      }
    }

    function typeGuideMessage(message) {
      guideMessage.dataset.i18nOrig = message;
      if (window.__t) message = window.__t(message);
      if(guideTypingTimer) window.clearTimeout(guideTypingTimer);
      guideMessage.textContent='';
      guideMessage.classList.remove('is-typing');
      guideMessage.setAttribute('aria-live','off');
      if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        guideMessage.textContent=message;
        guideMessage.setAttribute('aria-live','polite');
        return;
      }
      let position=0;
      // El text complet ocupa l'espai des del principi: la bombolla no canvia de mida a cada lletra.
      const shown=document.createElement('span');
      const ghost=document.createElement('span');
      ghost.className='guide-ghost'; ghost.setAttribute('aria-hidden','true'); ghost.textContent=message;
      guideMessage.replaceChildren(shown,ghost);
      guideMessage.classList.add('is-typing');
      const writeNextCharacter=()=>{
        if(position>=message.length) {
          guideMessage.classList.remove('is-typing');
          guideMessage.textContent=message;
          guideMessage.setAttribute('aria-live','polite');
          guideTypingTimer=null;
          return;
        }
        const character=message.charAt(position);
        position+=1;
        shown.textContent=message.slice(0,position);
        ghost.textContent=message.slice(position);
        if(position%2===1) playMaltBlip(character);
        let delay=29;
        if(character===' ') delay=13;
        else if(/[,:;]/.test(character)) delay=115;
        else if(/[.!?…]/.test(character)) delay=230;
        guideTypingTimer=window.setTimeout(writeNextCharacter,delay);
      };
      writeNextCharacter();
    }

    const desktopMenuLinks=[...document.querySelectorAll('#desktopNav a')];
    const mobileMenuLinks=[...document.querySelectorAll('#mobileNav a')];
    [...desktopMenuLinks,...mobileMenuLinks].forEach(link=>{
      link.addEventListener('click',()=>{ unlockMaltAudio(); playPageFlip(); });
    });
    const textSizeButton=document.getElementById('textSizeBtn');
    if(textSizeButton) textSizeButton.addEventListener('click',()=>{ unlockMaltAudio(); playPageFlip(); });

    function setGuideMessage(mood, customMessage) {
      quizGuide.dataset.mood = mood;
      const options = guideMessages[mood] || guideMessages.idle;
      const message = customMessage || options[Math.floor(Math.random() * options.length)];

      // El navegador només permet iniciar àudio després d'una acció de l'usuari.
      if (navigator.userActivation && navigator.userActivation.isActive) unlockMaltAudio();
      typeGuideMessage(message);

      if (mood === 'correct') {
        quizGuide.classList.remove('celebrate');
        void quizGuide.offsetWidth;
        quizGuide.classList.add('celebrate');
        window.setTimeout(() => quizGuide.classList.remove('celebrate'), 1450);
      } else {
        quizGuide.classList.remove('celebrate');
      }
    }


    function renderQuestion() {
      const current = questions[quizIndex];
      setGuideMessage('idle');
      quizAnswered = false;
      questionText.textContent = current.q;
      questionCount.textContent = `Pregunta ${quizIndex + 1} de ${questions.length}`;
      scoreLabel.textContent = `${quizScore} encerts`;
      quizProgress.style.transform = `scaleX(${quizIndex / questions.length})`;
      quizFeedback.textContent = '';
      nextQuestion.disabled = true;
      nextQuestion.textContent = quizIndex === questions.length - 1 ? 'Veure resultat →' : 'Següent pregunta →';
      answerList.innerHTML = '';
      current.a.forEach((answer, index) => {
        const button = document.createElement('button');
        button.type = 'button'; button.className = 'answer'; button.textContent = answer;
        button.addEventListener('click', () => chooseAnswer(index));
        answerList.appendChild(button);
      });
      scoreValue.textContent = `${quizScore}/${questions.length}`;
    }
    function chooseAnswer(index) {
      if (quizAnswered || quizFinished) return;
      quizAnswered = true;
      const current = questions[quizIndex];
      const buttons = [...answerList.querySelectorAll('button')];
      buttons.forEach((button, i) => {
        button.disabled = true;
        if (i === current.c) button.classList.add('correct');
        else if (i === index) button.classList.add('incorrect');
      });
      if (index === current.c) {
        quizScore++;
        quizFeedback.textContent = `Correcte. ${current.e}`;
        setGuideMessage('correct');
        playCorrectSound();
        launchConfetti(buttons[current.c]);
      } else {
        quizFeedback.textContent = `La resposta correcta és «${current.a[current.c]}». ${current.e}`;
        setGuideMessage('incorrect');
        playWrongSound();
        throwTomatoes();
      }
      scoreLabel.textContent = `${quizScore} encerts`;
      scoreValue.textContent = `${quizScore}/${questions.length}`;
      nextQuestion.disabled = false;
      document.getElementById('quizHint').textContent = 'Llegeix l’explicació abans de continuar.';
    }
    function finishQuiz() {
      quizFinished = true;
      quizProgress.style.transform = 'scaleX(1)';
      questionCount.textContent = 'Qüestionari completat';
      scoreLabel.textContent = `${quizScore} de ${questions.length}`;
      questionText.textContent = `Has encertat ${quizScore} de ${questions.length} preguntes.`;
      answerList.innerHTML = '';
      quizFeedback.textContent = quizScore === questions.length ? 'Resultat perfecte. Has dominat tots els conceptes del qüestionari.' : 'Pots repassar els apartats de la web i tornar-ho a provar.';
      nextQuestion.textContent = 'Tornar a començar ↻';
      nextQuestion.disabled = false;
      scoreValue.textContent = `${quizScore}/${questions.length}`;
      scoreMessage.textContent = quizScore >= 7 ? 'Molt bon domini dels conceptes.' : quizScore >= 4 ? 'Bon començament. Repassa les explicacions.' : 'Et pot anar bé tornar a consultar la web.';
      const finalMessage = quizScore === questions.length
        ? 'Repte superat! Has respost totes les preguntes. La teva curiositat està a un nivell excel·lent!'
        : quizScore >= 5
          ? 'Molt bona feina! Ja tens una bona base. Repassa les preguntes que t’han fet pensar i continua investigant.'
          : 'Bon punt de partida! Ara ja saps què pots repassar. Recorda: la curiositat és el millor ingredient per aprendre.';
      setGuideMessage('result', finalMessage);
      document.getElementById('quizHint').textContent = 'Ja pots repetir el qüestionari.';
      if (quizScore >= 6) showQuizVictory();
    }
    nextQuestion.addEventListener('click', () => {
      if (quizFinished) {
        closeQuizVictory();
        quizIndex = 0; quizScore = 0; quizFinished = false;
        questions = shuffleQuiz(QUIZ_POOLS[quizLevel]);
        scoreMessage.textContent = 'Completa el qüestionari per veure el resultat.';
        document.getElementById('quizHint').textContent = 'Tria una resposta per continuar.';
        setGuideMessage('idle', 'Tornem-hi! Aquesta vegada segur que descobriràs algun detall nou.');
        renderQuestion();
      } else if (quizIndex < questions.length - 1) {
        quizIndex++; renderQuestion();
      } else finishQuiz();
    });
    renderQuestion();
    document.querySelectorAll('.quiz-level-btn').forEach(button => button.addEventListener('click', () => {
      if (button.dataset.level === quizLevel && !quizFinished && quizIndex === 0 && !quizAnswered) return;
      quizLevel = button.dataset.level;
      document.querySelectorAll('.quiz-level-btn').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
      closeQuizVictory();
      quizIndex = 0; quizScore = 0; quizFinished = false;
      questions = shuffleQuiz(QUIZ_POOLS[quizLevel]);
      scoreMessage.textContent = 'Completa el qüestionari per veure el resultat.';
      document.getElementById('quizHint').textContent = 'Tria una resposta per continuar.';
      setGuideMessage('idle', quizLevel === 'expert' ? 'Nivell expert! Aquestes preguntes surten del treball de recerca.' : 'Nivell inicial: preguntes per començar a escalfar.');
      renderQuestion();
    }));

    // Obre les cortines del plató quan l'usuari prem la gerra SVG.
    const quizTheatre = document.getElementById('quizTheatre');
    const openCurtainsButton = document.getElementById('openCurtains');
    const quizStageContent = document.getElementById('quizStageContent');
    const quizCurtainScreen = document.getElementById('quizCurtainScreen');
    if (quizTheatre && openCurtainsButton && quizStageContent && quizCurtainScreen) {
      openCurtainsButton.addEventListener('click', () => {
        if (quizTheatre.classList.contains('curtains-open')) return;
        quizTheatre.classList.add('curtains-open');
        quizStageContent.removeAttribute('inert');
        quizStageContent.setAttribute('aria-hidden', 'false');
        openCurtainsButton.disabled = true;
        setGuideMessage('idle', 'Benvingut al Malt Show! Les cortines s’han obert: que comenci el concurs!');
        window.setTimeout(() => {
          quizCurtainScreen.hidden = true;
        }, 1150);
      });
    }

    // Glossari: filtre per matèria, sense cercador.
    const termCards = [...document.querySelectorAll('.term')];
    const termCount = document.getElementById('termCount');
    const glossaryFilters = [...document.querySelectorAll('.glossary-filter')];
    let activeGlossaryFilter = 'all';

    function updateGlossary() {
      let visible = 0;
      termCards.forEach(card => {
        const matches = activeGlossaryFilter === 'all' || card.dataset.category === activeGlossaryFilter;
        card.hidden = !matches;
        if (matches) visible++;
      });
      termCount.textContent = `${visible} ${visible === 1 ? 'concepte' : 'conceptes'}`;
    }

    glossaryFilters.forEach(button => {
      button.addEventListener('click', () => {
        activeGlossaryFilter = button.dataset.filter;
        glossaryFilters.forEach(filter => {
          const selected = filter === button;
          filter.classList.toggle('active', selected);
          filter.setAttribute('aria-pressed', String(selected));
        });
        updateGlossary();
      });
    });
    updateGlossary();


        // Microhistòries interactives: desplegament, progrés i preguntes ràpides.
    const storyCards = [...document.querySelectorAll('[data-story]')];
    const storyProgressText = document.getElementById('storyProgressText');
    const storyProgressBar = document.getElementById('storyProgressBar');
    const storyProgressFill = document.getElementById('storyProgressFill');
    function updateStoryProgress() {
      const opened = storyCards.filter(card => card.open).length;
      if (storyProgressText) storyProgressText.textContent = `${opened} de ${storyCards.length} històries desplegades`;
      if (storyProgressBar) storyProgressBar.setAttribute('aria-valuenow', String(opened));
      if (storyProgressFill) storyProgressFill.style.transform = `scaleX(${storyCards.length ? opened / storyCards.length : 0})`;
    }
    storyCards.forEach(card => {
      card.addEventListener('toggle', updateStoryProgress);
      const question = card.querySelector('[data-story-question]');
      if (!question) return;
      const answers = [...question.querySelectorAll('.story-answer')];
      const feedback = question.querySelector('.story-feedback');
      const retry = question.querySelector('.story-retry');
      answers.forEach(answer => answer.addEventListener('click', () => {
        const isCorrect = answer.dataset.correct === 'true';
        answers.forEach(option => {
          option.disabled = true;
          if (option.dataset.correct === 'true') option.classList.add('correct');
          else if (option === answer) option.classList.add('incorrect');
        });
        feedback.className = `story-feedback ${isCorrect ? 'good' : 'bad'}`;
        feedback.textContent = isCorrect
          ? 'Molt bé! Has identificat el detall important d’aquesta història.'
          : 'No ben bé. Repassa la pista de la fitxa i torna-ho a intentar.';
        retry.hidden = false;
      }));
      retry.addEventListener('click', () => {
        answers.forEach(option => { option.disabled = false; option.classList.remove('correct','incorrect'); });
        feedback.textContent = '';
        feedback.className = 'story-feedback';
        retry.hidden = true;
      });
    });
    updateStoryProgress();

    // Biblioteca d'investigació: una única vista amb totes les fonts.
    const sourceCards = [...document.querySelectorAll('.research-card[data-source-id]')];
    const researchProgressText = document.getElementById('researchProgressText');
    const researchProgressBar = document.getElementById('researchProgressBar');
    const researchProgressFill = document.getElementById('researchProgressFill');
    const consultedSources = new Set();

    function updateResearchProgress() {
      const total = sourceCards.length;
      const count = consultedSources.size;
      if (researchProgressText) researchProgressText.textContent = `${count} / ${total} consultades`;
      if (researchProgressBar) researchProgressBar.setAttribute('aria-valuenow', String(count));
      if (researchProgressFill) researchProgressFill.style.transform = `scaleX(${total ? count / total : 0})`;
    }

    sourceCards.forEach(card => {
      const sourceLink = card.querySelector('.research-card-actions a');
      const sourceId = card.dataset.sourceId;
      if (!sourceLink || !sourceId) return;
      sourceLink.addEventListener('click', () => {
        if (consultedSources.has(sourceId)) return;
        consultedSources.add(sourceId);
        sourceLink.classList.add('source-visited');
        sourceLink.setAttribute('aria-label', `${sourceLink.textContent.trim()} · Font consultada`);
        updateResearchProgress();
      });
    });
    updateResearchProgress();

    // Enllaç actiu a la navegació segons la secció visible
    const navLinks = [...document.querySelectorAll('#desktopNav a')];
    if ('IntersectionObserver' in window) {
      const sectionObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
          }
        });
      }, { rootMargin: '-35% 0px -55% 0px' });
      document.querySelectorAll('main section[id]').forEach(section => sectionObserver.observe(section));
    }

    // ===== Capa visual: titulars revelats i inclinació 3D amb molla =====
    (() => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Titulars de secció: clip-path quan entren a la pantalla
      if ('IntersectionObserver' in window && !reduceMotion) {
        const heads = document.querySelectorAll('.section-head');
        const headObserver = new IntersectionObserver(entries => {
          entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-in');
            headObserver.unobserve(entry.target);
          });
        }, { rootMargin: '0px 0px -10% 0px' });
        document.documentElement.classList.add('has-head-reveal');
        heads.forEach(head => headObserver.observe(head));
      }

      // Hero: inclinació que segueix el ratolí amb física de molla (només decoratiu)
      const hero = document.querySelector('.hero');
      const heroArtEl = document.querySelector('.hero-art');
      const orbit = heroArtEl && heroArtEl.querySelector('.art-orbit');
      if (!hero || !orbit || reduceMotion || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

      heroArtEl.classList.add('has-tilt');
      const STIFFNESS = 140, DAMPING = 16, MAX_TILT = 11;
      const state = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0 };
      let frame = 0, lastTime = 0;

      function tick(time) {
        const dt = lastTime ? Math.min(0.032, (time - lastTime) / 1000) : 0.016;
        lastTime = time;
        for (const axis of ['x', 'y']) {
          const v = 'v' + axis, t = 't' + axis;
          const force = -STIFFNESS * (state[axis] - state[t]) - DAMPING * state[v];
          state[v] += force * dt;
          state[axis] += state[v] * dt;
        }
        orbit.style.transform = `perspective(900px) rotateX(${state.y.toFixed(2)}deg) rotateY(${state.x.toFixed(2)}deg)`;
        const moving = Math.abs(state.x - state.tx) + Math.abs(state.y - state.ty) + Math.abs(state.vx) + Math.abs(state.vy) > 0.02;
        if (moving) frame = requestAnimationFrame(tick);
        else { frame = 0; lastTime = 0; }
      }
      const wake = () => { if (!frame) frame = requestAnimationFrame(tick); };

      hero.addEventListener('pointermove', event => {
        const rect = orbit.getBoundingClientRect();
        const nx = (event.clientX - (rect.left + rect.width / 2)) / rect.width;
        const ny = (event.clientY - (rect.top + rect.height / 2)) / rect.height;
        state.tx = Math.max(-1, Math.min(1, nx)) * MAX_TILT;
        state.ty = Math.max(-1, Math.min(1, ny)) * -MAX_TILT;
        wake();
      });
      hero.addEventListener('pointerleave', () => { state.tx = 0; state.ty = 0; wake(); });
    })();

    // ===== Curiositat: progrés unificat, línia del temps, portada viva, sorpreses i atajos =====
    (function () {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      const store = {
        get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
        set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
      };

      const toast = document.createElement('div');
      toast.className = 'toast-lite'; toast.setAttribute('role', 'status'); toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
      let toastTimer;
      function showToast(message) {
        toast.textContent = message; toast.classList.add('is-in');
        clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('is-in'), 3400);
      }

      // Gerra d'exploració: històries, curiositats, fonts i el concurs en un sol indicador
      const notes = [...document.querySelectorAll('.history-note')];
      const stories = [...document.querySelectorAll('[data-story]')];
      const sources = [...document.querySelectorAll('.research-card[data-source-id]')];
      const journey = document.getElementById('journey');
      const journeyCount = document.getElementById('journeyCount');
      const ids = [...notes.map((_, i) => 'h' + i), ...stories.map((_, i) => 's' + i), ...sources.map(c => 'f' + c.dataset.sourceId), 'quiz'];
      const valid = new Set(ids);
      let explored;
      try { explored = new Set(JSON.parse(store.get('cervesa-viatge') || '[]').filter(id => valid.has(id))); } catch (e) { explored = new Set(); }
      function renderJourney(pulse) {
        if (!journey) return;
        journey.style.setProperty('--fill', String(explored.size / ids.length));
        journeyCount.textContent = explored.size + '/' + ids.length;
        journey.classList.toggle('is-full', explored.size >= ids.length);
        if (pulse && !reduce) { journey.classList.remove('pulse'); void journey.offsetWidth; journey.classList.add('pulse'); }
      }
      function mark(id) {
        if (!valid.has(id) || explored.has(id)) return;
        explored.add(id); store.set('cervesa-viatge', JSON.stringify([...explored])); renderJourney(true);
        if (explored.size === ids.length) showToast('Has explorat tota la web. Enhorabona!');
      }
      renderJourney(false);
      notes.forEach((el, i) => el.addEventListener('toggle', () => { if (el.open) mark('h' + i); }));
      stories.forEach((el, i) => el.addEventListener('toggle', () => { if (el.open) mark('s' + i); }));
      sources.forEach(card => {
        const link = card.querySelector('.research-card-actions a');
        if (link) link.addEventListener('click', () => mark('f' + card.dataset.sourceId));
      });
      const overlay = document.getElementById('quizVictoryOverlay');
      if (overlay) new MutationObserver(() => { if (!overlay.hidden) mark('quiz'); }).observe(overlay, { attributes: true, attributeFilter: ['hidden'] });

      // Línia del temps: es dibuixa amb el scroll i cada nota s'il·lumina en arribar-hi
      const timeline = document.querySelector('.history-notes');
      if (timeline) {
        if (reduce || !('IntersectionObserver' in window)) notes.forEach(n => n.classList.add('is-reached'));
        else {
          timeline.classList.add('tl-ready');
          const io = new IntersectionObserver(entries => entries.forEach(e => {
            if (e.isIntersecting) { e.target.classList.add('is-reached'); io.unobserve(e.target); }
          }), { rootMargin: '0px 0px -38% 0px' });
          notes.forEach(n => io.observe(n));
          let queued = false;
          const update = () => {
            queued = false;
            const r = timeline.getBoundingClientRect();
            const progress = Math.max(0, Math.min(1, (window.innerHeight * 0.62 - r.top) / r.height));
            timeline.style.setProperty('--tl', progress.toFixed(3));
          };
          window.addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(update); } }, { passive: true });
          window.addEventListener('resize', update);
          update();
        }
      }

      // Portada: paral·laxi suau amb inèrcia (només amb ratolí) i sorpresa amagada
      const art = document.querySelector('.hero-art');
      if (art && finePointer && !reduce) {
        let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
        const loop = () => {
          cx += (tx - cx) * 0.12; cy += (ty - cy) * 0.12;
          art.style.setProperty('--px', cx.toFixed(3)); art.style.setProperty('--py', cy.toFixed(3));
          raf = (Math.abs(tx - cx) > 0.002 || Math.abs(ty - cy) > 0.002) ? requestAnimationFrame(loop) : 0;
        };
        const go = () => { if (!raf) raf = requestAnimationFrame(loop); };
        art.addEventListener('pointermove', e => {
          const r = art.getBoundingClientRect();
          tx = ((e.clientX - r.left) / r.width - 0.5) * 2; ty = ((e.clientY - r.top) / r.height - 0.5) * 2; go();
        });
        art.addEventListener('pointerleave', () => { tx = 0; ty = 0; go(); });
      }
      function burst() {
        if (!art || reduce) return;
        const r = art.getBoundingClientRect();
        for (let i = 0; i < 16; i++) {
          const b = document.createElement('span'); const size = 10 + Math.random() * 22;
          b.className = 'bubble-burst';
          b.style.cssText = 'left:' + (r.left + r.width / 2) + 'px;top:' + (r.top + r.height / 2) + 'px;width:' + size + 'px;height:' + size + 'px';
          document.body.appendChild(b);
          const dx = (Math.random() - 0.5) * 360, dy = -(80 + Math.random() * 260);
          b.animate([
            { transform: 'translate(-50%,-50%) scale(.4)', opacity: 0 },
            { opacity: 1, offset: 0.15 },
            { transform: 'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + dy + 'px)) scale(1)', opacity: 0 }
          ], { duration: 900 + Math.random() * 700, easing: 'cubic-bezier(.23,1,.32,1)', fill: 'forwards' }).onfinish = () => b.remove();
        }
      }
      if (art) {
        let clicks = 0, timer;
        art.addEventListener('click', () => {
          clicks++; clearTimeout(timer); timer = setTimeout(() => { clicks = 0; }, 1800);
          if (clicks >= 5) { clicks = 0; burst(); showToast("Sorpresa! Has trobat l'escuma secreta."); }
        });
      }

      // Enllaç «Següent» al final de cada secció, amb el títol de la següent
      const order = ['historia', 'ingredients', 'ciencia', 'simulador', 'quiz', 'curiositats', 'glossari', 'fonts', 'treball'];
      order.slice(0, -1).forEach((id, i) => {
        const section = document.getElementById(id), next = document.getElementById(order[i + 1]);
        const title = next && next.querySelector('h2');
        if (!section || !title) return;
        const link = document.createElement('a');
        link.className = 'next-hook'; link.href = '#' + order[i + 1];
        link.innerHTML = '<small>Següent</small><span></span><b aria-hidden="true">→</b>';
        link.querySelector('span').textContent = title.textContent.trim();
        (section.querySelector(':scope > .wrap') || section).appendChild(link);
      });

      // Dada curiosa i atajos de teclat al peu
      const footerBox = document.querySelector('.footer-inner > div');
      if (footerBox) {
        const facts = [
          "A la cova de Raqefet, a l'actual Israel, s'han estudiat restes que apunten a una beguda fermentada de cereals.",
          "La disposició coneguda com a Reinheitsgebot va regular determinats ingredients a Baviera.",
          "Les investigacions de Louis Pasteur van ajudar a demostrar que la fermentació està relacionada amb els microorganismes.",
          "A Mesopotàmia, la figura de Ninkasi va quedar vinculada a la cervesa."
        ];
        const fact = document.createElement('div');
        fact.className = 'footer-fact';
        const label = document.createElement('strong'); label.textContent = 'Sabies que…? ';
        fact.append(label, document.createTextNode(facts[Math.floor(Math.random() * facts.length)]));
        footerBox.appendChild(fact);
        if (finePointer) {
          const tip = document.createElement('div'); tip.className = 'footer-fact';
          tip.textContent = 'Consell: prem les tecles 1–9 per saltar entre seccions.'; footerBox.appendChild(tip);
        }
      }
      document.addEventListener('keydown', e => {
        if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
        const t = e.target;
        if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
        if (document.body.classList.contains('quiz-victory-open')) return;
        const n = Number(e.key);
        if (n >= 1 && n <= order.length) {
          const target = document.getElementById(order[n - 1]);
          if (target) { target.scrollIntoView({ behavior: 'instant', block: 'start' }); e.preventDefault(); }
        }
      });
    })();

    // ===== Simulador: fes la teva cervesa =====
    (() => {
      const form = document.getElementById('simForm');
      if (!form) return;
      const $ = id => document.getElementById(id);
      const mash = $('simMash');
      const SRM = { pale: 4, wheat: 3.5, caramel: 14, roast: 38 };
      const OG = { low: 1.040, mid: 1.052, high: 1.068 };
      const IBU = { low: 15, mid: 30, high: 55 };
      const srmTable = [[2, '#f8f753'], [3, '#f6f513'], [4, '#ece61a'], [6, '#d5bc26'], [8, '#bf923b'], [10, '#bf813a'], [13, '#bc6733'], [17, '#a13700'], [20, '#8e2900'], [24, '#651300'], [29, '#4c0505'], [35, '#3b0201'], [40, '#36080a']];
      const colorFor = v => srmTable.reduce((best, row) => Math.abs(row[0] - v) < Math.abs(best[0] - v) ? row : best)[1];
      const fmt = (v, d) => v.toLocaleString('ca-ES', { minimumFractionDigits: d, maximumFractionDigits: d });
      const val = name => form.querySelector(`input[name="${name}"]:checked`).value;
      function styleName(malt, hops, yeast) {
        if (malt === 'roast') return yeast === 'ale' ? 'Stout' : 'Schwarzbier';
        if (malt === 'caramel') return yeast === 'ale' ? 'Amber Ale' : 'Märzen';
        if (malt === 'wheat') return yeast === 'ale' ? 'Cervesa de blat' : 'Lager de blat';
        if (yeast === 'lager') return hops === 'low' ? 'Lager suau' : 'Pilsner';
        return hops === 'high' ? 'IPA' : hops === 'mid' ? 'Pale Ale' : 'Blonde Ale';
      }
      function update() {
        const malt = val('malt'), amount = val('amount'), hops = val('hops'), yeast = val('yeast');
        const t = Number(mash.value);
        $('simMashOut').textContent = t + ' °C';
        const og = OG[amount];
        const attenuation = 0.82 - (t - 62) * 0.016 + (yeast === 'lager' ? 0.02 : 0);
        const fg = 1 + (og - 1) * (1 - attenuation);
        const abv = (og - fg) * 131.25;
        const srm = SRM[malt] * ({ low: 0.8, mid: 1, high: 1.3 })[amount];
        $('simLiquid').setAttribute('fill', colorFor(srm));
        $('simHaze').setAttribute('opacity', malt === 'wheat' ? '.38' : '0');
        $('simStyle').textContent = styleName(malt, hops, yeast);
        $('simAbv').textContent = fmt(abv, 1) + ' %';
        $('simColor').textContent = malt === 'wheat' ? 'Daurat tèrbol' : srm < 7 ? 'Daurat pàl·lid' : srm < 20 ? 'Ambre' : srm < 30 ? 'Marró' : 'Negre';
        $('simBitter').textContent = IBU[hops] < 20 ? 'Suau' : IBU[hops] < 40 ? 'Equilibrada' : 'Intensa';
        $('simBody').textContent = t <= 64 ? 'Sec' : t <= 68 ? 'Equilibrat' : 'Amb cos';
        $('simAroma').textContent = yeast === 'lager' ? 'Net i suau' : malt === 'wheat' ? 'Afruitat, de plàtan' : malt === 'roast' ? 'Torrat, de cafè' : 'Afruitat';
        $('simGravity').textContent = fmt(og, 3) + ' → ' + fmt(fg, 3);
        $('simNote').textContent = t <= 64
          ? 'Maceració baixa: la beta-amilasa produeix més maltosa, el llevat en fermenta més i la cervesa queda més seca i amb més alcohol.'
          : t >= 69
            ? 'Maceració alta: l’alfa-amilasa deixa sucres que el llevat no pot fermentar, i la cervesa té més cos i és més dolça.'
            : 'Maceració intermèdia: un equilibri entre alcohol i cos.';
      }
      form.addEventListener('input', update);
      form.addEventListener('change', update);
      form.addEventListener('submit', e => e.preventDefault());
      document.querySelectorAll('.sim-style').forEach(button => button.addEventListener('click', () => {
        const [malt, amount, t, hops, yeast] = button.dataset.preset.split(',');
        form.querySelector(`input[name="malt"][value="${malt}"]`).checked = true;
        form.querySelector(`input[name="amount"][value="${amount}"]`).checked = true;
        form.querySelector(`input[name="hops"][value="${hops}"]`).checked = true;
        form.querySelector(`input[name="yeast"][value="${yeast}"]`).checked = true;
        mash.value = t;
        document.querySelectorAll('.sim-style').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
        update();
      }));
      update();
    })();

    // ===== Malt et fa de guia per la web =====
    (() => {
      const lines = {
        historia: 'Comencem pel principi: fa milers d’anys que fem cervesa!',
        ingredients: 'Només quatre ingredients… però cadascun hi fa una feina diferent.',
        ciencia: 'Aquí passa la màgia: el llevat converteix el sucre en alcohol i bombolles.',
        simulador: 'Et toca a tu! Tria els ingredients i mira quina cervesa en surt.',
        quiz: 'Ei, aquest és el meu escenari! Obre el teló quan vulguis.',
        curiositats: 'Cada fitxa amaga una història. Quina obriràs primer?',
        glossari: 'Una paraula que no coneixes? Segur que és aquí.',
        fonts: 'Un bon investigador sempre contrasta les fonts.',
        treball: 'Aquí t’explico com s’ha fet tot aquest treball.'
      };
      let muted = false;
      try { muted = localStorage.getItem('cervesa-malt-guia') === 'off'; } catch (e) {}
      if (muted || !('IntersectionObserver' in window)) return;
      const tip = document.createElement('div');
      tip.className = 'malt-tip'; tip.setAttribute('role', 'status'); tip.hidden = true;
      tip.innerHTML = '<span class="malt-tip-face" aria-hidden="true"></span><p class="malt-tip-text"></p><button type="button" class="malt-tip-close" aria-label="Tanca">×</button><button type="button" class="malt-tip-mute">No ho tornis a mostrar</button>';
      document.body.appendChild(tip);
      const text = tip.querySelector('.malt-tip-text');
      const seen = new Set();
      let timer;
      const hide = () => { tip.classList.remove('is-in'); clearTimeout(timer); timer = setTimeout(() => { tip.hidden = true; }, 220); };
      function show(id) {
        // Just després de l'entrada, deixa respirar la pàgina abans de parlar
        const calm = (window.__journeyStart || 0) + 2600 - Date.now();
        if (document.body.classList.contains('onboarding-active')) { seen.delete(id); return; }
        if (calm > 0) { setTimeout(() => show(id), calm); return; }
        if (document.documentElement.classList.contains('presenting') || document.body.classList.contains('quiz-victory-open')) return;
        clearTimeout(timer);
        text.textContent = lines[id];
        tip.hidden = false;
        requestAnimationFrame(() => tip.classList.add('is-in'));
        timer = setTimeout(hide, 6500);
      }
      tip.querySelector('.malt-tip-close').addEventListener('click', hide);
      tip.querySelector('.malt-tip-mute').addEventListener('click', () => {
        try { localStorage.setItem('cervesa-malt-guia', 'off'); } catch (e) {}
        io.disconnect(); hide();
      });
      const io = new IntersectionObserver(entries => entries.forEach(entry => {
        if (!entry.isIntersecting || seen.has(entry.target.id)) return;
        seen.add(entry.target.id);
        show(entry.target.id);
      }), { rootMargin: '-40% 0px -45% 0px' });
      Object.keys(lines).forEach(id => { const el = document.getElementById(id); if (el) io.observe(el); });
    })();

    // ===== Diploma del concurs =====
    (() => {
      const btn = document.getElementById('certBtn');
      if (!btn) return;
      const t = s => (window.__t ? window.__t(s) : s);
      btn.addEventListener('click', async () => {
        const name = (document.getElementById('certName').value || '').trim() || t('Investigador o investigadora');
        try { await Promise.all([document.fonts.load('400 40px ' + (getComputedStyle(document.documentElement).getPropertyValue('--heading-font').trim() || 'serif')), document.fonts.load('700 40px "Nunito Sans"')]); } catch (e) {}
        const c = document.createElement('canvas');
        c.width = 1600; c.height = 1130;
        const g = c.getContext('2d');
        const headingFont = getComputedStyle(document.documentElement).getPropertyValue('--heading-font').trim() || 'serif';
        const display = headingFont + ', "PingFang SC", "Noto Sans SC", "Microsoft YaHei", sans-serif';
        const body = '"Nunito Sans", "PingFang SC", "Noto Sans SC", "Microsoft YaHei", sans-serif';
        g.fillStyle = '#fff8e8'; g.fillRect(0, 0, 1600, 1130);
        g.strokeStyle = '#26354a'; g.lineWidth = 10; g.strokeRect(40, 40, 1520, 1050);
        g.strokeStyle = '#edbf56'; g.lineWidth = 4; g.strokeRect(64, 64, 1472, 1002);
        g.textAlign = 'center'; g.fillStyle = '#26354a';
        g.font = `700 40px ${body}`; g.fillText(t('Malt Show · La cervesa, més que una beguda'), 800, 190);
        g.font = `400 120px ${display}`; g.fillText(t('Diploma'), 800, 330);
        g.font = `600 40px ${body}`; g.fillText(t('Certifiquem que'), 800, 440);
        g.font = `400 86px ${display}`; g.fillStyle = '#8f4f26'; g.fillText(name, 800, 560, 1300);
        g.fillStyle = '#26354a'; g.font = `600 40px ${body}`;
        g.fillText(t('ha superat el gran concurs de la cervesa amb'), 800, 660);
        const score = (document.getElementById('victoryScore') || {}).textContent || '';
        g.font = `400 72px ${display}`; g.fillText(score, 800, 770);
        const lang = document.documentElement.lang || 'ca';
        g.font = `600 32px ${body}`; g.fillStyle = '#52665f';
        g.fillText(new Date().toLocaleDateString(lang, { day: 'numeric', month: 'long', year: 'numeric' }), 800, 880);
        g.fillText(t('Treball de Recerca d\'Àlex López'), 800, 940);
        g.fillStyle = '#edbf56'; g.beginPath(); g.arc(1380, 930, 70, 0, Math.PI * 2); g.fill();
        g.strokeStyle = '#26354a'; g.lineWidth = 6; g.stroke();
        g.fillStyle = '#26354a'; g.font = `700 64px ${display}`; g.fillText('🏆', 1380, 952);
        const a = document.createElement('a');
        a.download = 'diploma-malt-show.png';
        a.href = c.toDataURL('image/png');
        document.body.appendChild(a); a.click(); a.remove();
      });
    })();

    // ===== Mode presentació =====
    (() => {
      const btn = document.getElementById('presentBtn');
      const slides = () => [document.getElementById('inici'), ...document.querySelectorAll('main > section[id]')].filter(Boolean);
      const bar = document.createElement('div');
      bar.className = 'present-bar'; bar.hidden = true;
      bar.innerHTML = '<button type="button" class="present-prev" aria-label="Secció anterior">←</button><span class="present-count" aria-live="polite"></span><button type="button" class="present-next" aria-label="Secció següent">→</button><button type="button" class="present-exit">Surt</button>';
      document.body.appendChild(bar);
      const count = bar.querySelector('.present-count');
      let idx = 0;
      const go = i => {
        const list = slides();
        idx = Math.max(0, Math.min(list.length - 1, i));
        list[idx].scrollIntoView({ behavior: 'instant', block: 'start' });
        count.textContent = (idx + 1) + ' / ' + list.length;
      };
      const current = () => {
        const list = slides();
        let best = 0;
        list.forEach((el, i) => { if (el.getBoundingClientRect().top <= 80) best = i; });
        return best;
      };
      function start() {
        document.documentElement.classList.add('presenting');
        bar.hidden = false;
        if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {});
        go(0);
      }
      function stop() {
        document.documentElement.classList.remove('presenting');
        bar.hidden = true;
        if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {});
      }
      if (btn) btn.addEventListener('click', start);
      bar.querySelector('.present-prev').addEventListener('click', () => go(current() - 1));
      bar.querySelector('.present-next').addEventListener('click', () => go(current() + 1));
      bar.querySelector('.present-exit').addEventListener('click', stop);
      document.addEventListener('keydown', e => {
        if (!document.documentElement.classList.contains('presenting')) {
          if ((e.key === 'p' || e.key === 'P') && !e.metaKey && !e.ctrlKey && !e.altKey && !/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) { start(); e.preventDefault(); }
          return;
        }
        if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
        if (['ArrowRight', 'PageDown'].includes(e.key)) { go(current() + 1); e.preventDefault(); }
        else if (['ArrowLeft', 'PageUp'].includes(e.key)) { go(current() - 1); e.preventDefault(); }
        else if (e.key === 'Escape') stop();
      });
      document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement && document.documentElement.classList.contains('presenting')) stop(); });
    })();
  
    // Atura les animacions decoratives de l'inici quan queden fora de la pantalla
    (() => {
      const hero = document.getElementById('inici');
      if (!hero || !('IntersectionObserver' in window)) return;
      new IntersectionObserver(([entry]) => hero.classList.toggle('is-offscreen', !entry.isIntersecting)).observe(hero);
    })();


// ===== Entrada guiada: omple el got, l'onada et porta a MALT i les respostes trien per on comences =====
    (() => {
      const KEY = 'cervesa-intro-vista';
      const onboarding = document.getElementById('beerOnboarding');
      const openPage = () => {
        document.body.classList.remove('onboarding-active');
        ['.skip-link', '.topbar', '#main-content'].forEach(sel => document.querySelector(sel)?.removeAttribute('inert'));
      };
      const remember = () => { try { sessionStorage.setItem(KEY, '1'); } catch (e) {} };   // l'entrada surt a cada visita nova

      // Torna a veure la introducció (enllaç del peu de pàgina)
      document.getElementById('replayIntro')?.addEventListener('click', event => {
        event.preventDefault();
        try { sessionStorage.removeItem(KEY); } catch (e) {}
        window.scrollTo(0, 0);
        location.reload();
      });

      if (!onboarding) { openPage(); return; }
      if (document.documentElement.classList.contains('ob-seen')) { onboarding.remove(); openPage(); return; }

      const glass = document.getElementById('onboardingGlass');
      const welcome = document.getElementById('onboardingWelcome');
      const interests = document.getElementById('onboardingInterests');
      const form = document.getElementById('onboardingInterestForm');
      const status = document.getElementById('onboardingGlassStatus');
      const flood = document.getElementById('onboardingFlood');
      const says = document.getElementById('onboardingMaltSays');
      const bubble = says?.closest('.ob-bubble');
      const maltImg = onboarding.querySelector('.ob-malt-img');
      const goBtn = document.getElementById('onboardingContinue');
      const goText = document.getElementById('onboardingGoText');
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const wait = ms => new Promise(r => setTimeout(r, reduced ? Math.min(ms, 60) : ms));
      const EASE_INOUT = 'cubic-bezier(.77,0,.175,1)';

      const showInterests = () => {
        welcome.hidden = true;
        interests.hidden = false;
        document.getElementById('onboardingSkip')?.remove();
        requestAnimationFrame(() => {
          interests.classList.add('is-in');
          document.getElementById('onboardingMaltTitle')?.focus({ preventScroll: true });
        });
      };

      let started = false;
      glass.addEventListener('click', async () => {
        if (started) return;
        started = true;
        glass.disabled = true;
        welcome.classList.add('is-filling');
        status.textContent = "S'està omplint…";
        await wait(1300);
        welcome.classList.add('is-full');
        status.textContent = 'Ple! Ja vessa.';
        await wait(260);
        welcome.classList.add('is-spilling');
        await wait(520);
        if (reduced || !flood.animate) { showInterests(); return; }
        // L'onada puja, tapa la pantalla, canvia d'escena i continua cap amunt
        flood.classList.add('is-on');
        await flood.animate([{ transform: 'translateY(110%)' }, { transform: 'translateY(0)' }], { duration: 640, easing: EASE_INOUT, fill: 'forwards' }).finished;
        showInterests();
        await flood.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-118%)' }], { duration: 620, easing: EASE_INOUT, fill: 'forwards' }).finished;
        flood.remove();
      });

      // ----- Enquesta en tres passos: respostes anònimes per al Treball de Recerca -----
      // Supabase: posa aquí la URL del projecte i la clau pública (publishable / anon).
      // La clau pública es pot veure al navegador; la taula només deixa AFEGIR files, no llegir-les.
      const SURVEY_DB = { url: '', key: '' };
      const SENT_KEY = 'cervesa-enquesta-enviada';
      const hasDb = !!(SURVEY_DB.url && SURVEY_DB.key);
      form.querySelectorAll('[data-needs-db]').forEach(el => { el.hidden = !hasDb; });
      form.querySelectorAll('[data-no-db]').forEach(el => { el.hidden = hasDb; });

      const LINES = {
        historia: "Viatjarem milers d'anys enrere!",
        ciencia: 'Llevat, sucre i bombolles: la meva especialitat.',
        ingredients: 'Només quatre ingredients, i quantes cerveses diferents!',
        tot: 'Doncs farem el recorregut sencer!',
        origen: 'Començarem pel principi de tot.',
        fermentacio: 'Anirem directes on el llevat fa la feina.',
        recepta: "Prepara't: tindràs el teu propi simulador.",
        curiositats: "Tinc un munt d'històries per explicar-te.",
        inici: 'Cap problema: el concurs serà de nivell inicial.',
        mitja: 'Perfecte, anirem al teu ritme.',
        aprofundir: 'Et deixo el concurs en nivell expert!',
        'age_range': 'Apuntat! Ara ja sé una mica més de tu.',
        'role:alumne_montjuic': "Algú de l'institut! Benvingut a casa.",
        'role:professor': 'Un professor! Hauré de fer-ho molt bé.',
        'role': 'Encantat de conèixer-te!',
        'found_via:qr': 'El codi QR funciona! Que bé.',
        'found_via': 'Gràcies per passar per aquí!',
        'nsnc': 'Cap problema: per això hi som!',
        'guess': 'Interessant… ho comprovarem durant el recorregut.',
        'learn_style:jocs': 'Doncs tinc un concurs i un simulador esperant-te!',
        'learn_style': 'Apuntat! Hi ha una mica de tot a la web.',
        'science_interest': "Gràcies! Intentaré que t'interessi encara més."
      };
      const STEP_LINES = {
        1: "Hola! Sóc en Malt. Abans de començar, t'acompanyo en tres passos ràpids.",
        2: 'Ara una mica de joc: què en saps, de cervesa?',
        3: 'Última parada: tria per on vols començar.'
      };
      const DEST = {
        historia: ['historia', 'Comença per la història'],
        tot: ['historia', 'Comença per la història'],
        origen: ['historia', 'Comença per la història'],
        ciencia: ['ciencia', 'Comença per la ciència'],
        fermentacio: ['ciencia', 'Comença per la ciència'],
        ingredients: ['ingredients', 'Comença pels ingredients'],
        recepta: ['simulador', 'Comença pel simulador'],
        curiositats: ['curiositats', 'Comença per les curiositats']
      };
      const val = name => form.querySelector(`input[name="${name}"]:checked`)?.value || null;
      const destination = () => DEST[val('interestDiscover')] || DEST[val('interestPart')] || ['historia', 'Comença el recorregut'];
      const replay = (el, cls) => { if (!el) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };
      const maltSay = line => {
        if (!line || !says) return;
        says.textContent = line; replay(bubble, 'is-talking');
        if (maltImg?.animate && !reduced) maltImg.animate([{ transform: 'none' }, { transform: 'translateY(-10px) rotate(-4deg)' }, { transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.34,1.56,.64,1)' });
      };

      form.addEventListener('change', event => {
        const { name, value } = event.target;
        if (event.target.type !== 'radio') return;
        let line = LINES[`${name}:${value}`] || (name.startsWith('interest') ? LINES[value] : null) || LINES[name];
        if (name.startsWith('guess_')) line = value === 'nsnc' ? LINES.nsnc : LINES.guess;
        maltSay(line);
        const label = destination()[1];
        if (goText.textContent !== label) { goText.textContent = label; replay(goBtn, 'is-updated'); }
      });

      // Passos
      const steps = [...form.querySelectorAll('.ob-step')];
      const backBtn = document.getElementById('onboardingBack');
      const nextBtn = document.getElementById('onboardingNext');
      const stepLabel = document.getElementById('onboardingStepLabel');
      const stepFill = document.getElementById('onboardingStepFill');
      let step = 1;
      const goTo = n => {
        const from = steps[step - 1], to = steps[n - 1], dir = n > step ? 1 : -1;
        step = n;
        from.hidden = true; from.classList.remove('is-current');
        to.hidden = false; to.classList.add('is-current');
        if (to.animate && !reduced) to.animate([{ opacity: 0, transform: `translateX(${24 * dir}px)` }, { opacity: 1, transform: 'none' }], { duration: 280, easing: 'cubic-bezier(.23,1,.32,1)' });
        backBtn.hidden = n === 1;
        nextBtn.hidden = n === steps.length;
        goBtn.hidden = n !== steps.length;
        stepLabel.textContent = `Pas ${n} de ${steps.length}`;
        stepFill.style.transform = `scaleX(${n / steps.length})`;
        maltSay(STEP_LINES[n]);
        interests.scrollTo({ top: 0, behavior: reduced ? 'instant' : 'smooth' });
        to.querySelector('.ob-step-title')?.focus({ preventScroll: true });
      };
      stepFill.style.transform = `scaleX(${1 / steps.length})`;
      nextBtn.addEventListener('click', () => { if (step < steps.length) goTo(step + 1); });
      backBtn.addEventListener('click', () => { if (step > 1) goTo(step - 1); });

      const sendSurvey = () => {
        if (!hasDb) return;
        if (!form.querySelector('input[name="consent"]')?.checked) return;
        if (form.querySelector('input[name="website"]')?.value) return;   // robot
        try { if (localStorage.getItem(SENT_KEY)) return; } catch (e) {}
        let lang = 'ca';
        try { lang = localStorage.getItem('cervesa-lang') || 'ca'; } catch (e) {}
        const wish = (form.querySelector('#obWish')?.value || '').trim().slice(0, 200) || null;
        const row = {
          lang: ['ca', 'es', 'en', 'de', 'zh'].includes(lang) ? lang : 'ca',
          age_range: val('age_range'), role: val('role'), found_via: val('found_via'),
          guess_ingredients: val('guess_ingredients'), guess_yeast: val('guess_yeast'),
          guess_origin: val('guess_origin'), guess_nonalcoholic: val('guess_nonalcoholic'),
          guess_hops: val('guess_hops'), guess_cereal: val('guess_cereal'),
          interest_part: val('interestPart'), interest_discover: val('interestDiscover'), interest_level: val('interestLevel'),
          learn_style: val('learn_style'), science_interest: val('science_interest') ? Number(val('science_interest')) : null,
          wish
        };
        if (Object.entries(row).every(([k, v]) => k === 'lang' || v == null)) return;   // no ha respost res
        const headers = { 'Content-Type': 'application/json', apikey: SURVEY_DB.key, Prefer: 'return=minimal' };
        if (SURVEY_DB.key.startsWith('eyJ')) headers.Authorization = `Bearer ${SURVEY_DB.key}`;
        fetch(`${SURVEY_DB.url.replace(/\/$/, '')}/rest/v1/intro_responses`, { method: 'POST', headers, body: JSON.stringify(row), keepalive: true })
          .then(r => { if (r.ok) { try { localStorage.setItem(SENT_KEY, '1'); } catch (e) {} } })
          .catch(() => {});
      };

      const finish = (target, level) => {
        remember();
        if (level) document.querySelector(`.quiz-level-btn[data-level="${level}"]`)?.click();
        openPage();
        window.__journeyStart = Date.now();
        const section = target && document.getElementById(target);
        // La pàgina ja és al lloc correcte quan la cortina de cervesa puja
        if (section) section.scrollIntoView({ behavior: 'instant', block: 'start' });
        onboarding.setAttribute('aria-hidden', 'true');
        onboarding.classList.add('is-leaving');
        const done = () => {
          onboarding.remove();
          const heading = section?.querySelector('h2');
          if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus({ preventScroll: true }); }
          else document.getElementById('main-content')?.focus({ preventScroll: true });
        };
        setTimeout(done, reduced ? 220 : 600);
      };

      form.addEventListener('submit', event => {
        event.preventDefault();
        if (step < steps.length) { goTo(step + 1); return; }   // Enter a mig formulari: passa al següent pas
        sendSurvey();
        const level = form.querySelector('input[name="interestLevel"]:checked')?.value;
        finish(destination()[0], level === 'inici' ? 'inicial' : level === 'aprofundir' ? 'expert' : null);
      });
      document.getElementById('onboardingSkip')?.addEventListener('click', () => finish(null, null));
    })();
