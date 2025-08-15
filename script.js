// toggleSection kaldırıldı: anasayfa bölümleri artık daraltılabilir değil.
// Lightweight particles for the homepage hero background
(function () {
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function initHeroParticles() {
        if (prefersReducedMotion) return;
        const canvas = document.getElementById('heroParticles');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        let width = 0, height = 0, dpr = 1, particles = [], raf = 0;

        function createParticles() {
            const count = Math.min(80, Math.max(30, Math.floor(width / 20)));
            particles = Array.from({ length: count }, () => ({
                x: Math.random() * width,
                y: Math.random() * height,
                r: Math.random() * 2 + 0.6,
                vx: (Math.random() * 0.6 - 0.3),
                vy: (Math.random() * 0.6 - 0.3),
                alpha: Math.random() * 0.5 + 0.2
            }));
        }

        function resize() {
            dpr = window.devicePixelRatio || 1;
            const rect = canvas.parentElement.getBoundingClientRect();
            width = Math.max(1, Math.floor(rect.width));
            height = Math.max(1, Math.floor(rect.height));
            canvas.width = Math.floor(width * dpr);
            canvas.height = Math.floor(height * dpr);
            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            createParticles();
        }

        function tick() {
            ctx.clearRect(0, 0, width, height);

            // Draw particles
            ctx.save();
            ctx.fillStyle = 'rgba(255,255,255,0.7)';
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < -5) p.x = width + 5; else if (p.x > width + 5) p.x = -5;
                if (p.y < -5) p.y = height + 5; else if (p.y > height + 5) p.y = -5;

                ctx.beginPath();
                ctx.globalAlpha = p.alpha * 0.8;
                ctx.shadowColor = 'rgba(255,255,255,0.5)';
                ctx.shadowBlur = 6;
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.restore();

            // Subtle connecting lines for a tech feel
            ctx.save();
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.hypot(dx, dy);
                    if (dist < 120) {
                        const a = 0.08 * (1 - dist / 120);
                        ctx.globalAlpha = a;
                        ctx.strokeStyle = 'rgba(255,255,255,0.8)';
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
            ctx.restore();

            raf = requestAnimationFrame(tick);
        }

        resize();
        window.addEventListener('resize', resize);
        raf = requestAnimationFrame(tick);

        return {
            destroy() {
                cancelAnimationFrame(raf);
                window.removeEventListener('resize', resize);
            }
        };
    }

    // Only run on homepage
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            if (document.body.classList.contains('home')) initHeroParticles();
        });
    } else {
        if (document.body.classList.contains('home')) initHeroParticles();
    }
})();

// Typewriter effect for the homepage hero title
(function () {
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function initTypewriter() {
        const el = document.getElementById('typewriter');
        if (!el) return;

        const segments = [
            { text: 'Dinamik ve İnteraktif ', highlight: false, breakAfter: true },
            { text: 'Matematik Uygulamaları', highlight: true },
            { text: ' Platformu', highlight: false },
        ];

        let segIndex = 0;
        let charIndex = 0;
        let deleting = false;
        let typedSegs = segments.map(() => '');

        const typeDelay = 70;
        const deleteDelay = 40;
        const endPause = 30000; // yazı tamamlandıktan sonra 30 sn bekle
        const restartPause = 800;

        function render() {
            let html = '';
            segments.forEach((seg, i) => {
                const txt = typedSegs[i];
                const part = seg.highlight ? `<span class="highlight">${txt}</span>` : txt;
                html += part;
                if (seg.breakAfter) html += '<br class="hero-title-break">';
            });
            el.innerHTML = html;
        }

        function step() {
            if (!deleting) {
                if (charIndex < segments[segIndex].text.length) {
                    typedSegs[segIndex] += segments[segIndex].text.charAt(charIndex++);
                    render();
                    setTimeout(step, typeDelay);
                } else {
                    if (segIndex < segments.length - 1) {
                        segIndex++;
                        charIndex = 0;
                        setTimeout(step, typeDelay);
                    } else {
                        setTimeout(() => {
                            deleting = true;
                            setTimeout(step, deleteDelay);
                        }, endPause);
                    }
                }
            } else {
                if (charIndex > 0) {
                    typedSegs[segIndex] = typedSegs[segIndex].slice(0, -1);
                    charIndex--;
                    render();
                    setTimeout(step, deleteDelay);
                } else {
                    if (segIndex > 0) {
                        segIndex--;
                        charIndex = typedSegs[segIndex].length;
                        setTimeout(step, deleteDelay);
                    } else {
                        // fully deleted, restart
                        deleting = false;
                        segIndex = 0;
                        charIndex = 0;
                        typedSegs = segments.map(() => '');
                        setTimeout(step, restartPause);
                    }
                }
            }
        }

        if (prefersReducedMotion) {
            el.innerHTML = `${segments[0].text}<span class="highlight">${segments[1].text}</span>${segments[2].text}`;
            return;
        }

        render();
        setTimeout(step, 400);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            if (document.body.classList.contains('home')) initTypewriter();
        });
    } else {
        if (document.body.classList.contains('home')) initTypewriter();
    }
})();

