(function(){
  const rules = [
    { key: 2,  name: '2 ile Bölünebilme',    color: '#4caf50' },
    { key: 3,  name: '3 ile Bölünebilme',    color: '#42a5f5' },
    { key: 4,  name: '4 ile Bölünebilme',    color: '#26a69a' },
    { key: 5,  name: '5 ile Bölünebilme',    color: '#ff9800' },
    { key: 6,  name: '6 ile Bölünebilme',    color: '#ab47bc' },
    { key: 9,  name: '9 ile Bölünebilme',    color: '#ef5350' },
    { key: 10, name: '10 ile Bölünebilme',   color: '#7e57c2' },
  ];

  // Utilities
  function digits(n){ return String(Math.abs(n)).split('').map(d=>+d); }
  function sum(arr){ return arr.reduce((a,b)=>a+b,0); }
  function lastDigit(n){ const s=String(Math.abs(n)); return +(s[s.length-1]||'0'); }
  function lastTwo(n){ const s=String(Math.abs(n)); return +(s.slice(-2)); }
  function isPrime(n){
    if (n < 2) return false;
    if (n % 2 === 0) return n === 2;
    if (n % 3 === 0) return n === 3;
    for (let i = 5; i * i <= n; i += 6){
      if (n % i === 0 || n % (i + 2) === 0) return false;
    }
    return true;
  }

  const tests = {
    2:  n => n % 2 === 0,
    3:  n => sum(digits(n)) % 3 === 0,
    4:  n => lastTwo(n) % 4 === 0,
    5:  n => [0,5].includes(lastDigit(n)),
    6:  n => (n % 2 === 0) && (sum(digits(n)) % 3 === 0),
    9:  n => sum(digits(n)) % 9 === 0,
    10: n => lastDigit(n) === 0,
  };

  // Explanation builders per rule
  function buildExplain(n, k){
    const ds = digits(n);
    const ld = lastDigit(n);
    const l2 = lastTwo(n);
    const s  = sum(ds);
    switch(k){
      case 2:
        return [
          { html: highlightDigits(ds, { last: true }), label: 'Son basamak çift mi?' },
          { html: `<strong>Son basamak:</strong> ${ld} → ${ld%2===0?'çift ✅':'tek ❌'}` }
        ];
      case 3:
        return [
          { html: sumChips(ds), label: 'Rakamları topla' },
          { html: `<strong>Toplam:</strong> ${s} → ${s} ÷ 3 ${s%3===0?'kalan 0 ✅':'kalan '+(s%3)+' ❌'}` }
        ];
      case 4:
        return [
          { html: highlightDigits(ds, { last2: true }), label: 'Son iki basamak' },
          { html: `<strong>Son iki basamak:</strong> ${l2} → ${l2} ÷ 4 ${l2%4===0?'kalan 0 ✅':'kalan '+(l2%4)+' ❌'}` }
        ];
      case 5:
        return [
          { html: highlightDigits(ds, { last: true }), label: 'Son basamak 0 ya da 5 mi?' },
          { html: `<strong>Son basamak:</strong> ${ld} → ${[0,5].includes(ld)?'uyuyor ✅':'uymuyor ❌'}` }
        ];
      case 6:
        return [
          { html: highlightDigits(ds, { last: true }), label: 'Önce 2 ile bölünebilme' },
          { html: `<strong>2 kuralı:</strong> ${ld%2===0?'sağlanır ✅':'sağlanmaz ❌'}` },
          { html: sumChips(ds), label: 'Sonra 3 ile bölünebilme' },
          { html: `<strong>3 kuralı:</strong> ${s%3===0?'sağlanır ✅':'sağlanmaz ❌'}` }
        ];
      case 9:
        return [
          { html: sumChips(ds), label: 'Rakamları topla' },
          { html: `<strong>Toplam:</strong> ${s} → ${s} ÷ 9 ${s%9===0?'kalan 0 ✅':'kalan '+(s%9)+' ❌'}` }
        ];
      case 10:
        return [
          { html: highlightDigits(ds, { last: true }), label: 'Son basamak 0 mı?' },
          { html: `<strong>Son basamak:</strong> ${ld} → ${ld===0?'evet ✅':'hayır ❌'}` }
        ];
      default: return [];
    }
  }

  function sumChips(ds){
    const chips = ds.map(d=>`<span class="sum-chip">${d}</span>`).join('');
    const total = ds.reduce((a,b)=>a+b,0);
    return `<div class="sum-chips" aria-label="Rakamların toplamı">${chips}<span class="sum-eq">= ${total}</span></div>`;
  }

  function highlightDigits(ds, opt){
    const len = ds.length;
    return '<div class="number-badge" aria-label="Sayı basamakları">'
      + ds.map((d,i)=>{
          const isLast = i===len-1;
          const isLast2 = i>=len-2;
          const cls = opt.last && isLast ? 'digit hl' : (opt.last2 && isLast2 ? 'digit hl2' : 'digit');
          return `<span class="${cls}">${d}</span>`;
        }).join('')
      + '</div>';
  }

  // Evaluate a single rule upon user's guess and show its animated explanation
  function evaluateOne(n, key, userThinksDivisible){
    const r = rules.find(x=>x.key===key);
    if (!r) return;
    const ok = tests[key](n);
    const card = document.getElementById(`rule-${key}`);
    const badge = card.querySelector('.status-badge');
    const exp = card.querySelector('.explain');
    const fb = card.querySelector('.feedback');

    card.classList.remove('pass','fail','pending');
    card.classList.add(ok?'pass':'fail','pop');
    setTimeout(()=>card.classList.remove('pop'), 350);

    badge.textContent = ok ? '✓' : '✗';
    badge.setAttribute('aria-label', ok? 'Sağlıyor' : 'Sağlamıyor');

    // Build explanation with animation
    const steps = buildExplain(n, key);
    exp.innerHTML = '';
    let delay = 0;
    for (const st of steps){
      const div = document.createElement('div');
      div.className = 'explain-step';
      div.innerHTML = (st.label? `<div><strong>${st.label}</strong></div>` : '') + (st.html || '');
      exp.appendChild(div);
      setTimeout(()=>div.classList.add('enter'), delay += 220);
    }

    // Feedback
    if (userThinksDivisible === ok){
      fb.textContent = 'Tebrikler! Doğru.';
      fb.className = 'feedback ok';
    } else {
      fb.textContent = ok ? 'Yanlış. Aslında bölünür.' : 'Yanlış. Aslında bölünmez.';
      fb.className = 'feedback err';
    }
  }

  // Build rule cards
  function buildCards(){
    const grid = document.getElementById('rulesGrid');
    grid.innerHTML = '';
    for (const r of rules){
      const card = document.createElement('article');
      card.className = 'rule-card pending';
      card.id = `rule-${r.key}`;
      card.innerHTML = `
        <h3>${r.name}</h3>
        <div class="status-badge" aria-live="polite">?</div>
        <div class="answer-controls">
          <button type="button" class="btn green btn-yes">Bölünür</button>
          <button type="button" class="btn red btn-no">Bölünmez</button>
        </div>
        <div class="feedback" id="fb-${r.key}" aria-live="polite"></div>
        <div class="explain" id="exp-${r.key}"></div>
      `;
      grid.appendChild(card);
    }
  }

  function randomN(){
    // 2-5 basamak arasında rastgele, bazen kenar durumlarını da dene
    const modes = [
      () => Math.floor(10 + Math.random()*90),             // 2 basamak
      () => Math.floor(100 + Math.random()*900),           // 3 basamak
      () => Math.floor(1000 + Math.random()*9000),         // 4 basamak
      () => Math.floor(10000 + Math.random()*90000),       // 5 basamak
      () => [120, 125, 128, 150, 180, 198, 200, 225, 250, 252, 270, 300][Math.floor(Math.random()*13)], // zengin örnekler
    ];
    return modes[Math.floor(Math.random()*modes.length)]();
  }

  function evaluate(n, stepMode){
    let passCount = 0;
    for (const r of rules){
      const ok = tests[r.key](n);
      const card = document.getElementById(`rule-${r.key}`);
      const badge = card.querySelector('.status-badge');
      const exp = card.querySelector('.explain');

      card.classList.remove('pass','fail','pending');
      card.classList.add(ok?'pass':'fail','pop');
      setTimeout(()=>card.classList.remove('pop'), 350);

      badge.textContent = ok ? '✓' : '✗';
      badge.setAttribute('aria-label', ok? 'Sağlıyor' : 'Sağlamıyor');

      // Build explanation steps
      const steps = buildExplain(n, r.key);
      exp.innerHTML = '';
      if (stepMode){
        let delay = 0;
        for (const st of steps){
          const div = document.createElement('div');
          div.className = 'explain-step';
          div.innerHTML = (st.label? `<div><strong>${st.label}</strong></div>` : '') + (st.html || '');
          exp.appendChild(div);
          setTimeout(()=>div.classList.add('enter'), delay += 220);
        }
      } else {
        for (const st of steps){
          const div = document.createElement('div');
          div.className = 'explain-step enter';
          div.innerHTML = (st.label? `<div><strong>${st.label}</strong></div>` : '') + (st.html || '');
          exp.appendChild(div);
        }
      }

      if (ok) passCount++;
    }

    const summary = document.getElementById('summary');
    const prime = isPrime(n);
    const base = `${n} sayısı kurallardan ${passCount}/${rules.length} tanesini sağlar.`;
    const note = `Yalnızca 1'e ve kendine bölünebildiğinden`;
    summary.innerHTML = prime ? `${base} ${note} <span class="prime-badge" aria-label="Asal Sayıdır">ASAL SAYIDIR</span>` : base;
  }

  // Reset UI to pending state (no solutions shown)
  function resetCards(){
    for (const r of rules){
      const card = document.getElementById(`rule-${r.key}`);
      if (!card) continue;
      card.classList.remove('pass','fail');
      card.classList.add('pending');
      const badge = card.querySelector('.status-badge');
      if (badge){
        badge.textContent = '?';
        badge.setAttribute('aria-label','Beklemede');
      }
      const exp = card.querySelector('.explain');
      if (exp) exp.innerHTML = '';
      const fb = card.querySelector('.feedback');
      if (fb) { fb.textContent = ''; fb.className = 'feedback'; }
    }
    const summary = document.getElementById('summary');
    if (summary) summary.textContent = '';
  }

  function init(){
    buildCards();

    const input = document.getElementById('nInput');
    const randomBtn = document.getElementById('randomBtn');
    const checkAllBtn = document.getElementById('checkAllBtn');

    // Per-rule buttons
    for (const r of rules){
      const card = document.getElementById(`rule-${r.key}`);
      const yesBtn = card.querySelector('.btn-yes');
      const noBtn  = card.querySelector('.btn-no');
      const handler = (thinksYes)=>{
        const n = parseInt(input.value, 10);
        if (Number.isNaN(n) || n < 0){
          alert('Lütfen 0 veya daha büyük bir doğal sayı girin.');
          input.focus();
          return;
        }
        evaluateOne(n, r.key, thinksYes);
      };
      yesBtn.addEventListener('click', ()=>handler(true));
      noBtn.addEventListener('click', ()=>handler(false));
    }

    randomBtn.addEventListener('click', ()=>{
      const n = randomN();
      input.value = n;
      resetCards(); // sadece sayı üret, çözüm gösterme
    });

    checkAllBtn.addEventListener('click', ()=>{
      const n = parseInt(input.value, 10);
      if (Number.isNaN(n) || n < 0){
        alert('Lütfen 0 veya daha büyük bir doğal sayı girin.');
        input.focus();
        return;
        }
      evaluate(n, true);
    });

    // Yazarken otomatik çözüm gösterme; sadece görünümü sıfırla
    input.addEventListener('input', resetCards);

    // İlk yüklemede çözüm gösterme
    resetCards();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
