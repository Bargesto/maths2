const canvas = document.getElementById('geometryCanvas');
const ctx = canvas.getContext('2d');
const addCircleBtn = document.getElementById('addCircle');
const resetBtn = document.getElementById('reset');
const info = document.getElementById('info');
const makeTriangleBtn = document.getElementById('makeTriangle');
const radiusInput = document.getElementById('radiusInput');

// Logical canvas size and responsive scaling
const BASE_W = 900, BASE_H = 540;
const GRID_STEP = 15; // daha küçük kareler
let dpr = window.devicePixelRatio || 1;

function resizeCanvas(){
  dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(BASE_W * dpr);
  canvas.height = Math.round(BASE_H * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  draw();
}
window.addEventListener('resize', resizeCanvas);

// State
const circles = []; // {x, y, r, color}
let mode = 'idle'; // 'idle' | 'placingCenter' | 'settingRadius'
let tempCenter = null; // {x,y} while creating
let drag = null; // { type: 'center'|'radius', index }
let intersections = []; // {x,y,c1,c2}
let selectedIntersectionIndex = -1;
let animation = null; // {A,B,C, start, duration}

const palette = ['#1565c0','#2e7d32','#ef6c00'];

function setInfo(text) {
  info.textContent = text;
}

// Highlighted triangle type announcement
function announceTriangleType(type){
  const clsMap = { 'Eşkenar':'type-eskenar', 'İkizkenar':'type-ikizkenar', 'Çeşitkenar':'type-cesitkenar' };
  const iconMap = { 'Eşkenar':'⭐', 'İkizkenar':'🔶', 'Çeşitkenar':'🔷' };
  const cls = clsMap[type] || 'type-cesitkenar';
  const icon = iconMap[type] || '🔺';
  info.innerHTML = `<span class="triangle-type ${cls}">${icon} Üçgen türü: <strong>${type}</strong></span>`;
  info.classList.remove('info-pop');
  // retrigger animation
  void info.offsetWidth;
  info.classList.add('info-pop');
}

function dist(ax, ay, bx, by) {
  const dx = ax - bx, dy = ay - by;
  return Math.hypot(dx, dy);
}

function drawGrid() {
  const step = GRID_STEP;
  ctx.save();
  ctx.strokeStyle = '#e8e8ee';
  ctx.lineWidth = 1;
  for (let x=0; x<=BASE_W; x+=step) {
    ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,BASE_H); ctx.stroke();
  }
  for (let y=0; y<=BASE_H; y+=step) {
    ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(BASE_W,y); ctx.stroke();
  }
  ctx.restore();
}

function drawCircle(c) {
  ctx.save();
  ctx.strokeStyle = c.color; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, Math.PI*2); ctx.stroke();
  // center
  ctx.fillStyle = c.color;
  ctx.beginPath(); ctx.arc(c.x, c.y, 4, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}

function computeIntersections() {
  intersections = [];
  for (let i=0;i<circles.length;i++) {
    for (let j=i+1;j<circles.length;j++) {
      const a = circles[i], b = circles[j];
      const d = dist(a.x,a.y,b.x,b.y);
      if (d === 0) continue; // concentric
      if (d > a.r + b.r + 1e-6) continue; // separate
      if (d < Math.abs(a.r - b.r) - 1e-6) continue; // contained
      // circle-circle intersection
      const x0=a.x, y0=a.y, r0=a.r; const x1=b.x, y1=b.y, r1=b.r;
      const a2 = (r0*r0 - r1*r1 + d*d) / (2*d);
      const h2 = Math.max(r0*r0 - a2*a2, 0);
      const h = Math.sqrt(h2);
      const xm = x0 + a2*(x1-x0)/d;
      const ym = y0 + a2*(y1-y0)/d;
      const rx = -(y1-y0) * (h/d);
      const ry =  (x1-x0) * (h/d);
      const p1 = {x: xm + rx, y: ym + ry, c1:i, c2:j};
      const p2 = {x: xm - rx, y: ym - ry, c1:i, c2:j};
      intersections.push(p1);
      // If the two points are distinct add the second
      if (dist(p1.x,p1.y,p2.x,p2.y) > 1e-4) intersections.push(p2);
    }
  }
}

function drawIntersections() {
  intersections.forEach((p, idx) => {
    ctx.save();
    ctx.fillStyle = idx === selectedIntersectionIndex ? '#d32f2f' : '#212121';
    ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, Math.PI*2); ctx.fill();
    ctx.restore();
  });
}

function drawTempCreating(mouseX, mouseY) {
  if (mode !== 'settingRadius' || !tempCenter) return;
  const r = dist(tempCenter.x, tempCenter.y, mouseX, mouseY);
  ctx.save();
  ctx.setLineDash([6,6]);
  ctx.strokeStyle = '#9c27b0';
  ctx.beginPath(); ctx.arc(tempCenter.x, tempCenter.y, r, 0, Math.PI*2); ctx.stroke();
  ctx.restore();
}