// Simple client-side search: filters app buttons and navigates first match on Enter
(function () {
    function initSiteSearch() {
        const form = document.getElementById('siteSearchForm');
        const input = document.getElementById('siteSearchInput');
        if (!form || !input) return;

        const buttons = Array.from(document.querySelectorAll('.app-list .app-button'));
        const results = document.getElementById('siteSearchResults');
        if (!results) return;

        function normalize(str) {
            return str
                .toLowerCase()
                .replace(/[çÇ]/g, 'c')
                .replace(/[ğĞ]/g, 'g')
                .replace(/[ıI]/g, 'i')
                .replace(/[İ]/g, 'i')
                .replace(/[öÖ]/g, 'o')
                .replace(/[şŞ]/g, 's')
                .replace(/[üÜ]/g, 'u');
        }

        let activeIndex = -1;
        let currentMatches = [];

        function buildItems() {
            return buttons.map(b => ({
                el: b,
                label: (b.textContent || '').trim(),
                href: b.href
            }));
        }
        const items = buildItems();

        function clearResults() {
            results.innerHTML = '';
            results.classList.add('hidden');
            activeIndex = -1;
            currentMatches = [];
        }

        function highlight(label, q) {
            const nLabel = normalize(label);
            const idx = nLabel.indexOf(q);
            if (idx === -1 || !q) return label;
            const before = label.slice(0, idx);
            const match = label.slice(idx, idx + q.length);
            const after = label.slice(idx + q.length);
            return `${before}<mark>${match}</mark>${after}`;
        }

        function renderResults(q) {
            results.innerHTML = currentMatches.map((m, i) =>
                `<a class="suggestion-item${i===activeIndex?' active':''}" role="option" href="${m.href}">${highlight(m.label, q)}</a>`
            ).join('');
            results.classList.toggle('hidden', currentMatches.length === 0);
        }

        input.addEventListener('input', () => {
            const q = normalize(input.value.trim());
            if (!q) { clearResults(); return; }
            currentMatches = items.filter(it => normalize(it.label).includes(q)).slice(0, 8);
            activeIndex = -1;
            renderResults(q);
        });

        input.addEventListener('keydown', (e) => {
            if (results.classList.contains('hidden')) return;
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                activeIndex = (activeIndex + 1) % currentMatches.length;
                renderResults(normalize(input.value.trim()));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                activeIndex = (activeIndex - 1 + currentMatches.length) % currentMatches.length;
                renderResults(normalize(input.value.trim()));
            } else if (e.key === 'Enter') {
                if (currentMatches.length) {
                    e.preventDefault();
                    const target = currentMatches[Math.max(0, activeIndex)];
                    if (target && target.href) window.location.href = target.href;
                }
            } else if (e.key === 'Escape') {
                clearResults();
            }
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const q = normalize(input.value.trim());
            if (!q || !currentMatches.length) return;
            const target = currentMatches[0];
            if (target && target.href) window.location.href = target.href;
        });

        // Hide on blur (allow click)
        input.addEventListener('blur', () => {
            setTimeout(clearResults, 150);
        });
    }

    // Expose to global so we can init after dynamic header injection
    if (typeof window !== 'undefined') {
        window.initSiteSearch = initSiteSearch;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSiteSearch);
    } else {
        initSiteSearch();
    }
})();

// Helper to dynamically load shared header into pages
(function(){
    if (typeof window === 'undefined') return;
    window.loadSiteHeader = async function(mountSelector = '#site-header'){
        try {
            const mount = document.querySelector(mountSelector);
            if (!mount) return;
            // Determine correct relative path for header partial
            const isHome = document.body.classList.contains('home');
            const base = isHome ? '' : '../';
            const headerPath = base + 'header.html';
            let html = '';
            try {
                const res = await fetch(headerPath, { cache: 'no-store' });
                if (!res.ok) throw new Error('HTTP ' + res.status);
                html = await res.text();
            } catch (e) {
                // Fallback for file:// or blocked fetch: inline template
                html = `
<header class="topbar">
  <div class="container">
    <div class="logo-link">
      <a href="${base}index.html" class="logo-anchor" aria-label="Ana sayfa">
        <img src="${base}public/logogif.gif" alt="Logo" class="logo">
      </a>
      <div class="brand">
        <span class="app-name">MATHS</span>
        <span class="app-tagline">Dinamik Matematik Uygulamaları</span>
      </div>
    </div>
    ${isHome ? `
    <form id="siteSearchForm" class="site-search" role="search">
      <input type="search" id="siteSearchInput" placeholder="Uygulama ara..." aria-label="Sitede ara" autocomplete="off">
      <div id="siteSearchResults" class="search-suggestions hidden" role="listbox" aria-label="Arama sonuçları"></div>
    </form>
    ` : ''}
    <div class="right-badge" aria-hidden="true">
      <img src="${base}public/maarifmodel.png" alt="Maarif Modeli" />
    </div>
  </div>
</header>`;
            }
            mount.innerHTML = html;

            // Fix relative paths for logo and home link depending on page depth
            const anchor = mount.querySelector('.logo-anchor');
            const img = mount.querySelector('.logo');
            const badge = mount.querySelector('.right-badge img');
            if (anchor) anchor.setAttribute('href', base + 'index.html');
            if (img) img.setAttribute('src', base + 'public/logogif.gif');
            if (badge) badge.setAttribute('src', base + 'public/maarifmodel.png');

            // Subpages: remove search form if present
            if (!isHome) {
                const form = mount.querySelector('#siteSearchForm');
                const results = mount.querySelector('#siteSearchResults');
                if (form) form.remove();
                if (results) results.remove();
            }

            // Initialize search now that header exists
            if (window.initSiteSearch) window.initSiteSearch();
        } catch (e) {
            console.error('Header yüklenemedi:', e);
        }
    }
})();

