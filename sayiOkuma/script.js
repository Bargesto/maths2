const numberInput = document.getElementById('numberInput');
const randomButton = document.getElementById('randomButton');
const formattedNumber = document.getElementById('formattedNumber');
const numberReading = document.getElementById('numberReading');
const practiceNumber = document.getElementById('practiceNumber');
const practiceInput = document.getElementById('practiceInput');
const checkButton = document.getElementById('checkButton');
const practiceResult = document.getElementById('practiceResult');
const toggleReadingSwitch = document.getElementById('toggleReadingSwitch');
const newPracticeBtn = document.getElementById('newPracticeBtn');

const birler = ['', 'bir', 'iki', 'üç', 'dört', 'beş', 'altı', 'yedi', 'sekiz', 'dokuz'];
const onlar = ['', 'on', 'yirmi', 'otuz', 'kırk', 'elli', 'altmış', 'yetmiş', 'seksen', 'doksan'];
const basamaklar = ['', 'bin', 'milyon', 'milyar'];

function formatNumber(num) {
    // Binlik ayırıcı olarak boşluk kullan
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function readNumber(num) {
    if (num === 0) return 'sıfır';
    
    let str = num.toString();
    let result = '';
    let groupIndex = 0;
    
    // Sayıyı üçerli gruplara ayır ve sondan başlayarak oku
    while (str.length > 0) {
        let group = str.slice(-3);
        if (group.length < 3) {
            group = group.padStart(3, '0');
        }
        
        let groupReading = readGroup(group, groupIndex);
        if (groupReading) {
            result = groupReading + (basamaklar[groupIndex] ? ' ' + basamaklar[groupIndex] + ' ' : '') + result;
        }
        
        str = str.slice(0, -3);
        groupIndex++;
    }
    
    return result.trim();
}

function readGroup(group, groupIndex) {
    let yuzler = parseInt(group[0]);
    let onlarBasamagi = parseInt(group[1]);
    let birlerBasamagi = parseInt(group[2]);
    
    let result = '';
    
    // Yüzler basamağı
    if (yuzler > 0) {
        result += (yuzler === 1 ? '' : birler[yuzler] + ' ') + 'yüz ';
    }
    
    // Onlar basamağı
    if (onlarBasamagi > 0) {
        result += onlar[onlarBasamagi] + ' ';
    }
    
    // Birler basamağı
    if (birlerBasamagi > 0) {
        // Özel durum: binler basamağında "bir bin" yerine sadece "bin" kullanılır
        if (!(groupIndex === 1 && birlerBasamagi === 1 && onlarBasamagi === 0 && yuzler === 0)) {
            result += birler[birlerBasamagi] + ' ';
        }
    }
    
    return result;
}

function generateRandomNumber(max) {
    return Math.floor(Math.random() * max);
}

// Sayı girişi kontrolü
numberInput.addEventListener('input', function(e) {
    // Sadece rakam girişine izin ver
    this.value = this.value.replace(/[^0-9]/g, '');
    
    if (this.value.length > 12) {
        this.value = this.value.slice(0, 12);
    }
    // Anlık olarak gösterim ve okunuşu güncelle
    if (this.value === '') {
        formattedNumber.textContent = '-';
        numberReading.textContent = '-';
        return;
    }
    const num = parseInt(this.value || '0');
    formattedNumber.textContent = formatNumber(num);
    numberReading.textContent = readNumber(num);
});


// Rastgele sayı butonu
randomButton.addEventListener('click', function() {
    let randomNum = generateRandomNumber(1000000000000);
    numberInput.value = randomNum;
    formattedNumber.textContent = formatNumber(randomNum);
    numberReading.textContent = readNumber(randomNum);
});

// Alıştırma için yeni sayı oluştur
function newPracticeNumber() {
    const num = generateRandomNumber(1000000);
    practiceNumber.textContent = formatNumber(num);
    practiceInput.value = '';
    practiceResult.textContent = '';
    practiceResult.className = 'practice-result';
    return num;
}

let currentPracticeNumber = newPracticeNumber();

// Kontrol et butonu
checkButton.addEventListener('click', function() {
    // Türkçe için küçük harfe çevirme ve normalizasyon (boşlukları sadeleştir, noktalama kaldır)
    const normalizeTr = (s) => s
        .toLocaleLowerCase('tr-TR')
        .replace(/[^a-zçğıöşü\s]/gi, ' ') // harf ve boşluk dışını temizle
        .replace(/\s+/g, ' ')            // fazla boşlukları tek boşluğa indir
        .trim();

    const userAnswer = normalizeTr(practiceInput.value);
    const correctAnswer = normalizeTr(readNumber(currentPracticeNumber));

    if (userAnswer === correctAnswer) {
        practiceResult.textContent = 'Doğru! Tebrikler!';
        practiceResult.className = 'practice-result correct';
        setTimeout(() => {
            currentPracticeNumber = newPracticeNumber();
        }, 1500);
    } else {
        // Kullanıcıya doğru cevabı orijinal biçimde göster (okunuş)
        practiceResult.textContent = `Yanlış. Doğru cevap: ${readNumber(currentPracticeNumber)}`;
        practiceResult.className = 'practice-result incorrect';
    }
});

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', function() {
    currentPracticeNumber = newPracticeNumber();

    // Initialize reading switch state to match current visibility
    if (toggleReadingSwitch && numberReading) {
        const isShown = !numberReading.classList.contains('hidden');
        toggleReadingSwitch.checked = isShown;
        const title = isShown ? 'Okunuşu gizle' : 'Okunuşu göster';
        toggleReadingSwitch.setAttribute('title', title);
        toggleReadingSwitch.setAttribute('aria-label', title);
        const labelEl = document.querySelector('label[for="toggleReadingSwitch"]');
        if (labelEl) labelEl.setAttribute('title', title);
    }
});

// Okunuşu göster/gizle (switch)
if (toggleReadingSwitch) {
    const updateReadingToggleUI = () => {
        if (!numberReading) return;
        numberReading.classList.toggle('hidden', !toggleReadingSwitch.checked);
        const title = toggleReadingSwitch.checked ? 'Okunuşu gizle' : 'Okunuşu göster';
        toggleReadingSwitch.setAttribute('title', title);
        toggleReadingSwitch.setAttribute('aria-label', title);
        const labelEl = document.querySelector('label[for="toggleReadingSwitch"]');
        if (labelEl) labelEl.setAttribute('title', title);
    };
    toggleReadingSwitch.addEventListener('change', updateReadingToggleUI);
}

// Alıştırma sayısını değiştir
if (newPracticeBtn) {
    newPracticeBtn.addEventListener('click', () => {
        currentPracticeNumber = newPracticeNumber();
    });
}
