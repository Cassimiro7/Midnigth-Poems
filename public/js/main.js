// public/js/main.js
// Mantém posicionamento e parallax do "céu" + adiciona detalhe com hotspots nas estrelas (modal behavior left intact but will not intercept link navigation)

document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('overlay');
  const sky = document.getElementById('sky-container');
  const constels = Array.from(document.querySelectorAll('.constellation'));
  const header = document.querySelector('.hero');
  const bgBase = document.querySelector('.bg-base');
  const bgCosmo = document.querySelector('.bg-cosmo');
  const bgStars = document.querySelector('.bg-stars');

  // --- MAPA DE COORDENADAS DAS CONSTELAÇÕES (used by modal variant; not required for page links) ---
  // (kept for backward compatibility if you use non-link constellations later)
  const starCoords = {
    'orion': [
      {x:44, y:28, name: 'Betelgeuse'},
      {x:50, y:44, name: 'Bellatrix'},
      {x:48, y:56, name: 'Alnilam (Cinturão)'},
      {x:44, y:60, name: 'Alnitak (Cinturão)'},
      {x:52, y:60, name: 'Mintaka (Cinturão)'},
      {x:50, y:72, name: 'Rigel'},
      {x:38, y:72, name: 'Saiph'}
    ],
    // ... (others omitted here to keep file concise; index.js provides authoritative stars for detail page)
  };

  // Tooltip element (one global)
  let tooltip = document.querySelector('.star-tooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.className = 'star-tooltip';
    document.body.appendChild(tooltip);
  }

  // fallback: if no sky or constellations, attach overlay handlers and exit
  if (!sky || constels.length === 0) {
    attachOverlayHandlers();
    return;
  }

  // --- helper functions for placement (kept from previous implementation) ---
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

  // click to open detail BUT do not intercept <a href="/constellation/..."> links
  sky.addEventListener('click', ev => {
    const btn = ev.target.closest('.constellation');
    if (!btn) return;

    // If the constellation element is an anchor with href, allow the browser to navigate.
    if (btn.tagName && btn.tagName.toLowerCase() === 'a' && btn.getAttribute('href')) {
      // Let the navigation proceed; do not call openDetail
      return;
    }

    // Otherwise, fallback to opening modal detail (for non-link UI)
    if (typeof openDetail === 'function') openDetail(btn);
  });

  document.querySelectorAll('.constellation').forEach(btn => {
    btn.addEventListener('keydown', e => {
      // For anchors, default Enter/Space should trigger navigation — don't override.
      if (btn.tagName && btn.tagName.toLowerCase() === 'a' && btn.getAttribute('href')) return;

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (typeof openDetail === 'function') openDetail(btn);
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

  // ---------- DETAIL PANEL & HOTSPOTS (kept for modal fallback) ----------

  // helper: convert normalized coords (0..100) to CSS left/top inside hotspot-wrap
  function coordToCssPercent(coord) {
    return { left: `${coord.x}%`, top: `${coord.y}%` };
  }

  // create hotspot buttons markup (used if modal path is used)
  function buildHotspotsHtml(constelId) {
    const coords = starCoords[constelId];
    if (!coords || coords.length === 0) return '<div class="hotspot-wrap" aria-hidden="true"></div>';

    // hotspots are positioned relative to hotspot-wrap using percentage coordinates
    let html = '<div class="hotspot-wrap" aria-hidden="false">';
    coords.forEach((s, i) => {
      // left/top will be applied inline for precision
      html += `<button class="star-hotspot" data-star-name="${escapeHtml(s.name)}" aria-label="${escapeHtml(s.name)}" style="left:${s.x}%;top:${s.y}%"><span class="hot-dot" aria-hidden="true"></span></button>`;
    });
    html += '</div>';
    return html;
  }

  // escape helper for names
  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  // Tracks event listeners to remove them later
  let detailListeners = [];

  // openDetail / closeDetail kept (modal fallback) - not used when link navigation is in place
  function openDetail(btn) {
    // For safety if called, preserve previous implementation but keep simple
    const nome = btn.dataset.nome || '—';
    const imagem = btn.dataset.imagem || '/img/placeholder.png';
    const forma = btn.dataset.forma || '';
    const historia = btn.dataset.historia || 'Sem descrição.';
    const epoca = btn.dataset.epoca || 'Desconhecida';
    const id = btn.dataset.id || (btn.dataset.nome || '').toLowerCase().replace(/\s+/g,'-');

    const hotspotsHtml = buildHotspotsHtml(id);

    overlay.innerHTML = `
      <div class="detail-panel" role="dialog" aria-modal="true">
        <button class="btn-close-3d" title="Fechar" aria-label="Fechar" style="position:absolute;right:20px;top:18px;font-size:22px;border:none;background:transparent;color:#fff;cursor:pointer">&times;</button>

        <div class="detail-constellation" aria-hidden="false">
          <div class="detail-stage" data-constel="${escapeHtml(id)}">
            <div class="detail-tilt">
              <div class="detail-float">
                <div class="detail-parallax">
                  <img class="detail-stars" src="${escapeHtml(imagem)}" alt="${escapeHtml(nome)} - estrelas">
                  ${forma ? `<img class="detail-lines" src="${escapeHtml(forma)}" alt="${escapeHtml(nome)} - linhas">` : ''}
                </div>
                ${hotspotsHtml}
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 style="margin-top:0">${nome}</h2>
          <div class="meta"><strong>Visível:</strong> ${epoca}</div>
          <p style="line-height:1.6">${historia}</p>

          <div class="subhead">Mais sobre ${nome}</div>
          <p style="margin-top:8px;line-height:1.5;color:rgba(220,225,255,0.86)">Informações adicionais, curiosidades, estrelas principais e dicas de observação. Passe o mouse sobre as estrelas à esquerda para ver nomes; use tab para acessibilidade.</p>
          <p style="margin-top:10px"><a href="#" class="back-link" id="back-to-sky">← Voltar ao céu</a></p>
        </div>
      </div>
    `;

    overlay.classList.add('open');
    requestAnimationFrame(() => {
      const panel = overlay.querySelector('.detail-panel');
      if (panel) panel.classList.add('show');

      // close button
      const btnClose = overlay.querySelector('.btn-close-3d');
      if (btnClose) btnClose.addEventListener('click', closeDetail);

      // back link
      const back = overlay.querySelector('#back-to-sky');
      if (back) {
        back.addEventListener('click', (ev) => { ev.preventDefault(); closeDetail(); });
      }

      // attach hotspot handlers
      attachHotspotHandlers();

      // attach tilt/parallax on the large constellation image (mouse move)
      attachDetailParallax();
    });
  }

  function closeDetail() {
    // remove listeners attached specifically to the detail panel
    if (detailListeners && detailListeners.length) {
      detailListeners.forEach(({el, ev, fn}) => {
        try { el.removeEventListener(ev, fn); } catch(e){}
      });
      detailListeners = [];
    }

    const panel = overlay.querySelector('.detail-panel');
    if (panel) panel.classList.remove('show');
    setTimeout(()=>{ overlay.classList.remove('open'); overlay.innerHTML = ''; }, 260);
    hideTooltip();
  }

  // Attach handlers to hotspots (tooltip show/hide, keyboard accessibility)
  function attachHotspotHandlers() {
    const hotspots = overlay.querySelectorAll('.star-hotspot');
    hotspots.forEach(h => {
      // mouse enter
      const onEnter = (ev) => {
        const name = h.dataset.starName || h.getAttribute('aria-label') || '—';
        showTooltip(name, ev.clientX, ev.clientY);
      };
      const onMove = (ev) => {
        positionTooltip(ev.clientX, ev.clientY);
      };
      const onLeave = () => hideTooltip();

      h.addEventListener('mouseenter', onEnter);
      h.addEventListener('mousemove', onMove);
      h.addEventListener('mouseleave', onLeave);

      // focus/blur for keyboard
      const onFocus = (ev) => {
        const name = h.dataset.starName || h.getAttribute('aria-label') || '—';
        const r = h.getBoundingClientRect();
        const cx = r.left + r.width/2;
        const cy = r.top + r.height/2;
        showTooltip(name, cx, cy);
      };
      const onBlur = () => hideTooltip();

      h.addEventListener('focus', onFocus);
      h.addEventListener('blur', onBlur);

      // store listeners to remove later
      detailListeners.push({ el: h, ev: 'mouseenter', fn: onEnter });
      detailListeners.push({ el: h, ev: 'mousemove', fn: onMove });
      detailListeners.push({ el: h, ev: 'mouseleave', fn: onLeave });
      detailListeners.push({ el: h, ev: 'focus', fn: onFocus });
      detailListeners.push({ el: h, ev: 'blur', fn: onBlur });
    });
  }

  // tooltip helpers
  function showTooltip(text, clientX, clientY) {
    tooltip.textContent = text;
    tooltip.style.opacity = '1';
    positionTooltip(clientX, clientY);
  }
  function positionTooltip(clientX, clientY) {
    if (!tooltip) return;
    const offset = 14;
    const tw = tooltip.offsetWidth || 120;
    const th = tooltip.offsetHeight || 28;
    let left = clientX + offset;
    let top = clientY + offset;
    // keep inside viewport
    if (left + tw > window.innerWidth - 8) left = clientX - offset - tw;
    if (top + th > window.innerHeight - 8) top = clientY - offset - th;
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }
  function hideTooltip() {
    if (!tooltip) return;
    tooltip.style.opacity = '0';
  }

  // attach tilt/parallax to the large constellation image area
  function attachDetailParallax() {
    const stage = overlay.querySelector('.detail-stage');
    if (!stage) return;

    const parallaxEl = stage.querySelector('.detail-parallax');
    const imgStars = stage.querySelector('.detail-stars');
    const imgLines = stage.querySelector('.detail-lines');

    let lastMouse = {x:0,y:0};
    const onMove = (ev) => {
      const r = stage.getBoundingClientRect();
      const cx = r.left + r.width/2;
      const cy = r.top + r.height/2;
      const dx = (ev.clientX - cx) / Math.max(1, r.width/2);
      const dy = (ev.clientY - cy) / Math.max(1, r.height/2);

      // tilt effect (rotateX / rotateY small)
      const rotX = Math.max(-6, Math.min(6, dy * -6));
      const rotY = Math.max(-6, Math.min(6, dx * 6));
      stage.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;

      // parallax translate for image layers
      const depth = 12;
      if (parallaxEl) parallaxEl.style.transform = `translate3d(${dx * depth}px, ${dy * depth}px, 0)`;
      if (imgStars) imgStars.style.transform = `translate3d(${dx * depth * 0.5}px, ${dy * depth * 0.5}px, 0)`;
      if (imgLines) imgLines.style.transform = `translate3d(${dx * depth * 0.8}px, ${dy * depth * 0.8}px, 0)`;

      lastMouse = {x: ev.clientX, y: ev.clientY};
    };

    const onLeave = () => {
      // reset transforms smoothly
      stage.style.transform = '';
      if (parallaxEl) parallaxEl.style.transform = '';
      if (imgStars) imgStars.style.transform = '';
      if (imgLines) imgLines.style.transform = '';
    };

    stage.addEventListener('mousemove', onMove);
    stage.addEventListener('mouseleave', onLeave);

    detailListeners.push({ el: stage, ev: 'mousemove', fn: onMove });
    detailListeners.push({ el: stage, ev: 'mouseleave', fn: onLeave });
  }

});
