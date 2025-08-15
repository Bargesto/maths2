document.addEventListener('DOMContentLoaded', function() {
    // Canvas oluştur
    const canvas = new fabric.Canvas('canvas', {
        width: document.querySelector('.canvas-container').offsetWidth,
        height: 800,
        backgroundColor: '#ffffff'
    });

    // Şekil oluşturma fonksiyonları
    const shapeCreators = {
        oval: () => new fabric.Ellipse({
            rx: 60,
            ry: 30,
            fill: '#90caf9',
            originX: 'center',
            originY: 'center'
        }),
        parallelogram: () => {
            const points = [
                { x: -30, y: -20 },
                { x: 40, y: -20 },
                { x: 30, y: 20 },
                { x: -40, y: 20 }
            ];
            return new fabric.Polygon(points, {
                fill: '#ffcc80',
                originX: 'center',
                originY: 'center'
            });
        },
        rectangle: () => new fabric.Rect({
            width: 120,
            height: 60,
            fill: '#a5d6a7',
            originX: 'center',
            originY: 'center'
        }),
        diamond: () => {
            const points = [
                { x: 0, y: -30 },
                { x: 30, y: 0 },
                { x: 0, y: 30 },
                { x: -30, y: 0 }
            ];
            return new fabric.Polygon(points, {
                fill: '#ef9a9a',
                originX: 'center',
                originY: 'center'
            });
        },
        display: () => new fabric.Path('M -40 20 L -40 -10 C -40 -20 -30 -20 -30 -20 L 30 -20 C 30 -20 40 -20 40 -10 L 40 20 z', {
            fill: '#ce93d8',
            originX: 'center',
            originY: 'center'
        }),
        arrow: () => new fabric.Path('M -20 -5 L 15 -5 L 15 -10 L 30 0 L 15 10 L 15 5 L -20 5 z', {
            fill: '#1565C0',
            originX: 'center',
            originY: 'center'
        })
    };

    let selectedShapeType = null;

    // Şekil seçme
    document.querySelectorAll('.shape-item').forEach(item => {
        item.addEventListener('click', function() {
            // Önceki seçili şekli temizle
            document.querySelectorAll('.shape-item').forEach(i => i.classList.remove('selected'));
            
            // Yeni şekli seç
            this.classList.add('selected');
            selectedShapeType = this.dataset.shape;
            
            // İmleci değiştir
            canvas.defaultCursor = 'crosshair';
        });
    });

    // Canvas'a tıklama
    canvas.on('mouse:down', function(options) {
        if (selectedShapeType && !options.target) {
            const pointer = canvas.getPointer(options.e);
            const shape = shapeCreators[selectedShapeType]();
            
            shape.set({
                left: pointer.x,
                top: pointer.y,
                cornerSize: 8,
                transparentCorners: false,
                cornerColor: '#1565C0',
                borderColor: '#1565C0'
            });

            canvas.add(shape);
            canvas.setActiveObject(shape);
            canvas.renderAll();
        }
    });

    // Metin ekleme
    document.getElementById('text-tool').addEventListener('click', function() {
        // Önceki seçili şekli temizle
        document.querySelectorAll('.shape-item').forEach(i => i.classList.remove('selected'));
        selectedShapeType = null;
        
        const text = new fabric.IText('Metin', {
            left: canvas.width / 2,
            top: canvas.height / 2,
            fontSize: 20,
            fill: '#333',
            originX: 'center',
            originY: 'center'
        });
        canvas.add(text);
        canvas.setActiveObject(text);
        canvas.renderAll();
    });

    // Seçili nesneyi silme
    document.getElementById('delete-tool').addEventListener('click', function() {
        const activeObject = canvas.getActiveObject();
        if (activeObject) {
            canvas.remove(activeObject);
            canvas.renderAll();
        }
    });

    // Tümünü temizle
    document.getElementById('clear-all').addEventListener('click', function() {
        if (confirm('Tüm çizimi temizlemek istediğinize emin misiniz?')) {
            canvas.clear();
            canvas.backgroundColor = '#ffffff';
            canvas.renderAll();
        }
    });

    // Yeni algoritma oluştur
    document.getElementById('create-new').addEventListener('click', function() {
        canvas.clear();
        canvas.backgroundColor = '#ffffff';
        canvas.renderAll();
    });

    // Canvas boyutunu pencere boyutuna göre ayarla
    window.addEventListener('resize', function() {
        canvas.setWidth(document.querySelector('.canvas-container').offsetWidth);
        canvas.renderAll();
    });

    // Delete tuşu ile silme
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Delete' && canvas.getActiveObject()) {
            canvas.remove(canvas.getActiveObject());
            canvas.renderAll();
        }
    });

    // Modal işlevleri
    function openImageModal(imgSrc) {
        const modal = document.getElementById('imageModal');
        const modalImg = document.getElementById('modalImage');
        modal.style.display = "block";
        modalImg.src = imgSrc;
    }

    // Modal kapatma
    document.querySelector('.close-modal').addEventListener('click', function() {
        document.getElementById('imageModal').style.display = "none";
    });

    // Modal dışına tıklayınca kapatma
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('imageModal');
        if (event.target == modal) {
            modal.style.display = "none";
        }
    });
});
