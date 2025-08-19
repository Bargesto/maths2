(function(){
  function qs(id){ return document.getElementById(id); }

  // UI helpers
  function createChip(text, tight=false){
    const el = document.createElement('span');
    el.className = 'chip' + (tight ? ' tight' : '');
    el.textContent = text;
    return el;
  }
  function animateList(container, numbers, delay = 90){
    container.innerHTML = '';
    const tight = container.classList.contains('tight');
    numbers.forEach((n, i) => {
      const chip = createChip(String(n), tight);
      container.appendChild(chip);
      setTimeout(() => requestAnimationFrame(() => chip.classList.add('enter')), i * delay);
    });
  }

  // Math helpers
  function clampInt(n, min, max){
    const x = Math.floor(Number(n)||0);
    return Math.max(min, Math.min(max, x));
  }
  function factorsOf(n){
    const set = new Set();
    const limit = Math.floor(Math.sqrt(n));
    for (let i=1;i<=limit;i++){
      if (n % i === 0){ set.add(i); set.add(n / i); }
    }
    return Array.from(set).sort((a,b)=>a-b);
  }
  function multiplesOf(n, count){
    return Array.from({length: count}, (_,i)=> n*(i+1));
  }
  function intersectSorted(a, b){
    const res = [];
    let i=0, j=0;
    while(i<a.length && j<b.length){
      if (a[i]===b[j]){ res.push(a[i]); i++; j++; }
      else if (a[i]<b[j]) i++; else j++;
    }
    return res;
  }
  function gcd(a,b){
    a=Math.abs(a); b=Math.abs(b);
    while(b){ [a,b] = [b, a%b]; }
    return a || 1;
  }
  function lcm(a,b){ return Math.abs(a / gcd(a,b) * b); }

  function setBadge(el, label){
    el.querySelector('strong').textContent = String(label);
    // re-trigger pop animation
    el.classList.remove('pop');
    // force reflow
    void el.offsetWidth;
    el.classList.add('pop');
  }

  function init(){
    // Elements
    const numA = qs('numA');
    const numB = qs('numB');
    const randomPair = qs('randomPair');
    const calcBoth = qs('calcBoth');
    const pairSummary = qs('pairSummary');
    const gcdBadge = qs('gcdBadge');
    const lcmBadge = qs('lcmBadge');

    const showCommonFactorsBtn = qs('showCommonFactors');
    const factorsA = qs('factorsA');
    const factorsB = qs('factorsB');
    const commonFactors = qs('commonFactors');

    const cmCount = qs('cmCount');
    const showCommonMultiplesBtn = qs('showCommonMultiples');
    const multiplesA = qs('multiplesA');
    const multiplesB = qs('multiplesB');
    const commonMultiples = qs('commonMultiples');

    function readPair(){
      const A = clampInt(numA.value, 1, 9999);
      const B = clampInt(numB.value, 1, 9999);
      numA.value = String(A); numB.value = String(B);
      return {A,B};
    }

    function computeSummary(){
      const {A,B} = readPair();
      const g = gcd(A,B);
      const k = lcm(A,B);
      pairSummary.textContent = `${A} ve ${B} için en büyük ortak bölen (EBOB) ${g}, en küçük ortak kat (EKOK) ${k}.`;
      setBadge(gcdBadge, g);
      setBadge(lcmBadge, k);
      return {A,B,g,k};
    }

    function showCommonFactors(){
      const {A,B} = readPair();
      const fa = factorsOf(A);
      const fb = factorsOf(B);
      const common = intersectSorted(fa, fb);
      animateList(factorsA, fa, 70);
      animateList(factorsB, fb, 70);
      setTimeout(() => animateList(commonFactors, common, 90), Math.max(fa.length, fb.length)*50);
    }

    function showCommonMultiples(){
      const {A,B} = readPair();
      const count = clampInt(cmCount.value, 3, 40);
      cmCount.value = String(count);
      const ma = multiplesOf(A, count);
      const mb = multiplesOf(B, count);
      const L = lcm(A,B);
      const cm = multiplesOf(L, count);
      animateList(multiplesA, ma, 60);
      animateList(multiplesB, mb, 60);
      setTimeout(() => animateList(commonMultiples, cm, 80), Math.max(ma.length, mb.length)*40);
    }

    function randomNicePair(){
      // 60% chance: share a common factor >1
      if (Math.random() < 0.6){
        const base = Math.floor(Math.random()*8)+2; // 2..9 common factor
        const x = Math.floor(Math.random()*20)+2;   // 2..21
        const y = Math.floor(Math.random()*20)+2;
        let A = base * x;
        let B = base * y;
        if (A===B) B += base; // avoid equal
        return {A, B};
      }
      // 40%: random within 10..120
      let A = Math.floor(Math.random()*111)+10;
      let B = Math.floor(Math.random()*111)+10;
      if (A===B) B += 1;
      return {A,B};
    }

    // Events
    randomPair.addEventListener('click', () => {
      const p = randomNicePair();
      numA.value = String(p.A);
      numB.value = String(p.B);
      // reset lists
      [factorsA,factorsB,commonFactors,multiplesA,multiplesB,commonMultiples].forEach(el=> el.innerHTML='');
      // clear summary and badges until user clicks 'Hesapla'
      pairSummary.textContent = '';
      gcdBadge.querySelector('strong').textContent = '-';
      lcmBadge.querySelector('strong').textContent = '-';
      gcdBadge.classList.remove('pop');
      lcmBadge.classList.remove('pop');
    });

    calcBoth.addEventListener('click', () => {
      computeSummary();
      showCommonFactors();
      showCommonMultiples();
    });

    showCommonFactorsBtn.addEventListener('click', showCommonFactors);
    showCommonMultiplesBtn.addEventListener('click', showCommonMultiples);

    // Enter to compute
    numA.addEventListener('keydown', (e)=>{ if (e.key==='Enter') calcBoth.click(); });
    numB.addEventListener('keydown', (e)=>{ if (e.key==='Enter') calcBoth.click(); });

    // Initial render
    computeSummary();
    showCommonFactors();
    showCommonMultiples();
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
