// Canvas ayarları
const canvas = document.getElementById('pieChart');
const ctx = canvas.getContext('2d');
canvas.width = 300;
canvas.height = 300;

// Kesir, ondalık ve yüzde giriş alanları
const numeratorInput = document.getElementById('numerator');
const denominatorInput = document.getElementById('denominator');
const decimalInput = document.getElementById('decimal');
const percentInput = document.getElementById('percent');

// Örnek sorular
const questions = [
    // Yiyecek ve İçeceklerle İlgili Sorular
    { numerator: 1, denominator: 4, context: "Bir pizzanın çeyreği yendi." },
    { numerator: 3, denominator: 4, context: "Su şişesinin dörtte üçü dolu." },
    { numerator: 1, denominator: 2, context: "Yarım elma kaldı." },
    { numerator: 5, denominator: 8, context: "Çikolata kutusunun 8 parçasından 5'i yendi." },
    { numerator: 2, denominator: 3, context: "Meyve suyunun üçte ikisi içildi." },
    
    // Öğrenci ve Sınıf İle İlgili Sorular
    { numerator: 2, denominator: 5, context: "Beş öğrenciden ikisi kız." },
    { numerator: 3, denominator: 10, context: "On soruda üç doğru cevap." },
    { numerator: 7, denominator: 20, context: "Yirmi öğrenciden yedisi basketbol oynuyor." },
    { numerator: 4, denominator: 25, context: "Yirmi beş öğrenciden dördü gözlük takıyor." },
    { numerator: 9, denominator: 12, context: "On iki öğrenciden dokuzu okul servisi kullanıyor." },
    
    // Para ve Alışveriş İle İlgili Sorular
    { numerator: 3, denominator: 5, context: "Kumbaradaki paranın beşte üçü harcandı." },
    { numerator: 1, denominator: 3, context: "İndirimli ürünlerin üçte biri satıldı." },
    { numerator: 4, denominator: 10, context: "On liralık harçlığın 4 lirası harcandı." },
    { numerator: 6, denominator: 8, context: "Sekiz liralık çikolatanın 6 lirası ödendi." },
    
    // Zaman İle İlgili Sorular
    { numerator: 1, denominator: 6, context: "Günün altıda biri uyku ile geçti." },
    { numerator: 3, denominator: 12, context: "On iki saatin üç saati ders çalışarak geçti." },
    { numerator: 5, denominator: 7, context: "Haftanın yedi gününden beşi okul günü." },
    { numerator: 15, denominator: 60, context: "Bir saatin çeyreği teneffüs süresi." },
    
    // Spor ve Oyun İle İlgili Sorular
    { numerator: 2, denominator: 4, context: "Basketbol maçının yarısı tamamlandı." },
    { numerator: 5, denominator: 6, context: "Altı oyuncudan beşi sahada." },
    { numerator: 8, denominator: 10, context: "On penaltıdan sekizi gol oldu." },
    { numerator: 3, denominator: 15, context: "On beş oyuncudan üçü kaleci olmak istiyor." },
    
    // Ev ve Bahçe İle İlgili Sorular
    { numerator: 4, denominator: 5, context: "Beş saksıdan dördünde çiçek var." },
    { numerator: 7, denominator: 10, context: "On pencereden yedisi açık." },
    { numerator: 2, denominator: 8, context: "Sekiz odalı evin ikisi boş." },
    { numerator: 6, denominator: 12, context: "On iki sandalyeden altısı kullanılıyor." }
];

let currentQuestion = null;

// Yeni soru oluştur
function generateNewQuestion() {
    currentQuestion = questions[Math.floor(Math.random() * questions.length)];
    drawPieChart(currentQuestion.numerator, currentQuestion.denominator);
    clearInputs();
    
    // Soruyu sayfa içinde göster ve "Soru:" kısmını mor yap
    const qEl = document.getElementById('questionText');
    if (qEl) {
        qEl.innerHTML = `<span class="q-prefix">Soru:</span> ${currentQuestion.context} — Kesri bulun ve farklı biçimlerde gösterin.`;
    }
    validateAll();
}

// Cevabı göster
function showAnswer() {
    if (!currentQuestion) return;
    
    const decimal = currentQuestion.numerator / currentQuestion.denominator;
    const percent = decimal * 100;
    
    numeratorInput.value = currentQuestion.numerator;
    denominatorInput.value = currentQuestion.denominator;
    decimalInput.value = decimal.toFixed(2);
    percentInput.value = percent.toFixed(1);
    drawPieChart(currentQuestion.numerator, currentQuestion.denominator);
    validateAll();
}

