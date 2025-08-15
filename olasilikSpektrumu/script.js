document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.event-button');
    const marker = document.querySelector('.marker');
    const description = document.querySelector('.event-description');
    const spectrum = document.querySelector('.spectrum');
    
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            // Aktif butonu güncelle
            buttons.forEach(b => b.classList.remove('active'));
            button.classList.add('active');
            
            // Olasılık değerini al
            const probability = parseFloat(button.dataset.probability);
            
            // İşaretçiyi hareket ettir
            // Spektrumun iç genişliğini al (margin hariç)
            const spectrumWidth = spectrum.clientWidth;
            
            // Olasılığa göre pozisyonu hesapla
            let position;
            if (probability === 0) {
                position = 0; // Tam 0'ın üstünde
            } else if (probability === 1) {
                position = spectrumWidth; // Tam 1'in üstünde
            } else {
                position = probability * spectrumWidth;
            }
            
            marker.style.left = `${position}px`;
            
            // Açıklamayı güncelle
            description.textContent = `${button.textContent} olasılığı: ${formatProbability(probability)}`;
        });
    });
});

function formatProbability(probability) {
    if (probability === 0) return 'İmkansız (0)';
    if (probability === 1) return 'Kesin (1)';
    
    // Diğer olasılıkları kesir olarak göster
    const fractions = {
        0.5: '1/2',
        0.25: '1/4',
        0.75: '3/4',
        0.167: '1/6',
        0.2: '1/5',
        0.333: '1/3',
        0.667: '2/3',
        0.8: '4/5'
    };
    
    return fractions[probability] || probability.toFixed(3);
}
