document.addEventListener('DOMContentLoaded', function() {
    // Değişkenler
    let dataSet = [];
    let barChart = null;
    let scatterChart = null;

    // Renkler dizisi
    const colors = [
        '#87CEEB', // Açık Mavi
        '#FFFF99', // Açık Sarı
        '#98FB98', // Açık Yeşil
        '#FFB6C1', // Açık Pembe
        '#DDA0DD', // Açık Mor
        '#F0E68C', // Khaki
        '#E6E6FA', // Lavender
        '#FFA07A'  // Açık Somon
    ];

    // DOM Elementleri
    const dataNameInput = document.getElementById('dataName');
    const dataValueInput = document.getElementById('dataValue');
    const addDataBtn = document.getElementById('addData');
    const clearDataBtn = document.getElementById('clearData');
    const saveImageBtn = document.getElementById('saveImage');
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const dataList = document.getElementById('dataList');

    // Tab değiştirme fonksiyonu
    function switchTab(tabId) {
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabPanes.forEach(pane => pane.classList.remove('active'));
        
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
        document.getElementById(tabId).classList.add('active');
        
        if (tabId === 'bar') {
            updateBarChart();
        } else if (tabId === 'scatter') {
            updateScatterChart();
        }
    }

    // Veri ekleme fonksiyonu
    function addData() {
        const name = dataNameInput.value.trim();
        const value = parseInt(dataValueInput.value);

        if (!name || isNaN(value) || value <= 0) {
            alert('Lütfen geçerli bir veri adı ve pozitif bir değer girin!');
            return;
        }

        // Veriyi ekle
        dataSet.push({ name, value });

        // Veri listesini güncelle
        updateDataList();

        // Grafikleri güncelle
        updateBarChart();
        updateScatterChart();

        // Input alanlarını temizle
        dataNameInput.value = '';
        dataValueInput.value = '';
    }

    // Veri listesini güncelleme
    function updateDataList() {
        dataList.innerHTML = '';
        dataSet.forEach((data, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                ${data.name}: ${data.value}
                <button onclick="deleteData(${index})" class="delete-btn">Sil</button>
            `;
            dataList.appendChild(li);
        });
    }

    // Sütun grafiği güncelleme fonksiyonu
    function updateBarChart() {
        const ctx = document.getElementById('barChart').getContext('2d');
        
        if (barChart) {
            barChart.destroy();
        }

        barChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: dataSet.map(data => data.name),
                datasets: [{
                    label: 'Değer',
                    data: dataSet.map(data => data.value),
                    backgroundColor: dataSet.map((_, index) => colors[index % colors.length]),
                    borderColor: dataSet.map((_, index) => colors[index % colors.length]),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    // Nokta grafiği güncelleme fonksiyonu
    function updateScatterChart() {
        const ctx = document.getElementById('scatterChart').getContext('2d');
        
        if (scatterChart) {
            scatterChart.destroy();
        }

        // Her veri için noktaları oluştur
        let allPoints = [];
        dataSet.forEach((data, dataIndex) => {
            for (let i = 0; i < data.value; i++) {
                allPoints.push({
                    x: dataIndex + 1,
                    y: i + 1,
                    name: data.name,
                    value: data.value,
                    color: colors[dataIndex % colors.length]
                });
            }
        });

        scatterChart = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    data: allPoints,
                    backgroundColor: allPoints.map(point => point.color),
                    pointRadius: 8,
                    pointHoverRadius: 10
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        min: 0.5,
                        max: dataSet.length + 0.5,
                        ticks: {
                            stepSize: 1,
                            callback: function(value) {
                                return dataSet[value - 1]?.name || '';
                            }
                        },
                        grid: {
                            display: false
                        },
                        title: {
                            display: true,
                            text: ' ',  // Boşluk bırakarak altta yer aç
                            padding: {
                                top: 10,
                                bottom: 30  // Altta daha fazla boşluk bırak
                            }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        max: Math.max(...dataSet.map(d => d.value)) + 0.5,
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const point = context.raw;
                                return `${point.name}: ${point.value}`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Veri silme fonksiyonu
    window.deleteData = function(index) {
        dataSet.splice(index, 1);
        updateDataList();
        updateBarChart();
        updateScatterChart();
    };

    // Tüm verileri temizleme
    function clearAllData() {
        if (confirm('Tüm verileri silmek istediğinizden emin misiniz?')) {
            dataSet = [];
            updateDataList();
            updateBarChart();
            updateScatterChart();
        }
    }

    // Görüntüyü kaydetme fonksiyonu
    function saveAsImage() {
        const activeTab = document.querySelector('.tab-pane.active');
        
        html2canvas(activeTab).then(canvas => {
            const link = document.createElement('a');
            link.download = 'veri-gorsellestirme.png';
            link.href = canvas.toDataURL();
            link.click();
        });
    }

    // Event Listeners
    addDataBtn.addEventListener('click', addData);
    clearDataBtn.addEventListener('click', clearAllData);
    saveImageBtn.addEventListener('click', saveAsImage);
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            switchTab(button.dataset.tab);
        });
    });

    // Enter tuşu ile veri ekleme
    dataValueInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addData();
        }
    });

    // Sayfa yüklendiğinde varsayılan tabı göster
    switchTab('bar');
});
