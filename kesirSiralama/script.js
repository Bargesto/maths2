// Kesir oluşturma ve karşılaştırma fonksiyonları
function createFraction(numerator, denominator) {
    return {
        numerator: numerator,
        denominator: denominator,
        value: numerator / denominator,
        toString: function() {
            return `${this.numerator}/${this.denominator}`;
        }
    };
}

// Kesir oluşturma fonksiyonları
function generateEqualDenominatorFractions() {
    const denominator = Math.floor(Math.random() * 8) + 2; // 2 ile 9 arası payda
    const fractions = [];
    const usedNumerators = new Set();

    while (fractions.length < 4) {
        const numerator = Math.floor(Math.random() * (denominator * 2)) + 1;
        if (!usedNumerators.has(numerator)) {
            usedNumerators.add(numerator);
            fractions.push(createFraction(numerator, denominator));
        }
    }
    return fractions;
}

function generateEqualNumeratorFractions() {
    const numerator = Math.floor(Math.random() * 5) + 1; // 1 ile 5 arası pay
    const fractions = [];
    const usedDenominators = new Set();

    while (fractions.length < 4) {
        const denominator = Math.floor(Math.random() * 8) + 2; // 2 ile 9 arası payda
        if (!usedDenominators.has(denominator)) {
            usedDenominators.add(denominator);
            fractions.push(createFraction(numerator, denominator));
        }
    }
    return fractions;
}

function generateMultipleDenominatorFractions() {
    const baseDenominator = Math.floor(Math.random() * 3) + 2; // 2, 3 veya 4
    const fractions = [];
    const denominators = [baseDenominator];
    
    // Paydaları oluştur (birbirinin katları)
    for (let i = 2; i <= 4; i++) {
        denominators.push(baseDenominator * i);
    }

    // Her payda için uygun pay seç
    denominators.forEach(denominator => {
        const maxNumerator = Math.floor(denominator * 1.5);
        const numerator = Math.floor(Math.random() * maxNumerator) + 1;
        fractions.push(createFraction(numerator, denominator));
    });

    return fractions;
}

function generateRandomFractions() {
    const fractions = [];
    const usedValues = new Set();

    while (fractions.length < 4) {
        const denominator = Math.floor(Math.random() * 8) + 2; // 2 ile 9 arası payda
        const numerator = Math.floor(Math.random() * (denominator * 2)) + 1;
        const value = numerator / denominator;

        if (!usedValues.has(value)) {
            usedValues.add(value);
            fractions.push(createFraction(numerator, denominator));
        }
    }
    return fractions;
}

let currentFractions = [];
let isAscending = true;

// DOM elementleri
const sourceContainer = document.getElementById('source');
const targetContainer = document.getElementById('target');
const correctOrderContainer = document.getElementById('correctOrder');
const newQuestionButton = document.getElementById('newQuestion');
const checkAnswerButton = document.getElementById('checkAnswer');
const showCorrectButton = document.getElementById('showCorrect');
const resultMessage = document.getElementById('result');
const orderRadios = document.getElementsByName('order');
const fractionTypeRadios = document.getElementsByName('fractionType');
const correctAnswerSection = document.querySelector('.correct-answer');

// Yeni soru oluştur
function generateNewQuestion() {
    // Seçili kesir türünü al
    const selectedType = document.querySelector('input[name="fractionType"]:checked').value;
    
    // Seçilen türe göre kesir seti oluştur
    switch (selectedType) {
        case 'equalDenominator':
            currentFractions = generateEqualDenominatorFractions();
            break;
        case 'equalNumerator':
            currentFractions = generateEqualNumeratorFractions();
            break;
        case 'multipleDenominator':
            currentFractions = generateMultipleDenominatorFractions();
            break;
        case 'random':
            currentFractions = generateRandomFractions();
            break;
    }
    
    // Kesirleri karıştır
    shuffleArray(currentFractions);
    
    // Alanları temizle
    sourceContainer.innerHTML = '';
    targetContainer.innerHTML = '';
    correctOrderContainer.innerHTML = '';
    resultMessage.style.display = 'none';
    correctAnswerSection.style.display = 'none';
    
    // Kesirleri ekle
    currentFractions.forEach((fraction, index) => {
        const fractionElement = createFractionElement(fraction, index + 1);
        sourceContainer.appendChild(fractionElement);
    });
}

// Kesir elementi oluştur
function createFractionElement(fraction, colorIndex) {
    const element = document.createElement('div');
    element.className = `fraction-item fraction-color-${colorIndex}`;
    element.draggable = true;
    element.innerHTML = `
        <div class="fraction">
            <div class="numerator">${fraction.numerator}</div>
            <div class="fraction-line"></div>
            <div class="denominator">${fraction.denominator}</div>
        </div>
    `;
    
    element.addEventListener('dragstart', dragStart);
    element.addEventListener('dragend', dragEnd);
    element.fraction = fraction;
    element.colorIndex = colorIndex;
    
    return element;
}