function triangleType(A,B,C){
  const ab = dist(A.x,A.y,B.x,B.y);
  const bc = dist(B.x,B.y,C.x,C.y);
  const ca = dist(C.x,C.y,A.x,A.y);
  const eps = 1e-2;
  const eq = (x,y)=>Math.abs(x-y)<eps;
  if (eq(ab,bc) && eq(bc,ca)) return 'Eşkenar';
  if (eq(ab,bc) || eq(bc,ca) || eq(ca,ab)) return 'İkizkenar';
  return 'Çeşitkenar';
}

function drawTriangleAnimated(){
  if (!animation) return;
  const {A,B,C,start,duration} = animation;
  const t = Math.min((performance.now()-start)/duration, 1);

  // path segments lengths
  const L1 = dist(A.x,A.y,B.x,B.y);
  const L2 = L1 + dist(B.x,B.y,C.x,C.y);
  const L3 = L2 + dist(C.x,C.y,A.x,A.y);
  const total = L3;
  let drawTo = t*total;

  ctx.save();
  ctx.lineWidth = 3; ctx.strokeStyle = '#37474f';
  ctx.beginPath();
  ctx.moveTo(A.x,A.y);
  // Segment AB
  if (drawTo <= L1) {
    const u = drawTo / L1;
    ctx.lineTo(A.x + (B.x-A.x)*u, A.y + (B.y-A.y)*u);
  } else {
    ctx.lineTo(B.x,B.y);
    drawTo -= L1;
    // Segment BC
    if (drawTo <= dist(B.x,B.y,C.x,C.y)) {
      const L = dist(B.x,B.y,C.x,C.y);
      const u = drawTo / L;
      ctx.lineTo(B.x + (C.x-B.x)*u, B.y + (C.y-B.y)*u);
    } else {
      ctx.lineTo(C.x,C.y);
      drawTo -= dist(B.x,B.y,C.x,C.y);
      // Segment CA
      const L = dist(C.x,C.y,A.x,A.y);
      const u = Math.min(drawTo / L, 1);
      ctx.lineTo(C.x + (A.x-C.x)*u, C.y + (A.y-C.y)*u);
    }
  }
  ctx.stroke();
  ctx.restore();

  if (t >= 1 && !animation.done) {
    animation.done = true;
    const type = triangleType(A,B,C);
    announceTriangleType(type);
  }
}

function clearCanvas(){
  ctx.save();
  ctx.setTransform(1,0,0,1,0,0);
  ctx.clearRect(0,0,canvas.width, canvas.height);
  ctx.restore();
}

function draw(mouseX, mouseY) {
  clearCanvas();
  drawGrid();
  circles.forEach(drawCircle);
  computeIntersections();
  drawIntersections();
  drawTempCreating(mouseX ?? -1, mouseY ?? -1);
  drawTriangleAnimated();
}

function hitTestCircleCenter(x,y) {
  for (let i=circles.length-1;i>=0;i--) {
    if (dist(x,y,circles[i].x,circles[i].y) < 10) return i;
  }
  return -1;
}
function hitTestCircleEdge(x,y) {
  for (let i=circles.length-1;i>=0;i--) {
    const d = Math.abs(dist(x,y,circles[i].x,circles[i].y) - circles[i].r);
    if (d < 8) return i;
  }
  return -1;
}
function hitTestIntersection(x,y){
  for (let i=0;i<intersections.length;i++){
    if (dist(x,y,intersections[i].x,intersections[i].y) < 10) return i;
  }
  return -1;
}

function hitTestCircleFill(x,y){
  for (let i=circles.length-1;i>=0;i--){
    if (dist(x,y,circles[i].x,circles[i].y) < circles[i].r - 8) return i;
  }
  return -1;
}

// Interaction helpers
function getCanvasPos(clientX, clientY) {
  const r = canvas.getBoundingClientRect();
  const scaleX = r.width / BASE_W;
  const scaleY = r.height / BASE_H;
  return {x: (clientX - r.left) / scaleX, y: (clientY - r.top) / scaleY};
}

function snapToGrid(x, y){
  const sx = Math.round(x / GRID_STEP) * GRID_STEP;
  const sy = Math.round(y / GRID_STEP) * GRID_STEP;
  return {x: sx, y: sy};
}

