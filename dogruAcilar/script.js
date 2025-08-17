const canvas = document.getElementById('geometryCanvas');
const ctx = canvas.getContext('2d');
const addLineBtn = document.getElementById('addLine');
const resetBtn = document.getElementById('reset');
const angleInfo = document.getElementById('angleInfo');

// Canvas boyutlarını ayarla
canvas.width = 800;
canvas.height = 600;

const colors = ['#FF5252', '#4CAF50', '#2196F3'];
let lines = [];
let isDragging = false;
let selectedLine = null;
let selectedPoint = null;

// Izgara çizimi için fonksiyon
function drawGrid() {
    const gridSize = 20;
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 0.5;

    // Dikey çizgiler
    for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    // Yatay çizgiler
    for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

class Line {
    constructor(x1, y1, x2, y2, color) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.color = color;
    }

    draw() {
        ctx.beginPath();
        ctx.moveTo(this.x1, this.y1);
        ctx.lineTo(this.x2, this.y2);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Uç noktaları çiz
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x1, this.y1, 5, 0, Math.PI * 2);
        ctx.arc(this.x2, this.y2, 5, 0, Math.PI * 2);
        ctx.fill();
    }

    isNearPoint(x, y) {
        const d1 = Math.sqrt((x - this.x1) ** 2 + (y - this.y1) ** 2);
        const d2 = Math.sqrt((x - this.x2) ** 2 + (y - this.y2) ** 2);
        if (d1 < 10) return 'start';
        if (d2 < 10) return 'end';
        return null;
    }
}

function calculateAngle(line1, line2) {
    const angle1 = Math.atan2(line1.y2 - line1.y1, line1.x2 - line1.x1);
    const angle2 = Math.atan2(line2.y2 - line2.y1, line2.x2 - line2.x1);
    let angle = Math.abs(angle1 - angle2) * (180 / Math.PI);
    if (angle > 180) angle = 360 - angle;
    return angle;
}

function drawAngle(line1, line2) {
    const intersection = findIntersection(line1, line2);
    if (!intersection) return;

    const radius = 30;
    const angle1 = Math.atan2(line1.y2 - line1.y1, line1.x2 - line1.x1);
    const angle2 = Math.atan2(line2.y2 - line2.y1, line2.x2 - line2.x1);
    
    let startAngle = Math.min(angle1, angle2);
    let endAngle = Math.max(angle1, angle2);
    
    if (endAngle - startAngle > Math.PI) {
        [startAngle, endAngle] = [endAngle, startAngle];
    }

    ctx.beginPath();
    ctx.moveTo(intersection.x, intersection.y);
    ctx.arc(intersection.x, intersection.y, radius, startAngle, endAngle);
    ctx.strokeStyle = 'rgba(255, 99, 71, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Açı değerini yaz
    const angle = calculateAngle(line1, line2);
    const midAngle = (startAngle + endAngle) / 2;
    const textX = intersection.x + (radius + 10) * Math.cos(midAngle);
    const textY = intersection.y + (radius + 10) * Math.sin(midAngle);
    
    ctx.fillStyle = '#333';
    ctx.font = '14px Arial';
    ctx.fillText(`${angle.toFixed(1)}°`, textX, textY);
}

function findIntersection(line1, line2) {
    const x1 = line1.x1, y1 = line1.y1;
    const x2 = line1.x2, y2 = line1.y2;
    const x3 = line2.x1, y3 = line2.y1;
    const x4 = line2.x2, y4 = line2.y2;

    const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (denominator === 0) return null;

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denominator;
    
    return {
        x: x1 + t * (x2 - x1),
        y: y1 + t * (y2 - y1)
    };
}

