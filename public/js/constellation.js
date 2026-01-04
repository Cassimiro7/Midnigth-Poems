// public/js/constellation.js
console.log('[constellation.js] carregado — mystical detail');

document.addEventListener('DOMContentLoaded', () => {
  const detail = document.getElementById('detail-constel');
  if (!detail) {
    console.warn('[constellation] elemento detail-constel não encontrado');
    return;
  }

  const svg = document.getElementById('constellation-svg');
  const tooltip = document.getElementById('star-tooltip');
  const sideInfo = document.getElementById('star-info');
  const btnReset = document.getElementById('btn-reset');

  // parse data-stars robustly
  let starsMeta = [];
  try {
    const raw = detail.getAttribute('data-stars') || '[]';
    starsMeta = JSON.parse(raw);
  } catch (e) {
    console.error('[constellation] erro ao parsear data-stars', e);
    starsMeta = [];
  }

  console.log('[constellation] estrelas recebidas:', starsMeta);

  if (!Array.isArray(starsMeta) || starsMeta.length === 0) {
    console.warn('[constellation] nenhuma estrela para renderizar');
    return;
  }

  // create hotspot wrap (inside the detail bounds)
  const hotspotWrap = document.createElement('div');
  hotspotWrap.className = 'hotspot-wrap';
  hotspotWrap.style.position = 'absolute';
  hotspotWrap.style.inset = '18% 7% 18% 7%';
  hotspotWrap.style.pointerEvents = 'none';
  detail.appendChild(hotspotWrap);

  // helper to map percentage coords to pixel in the hotspotWrap coordinate system
  function getPixelFromPercent(xPct, yPct) {
    const rect = detail.getBoundingClientRect();
    // hotspot-wrap inset: 18% top/bottom, 7% left/right relative to detail
    const leftPad = rect.width * 0.07;
    const topPad = rect.height * 0.18;
    const innerW = rect.width - leftPad * 2;
    const innerH = rect.height - topPad * 2;
    const x = rect.left + leftPad + (xPct / 100) * innerW;
    const y = rect.top + topPad + (yPct / 100) * innerH;
    return { x, y, innerW, innerH, rectLeft: rect.left, rectTop: rect.top };
  }

  // draw animated lines and sparks in SVG
  function drawConstellation() {
    if (!svg) return;
    // clear
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    // set viewBox to 0 0 width height to match element size
    const rect = detail.getBoundingClientRect();
    const width = Math.max(200, rect.width);
    const height = Math.max(200, rect.height);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.style.width = '100%';
    svg.style.height = '100%';

    // defs: gradient for stroke
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const grad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    grad.setAttribute('id', 'gline');
    grad.setAttribute('x1', '0%'); grad.setAttribute('y1', '0%'); grad.setAttribute('x2', '100%'); grad.setAttribute('y2', '0%');

    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%'); stop1.setAttribute('stop-color', '#9dbdff'); stop1.setAttribute('stop-opacity', '0.96');
    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '100%'); stop2.setAttribute('stop-color', '#c9a7ff'); stop2.setAttribute('stop-opacity', '0.86');

    grad.appendChild(stop1); grad.appendChild(stop2);
    defs.appendChild(grad);
    svg.appendChild(defs);

    // build path connecting stars in given order
    let d = '';
    const pointsPx = [];
    for (let i = 0; i < starsMeta.length; i++) {
      const s = starsMeta[i];
      const p = getPixelFromPercent(s.x, s.y);
      // convert to local svg coords (relative to svg's left/top)
      const localX = p.x - rect.left;
      const localY = p.y - rect.top;
      pointsPx.push({ x: localX, y: localY, data: s });
      if (i === 0) d += `M ${localX.toFixed(1)} ${localY.toFixed(1)}`;
      else d += ` L ${localX.toFixed(1)} ${localY.toFixed(1)}`;
    }

    // path
    if (pointsPx.length > 1) {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d);
      path.classList.add('line', 'shimmer');
      path.setAttribute('stroke', 'url(#gline)');
      path.setAttribute('stroke-width', '2.2');
      path.setAttribute('fill', 'none');
      svg.appendChild(path);

      // gentle glow by duplicating path with low opacity thicker
      const glow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      glow.setAttribute('d', d);
      glow.setAttribute('stroke', 'url(#gline)');
      glow.setAttribute('stroke-width', '6');
      glow.setAttribute('opacity', '0.12');
      glow.setAttribute('fill', 'none');
      svg.appendChild(glow);
    }

    // sparks (small circles) at each star
    pointsPx.forEach((pt, idx) => {
      const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      c.setAttribute('cx', pt.x);
      c.setAttribute('cy', pt.y);
      c.setAttribute('r', '2.8');
      c.setAttribute('class', 'spark');
      c.setAttribute('fill', '#fff');
      c.setAttribute('opacity', '0.95');
      svg.appendChild(c);

      // small outer glow
      const cg = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      cg.setAttribute('cx', pt.x);
      cg.setAttribute('cy', pt.y);
      cg.setAttribute('r', '6.4');
      cg.setAttribute('fill', 'none');
      cg.setAttribute('stroke', '#a8c6ff');
      cg.setAttribute('stroke-opacity', '0.12');
      cg.setAttribute('stroke-width', '2');
      svg.appendChild(cg);
    });
  }

  // create hotspots and wire tooltip/pin behavior
  function mountHotspots() {
    starsMeta.forEach((s) => {
      if (typeof s.x !== 'number' || typeof s.y !== 'number' || !s.name) return;

      const btn = document.createElement('button');
      btn.className = 'star-hotspot';
      btn.type = 'button';
      // percent positioning relative to hotspot-wrap
      btn.style.left = `${s.x}%`;
      btn.style.top = `${s.y}%`;
      btn.setAttribute('aria-label', s.name);
      btn.setAttribute('data-star-name', s.name);

      const halo = document.createElement('span');
      halo.className = 'hot-halo';
      halo.setAttribute('aria-hidden', 'true');

      const dot = document.createElement('span');
      dot.className = 'hot-dot';
      dot.setAttribute('aria-hidden', 'true');

      btn.appendChild(halo);
      btn.appendChild(dot);
      hotspotWrap.appendChild(btn);

      const show = (ev) => {
        if (!tooltip) return;
        tooltip.textContent = s.name;
        tooltip.classList.add('visible');
        tooltip.setAttribute('aria-hidden', 'false');

        // position tooltip above the button center
        const r = btn.getBoundingClientRect();
        const centerX = r.left + r.width / 2;
        const centerY = r.top + r.height / 2;
        positionTooltip(centerX, r.top);
      };

      const move = (ev) => {
        if (!tooltip) return;
        const r = btn.getBoundingClientRect();
        positionTooltip(r.left + r.width / 2, r.top);
      };

      const hide = () => {
        if (!tooltip) return;
        tooltip.classList.remove('visible');
        tooltip.setAttribute('aria-hidden', 'true');
      };

      btn.addEventListener('mouseenter', show);
      btn.addEventListener('mousemove', move);
      btn.addEventListener('mouseleave', hide);
      btn.addEventListener('focus', show);
      btn.addEventListener('blur', hide);

      btn.addEventListener('click', (ev) => {
        ev.preventDefault();
        pinStar(s);
      });

      btn.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          pinStar(s);
        }
      });
    });
  }

  // position tooltip with overflow prevention
  function positionTooltip(cx, topY) {
    if (!tooltip) return;
    const tw = tooltip.offsetWidth || 140;
    const th = tooltip.offsetHeight || 34;
    const margin = 8;
    let left = Math.round(cx - tw / 2);
    let top = Math.round(topY - th - 12);
    if (left < margin) left = margin;
    if (left + tw > window.innerWidth - margin) left = window.innerWidth - tw - margin;
    if (top < margin) top = topY + 20;
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }

  // pin star to side panel
  function pinStar(star) {
    if (!sideInfo) return;
    sideInfo.innerHTML = '';

    const card = document.createElement('div');
    card.className = 'pin-card';

    const badge = document.createElement('div');
    badge.className = 'pin-badge';
    const initials = star.name.split(' ').slice(0,2).map(n => n[0]).join('').toUpperCase();
    badge.textContent = initials || star.name.substring(0,2).toUpperCase();

    const info = document.createElement('div');
    info.className = 'pin-info';

    const nameEl = document.createElement('div');
    nameEl.className = 'name';
    nameEl.textContent = star.name;

    const metaEl = document.createElement('div');
    metaEl.className = 'meta';
    metaEl.textContent = `Posição: ${star.x.toFixed(0)}% × ${star.y.toFixed(0)}%`;

    const descEl = document.createElement('div');
    descEl.className = 'desc';
    descEl.style.marginTop = '6px';
    descEl.style.color = 'rgba(200,215,245,0.92)';
    descEl.style.fontSize = '14px';
    descEl.textContent = star.desc || `Informações sobre ${star.name}.`;

    info.appendChild(nameEl);
    info.appendChild(metaEl);
    info.appendChild(descEl);

    card.appendChild(badge);
    card.appendChild(info);

    sideInfo.appendChild(card);
    sideInfo.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // reset pinned
  if (btnReset) {
    btnReset.addEventListener('click', (e) => {
      e.preventDefault();
      if (sideInfo) sideInfo.innerHTML = '<div class="pin-empty">Clique em uma estrela para ver detalhes</div>';
    });
  }

  // initial render
  drawConstellation();
  mountHotspots();

  // redraw on resize / orientation change (and reposition tooltip)
  let resizeTimeout = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      // clear hotspots and svg then redraw
      while (hotspotWrap.firstChild) hotspotWrap.removeChild(hotspotWrap.firstChild);
      drawConstellation();
      mountHotspots();
      if (tooltip) tooltip.classList.remove('visible');
    }, 140);
  });

  // small tilt/parallax for visual depth
  let raf = null;
  detail.addEventListener('mousemove', (e) => {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const rect = detail.getBoundingClientRect();
      const px = (e.clientX - rect.left) / Math.max(1, rect.width) - 0.5;
      const py = (e.clientY - rect.top) / Math.max(1, rect.height) - 0.5;
      const rx = py * 6;
      const ry = px * -6;
      const tx = px * 8;
      const ty = py * 8;
      const tilt = detail.querySelector('.detail-tilt');
      const par = detail.querySelector('.detail-parallax');
      if (tilt) tilt.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
      if (par) par.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
    });
  });

  detail.addEventListener('mouseleave', () => {
    const tilt = detail.querySelector('.detail-tilt');
    const par = detail.querySelector('.detail-parallax');
    if (tilt) tilt.style.transform = '';
    if (par) par.style.transform = '';
    if (tooltip) tooltip.classList.remove('visible');
  });

  // hide tooltip on scroll to avoid mismatch
  document.addEventListener('scroll', () => {
    if (tooltip) tooltip.classList.remove('visible');
  }, { passive: true });
});
