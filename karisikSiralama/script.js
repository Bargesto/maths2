// Sayı türleri için sınıflar
class NumberRepresentation {
    constructor(value) {
        this.value = value;
    }

    toDecimal() {
        return this.value;
    }
}

class Fraction extends NumberRepresentation {
    constructor(numerator, denominator) {
        super(numerator / denominator);
        this.numerator = numerator;
        this.denominator = denominator;
        this.type = 'fraction';
    }

    toString() {
        return `<div class="fraction">
            <div class="numerator">${this.numerator}</div>
            <div class="fraction-line"></div>
            <div class="denominator">${this.denominator}</div>
        </div>`;
    }
}

class Decimal extends NumberRepresentation {
    constructor(value) {
        super(value);
        this.type = 'decimal';
    }

    toString() {
        return `<div class="decimal">${this.value.toFixed(2).replace('.', ',')}</div>`;
    }
}

class Percent extends NumberRepresentation {
    constructor(value) {
        super(value / 100);
        this.percentValue = Math.round(value); // Yüzdelik değeri tam sayıya yuvarla
        this.type = 'percent';
    }

    toString() {
        return `<div class="percent">%${this.percentValue}</div>`;
    }
}

// Sayı üretme fonksiyonları
function generateFractionAndDecimal() {
    const numbers = [];
    const usedValues = new Set();

    while (numbers.length < 4) {
        const denominator = Math.floor(Math.random() * 8) + 2;
        const numerator = Math.floor(Math.random() * (denominator * 2)) + 1;
        const value = numerator / denominator;

        if (!usedValues.has(value)) {
            usedValues.add(value);
            if (numbers.length % 2 === 0) {
                numbers.push(new Fraction(numerator, denominator));
            } else {
                numbers.push(new Decimal(value));
            }
        }
    }
    return numbers;
}

function generateFractionAndPercent() {
    const numbers = [];
    const usedValues = new Set();

    while (numbers.length < 4) {
        const denominator = Math.floor(Math.random() * 8) + 2;
        const numerator = Math.floor(Math.random() * (denominator * 2)) + 1;
        const value = numerator / denominator;

        if (!usedValues.has(value)) {
            usedValues.add(value);
            if (numbers.length % 2 === 0) {
                numbers.push(new Fraction(numerator, denominator));
            } else {
                // Yüzdelik değeri 1-100 arasında tam sayı olarak üret
                const percentValue = Math.round(value * 100);
                numbers.push(new Percent(percentValue));
            }
        }
    }
    return numbers;
}

function generateDecimalAndPercent() {
    const numbers = [];
    const usedValues = new Set();

    while (numbers.length < 4) {
        // 0.1 ile 1 arasında rastgele bir değer üret
        const value = Math.round(Math.random() * 90 + 10) / 100;
        
        if (!usedValues.has(value)) {
            usedValues.add(value);
            if (numbers.length % 2 === 0) {
                numbers.push(new Decimal(value));
            } else {
                // Yüzdelik değeri 10-100 arasında tam sayı olarak üret
                const percentValue = Math.round(value * 100);
                numbers.push(new Percent(percentValue));
            }
        }
    }
    return numbers;
}

function generateAllTypes() {
    const numbers = [];
    const usedValues = new Set();

    while (numbers.length < 4) {
        const denominator = Math.floor(Math.random() * 8) + 2;
        const numerator = Math.floor(Math.random() * (denominator * 2)) + 1;
        const value = numerator / denominator;

        if (!usedValues.has(value)) {
            usedValues.add(value);
            switch (numbers.length) {
                case 0:
                    numbers.push(new Fraction(numerator, denominator));
                    break;
                case 1:
                    numbers.push(new Decimal(value));
                    break;
                case 2:
                    // Yüzdelik değeri tam sayı olarak üret
                    const percentValue = Math.round(value * 100);
                    numbers.push(new Percent(percentValue));
                    break;
                case 3:
                    // Rastgele bir tür seç
                    const type = Math.floor(Math.random() * 3);
                    switch (type) {
                        case 0:
                            numbers.push(new Fraction(numerator, denominator));
                            break;
                        case 1:
                            numbers.push(new Decimal(value));
                            break;
                        case 2:
                            numbers.push(new Percent(Math.round(value * 100)));
                            break;
                    }
                    break;
            }
        }
    }
    return numbers;
}