function updateAngleInfo() {
    if (lines.length < 2) {
        angleInfo.textContent = 'En az iki doğru çizin';
        return;
    }

    let angles = [];
    for (let i = 0; i < lines.length - 1; i++) {
        for (let j = i + 1; j < lines.length; j++) {
            const angle = calculateAngle(lines[i], lines[j]);
            angles.push(angle.toFixed(1));
        }
    }

    angleInfo.innerHTML = `Oluşan Açılar:<br>${angles.join('°, ')}°`;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    lines.forEach(line => line.draw());
    
    // Açıları çiz
    for (let i = 0; i < lines.length - 1; i++) {
        for (let j = i + 1; j < lines.length; j++) {
            drawAngle(lines[i], lines[j]);
        }
    }
}

addLineBtn.addEventListener('click', () => {
    if (lines.length >= 3) {
        alert('En fazla 3 doğru çizebilirsiniz!');
        return;
    }
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const offset = 50 * (lines.length + 1);
    lines.push(new Line(centerX - offset, centerY - offset, centerX + offset, centerY + offset, colors[lines.length]));
    draw();
    updateAngleInfo();
});

resetBtn.addEventListener('click', () => {
    lines = [];
    draw();
    updateAngleInfo();
});

// Unified input handling (mouse + touch) using Pointer Events when available
function getCanvasPos(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return { x: clientX - rect.left, y: clientY - rect.top };
}

function onDown(x, y, pointerId) {
    lines.forEach((line, index) => {
        const point = line.isNearPoint(x, y);
        if (point) {
            isDragging = true;
            selectedLine = index;
            selectedPoint = point;
        }
    });
}

function onMove(x, y) {
    if (!isDragging) return;
    if (selectedPoint === 'start') {
        lines[selectedLine].x1 = x;
        lines[selectedLine].y1 = y;
    } else {
        lines[selectedLine].x2 = x;
        lines[selectedLine].y2 = y;
    }
    draw();
    updateAngleInfo();
}

function onUp() {
    isDragging = false;
    selectedLine = null;
    selectedPoint = null;
}

if (window.PointerEvent) {
    // Prevent default gestures on touch
    canvas.style.touchAction = 'none';

    canvas.addEventListener('pointerdown', (e) => {
        const { x, y } = getCanvasPos(e.clientX, e.clientY);
        onDown(x, y, e.pointerId);
        if (canvas.setPointerCapture) {
            try { canvas.setPointerCapture(e.pointerId); } catch {}
        }
    });

    canvas.addEventListener('pointermove', (e) => {
        const { x, y } = getCanvasPos(e.clientX, e.clientY);
        onMove(x, y);
    });

    const endHandler = () => onUp();
    canvas.addEventListener('pointerup', endHandler);
    canvas.addEventListener('pointercancel', endHandler);
} else {
    // Mouse fallback
    canvas.addEventListener('mousedown', (e) => {
        const { x, y } = getCanvasPos(e.clientX, e.clientY);
        onDown(x, y);
    });
    window.addEventListener('mousemove', (e) => {
        const { x, y } = getCanvasPos(e.clientX, e.clientY);
        onMove(x, y);
    });
    window.addEventListener('mouseup', onUp);

    // Touch fallback
    canvas.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches.length) {
            const t = e.touches[0];
            const { x, y } = getCanvasPos(t.clientX, t.clientY);
            onDown(x, y);
        }
        e.preventDefault();
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
        if (e.touches && e.touches.length) {
            const t = e.touches[0];
            const { x, y } = getCanvasPos(t.clientX, t.clientY);
            onMove(x, y);
        }
        e.preventDefault();
    }, { passive: false });

    const touchEnd = (e) => { onUp(); e.preventDefault(); };
    canvas.addEventListener('touchend', touchEnd, { passive: false });
    canvas.addEventListener('touchcancel', touchEnd, { passive: false });
}

// Başlangıçta iki doğru oluştur
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
lines.push(new Line(centerX - 50, centerY - 50, centerX + 50, centerY + 50, colors[0]));
lines.push(new Line(centerX - 50, centerY + 50, centerX + 50, centerY - 50, colors[1]));

// İlk çizim
draw();
updateAngleInfo();