// Pasta grafiği çiz
function drawPieChart(numerator, denominator) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    
    const fraction = numerator / denominator;
    const angle = fraction * Math.PI * 2;
    
    // Tam daire (gri)
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#e0e0e0';
    ctx.fill();
    
    // Kesir bölümü (mavi)
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, -Math.PI/2, -Math.PI/2 + angle);
    ctx.lineTo(centerX, centerY);
    ctx.fillStyle = '#1a237e';
    ctx.fill();
}

// Giriş alanlarını temizle
function clearInputs() {
    numeratorInput.value = '';
    denominatorInput.value = '';
    decimalInput.value = '';
    percentInput.value = '';
}

// Yardımcılar: EBOB, sadeleştirme, yaklaşık eşitlik
function gcd(a, b) {
    a = Math.abs(a); b = Math.abs(b);
    while (b) { const t = b; b = a % b; a = t; }
    return a || 1;
}
function reduceFraction(n, d) {
    if (!isFinite(n) || !isFinite(d) || d === 0) return null;
    const sign = d < 0 ? -1 : 1; // payda negatifse işareti taşı
    n = n * sign; d = Math.abs(d);
    const g = gcd(n, d);
    return { n: n / g, d: d / g };
}
function approxEqual(a, b, eps) { return Math.abs(a - b) <= eps; }

// Durum göstergesi
function setStatus(id, status) {
    const el = document.getElementById(id);
    if (!el) return;
    if (status === null) { el.textContent = ''; el.className = 'status-indicator'; return; }
    if (status) { el.textContent = '✓'; el.className = 'status-indicator ok'; }
    else { el.textContent = '✗'; el.className = 'status-indicator err'; }
}

// Doğrulama
function validateAll() {
    if (!currentQuestion) { setStatus('fracStatus', null); setStatus('decimalStatus', null); setStatus('percentStatus', null); return; }
    const qN = currentQuestion.numerator;
    const qD = currentQuestion.denominator;
    const expectedDec = qN / qD;
    const expectedPct = expectedDec * 100;

    // Fraction check
    const n = parseFloat(numeratorInput.value);
    const d = parseFloat(denominatorInput.value);
    if (!isNaN(n) && !isNaN(d) && d !== 0) {
        const rUser = reduceFraction(n, d);
        const rExp = reduceFraction(qN, qD);
        const ok = rUser && rExp && rUser.n === rExp.n && rUser.d === rExp.d;
        setStatus('fracStatus', !!ok);
    } else {
        setStatus('fracStatus', null);
    }

    // Decimal check (2 ondalık toleransı ~0.005)
    const decVal = parseFloat(decimalInput.value);
    if (!isNaN(decVal)) {
        const ok = approxEqual(decVal, expectedDec, 0.005);
        setStatus('decimalStatus', ok);
    } else {
        setStatus('decimalStatus', null);
    }

    // Percent check (1 ondalık toleransı ~0.5)
    const pctVal = parseFloat(percentInput.value);
    if (!isNaN(pctVal)) {
        const ok = approxEqual(pctVal, expectedPct, 0.5);
        setStatus('percentStatus', ok);
    } else {
        setStatus('percentStatus', null);
    }
}

// Kesirden ondalık ve yüzdeye dönüştür
function fractionToDecimalAndPercent() {
    const numerator = parseFloat(numeratorInput.value);
    const denominator = parseFloat(denominatorInput.value);
    
    if (denominator && numerator != null) {
        const decimal = numerator / denominator;
        decimalInput.value = decimal.toFixed(2);
        percentInput.value = (decimal * 100).toFixed(1);
        drawPieChart(numerator, denominator);
    }
}

// Ondalıktan kesir ve yüzdeye dönüştür
function decimalToFractionAndPercent() {
    const decimal = parseFloat(decimalInput.value);
    
    if (decimal != null) {
        // Basit kesir yaklaşımı
        const fraction = decimalToFraction(decimal);
        numeratorInput.value = fraction.numerator;
        denominatorInput.value = fraction.denominator;
        percentInput.value = (decimal * 100).toFixed(1);
        drawPieChart(fraction.numerator, fraction.denominator);
    }
}

