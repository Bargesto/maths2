(function(){
  function qs(sel, root=document){ return root.querySelector(sel); }
  function qsa(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }

  // Parse numbers from textarea
  function parseNumbers(text){
    const tokens = (text||'')
      .split(/[^-\d]+/u) // split by non-digit (keep minus)
      .map(s=>s.trim())
      .filter(Boolean);
    const nums = tokens
      .map(s=>Number(s))
      .filter(n=>Number.isFinite(n));
    // Only integers for stem-leaf; round if needed
    return nums.map(n=>Math.round(n));
  }

  // Build stem and leaf groups
  function buildGroups(nums, leafUnit){
    const divisor = (leafUnit===10) ? 100 : 10; // stem divisor based on leaf unit
    const groups = new Map();
    for (const n of nums){
      const stem = Math.floor(Math.abs(n) / divisor) * (n<0? -1 : 1); // handle negatives simply
      const leaf = Math.abs(n) % divisor;
      if (!groups.has(stem)) groups.set(stem, []);
      groups.get(stem).push({ leaf, sign: n<0 ? -1 : 1 });
    }
    return { groups, divisor };
  }

  // Render with animations
  function renderStemLeaf(container, statsNode, nums, leafUnit, sortAsc){
    container.innerHTML = '';
    statsNode.textContent = '';
    if (!nums.length){
      return;
    }

    const min = Math.min(...nums);
    const max = Math.max(...nums);
    const count = nums.length;
    statsNode.textContent = `${count} sayı • Min: ${min} • Max: ${max}`;

    const { groups } = buildGroups(nums, leafUnit);
    const stems = Array.from(groups.keys()).sort((a,b)=> a-b);

    // Create rows
    stems.forEach((stem, rowIdx) => {
      const row = document.createElement('div');
      row.className = 'stem-row';

      const stemEl = document.createElement('div');
      stemEl.className = 'stem';
      stemEl.textContent = String(stem);

      const bar = document.createElement('div');
      bar.className = 'bar';
      bar.textContent = '|';

      const leaves = document.createElement('div');
      leaves.className = 'leaves';

      // sort leaves by value and sign (negatives can be marked with "−")
      const arr = groups.get(stem).slice();
      arr.sort((a,b)=> (a.sign*a.leaf) - (b.sign*b.leaf));

      // Append chips with animation
      arr.forEach((item, i) => {
        const chip = document.createElement('span');
        chip.className = 'leaf-chip';
        const text = (leafUnit===10 ? String(item.leaf).padStart(2,'0') : String(item.leaf));
        chip.textContent = (item.sign<0 ? '−' : '') + text;
        leaves.appendChild(chip);
        setTimeout(()=> chip.classList.add('enter'), rowIdx*60 + i*40);
      });

      row.appendChild(stemEl);
      row.appendChild(bar);
      row.appendChild(leaves);
      container.appendChild(row);

      // Row enter animation
      setTimeout(()=> row.classList.add('enter'), rowIdx*50);
    });
  }

  function randomData(leafUnit){
    // Generate a friendly dataset around 2- or 3-digits depending on leaf unit
    const count = Math.floor(Math.random()*11)+15; // 15..25
    const nums = [];
    if (leafUnit===10){
      // 3-digit numbers 100..399 for nice stems
      for (let i=0;i<count;i++) nums.push(Math.floor(Math.random()*300)+100);
    } else {
      // 2-digit numbers 10..99
      for (let i=0;i<count;i++) nums.push(Math.floor(Math.random()*90)+10);
    }
    return nums;
  }

  function init(){
    const dataInput = qs('#dataInput');
    const randomBtn = qs('#randomBtn');
    const drawBtn = qs('#drawBtn');
    const clearBtn = qs('#clearBtn');
    const graph = qs('#stemLeaf');
    const stats = qs('#stats');

    function draw(){
      const leafUnit = 1; // always last digit as leaf
      const nums = parseNumbers(dataInput.value);
      if (!nums.length){
        alert('Lütfen en az bir sayı girin.');
        dataInput.focus();
        return;
      }
      const arr = nums.slice().sort((a,b)=>a-b); // always ascending
      renderStemLeaf(graph, stats, arr, leafUnit, true);
    }

    randomBtn.addEventListener('click', () => {
      const leafUnit = 1;
      const arr = randomData(leafUnit);
      dataInput.value = arr.join(' ');
      graph.innerHTML = '';
      stats.textContent = '';
    });

    drawBtn.addEventListener('click', draw);

    clearBtn.addEventListener('click', () => {
      dataInput.value = '';
      graph.innerHTML = '';
      stats.textContent = '';
    });

    // Settings removed: always leafUnit=1 and ascending sort

    // Prefill a small sample
    dataInput.value = '12 15 21 22 23 34 35 41 42 46 47 49 50 51 55 58';
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