function onPointerDown(e){
  const {x,y} = getCanvasPos(e.clientX, e.clientY);
  if (mode === 'placingCenter') {
    // Tek tıkla kare cinsinden yarıçapla oluştur
    const p = snapToGrid(x,y);
    let units = parseFloat(radiusInput && radiusInput.value);
    if (!isFinite(units)) units = 6; // varsayılan 6 kare
    const rVal = Math.max(1, units) * GRID_STEP;
    const color = palette[circles.length % palette.length];
    circles.push({x: p.x, y: p.y, r: Math.max(5, rVal), color});
    mode = 'idle'; tempCenter = null; selectedIntersectionIndex = -1; animation = null;
    draw();
    setInfo('Kesişim noktalarına tıklayarak seçim yapın. Çemberleri içinden sürükleyerek taşıyın, kenarından sürükleyerek yarıçapı değiştirin. Yarıçap girişinin birimi: kare.');
    return;
  }
  // Selection of intersection
  const hitI = hitTestIntersection(x,y);
  if (hitI !== -1) { selectedIntersectionIndex = hitI; draw(); return; }

  // Drag center or radius
  const hitR = hitTestCircleEdge(x,y);
  if (hitR !== -1) { drag = {type:'radius', index: hitR}; return; }
  const hitF = hitTestCircleFill(x,y);
  if (hitF !== -1) { drag = {type:'center', index: hitF}; return; }
  const hitC = hitTestCircleCenter(x,y);
  if (hitC !== -1) { drag = {type:'center', index: hitC}; return; }
}

function onPointerMove(e){
  const {x,y} = getCanvasPos(e.clientX, e.clientY);
  if (mode === 'settingRadius' && tempCenter) {
    draw(x,y);
    return;
  }
  if (drag) {
    const c = circles[drag.index];
    if (drag.type === 'center') {
      const p = snapToGrid(x,y);
      c.x = p.x; c.y = p.y;
    } else if (drag.type === 'radius') {
      c.r = Math.max(5, dist(x,y,c.x,c.y));
    }
    draw();
  }
}

function onPointerUp(e){
  drag = null;
}

// Buttons
addCircleBtn.addEventListener('click', () => {
  if (circles.length >= 2) { alert('En fazla 2 çember oluşturabilirsiniz.'); return; }
  mode = 'placingCenter'; tempCenter = null; selectedIntersectionIndex = -1; animation = null;
  setInfo('Merkezi yerleştirmek için tuvale tıklayın. Yarıçap kutusundaki değer kare cinsindendir.');
});

resetBtn.addEventListener('click', () => {
  circles.splice(0, circles.length);
  intersections = []; selectedIntersectionIndex = -1; tempCenter = null; mode = 'idle'; animation = null;
  setInfo('İpuçları: "Çember Ekle" ile merkeze tıklayın; yarıçapı kare sayısı olarak girin. Çemberleri içinden sürükleyerek taşıyın, kenarından sürükleyerek yarıçap değiştirin.');
  draw();
});

makeTriangleBtn.addEventListener('click', () => {
  computeIntersections();
  if (intersections.length === 0) { alert('Önce kesişen en az iki çember oluşturun.'); return; }
  if (selectedIntersectionIndex < 0) selectedIntersectionIndex = 0;
  const P = intersections[selectedIntersectionIndex];
  const c1 = circles[P.c1], c2 = circles[P.c2];
  if (!c1 || !c2) return;
  const A = {x: c1.x, y: c1.y};
  const B = {x: c2.x, y: c2.y};
  const C = {x: P.x, y: P.y};
  animation = {A,B,C,start: performance.now(), duration: 1200, done:false};
  setInfo('Üçgen çiziliyor...');
  draw();
});

// Pointer events (mouse/touch unified)
if (window.PointerEvent) {
  canvas.style.touchAction = 'none';
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointercancel', onPointerUp);
} else {
  // mouse
  canvas.addEventListener('mousedown', (e)=>onPointerDown(e));
  window.addEventListener('mousemove', (e)=>onPointerMove(e));
  window.addEventListener('mouseup', (e)=>onPointerUp(e));
  // touch
  canvas.addEventListener('touchstart', (e)=>{ const t=e.touches[0]; onPointerDown({clientX:t.clientX, clientY:t.clientY}); e.preventDefault(); }, {passive:false});
  canvas.addEventListener('touchmove', (e)=>{ const t=e.touches[0]; onPointerMove({clientX:t.clientX, clientY:t.clientY}); e.preventDefault(); }, {passive:false});
  canvas.addEventListener('touchend', (e)=>{ const t=e.changedTouches[0]||{}; onPointerUp({clientX:t.clientX, clientY:t.clientY}); e.preventDefault(); }, {passive:false});
}

function loop(){
  // redraw continuously to animate triangle
  draw();
  requestAnimationFrame(loop);
}

// initial
resizeCanvas();
setInfo('İpuçları: "Çember Ekle" ile merkeze tıklayın; yarıçapı kare sayısı olarak girin. En fazla 2 çember. Kesişim noktalarına tıklayıp seçim yapın.');
loop();
