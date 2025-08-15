const canvas = document.getElementById('rectangleCanvas');
const ctx = canvas.getContext('2d');
const modeBtns = document.querySelectorAll('.mode-btn');
const areaMode = document.getElementById('areaMode');
const perimeterMode = document.getElementById('perimeterMode');
const resultsList = document.getElementById('resultsList');

// Canvas boyutlarını ayarla
canvas.width = 1000;  // Daha geniş canvas
canvas.height = 800;  // Daha yüksek canvas

// Mod değiştirme
modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        if (btn.dataset.mode === 'area') {
            areaMode.classList.remove('hidden');
            perimeterMode.classList.add('hidden');
        } else {
            areaMode.classList.add('hidden');
            perimeterMode.classList.remove('hidden');
        }
        
        clearResults();
        drawEmptyCanvas();
    });
});

// Alan verildiğinde çevre hesaplama
document.getElementById('calculatePerimeter').addEventListener('click', () => {
    const area = parseInt(document.getElementById('areaInput').value);
    if (!area || area < 1) {
        alert('Lütfen geçerli bir alan değeri girin!');
        return;
    }
    
    const possibilities = findPossibleDimensions(area);
    displayResults(possibilities, 'area');
});

// Çevre verildiğinde alan hesaplama
document.getElementById('calculateArea').addEventListener('click', () => {
    const perimeter = parseInt(document.getElementById('perimeterInput').value);
    if (!perimeter || perimeter < 4 || perimeter % 2 !== 0) {
        alert('Lütfen geçerli bir çevre değeri girin! (4\'ten büyük çift sayı)');
        return;
    }
    
    const possibilities = findPossibleDimensionsFromPerimeter(perimeter);
    displayResults(possibilities, 'perimeter');
});

// Verilen alan için olası kenar uzunluklarını bulma
function findPossibleDimensions(area) {
    const possibilities = [];
    for (let width = 1; width <= Math.sqrt(area); width++) {
        if (area % width === 0) {
            const height = area / width;
            possibilities.push({
                width,
                height,
                area,
                perimeter: 2 * (width + height)
            });
        }
    }
    return possibilities;
}

// Verilen çevre için olası kenar uzunluklarını bulma
function findPossibleDimensionsFromPerimeter(perimeter) {
    const possibilities = [];
    const halfPerimeter = perimeter / 2;
    
    for (let width = 1; width < halfPerimeter; width++) {
        const height = halfPerimeter - width;
        possibilities.push({
            width,
            height,
            area: width * height,
            perimeter
        });
    }
    return possibilities;
}

// Sonuçları görüntüleme
function displayResults(possibilities, mode) {
    clearResults();
    
    if (possibilities.length === 0) {
        resultsList.innerHTML = '<div class="result-item">Sonuç bulunamadı.</div>';
        return;
    }
    
    possibilities.forEach((p, index) => {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        
        if (mode === 'area') {
            resultItem.innerHTML = `
                Dikdörtgen ${index + 1}:<br>
                Genişlik: ${p.width} birim<br>
                Yükseklik: ${p.height} birim<br>
                Çevre: ${p.perimeter} birim
            `;
        } else {
            resultItem.innerHTML = `
                Dikdörtgen ${index + 1}:<br>
                Genişlik: ${p.width} birim<br>
                Yükseklik: ${p.height} birim<br>
                Alan: ${p.area} birim²
            `;
        }
        
        resultItem.addEventListener('click', () => {
            drawRectangle(p.width, p.height);
        });
        
        resultsList.appendChild(resultItem);
    });
    
    // İlk dikdörtgeni çiz
    if (possibilities.length > 0) {
        drawRectangle(possibilities[0].width, possibilities[0].height);
    }
}

// Dikdörtgen çizimi
function drawRectangle(width, height) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Dikdörtgenin merkezi konumu - birim başına 25 piksel kullanarak gerçek boyutlarda çizim
    const pixelsPerUnit = 25; 
    const rectWidth = width * pixelsPerUnit;
    const rectHeight = height * pixelsPerUnit;
    
    // Kenar boşlukları için minimum alan
    const margin = 80;
    
    // Canvas merkezini hesapla
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Dikdörtgenin sol üst köşesi
    const x = centerX - (rectWidth / 2);
    const y = centerY - (rectHeight / 2);
    
    // Dikdörtgen canvas sınırlarını aşıyorsa, tamamını göster
    let finalX = x;
    let finalY = y;
    let finalWidth = rectWidth;
    let finalHeight = rectHeight;
    
    // Canvas sınırlarını aşıyorsa scroll bar eklenecek şekilde canvas'ı büyüt
    if (rectWidth + margin * 2 > canvas.width) {
        canvas.width = rectWidth + margin * 2;
    }
    if (rectHeight + margin * 2 > canvas.height) {
        canvas.height = rectHeight + margin * 2;
    }
    
    // Dikdörtgeni çiz
    ctx.beginPath();
    ctx.strokeStyle = '#1565C0';
    ctx.fillStyle = '#E3F2FD';
    ctx.lineWidth = 2;
    ctx.rect(finalX, finalY, finalWidth, finalHeight);
    ctx.fill();
    ctx.stroke();
    
    // Kenar uzunluklarını yaz
    ctx.font = '16px Arial';
    ctx.fillStyle = '#1565C0';
    ctx.textAlign = 'center'; 
    
    // Genişlik - altta ortada
    ctx.fillText(`${width} birim`, centerX, finalY + finalHeight + 25);
    
    // Yükseklik - solda ortada
    ctx.save();
    ctx.translate(finalX - 25, centerY);
    ctx.rotate(-Math.PI/2);
    ctx.fillText(`${height} birim`, 0, 0);
    ctx.restore();
}

// Boş canvas çizimi
function drawEmptyCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '16px Arial';
    ctx.fillStyle = '#666';
    ctx.textAlign = 'center';
    ctx.fillText('Dikdörtgen burada görüntülenecek', canvas.width/2, canvas.height/2);
}

// Sonuçları temizleme
function clearResults() {
    resultsList.innerHTML = '';
    drawEmptyCanvas();
}

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    drawEmptyCanvas();
});