// Yüzdeden kesir ve ondalığa dönüştür
function percentToFractionAndDecimal() {
    const percent = parseFloat(percentInput.value);
    
    if (percent != null) {
        const decimal = percent / 100;
        decimalInput.value = decimal.toFixed(2);
        
        const fraction = decimalToFraction(decimal);
        numeratorInput.value = fraction.numerator;
        denominatorInput.value = fraction.denominator;
        drawPieChart(fraction.numerator, fraction.denominator);
    }
}

// Ondalık sayıyı kesre dönüştür
function decimalToFraction(decimal) {
    const precision = 1000000;
    let numerator = Math.round(decimal * precision);
    let denominator = precision;
    
    // En büyük ortak bölen
    const gcd = (a, b) => b ? gcd(b, a % b) : a;
    const divisor = gcd(numerator, denominator);
    
    return {
        numerator: numerator / divisor,
        denominator: denominator / divisor
    };
}

// Event listeners: öğrenci kendi yazsın, otomatik dönüştürme yok
numeratorInput.addEventListener('input', () => {
    const n = parseFloat(numeratorInput.value);
    const d = parseFloat(denominatorInput.value);
    if (!isNaN(n) && !isNaN(d) && d) {
        drawPieChart(n, d);
    }
    validateAll();
});
denominatorInput.addEventListener('input', () => {
    const n = parseFloat(numeratorInput.value);
    const d = parseFloat(denominatorInput.value);
    if (!isNaN(n) && !isNaN(d) && d) {
        drawPieChart(n, d);
    }
    validateAll();
});
decimalInput.addEventListener('input', validateAll);
percentInput.addEventListener('input', validateAll);

document.getElementById('newQuestion').addEventListener('click', generateNewQuestion);
document.getElementById('showAnswer').addEventListener('click', showAnswer);

// Pratik kutusu: elemanlar
const pNumerator = document.getElementById('pNumerator');
const pDenominator = document.getElementById('pDenominator');
const pDecimal = document.getElementById('pDecimal');
const pPercent = document.getElementById('pPercent');
const checkPracticeBtn = document.getElementById('checkPractice');
const resetPracticeBtn = document.getElementById('resetPractice');

// Pratik: kesirden ondalık & yüzdeye (buton ile)
function practiceFromFraction() {
    const n = parseFloat(pNumerator && pNumerator.value);
    const d = parseFloat(pDenominator && pDenominator.value);
    if (!isNaN(n) && !isNaN(d) && d) {
      const dec = n / d;
      if (pDecimal) pDecimal.value = dec.toFixed(2);
      if (pPercent) pPercent.value = (dec * 100).toFixed(1);
    }
}

// Pratik: ondalıktan kesir & yüzdeye (yazdıkça)
function practiceFromDecimal() {
    const dec = parseFloat(pDecimal && pDecimal.value);
    if (!isNaN(dec)) {
      const frac = decimalToFraction(dec);
      if (pNumerator) pNumerator.value = frac.numerator;
      if (pDenominator) pDenominator.value = frac.denominator;
      if (pPercent) pPercent.value = (dec * 100).toFixed(1);
    }
}

// Pratik: yüzdeden kesir & ondalığa
function practiceFromPercent() {
    const pct = parseFloat(pPercent && pPercent.value);
    if (!isNaN(pct)) {
      const dec = pct / 100;
      if (pDecimal) pDecimal.value = dec.toFixed(2);
      const frac = decimalToFraction(dec);
      if (pNumerator) pNumerator.value = frac.numerator;
      if (pDenominator) pDenominator.value = frac.denominator;
    }
}

// Dönüştür butonu: Hangi alan doluysa onu kaynak al
function practiceConvert() {
    const hasFrac = pNumerator && pDenominator && pNumerator.value !== '' && pDenominator.value !== '';
    const hasDec = pDecimal && pDecimal.value !== '';
    const hasPct = pPercent && pPercent.value !== '';

    if (hasFrac) {
      practiceFromFraction();
      return;
    }
    if (hasDec) {
      practiceFromDecimal();
      return;
    }
    if (hasPct) {
      practiceFromPercent();
      return;
    }
    // hiçbiri yoksa bir şey yapma
}

// Olay bağlama (varsa)
if (checkPracticeBtn) {
    checkPracticeBtn.addEventListener('click', practiceConvert);
}
if (resetPracticeBtn) {
    resetPracticeBtn.addEventListener('click', function(){
      if (pNumerator) pNumerator.value = '';
      if (pDenominator) pDenominator.value = '';
      if (pDecimal) pDecimal.value = '';
      if (pPercent) pPercent.value = '';
    });
}

// Başlangıçta yeni soru oluştur
generateNewQuestion();
