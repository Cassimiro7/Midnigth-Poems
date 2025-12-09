// public/js/main.js
document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('overlay');
  const sky = document.getElementById('sky-container');
  const constels = Array.from(document.querySelectorAll('.constellation'));
  const bgBase = document.querySelector('.bg-base');
  const bgCosmo = document.querySelector('.bg-cosmo');
  const bgStars = document.querySelector('.bg-stars');

  if (!sky || constels.length === 0) {
    attachOverlayHandlers();
    return;
  }

  // --- placement + natural distortion ---
  function placeConstellations() {
    const placedRects = [];
    const sw = sky.clientWidth;
    const sh = sky.clientHeight;

    constels.forEach((btn) => {
      const maxTries = 40;
      let tries = 0;
      let x=0,y=0,w=0,h=0,ok=false;

      // randomized visual params
      const rotate = (Math.random() * 60 - 30).toFixed(2); // -30..30
      const skewX = (Math.random() * 18 - 9).toFixed(2);   // -9..9 (mais variação)
      const skewY = (Math.random() * 8 - 4).toFixed(2);
      const scale = (0.8 + Math.random() * 0.6).toFixed(3); // 0.8..1.4
      const floatDelay = (Math.random() * 6).toFixed(2) + 's';
      // apply base transform first
      btn.style.transform = `rotate(${rotate}deg) skewX(${skewX}deg) skewY(${skewY}deg) scale(${scale})`;
      // slight color tint variation
      const hue = Math.floor(Math.random() * 40 - 20);
      btn.style.filter = `hue-rotate(${hue}deg) saturate(${0.94 + Math.random()*0.22})`;

      // set float animation with random duration/delay
      btn.style.animation = `floatSlow ${5 + Math.random()*6}s ease-in-out ${floatDelay} infinite`;

      // measure size after transform
      const bbox = btn.getBoundingClientRect();
      w = bbox.width;
      h = bbox.height;

      while(tries < maxTries && !ok) {
        x = Math.random() * (Math.max(1, sw - w - 20)) + 10;
        y = Math.random() * (Math.max(1, sh - h - 20)) + 10;

        const candidate = { left: x, top: y, right: x + w, bottom: y + h };
        let overlap = placedRects.some(r=>{
          return !(candidate.right < r.left || candidate.left > r.right || candidate.bottom < r.top || candidate.top > r.bottom);
        });

        if (!overlap) ok = true;
        tries++;
      }

      if (!ok) {
        x = Math.random() * Math.max(1, sw - w);
        y = Math.random() * Math.max(1, sh - h);
      }

      btn.style.left = `${Math.round(x)}px`;
      btn.style.top = `${Math.round(y)}px`;

      // Slight per-layer rotation differences so lines don't perfectly overlay stars (natural)
      const stars = btn.querySelector('.layer-stars');
      const lines = btn.querySelector('.layer-lines');
      if (stars) stars.style.transform = `rotate(${(Math.random()*6-3).toFixed(2)}deg)`;
      if (lines) lines.style.transform = `rotate(${(Math.random()*6-3).toFixed(2)}deg)`;

      placedRects.push({ left: x, top: y, right: x + w, bottom: y + h });
    });
  }

  // debounce resize
  let rt;
  function doResize() { clearTimeout(rt); rt = setTimeout(()=>placeConstellations(), 180); }
  window.addEventListener('resize', doResize);
  setTimeout(placeConstellations, 100);

  // --- Parallax: mouse moves background and each constellation's layers --- 
  document.addEventListener('mousemove', (e) => {
    const cx = window.innerWidth/2, cy = window.innerHeight/2;
    const dx = (e.clientX - cx)/cx; // -1..1
    const dy = (e.clientY - cy)/cy;

    // background layers parallax (subtle)
    if (bgBase) bgBase.style.transform = `translate(${dx*6}px, ${dy*4}px) scale(1.01)`;
    if (bgCosmo) bgCosmo.style.transform = `translate(${dx*12}px, ${dy*8}px) scale(1.02) rotate(${dx*1.2}deg)`;
    if (bgStars) bgStars.style.transform = `translate(${dx*18}px, ${dy*12}px) scale(1.03)`;

    // per-constellation micro-parallax (stars + lines move together)
    document.querySelectorAll('.constellation').forEach((btn, i) => {
      const stars = btn.querySelector('.layer-stars');
      const lines = btn.querySelector('.layer-lines');

      // depth factor based on index for slight variation
      const depth = 6 + (i % 5);
      const tx = dx * depth * (0.8 + (i%3)*0.12);
      const ty = dy * depth * (0.8 + (i%4)*0.08);

      // apply transforms but keep any existing rotate/skew by appending translate
      if (stars) stars.style.transform = `${stripTranslate(stars.style.transform)} translate(${tx}px, ${ty}px)`;
      if (lines) lines.style.transform = `${stripTranslate(lines.style.transform)} translate(${tx}px, ${ty}px)`;
    });
  });

  function stripTranslate(transformStr) {
    // remove previous translate(...) from inline transform to avoid stacking translates
    if (!transformStr) return '';
    // naive regex: remove translate(...) occurrences
    return transformStr.replace(/translate\([^)]+\)/g, '').trim();
  }

  // click open detail (delegate)
  sky.addEventListener('click', ev => {
    const btn = ev.target.closest('.constellation');
    if (!btn) return;
    openDetail(btn);
  });

  // keyboard access
  document.querySelectorAll('.constellation').forEach(btn => {
    btn.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openDetail(btn);
      }
    });
  });

  // overlay handlers
  function attachOverlayHandlers() {
    if (!overlay) return;
    overlay.addEventListener('click', (ev) => {
      if (ev.target === overlay) closeDetail();
    });
  }
  attachOverlayHandlers();

  function openDetail(btn) {
    const nome = btn.dataset.nome || '—';
    const imagem = btn.dataset.imagem || '/img/placeholder.png';
    const forma = btn.dataset.forma || '';
    const historia = btn.dataset.historia || 'Sem descrição.';
    const epoca = btn.dataset.epoca || 'Desconhecida';

    overlay.innerHTML = `
      <div class="detail-panel" role="dialog" aria-modal="true">
        <button class="btn-close-3d" title="Fechar" aria-label="Fechar" style="float:right;font-size:28px;border:none;background:transparent;color:#fff;cursor:pointer">&times;</button>
        <div class="detail-grid">
          <div>
            <div style="border-radius:12px; overflow:hidden">
              <img class="main" src="${imagem}" alt="${nome}" style="width:100%;height:auto;display:block">
              ${ forma ? `<img class="main" src="${forma}" alt="${nome} - forma" style="width:100%;height:auto;display:block;margin-top:8px;">` : '' }
            </div>
          </div>
          <div>
            <h2 style="margin-top:0">${nome}</h2>
            <div class="meta"><strong>Visível:</strong> ${epoca}</div>
            <p style="line-height:1.6">${historia}</p>
          </div>
        </div>
      </div>
    `;

    overlay.classList.add('open');
    requestAnimationFrame(() => {
      const panel = overlay.querySelector('.detail-panel');
      if (panel) panel.classList.add('show');
      const btnClose = overlay.querySelector('.btn-close-3d');
      if (btnClose) btnClose.addEventListener('click', closeDetail);
    });
  }

  function closeDetail() {
    const panel = overlay.querySelector('.detail-panel');
    if (panel) panel.classList.remove('show');
    setTimeout(()=>{ overlay.classList.remove('open'); overlay.innerHTML = ''; }, 260);
  }

});
