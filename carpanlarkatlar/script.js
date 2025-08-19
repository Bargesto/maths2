(function(){
  function qs(id){ return document.getElementById(id); }
  function createChip(text){
    const el = document.createElement('span');
    el.className = 'chip';
    el.textContent = text;
    return el;
  }
  function animateList(container, numbers, delay = 120){
    container.innerHTML = '';
    numbers.forEach((n, i) => {
      const chip = createChip(String(n));
      container.appendChild(chip);
      setTimeout(() => {
        requestAnimationFrame(() => chip.classList.add('enter'));
      }, i * delay);
    });
  }
  function factorsOf(n){
    const set = new Set();
    const limit = Math.floor(Math.sqrt(n));
    for (let i = 1; i <= limit; i++){
      if (n % i === 0){
        set.add(i); set.add(n / i);
      }
    }
    return Array.from(set).sort((a,b)=>a-b);
  }
  function multiplesOf(n, count){
    return Array.from({length: count}, (_, i) => n * (i+1));
  }
  function parseCommaNumbers(str){
    return Array.from(new Set(
      (str || '')
        .split(/[\s,;]+/)
        .map(s => s.trim())
        .filter(Boolean)
        .map(s => Number(s))
        .filter(n => Number.isFinite(n))
    )).sort((a,b)=>a-b);
  }
  function diffArrays(expected, got){
    const exp = new Set(expected);
    const g = new Set(got);
    const missing = expected.filter(x => !g.has(x));
    const extra = got.filter(x => !exp.has(x));
    return { missing, extra };
  }

  function setFeedback(node, ok, msg){
    node.classList.remove('hidden','success','error');
    node.classList.add(ok ? 'success' : 'error');
    node.textContent = msg;
  }

  function init(){
    // Elements
    const factorsN = qs('factorsN');
    const factorsRandom = qs('factorsRandom');
    const showFactors = qs('showFactors');
    const factorsList = qs('factorsList');
    const factorsInput = qs('factorsInput');
    const checkFactors = qs('checkFactors');
    const factorsFeedback = qs('factorsFeedback');

    const multiplesN = qs('multiplesN');
    const multiplesCount = qs('multiplesCount');
    const multiplesRandom = qs('multiplesRandom');
    const showMultiples = qs('showMultiples');
    const multiplesList = qs('multiplesList');
    const multiplesInput = qs('multiplesInput');
    const checkMultiples = qs('checkMultiples');
    const multiplesFeedback = qs('multiplesFeedback');

    // Handlers
    function randomComposite(){
      // favor composite numbers between 10..500
      for (let tries=0; tries<50; tries++){
        const n = Math.floor(Math.random()*491)+10;
        if (n % 2 === 0 && n>2) return n;
        const f = factorsOf(n);
        if (f.length>2) return n;
      }
      return Math.floor(Math.random()*98)+2; // fallback 2..99
    }

    function randomMultiplesBase(){
      return Math.floor(Math.random()*19)+2; // 2..20
    }

    function showFactorsAnimated(){
      const n = Math.max(2, Math.min(9999, Number(factorsN.value)||0));
      factorsN.value = String(n);
      const f = factorsOf(n);
      animateList(factorsList, f, 120);
    }

    function showMultiplesAnimated(){
      const n = Math.max(2, Math.min(200, Number(multiplesN.value)||0));
      const c = Math.max(3, Math.min(50, Number(multiplesCount.value)||0));
      multiplesN.value = String(n); multiplesCount.value = String(c);
      const m = multiplesOf(n, c);
      animateList(multiplesList, m, 100);
    }

    factorsRandom.addEventListener('click', () => {
      factorsN.value = String(randomComposite());
      factorsList.innerHTML = '';
      factorsFeedback.classList.add('hidden');
    });

    showFactors.addEventListener('click', showFactorsAnimated);

    checkFactors.addEventListener('click', () => {
      const n = Math.max(2, Math.min(9999, Number(factorsN.value)||0));
      const correct = factorsOf(n);
      const answer = parseCommaNumbers(factorsInput.value);
      const { missing, extra } = diffArrays(correct, answer);
      if (missing.length===0 && extra.length===0){
        setFeedback(factorsFeedback, true, 'Harika! Tüm çarpanları doğru yazdın.');
      } else {
        let parts = [];
        if (missing.length) parts.push(`Eksik: ${missing.join(', ')}`);
        if (extra.length) parts.push(`Fazla: ${extra.join(', ')}`);
        setFeedback(factorsFeedback, false, parts.join(' • '));
      }
    });

    factorsInput.addEventListener('keydown', (e)=>{ if (e.key==='Enter') checkFactors.click(); });

    multiplesRandom.addEventListener('click', () => {
      multiplesN.value = String(randomMultiplesBase());
      const c = Math.floor(Math.random()*8)+6; // 6..13
      multiplesCount.value = String(c);
      multiplesList.innerHTML = '';
      multiplesFeedback.classList.add('hidden');
    });

    showMultiples.addEventListener('click', showMultiplesAnimated);

    checkMultiples.addEventListener('click', () => {
      const n = Math.max(2, Math.min(200, Number(multiplesN.value)||0));
      const c = Math.max(3, Math.min(50, Number(multiplesCount.value)||0));
      const correct = multiplesOf(n, c);
      const answer = parseCommaNumbers(multiplesInput.value);
      const { missing, extra } = diffArrays(correct, answer);
      if (missing.length===0 && extra.length===0){
        setFeedback(multiplesFeedback, true, 'Süper! İlk N katı doğru.');
      } else {
        let parts = [];
        if (missing.length) parts.push(`Eksik: ${missing.join(', ')}`);
        if (extra.length) parts.push(`Fazla: ${extra.join(', ')}`);
        setFeedback(multiplesFeedback, false, parts.join(' • '));
      }
    });

    multiplesInput.addEventListener('keydown', (e)=>{ if (e.key==='Enter') checkMultiples.click(); });

    // Initial render
    showFactorsAnimated();
    showMultiplesAnimated();
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
