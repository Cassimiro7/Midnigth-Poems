// public/js/main.js
document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('overlay');
  const sky = document.getElementById('sky-container');
  const constels = Array.from(document.querySelectorAll('.constellation'));
  const header = document.querySelector('.hero');
  const bgBase = document.querySelector('.bg-base');
  const bgCosmo = document.querySelector('.bg-cosmo');
  const bgStars = document.querySelector('.bg-stars');

  if (!sky || constels.length === 0) {
    attachOverlayHandlers();
    return;
  }

  function adjustSkyHeight() {
    const headerBottom = header ? header.getBoundingClientRect().bottom : 120;
    const newHeight = Math.max(240, window.innerHeight - headerBottom - 24);
    sky.style.height = `${newHeight}px`;
  }
  adjustSkyHeight();

  function rectsOverlap(a, b, pad = 12) {
    return !(a.right + pad < b.left || a.left - pad > b.right || a.bottom + pad < b.top || a.top - pad > b.bottom);
  }

  function findFreePosition(sw, sh, w, h, placedRects, bandTop = 0, bandBottom = null, pad = 12, maxRandomTries = 140) {
    bandBottom = bandBottom === null ? (sh - h) : bandBottom;
    for (let i = 0; i < maxRandomTries; i++) {
      const x = Math.random() * Math.max(1, sw - w - 24) + 12;
      const y = bandTop + Math.random() * Math.max(1, (bandBottom - bandTop));
      const cand = { left: x, top: y, right: x + w, bottom: y + h };
      if (!placedRects.some(r => rectsOverlap(cand, r, pad))) return { x, y };
    }

    const startX = Math.min(Math.max(12, Math.floor(sw/2 - w/2)), sw - w - 12);
    const startY = Math.min(Math.max(bandTop + 12, Math.floor((bandTop + bandBottom)/2 - h/2)), bandBottom);
    const maxRadius = Math.max(sw, sh);
    const step = Math.max(12, Math.floor(Math.min(w, h) / 3));
    for (let r = step; r < maxRadius; r += step) {
      const samples = Math.min(32, Math.ceil(r / step) * 8);
      for (let s = 0; s < samples; s++) {
        const ang = (s / samples) * Math.PI * 2;
        const x = Math.round(startX + Math.cos(ang) * r);
        const y = Math.round(startY + Math.sin(ang) * r);
        if (x < 12 || x > sw - w - 12 || y < bandTop || y > bandBottom) continue;
        const cand = { left: x, top: y, right: x + w, bottom: y + h };
        if (!placedRects.some(r2 => rectsOverlap(cand, r2, pad))) return { x, y };
      }
    }

    const cell = Math.max(40, Math.floor(Math.min(w, h) / 2));
    for (let gy = 12; gy < sh - h - 12; gy += cell) {
      for (let gx = 12; gx < sw - w - 12; gx += cell) {
        const cand = { left: gx, top: gy, right: gx + w, bottom: gy + h };
        if (!placedRects.some(r => rectsOverlap(cand, r, pad))) return { x: gx, y: gy };
      }
    }

    return { x: Math.random() * Math.max(1, sw - w - 24) + 12, y: Math.random() * Math.max(1, sh - h - 24) + 12 };
  }

  function placeConstellations() {
    const placedRects = [];
    const sw = sky.clientWidth;
    const sh = sky.clientHeight;
    const pad = Math.max(8, Math.round(Math.min(sw, sh) * 0.03));

    const bands = 3;
    const perBand = Math.ceil(constels.length / bands);
    let idx = 0;

    constels.forEach((btn) => {
      // Reset parent transform for accurate bbox
      btn.style.transform = '';

      // Base bbox for placement
      const baseW = btn.offsetWidth || Math.round(Math.min(220, sw * 0.18));
      const baseH = btn.offsetHeight || baseW;

      // Determine band
      const bandIndex = Math.min(bands - 1, Math.floor(idx / perBand));
      const bandHeight = Math.max(0, (sh - baseH));
      const bandTop = (bandIndex / bands) * bandHeight;
      const bandBottom = ((bandIndex + 1) / bands) * bandHeight;

      // Find free position
      const pos = findFreePosition(sw, sh, baseW, baseH, placedRects, bandTop, bandBottom, pad);

      btn.style.left = `${Math.round(pos.x)}px`;
      btn.style.top = `${Math.round(pos.y)}px`;

      // z-index depth
      const zBase = 200;
      btn.style.zIndex = String(zBase + Math.round((pos.y / Math.max(1, sh)) * 400));

      // Apply rotation/scale/skew to rotator (persistent)
      const rotator = btn.querySelector('.constel-rotator');
      const floatWrapper = btn.querySelector('.constel-float');
      const parallax = btn.querySelector('.constel-parallax');

      if (rotator) {
        const rotate = (Math.random() * 360 - 180).toFixed(2); // -180..180
        const skewX = (Math.random() * 12 - 6).toFixed(2);
        const skewY = (Math.random() * 6 - 3).toFixed(2);
        const scale = (0.85 + Math.random() * 0.45).toFixed(3);
        rotator.style.transform = `rotate(${rotate}deg) skewX(${skewX}deg) skewY(${skewY}deg) scale(${scale})`;
        rotator.dataset._angle = rotate;
      }

      // Set float animation delay/duration without overriding transform of rotator/parallax
      if (floatWrapper) {
        const dur = (4 + Math.random() * 3.5).toFixed(2) + 's';
        const delay = (Math.random() * 5).toFixed(2) + 's';
        floatWrapper.style.animationDuration = dur;
        floatWrapper.style.animationDelay = delay;
      }

      // Reset parallax transforms
      if (parallax) parallax.style.transform = '';

      // Save placed rect
      placedRects.push({ left: pos.x, top: pos.y, right: pos.x + baseW, bottom: pos.y + baseH });
      idx++;
    });
  }

  let resizeTimeout;
  window.addEventListener('resize', () => {
    adjustSkyHeight();
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(placeConstellations, 220);
  });

  setTimeout(() => {
    adjustSkyHeight();
    placeConstellations();
  }, 120);

  // Parallax: move background and parallax wrapper for each constellation
  let raf = null;
  document.addEventListener('mousemove', (e) => {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const cx = window.innerWidth/2, cy = window.innerHeight/2;
      const dx = (e.clientX - cx)/cx;
      const dy = (e.clientY - cy)/cy;

      if (bgBase) bgBase.style.transform = `translate(${dx*6}px, ${dy*4}px) scale(1.01)`;
      if (bgCosmo) bgCosmo.style.transform = `translate(${dx*12}px, ${dy*8}px) scale(1.02) rotate(${dx*1.2}deg)`;
      if (bgStars) bgStars.style.transform = `translate(${dx*18}px, ${dy*12}px) scale(1.03)`;

      document.querySelectorAll('.constellation').forEach((btn, i) => {
        const parallax = btn.querySelector('.constel-parallax');
        // depth variation
        const depth = 6 + (i % 6);
        const tx = Math.round(dx * depth * (0.9 + (i%3)*0.08));
        const ty = Math.round(dy * depth * (0.9 + (i%4)*0.06));
        if (parallax) parallax.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      });
    });
  });

  // click to open detail
  sky.addEventListener('click', ev => {
    const btn = ev.target.closest('.constellation');
    if (!btn) return;
    openDetail(btn);
  });

  document.querySelectorAll('.constellation').forEach(btn => {
    btn.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openDetail(btn);
      }
    });
  });

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
            <div class="detail-constellation">
             <img class="detail-stars" src="${imagem}" alt="${nome}">
              ${forma ? `<img class="detail-lines" src="${forma}" alt="">` : ''}
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

}); // DOMContentLoaded end
