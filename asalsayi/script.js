(function(){
  function qs(id){ return document.getElementById(id); }
  function clampInt(v, min, max){ v = Math.floor(Number(v)||0); return Math.max(min, Math.min(max, v)); }

  // Math helpers
  function isPrime(n){
    if (n <= 1) return false;
    if (n <= 3) return true; // 2 or 3
    if (n % 2 === 0) return n === 2; // even
    if (n % 3 === 0) return n === 3; // divisible by 3
    const limit = Math.floor(Math.sqrt(n));
    for (let i = 5; i <= limit; i += 6){
      if (n % i === 0 || n % (i+2) === 0) return false;
    }
    return true;
  }

  function smallestDivisor(n){
    if (n % 2 === 0) return 2;
    if (n % 3 === 0) return 3;
    const limit = Math.floor(Math.sqrt(n));
    for (let i = 5; i <= limit; i += 6){
      if (n % i === 0) return i;
      if (n % (i+2) === 0) return i+2;
    }
    return n; // prime
  }

  function primeFactors(n){
    const res = [];
    n = Math.floor(n);
    if (n < 2) return res;
    while (n % 2 === 0) { res.push(2); n /= 2; }
    while (n % 3 === 0) { res.push(3); n /= 3; }
    let i = 5;
    while (i * i <= n){
      while (n % i === 0){ res.push(i); n /= i; }
      while (n % (i+2) === 0){ res.push(i+2); n /= (i+2); }
      i += 6;
    }
    if (n > 1) res.push(n);
    return res;
  }

  function countMap(arr){
    const m = new Map();
    arr.forEach(v => m.set(v, (m.get(v)||0) + 1));
    return m;
  }

  // UI helpers
  function stepDiv(labelHtml, bodyHtml){
    const el = document.createElement('div');
    el.className = 'explain-step';
    el.innerHTML = (labelHtml ? `<div><strong>${labelHtml}</strong></div>` : '') + (bodyHtml || '');
    return el;
  }

  function animateAppend(container, nodes, delay=220){
    container.innerHTML = '';
    let t = 0;
    nodes.forEach(n => {
      container.appendChild(n);
      setTimeout(()=>{ n.classList.add('enter'); }, t);
      t += delay;
    });
  }

  function numberBadge(n, hlIdxSet){
    const s = String(n);
    const div = document.createElement('div');
    div.className = 'number-badge';
    for (let i=0;i<s.length;i++){
      const d = document.createElement('span');
      d.className = 'digit' + (hlIdxSet && hlIdxSet.has(i) ? ' hl' : '');
      d.textContent = s[i];
      div.appendChild(d);
    }
    return div;
  }

  // PRIME SECTION
  function buildPrimeExplain(n){
    const steps = [];
    if (n <= 1){
      steps.push(stepDiv('Tanım', `${n} sayısı 1'den büyük olmadığından <strong>asal değildir</strong>.`));
      return steps;
    }
    if (n <= 3){
      steps.push(stepDiv('Küçük Asallar', `${n} sadece 1'e ve kendine kalansız bölünebildiğinden <strong>ASAL</strong>.`));
      return steps;
    }

    // Even check
    if (n % 2 === 0){
      const row = stepDiv('Çiftlik Kontrolü', 'Son basamağı 0,2,4,6 veya 8 ise sayı 2 ile bölünür.');
      row.appendChild(numberBadge(n, new Set([String(n).length-1])));
      steps.push(row);
      steps.push(stepDiv('', `${n} sayısı 2 ile kalansız bölündüğü için <strong>asal değildir</strong>.`));
      return steps;
    }
    // Divisible by 3
    if (n % 3 === 0){
      const s = String(n);
      const digits = s.split('').map(ch=>Number(ch));
      const sum = digits.reduce((a,b)=>a+b,0);
      const chips = `<div class="sum-chips">${digits.map(d=>`<span class="sum-chip">${d}</span>`).join('')}<span class="sum-eq">= ${sum}</span></div>`;
      steps.push(stepDiv('3 ile Bölünebilme', `Rakamları toplamı 3'ün katıysa sayı 3 ile bölünür.${chips}`));
      steps.push(stepDiv('', `${n} sayısı 3 ile kalansız bölündüğü için <strong>asal değildir</strong>.`));
      return steps;
    }

    const limit = Math.floor(Math.sqrt(n));
    steps.push(stepDiv('Küçük Bölen Denemeleri', `2 ve 3'e bölünmeyen sayılar için 5, 7, 11, 13, ... gibi <strong>küçük asal sayıları</strong> deneriz. Tam bölünen bulunursa sayı asal değildir.`));

    // Küçük asal sayılarla dene (6k±1 düzeninde), ama açıklamada sadece "tam bölünüyor/bölünmüyor" de.
    for (let i=5; i<=limit; i+=6){
      const a = i, b = i+2;
      if (n % a === 0){
        steps.push(stepDiv('Deneme', `${n} sayısı ${a} ile <strong>tam bölünür</strong>.`));
        steps.push(stepDiv('Sonuç', `${a} bulunduğu için <strong>asal değildir</strong>.`));
        return steps;
      } else {
        steps.push(stepDiv('Deneme', `${n} sayısı ${a} ile tam bölünmüyor.`));
      }
      if (n % b === 0){
        steps.push(stepDiv('Deneme', `${n} sayısı ${b} ile <strong>tam bölünür</strong>.`));
        steps.push(stepDiv('Sonuç', `${b} bulunduğu için <strong>asal değildir</strong>.`));
        return steps;
      } else {
        steps.push(stepDiv('Deneme', `${n} sayısı ${b} ile tam bölünmüyor.`));
      }
    }

    steps.push(stepDiv('Sonuç', `Herhangi bir uygun bölen bulunamadı. ${n} <strong>ASALDIR</strong>.`));
    return steps;
  }

  function primeSummaryText(n){
    if (n <= 1) return `${n} sayısı 1'den büyük olmadığından asal değildir.`;
    return isPrime(n)
      ? `${n} sayısı asaldır. <span class="prime-badge" aria-label="Asal Sayıdır">ASAL</span>`
      : `${n} sayısı <strong>asal değildir</strong>.`;
  }

  // FACTORIZATION SECTION
  function buildFactorTreeSteps(n){
    // returns array of renderer functions for each split, always smallest prime × cofactor
    const steps = [];

    function recurse(value, container, depth){
      if (value < 2) return;
      if (isPrime(value)){
        // Leaf prime node
        const leaf = document.createElement('div');
        leaf.className = 'node node-prime';
        leaf.textContent = String(value);
        steps.push(() => {
          container.appendChild(leaf);
          requestAnimationFrame(()=>leaf.classList.add('enter'));
        });
        return;
      }
      // Split by smallest prime divisor and the cofactor
      const d = smallestDivisor(value);
      const leftVal = d;
      const rightVal = Math.floor(value / d);

      // Node for this branch (root or composite)
      const top = document.createElement('div');
      top.className = depth === 0 ? 'node node-root' : 'node node-comp';
      top.textContent = String(value);

      const branch = document.createElement('div');
      branch.className = 'branch';
      const vline = document.createElement('div'); vline.className = 'connector';
      const hline = document.createElement('div'); hline.className = 'h-connector';
      const left = document.createElement('div');
      const right = document.createElement('div');

      steps.push(() => {
        container.appendChild(top);
        requestAnimationFrame(()=>top.classList.add('enter'));
      });

      steps.push(() => {
        container.appendChild(branch);
        branch.appendChild(vline);
        branch.appendChild(hline);
        branch.appendChild(left);
        branch.appendChild(right);
      });

      recurse(leftVal, left, depth+1);
      recurse(rightVal, right, depth+1);
    }

    // Wrapper root
    const root = document.createElement('div');
    root.className = 'tree-root';
    steps.start = (mount) => { mount.innerHTML = ''; mount.appendChild(root); };
    steps.root = root;
    recurse(n, root, 0);
    return steps;
  }

  function buildLadderColumns(n){
    const left = [];
    const primes = [];
    let x = n;
    left.push(x);
    while (x > 1){
      const d = smallestDivisor(x);
      primes.push(d);
      x = Math.floor(x / d);
      left.push(x);
    }
    return { left, primes };
  }

  function productHTML(n, primes){
    const flat = primes.map(p=>`<span class="mono">${p}</span>`).join(' × ');
    const m = countMap(primes);
    const expo = Array.from(m.entries()).sort((a,b)=>a[0]-b[0])
      .map(([p,c]) => c>1 ? `<span class="mono">${p}<sup>${c}</sup></span>` : `<span class="mono">${p}</span>`)
      .join(' · ');
    return `<div class="product">${n} = ${flat} = ${expo}</div>`;
  }

  function randomPrimeCandidate(){
    // Mix primes and composites in 2..999
    const n = Math.floor(Math.random()*998)+2;
    return n;
  }
  function randomComposite(){
    for (let t=0;t<50;t++){
      const n = Math.floor(Math.random()*898)+12; // 12..909
      if (!isPrime(n)) return n;
    }
    return Math.floor(Math.random()*98)+2;
  }

  function init(){
    // Elements - Prime Check
    const primeInput = qs('primeInput');
    const primeRandom = qs('primeRandom');
    const primeCheck = qs('primeCheck');
    const primeSummary = qs('primeSummary');
    const primeExplain = qs('primeExplain');

    // Elements - Factorization
    const factInput = qs('factInput');
    const factRandom = qs('factRandom');
    const factorize = qs('factorize');
    const factSummary = qs('factSummary');
    const tree = qs('tree');
    const ladder = qs('ladder');

    // Prime events
    function doPrime(){
      let n = clampInt(primeInput.value, 0, 999999);
      primeInput.value = String(n);
      const steps = buildPrimeExplain(n);
      primeSummary.innerHTML = primeSummaryText(n);
      animateAppend(primeExplain, steps, 220);
    }
    primeRandom.addEventListener('click', () => {
      const n = randomPrimeCandidate();
      primeInput.value = String(n);
      primeExplain.innerHTML = '';
      primeSummary.innerHTML = '';
    });
    primeCheck.addEventListener('click', doPrime);
    primeInput.addEventListener('keydown', (e)=>{ if (e.key==='Enter') doPrime(); });

    // Factorization events
    function doFactor(){
      let n = clampInt(factInput.value, 2, 999999);
      factInput.value = String(n);
      const { left, primes } = buildLadderColumns(n);
      const pf = primes.slice();
      factSummary.innerHTML = pf.length ? productHTML(n, pf) : '';

      // Render ladder as two columns
      ladder.innerHTML = '';
      const cols = document.createElement('div');
      cols.className = 'cols';
      const leftCol = document.createElement('div');
      leftCol.className = 'left-col';
      const rightCol = document.createElement('div');
      rightCol.className = 'right-col';
      cols.appendChild(leftCol);
      cols.appendChild(rightCol);
      ladder.appendChild(cols);

      left.forEach((val, i) => {
        const cell = document.createElement('div');
        cell.className = 'cell ' + (i === 0 ? 'orange' : (i === left.length-1 ? 'green' : 'gray'));
        cell.textContent = String(val);
        leftCol.appendChild(cell);
        setTimeout(()=> cell.classList.add('enter'), i * 180);
      });

      primes.forEach((p, i) => {
        const cell = document.createElement('div');
        cell.className = 'cell prime';
        cell.textContent = String(p);
        rightCol.appendChild(cell);
        setTimeout(()=> cell.classList.add('enter'), i * 180);
      });

      // Animate tree
      const steps = buildFactorTreeSteps(n);
      steps.start(tree);
      let idx = 0;
      (function next(){
        if (idx >= steps.length) return;
        steps[idx++]();
        setTimeout(next, 200);
      })();
    }

    factRandom.addEventListener('click', () => {
      const n = randomComposite();
      factInput.value = String(n);
      ladder.innerHTML = '';
      tree.innerHTML = '';
      factSummary.innerHTML = '';
    });
    factorize.addEventListener('click', doFactor);
    factInput.addEventListener('keydown', (e)=>{ if (e.key==='Enter') doFactor(); });

    // Initial examples
    primeSummary.innerHTML = primeSummaryText(clampInt(primeInput.value, 0, 999999));
    animateAppend(primeExplain, buildPrimeExplain(clampInt(primeInput.value, 0, 999999)), 180);
    doFactor();
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