// Doğru sıralamayı göster
function showCorrectOrder() {
    correctAnswerSection.style.display = 'block';
    correctOrderContainer.innerHTML = '';
    
    // Kesirleri sırala
    const sortedFractions = [...currentFractions].sort((a, b) => 
        isAscending ? a.value - b.value : b.value - a.value
    );
    
    // Sıralanmış kesirleri ekle
    sortedFractions.forEach((fraction, index) => {
        // Orijinal renk indeksini bul
        const originalElement = [...sourceContainer.children, ...targetContainer.children]
            .find(el => el.fraction && el.fraction.value === fraction.value);
        const colorIndex = originalElement ? originalElement.colorIndex : (index + 1);
        
        const fractionElement = createFractionElement(fraction, colorIndex);
        fractionElement.draggable = false;
        correctOrderContainer.appendChild(fractionElement);
        
        // Karşılaştırma sembolünü ekle (son eleman hariç)
        if (index < sortedFractions.length - 1) {
            const symbol = document.createElement('div');
            symbol.className = 'comparison-symbol';
            symbol.textContent = isAscending ? '<' : '>';
            correctOrderContainer.appendChild(symbol);
        }
    });
}

// Sürükleme fonksiyonları
function dragStart(e) {
    e.target.classList.add('dragging');
}

function dragEnd(e) {
    e.target.classList.remove('dragging');
}

// Hedef alan olayları
targetContainer.addEventListener('dragover', e => {
    e.preventDefault();
    const draggable = document.querySelector('.dragging');
    if (draggable) {
        const afterElement = getDragAfterElement(targetContainer, e.clientX);
        if (afterElement) {
            targetContainer.insertBefore(draggable, afterElement);
        } else {
            targetContainer.appendChild(draggable);
        }
        updateComparisonSymbols();
    }
});

// Karşılaştırma sembollerini güncelle
function updateComparisonSymbols() {
    // Önce mevcut sembolleri kaldır
    targetContainer.querySelectorAll('.comparison-symbol').forEach(el => el.remove());
    
    // Kesir elementlerini al
    const fractionElements = targetContainer.querySelectorAll('.fraction-item');
    
    // Her kesir arasına sembol ekle
    fractionElements.forEach((element, index) => {
        if (index < fractionElements.length - 1) {
            const symbol = document.createElement('div');
            symbol.className = 'comparison-symbol';
            symbol.textContent = isAscending ? '<' : '>';
            element.after(symbol);
        }
    });
}

// Sürükleme pozisyonunu hesapla
function getDragAfterElement(container, x) {
    const draggableElements = [...container.querySelectorAll('.fraction-item:not(.dragging)')];
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = x - box.left - box.width / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Cevabı kontrol et
function checkAnswer() {
    const fractionElements = [...targetContainer.querySelectorAll('.fraction-item')];
    
    if (fractionElements.length !== currentFractions.length) {
        showResult('Lütfen tüm kesirleri yerleştirin!', false);
        return;
    }
    
    const values = fractionElements.map(el => el.fraction.value);
    const isCorrect = isAscending
        ? isArraySorted(values)
        : isArraySorted(values.reverse());
    
    showResult(
        isCorrect ? 'Tebrikler! Doğru sıraladınız!' : 'Yanlış sıralama. Tekrar deneyin!',
        isCorrect
    );
}

// Yardımcı fonksiyonlar
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function isArraySorted(arr) {
    for (let i = 1; i < arr.length; i++) {
        if (arr[i] < arr[i - 1]) return false;
    }
    return true;
}

function showResult(message, isSuccess) {
    resultMessage.textContent = message;
    resultMessage.className = 'result-message ' + (isSuccess ? 'success' : 'error');
    resultMessage.style.display = 'block';
}

// Event listeners
newQuestionButton.addEventListener('click', generateNewQuestion);
checkAnswerButton.addEventListener('click', checkAnswer);
showCorrectButton.addEventListener('click', showCorrectOrder);

orderRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        isAscending = e.target.value === 'ascending';
        if (correctAnswerSection.style.display === 'block') {
            showCorrectOrder();
        }
        updateComparisonSymbols();
    });
});

fractionTypeRadios.forEach(radio => {
    radio.addEventListener('change', () => {
        generateNewQuestion();
    });
});

// Başlangıçta ilk soruyu oluştur
generateNewQuestion();
