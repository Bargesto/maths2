const grpA = document.getElementById('grpA');
const grpB = document.getElementById('grpB');
const grpOp = document.getElementById('grpOp');
const newBtn = document.getElementById('newQuestion');
const showBtn = document.getElementById('showResult');
const checkBtn = document.getElementById('checkAnswer');
const studentInput = document.getElementById('studentAnswer');
const panel = document.getElementById('opPanel');
const warningEl = document.getElementById('warning');
const feedbackEl = document.getElementById('checkFeedback');

let state = {
  a: 0,
  b: 0,
  op: '+',
  digitsA: 3,
  digitsB: 3,
  show: false,
};

function randInt(min, max){
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function rangeForDigits(d){
  if (d <= 0) return [0, 0];
  if (d === 1) return [0, 9];
  const min = Math.pow(10, d-1);
  const max = Math.pow(10, d) - 1;
  return [min, max];
}

function validateConfig(){
  warningEl.classList.add('hidden');
  warningEl.textContent = '';
  if (state.op === '-' && state.digitsA < state.digitsB){
    warningEl.textContent = 'Çıkarma için 1. sayının basamak sayısı, 2. sayınınkinden küçük olamaz.';
    warningEl.classList.remove('hidden');
    return false;
  }
  return true;
}

function generateNumbers(){
  if (!validateConfig()) { panel.innerHTML = ''; return; }
  const [minA, maxA] = rangeForDigits(state.digitsA);
  const [minB, maxB] = rangeForDigits(state.digitsB);

  if (state.op === '+'){
    state.a = randInt(minA, maxA);
    state.b = randInt(minB, maxB);
  } else {
    // subtraction: ensure a >= b while keeping digit counts as selected
    let tries = 0;
    do {
      state.a = randInt(minA, maxA);
      state.b = randInt(minB, maxB);
      tries++;
      if (tries > 5000) break; // safety
    } while (state.a < state.b);
  }
  state.show = false;
  showBtn.textContent = 'Sonucu Göster';
  clearFeedback();
  studentInput.value = '';
  render();
}

function padLeft(str, width){
  str = String(str);
  if (str.length >= width) return str;
  return ' '.repeat(width - str.length) + str;
}

function render(){
  if (!validateConfig()) { panel.innerHTML = ''; return; }
  const aStr = String(state.a);
  const bStr = String(state.b);
  const baseWidth = Math.max(aStr.length, bStr.length);
  const resultVal = state.op === '+' ? (state.a + state.b) : (state.a - state.b);
  const resWidth = Math.max(baseWidth, String(resultVal).length);

  const line1 = ' ' + padLeft(aStr, resWidth);
  const line2 = state.op + padLeft(bStr, resWidth);
  const line3 = '';
  const resultStr = ' ' + padLeft(String(resultVal), resWidth);
  const studentRaw = (studentInput.value || '').replace(/\D+/g, '');
  const studentStr = studentRaw ? (' ' + padLeft(studentRaw, resWidth)) : '';

  const lines = [line1, line2, line3];
  if (studentStr) lines.push(studentStr);
  if (state.show) lines.push(resultStr);

  panel.innerHTML = `<pre class="op-math">${lines.map((ln,i)=>{
    if (i===2) return ` <span class=\"solid-line\" style=\"width:${resWidth}ch\"></span>`;
    if (i===3 && studentStr) return `<span class=\"student\">${ln}</span>`;
    if ((i===3 && !studentStr) || (i===4 && studentStr)) return `<span class=\"result\">${ln}</span>`;
    return ln;
  }).join('\n')}</pre>`;
}

function setActiveInGroup(groupEl, targetBtn){
  Array.from(groupEl.querySelectorAll('button')).forEach(b => b.classList.toggle('active', b === targetBtn));
}

function initGroups(){
  // digits A
  grpA.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-value]');
    if (!btn) return;
    setActiveInGroup(grpA, btn);
    state.digitsA = Math.max(1, Math.min(5, parseInt(btn.dataset.value, 10) || 1));
    generateNumbers();
  });
  // digits B
  grpB.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-value]');
    if (!btn) return;
    setActiveInGroup(grpB, btn);
    state.digitsB = Math.max(1, Math.min(5, parseInt(btn.dataset.value, 10) || 1));
    generateNumbers();
  });
  // operation
  grpOp.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-op]');
    if (!btn) return;
    setActiveInGroup(grpOp, btn);
    state.op = (btn.dataset.op === '-') ? '-' : '+';
    generateNumbers();
  });
}

function clearFeedback(){
  feedbackEl.textContent = '';
  feedbackEl.classList.add('hidden');
  feedbackEl.classList.remove('success', 'error');
}

function placeNameTR(idx){
  switch(idx){
    case 0: return 'birler';
    case 1: return 'onlar';
    case 2: return 'yüzler';
    case 3: return 'binler';
    case 4: return 'on binler';
    default: return (idx+1) + '. basamak';
  }
}

function checkAnswer(){
  clearFeedback();
  const correct = state.op === '+' ? (state.a + state.b) : (state.a - state.b);
  const raw = (studentInput.value || '').replace(/\D+/g, '');
  if (!raw){
    feedbackEl.textContent = 'Lütfen cevabını yaz.';
    feedbackEl.classList.add('error');
    feedbackEl.classList.remove('hidden');
    return;
  }
  const studentVal = parseInt(raw, 10);
  if (studentVal === correct){
    feedbackEl.textContent = 'Tebrikler, doğru!';
    feedbackEl.classList.add('success');
    feedbackEl.classList.remove('hidden');
    return;
  }
  // Detailed guidance: find first mismatching digit from right
  const s = String(studentVal);
  const c = String(correct);
  const maxLen = Math.max(s.length, c.length);
  const sPadded = s.padStart(maxLen, '0');
  const cPadded = c.padStart(maxLen, '0');
  let mismatchIdx = -1; // from right: 0=ones
  for (let i = 0; i < maxLen; i++){
    const sDigit = sPadded[maxLen - 1 - i];
    const cDigit = cPadded[maxLen - 1 - i];
    if (sDigit !== cDigit){ mismatchIdx = i; break; }
  }
  if (mismatchIdx >= 0){
    const place = placeNameTR(mismatchIdx);
    let hint = `Cevabın doğru değil. İlk hatayı ${place} basamağında yapmış olabilirsin.`;
    // Optional extra hint based on op
    if (state.op === '+') hint += ' Toplama yaparken elde durumunu kontrol et.';
    else hint += ' Çıkarma yaparken onluk bozmayı (ödünç alma) kontrol et.';
    feedbackEl.textContent = hint + ' Bu basamağı tekrar kontrol etmelisin.';
  } else {
    feedbackEl.textContent = 'Cevabın doğru değil. Sonucu tekrar gözden geçir.';
  }
  feedbackEl.classList.add('error');
  feedbackEl.classList.remove('hidden');
}

// Events
newBtn.addEventListener('click', () => {
  generateNumbers();
});

showBtn.addEventListener('click', () => {
  if (!validateConfig()) return;
  state.show = !state.show;
  showBtn.textContent = state.show ? 'Sonucu Gizle' : 'Sonucu Göster';
  render();
});

checkBtn.addEventListener('click', checkAnswer);
studentInput.addEventListener('input', () => {
  // digits only
  const clean = (studentInput.value || '').replace(/\D+/g, '');
  if (studentInput.value !== clean) studentInput.value = clean;
  clearFeedback();
  render();
});

// initial
initGroups();
generateNumbers();