// Random app tiles population on the homepage
(function(){
    function initRandomTiles(){
        const grid = document.getElementById('randomTiles');
        if (!grid) return;

        // Collect all app links from existing lists (ignore placeholders with href="#")
        const links = Array.from(document.querySelectorAll('.app-list .app-button'))
            .filter(a => {
                const href = a.getAttribute('href') || '';
                return href && href !== '#';
            });

        if (!links.length) return;

        const apps = links.map(a => {
            const titleEl = a.querySelector('.app-title');
            const descEl = a.querySelector('.app-desc');
            const label = (titleEl ? titleEl.textContent : (a.textContent || '')).trim();
            const desc = (descEl ? descEl.textContent : '').trim();
            const href = a.getAttribute('href');
            return { label, desc, href };
        });

        // Shuffle apps (Fisher-Yates)
        for (let i = apps.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [apps[i], apps[j]] = [apps[j], apps[i]];
        }

        // Render alternating purple/yellow tiles
        grid.innerHTML = '';
        // Add a board image tile on the left
        const board = document.createElement('div');
        board.className = 'tile tile--board';
        board.setAttribute('aria-hidden', 'true');
        grid.appendChild(board);

        apps.forEach((app, idx) => {
            const tile = document.createElement('a');
            tile.className = 'tile ' + (idx % 2 === 0 ? 'tile--purple' : 'tile--yellow');
            tile.href = app.href;
            tile.setAttribute('aria-label', app.label + (app.desc ? ' - ' + app.desc : ''));

            const content = document.createElement('div');
            content.className = 'tile-content';

            const titleSpan = document.createElement('span');
            titleSpan.className = 'tile-title';
            titleSpan.textContent = app.label;

            const descSpan = document.createElement('span');
            descSpan.className = 'tile-desc';
            descSpan.textContent = app.desc;

            content.appendChild(titleSpan);
            if (app.desc) content.appendChild(descSpan);
            tile.appendChild(content);
            grid.appendChild(tile);
        });
    }

    if (document.readyState === 'loading'){
        document.addEventListener('DOMContentLoaded', () => {
            if (document.body.classList.contains('home')) initRandomTiles();
        });
    } else {
        if (document.body.classList.contains('home')) initRandomTiles();
    }
})();

// Promo strip: typing/erasing rotator for series names on the homepage
(function(){
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function initPromoRotator(){
        const el = document.getElementById('promoRotate');
        if (!el) return;

        const items = [
            'Süper [A]kademi',
            'Süper [B]aşarı',
            'Süper Tema',
            'Görev Serisi',
            'Defter Serisi',
            'Yaprak Test Serisi'
        ];

        if (prefersReducedMotion) {
            // On reduced motion, show all as inline list
            el.textContent = items.join(' • ');
            return;
        }

        let idx = 0;
        let char = 0;
        let deleting = false;

        const typeDelay = 60;
        const deleteDelay = 35;
        const holdDelay = 1200;   // wait when fully typed
        const betweenDelay = 500; // pause before next word starts

        function step(){
            const word = items[idx];
            if (!deleting){
                if (char < word.length){
                    el.textContent = word.slice(0, ++char);
                    setTimeout(step, typeDelay);
                } else {
                    setTimeout(() => { deleting = true; step(); }, holdDelay);
                }
            } else {
                if (char > 0){
                    el.textContent = word.slice(0, --char);
                    setTimeout(step, deleteDelay);
                } else {
                    deleting = false;
                    idx = (idx + 1) % items.length;
                    setTimeout(step, betweenDelay);
                }
            }
        }

        setTimeout(step, 300);
    }

    if (document.readyState === 'loading'){
        document.addEventListener('DOMContentLoaded', () => {
            if (document.body.classList.contains('home')) initPromoRotator();
        });
    } else {
        if (document.body.classList.contains('home')) initPromoRotator();
    }
})();