let currentNumbers = [];
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
const numberTypeRadios = document.getElementsByName('numberType');
const correctAnswerSection = document.querySelector('.correct-answer');

// Yeni soru oluştur
function generateNewQuestion() {
    // Seçili sayı türünü al
    const selectedType = document.querySelector('input[name="numberType"]:checked').value;
    
    // Seçilen türe göre sayı seti oluştur
    switch (selectedType) {
        case 'fractionDecimal':
            currentNumbers = generateFractionAndDecimal();
            break;
        case 'fractionPercent':
            currentNumbers = generateFractionAndPercent();
            break;
        case 'decimalPercent':
            currentNumbers = generateDecimalAndPercent();
            break;
        case 'all':
            currentNumbers = generateAllTypes();
            break;
    }
    
    // Sayıları karıştır
    shuffleArray(currentNumbers);
    
    // Alanları temizle
    sourceContainer.innerHTML = '';
    targetContainer.innerHTML = '';
    correctOrderContainer.innerHTML = '';
    resultMessage.style.display = 'none';
    correctAnswerSection.style.display = 'none';
    
    // Sayıları ekle
    currentNumbers.forEach((number, index) => {
        const numberElement = createNumberElement(number, index + 1);
        sourceContainer.appendChild(numberElement);
    });
}

// Sayı elementi oluştur
function createNumberElement(number, colorIndex) {
    const element = document.createElement('div');
    element.className = `number-item number-color-${colorIndex}`;
    element.draggable = true;
    element.innerHTML = number.toString();
    
    element.addEventListener('dragstart', dragStart);
    element.addEventListener('dragend', dragEnd);
    element.number = number;
    element.colorIndex = colorIndex;
    
    return element;
}

// Doğru sıralamayı göster
function showCorrectOrder() {
    correctAnswerSection.style.display = 'block';
    correctOrderContainer.innerHTML = '';
    
    // Sayıları sırala
    const sortedNumbers = [...currentNumbers].sort((a, b) => 
        isAscending ? a.value - b.value : b.value - a.value
    );
    
    // Sıralanmış sayıları ekle
    sortedNumbers.forEach((number, index) => {
        // Orijinal renk indeksini bul
        const originalElement = [...sourceContainer.children, ...targetContainer.children]
            .find(el => el.number && el.number.value === number.value);
        const colorIndex = originalElement ? originalElement.colorIndex : (index + 1);
        
        const numberElement = createNumberElement(number, colorIndex);
        numberElement.draggable = false;
        correctOrderContainer.appendChild(numberElement);
        
        // Karşılaştırma sembolünü ekle (son eleman hariç)
        if (index < sortedNumbers.length - 1) {
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
    const numberElements = targetContainer.querySelectorAll('.number-item');
    
    // Her sayı arasına sembol ekle
    numberElements.forEach((element, index) => {
        if (index < numberElements.length - 1) {
            const symbol = document.createElement('div');
            symbol.className = 'comparison-symbol';
            symbol.textContent = isAscending ? '<' : '>';
            element.after(symbol);
        }
    });
}

// Sürükleme pozisyonunu hesapla
function getDragAfterElement(container, x) {
    const draggableElements = [...container.querySelectorAll('.number-item:not(.dragging)')];
    
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
    const numberElements = [...targetContainer.querySelectorAll('.number-item')];
    
    if (numberElements.length !== currentNumbers.length) {
        showResult('Lütfen tüm sayıları yerleştirin!', false);
        return;
    }
    
    const values = numberElements.map(el => el.number.value);
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

numberTypeRadios.forEach(radio => {
    radio.addEventListener('change', () => {
        generateNewQuestion();
    });
});

// Başlangıçta ilk soruyu oluştur
generateNewQuestion();
