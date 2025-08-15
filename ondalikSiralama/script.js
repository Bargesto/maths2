// Ondalık sayı oluşturma fonksiyonları
function createDecimal(value) {
    return {
        value: value,
        toString: function() {
            return value.toFixed(this.getDecimalPlaces()).replace('.', ',');
        },
        getDecimalPlaces: function() {
            const str = value.toString();
            const decimalPart = str.split('.')[1] || '';
            return decimalPart.length;
        }
    };
}

function generateTenthsDecimals() {
    const decimals = [];
    const usedValues = new Set();

    while (decimals.length < 4) {
        const value = Math.round(Math.random() * 90 + 10) / 10;
        if (!usedValues.has(value)) {
            usedValues.add(value);
            decimals.push(createDecimal(value));
        }
    }
    return decimals;
}

function generateHundredthsDecimals() {
    const decimals = [];
    const usedValues = new Set();

    while (decimals.length < 4) {
        const value = Math.round(Math.random() * 900 + 100) / 100;
        if (!usedValues.has(value)) {
            usedValues.add(value);
            decimals.push(createDecimal(value));
        }
    }
    return decimals;
}

function generateThousandthsDecimals() {
    const decimals = [];
    const usedValues = new Set();

    while (decimals.length < 4) {
        const value = Math.round(Math.random() * 9000 + 1000) / 1000;
        if (!usedValues.has(value)) {
            usedValues.add(value);
            decimals.push(createDecimal(value));
        }
    }
    return decimals;
}

function generateMixedDecimals() {
    const decimals = [];
    const usedValues = new Set();
    const decimalPlaces = [1, 2, 3]; // Farklı basamak sayıları

    while (decimals.length < 4) {
        const places = decimalPlaces[Math.floor(Math.random() * decimalPlaces.length)];
        const multiplier = Math.pow(10, places);
        const value = Math.round(Math.random() * (9 * multiplier) + multiplier) / multiplier;
        
        if (!usedValues.has(value)) {
            usedValues.add(value);
            decimals.push(createDecimal(value));
        }
    }
    return decimals;
}

let currentDecimals = [];
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
const decimalTypeRadios = document.getElementsByName('decimalType');
const correctAnswerSection = document.querySelector('.correct-answer');

// Yeni soru oluştur
function generateNewQuestion() {
    // Seçili ondalık sayı türünü al
    const selectedType = document.querySelector('input[name="decimalType"]:checked').value;
    
    // Seçilen türe göre ondalık sayı seti oluştur
    switch (selectedType) {
        case 'tenths':
            currentDecimals = generateTenthsDecimals();
            break;
        case 'hundredths':
            currentDecimals = generateHundredthsDecimals();
            break;
        case 'thousandths':
            currentDecimals = generateThousandthsDecimals();
            break;
        case 'mixed':
            currentDecimals = generateMixedDecimals();
            break;
    }
    
    // Sayıları karıştır
    shuffleArray(currentDecimals);
    
    // Alanları temizle
    sourceContainer.innerHTML = '';
    targetContainer.innerHTML = '';
    correctOrderContainer.innerHTML = '';
    resultMessage.style.display = 'none';
    correctAnswerSection.style.display = 'none';
    
    // Sayıları ekle
    currentDecimals.forEach((decimal, index) => {
        const decimalElement = createDecimalElement(decimal, index + 1);
        sourceContainer.appendChild(decimalElement);
    });
}

// Ondalık sayı elementi oluştur
function createDecimalElement(decimal, colorIndex) {
    const element = document.createElement('div');
    element.className = `decimal-item decimal-color-${colorIndex}`;
    element.draggable = true;
    element.textContent = decimal.toString();
    
    element.addEventListener('dragstart', dragStart);
    element.addEventListener('dragend', dragEnd);
    element.decimal = decimal;
    element.colorIndex = colorIndex;
    
    return element;
}

// Doğru sıralamayı göster
function showCorrectOrder() {
    correctAnswerSection.style.display = 'block';
    correctOrderContainer.innerHTML = '';
    
    // Sayıları sırala
    const sortedDecimals = [...currentDecimals].sort((a, b) => 
        isAscending ? a.value - b.value : b.value - a.value
    );
    
    // Sıralanmış sayıları ekle
    sortedDecimals.forEach((decimal, index) => {
        // Orijinal renk indeksini bul
        const originalElement = [...sourceContainer.children, ...targetContainer.children]
            .find(el => el.decimal && el.decimal.value === decimal.value);
        const colorIndex = originalElement ? originalElement.colorIndex : (index + 1);
        
        const decimalElement = createDecimalElement(decimal, colorIndex);
        decimalElement.draggable = false;
        correctOrderContainer.appendChild(decimalElement);
        
        // Karşılaştırma sembolünü ekle (son eleman hariç)
        if (index < sortedDecimals.length - 1) {
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
    
    // Sayı elementlerini al
    const decimalElements = targetContainer.querySelectorAll('.decimal-item');
    
    // Her sayı arasına sembol ekle
    decimalElements.forEach((element, index) => {
        if (index < decimalElements.length - 1) {
            const symbol = document.createElement('div');
            symbol.className = 'comparison-symbol';
            symbol.textContent = isAscending ? '<' : '>';
            element.after(symbol);
        }
    });
}

// Sürükleme pozisyonunu hesapla
function getDragAfterElement(container, x) {
    const draggableElements = [...container.querySelectorAll('.decimal-item:not(.dragging)')];
    
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
    const decimalElements = [...targetContainer.querySelectorAll('.decimal-item')];
    
    if (decimalElements.length !== currentDecimals.length) {
        showResult('Lütfen tüm sayıları yerleştirin!', false);
        return;
    }
    
    const values = decimalElements.map(el => el.decimal.value);
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

decimalTypeRadios.forEach(radio => {
    radio.addEventListener('change', () => {
        generateNewQuestion();
    });
});

// Başlangıçta ilk soruyu oluştur
generateNewQuestion();
