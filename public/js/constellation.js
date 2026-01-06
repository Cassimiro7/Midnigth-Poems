// public/js/constellation.js
console.log('[constellation.js] carregado — stars + lines overlay');

document.addEventListener('DOMContentLoaded', () => {
  const detail = document.getElementById('detail-constel');
  if (!detail) {
    console.warn('[constellation] detail-constel não encontrado');
    return;
  }

  const svg = document.getElementById('constellation-svg');
  const tooltip = document.getElementById('star-tooltip');
  const sideInfo = document.getElementById('star-info');
  const btnReset = document.getElementById('btn-reset');
  const hotspotWrap = detail.querySelector('.hotspot-wrap') || document.createElement('div');

  // ensure hotspotWrap exists inside detail
  if (!detail.contains(hotspotWrap)) {
    hotspotWrap.className = 'hotspot-wrap';
    hotspotWrap.style.position = 'absolute';
    hotspotWrap.style.inset = '18% 7% 18% 7%';
    hotspotWrap.style.pointerEvents = 'none';
    detail.appendChild(hotspotWrap);
  }

  // parse stars metadata
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

  // helper: convert normalized coords (0..100) to pixel coordinates relative to the detail element
  function getPixelFromPercent(xPct, yPct) {
    const rect = detail.getBoundingClientRect();
    const leftPad = rect.width * 0.07;
    const topPad = rect.height * 0.18;
    const innerW = rect.width - leftPad * 2;
    const innerH = rect.height - topPad * 2;
    const x = rect.left + leftPad + (xPct / 100) * innerW;
    const y = rect.top + topPad + (yPct / 100) * innerH;
    return { x, y, innerW, innerH, rectLeft: rect.left, rectTop: rect.top };
  }

  // draw only sparks (circles) at star positions (no connecting lines)
  function drawConstellation() {
    if (!svg) return;
    // clear previous SVG content
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    const rect = detail.getBoundingClientRect();
    const width = Math.max(200, rect.width);
    const height = Math.max(200, rect.height);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.style.width = '100%';
    svg.style.height = '100%';

    // compute points in local svg coords
    const pointsPx = [];
    for (let i = 0; i < starsMeta.length; i++) {
      const s = starsMeta[i];
      const p = getPixelFromPercent(s.x, s.y);
      const localX = p.x - rect.left;
      const localY = p.y - rect.top;
      pointsPx.push({ x: localX, y: localY, data: s });
    }

    // create circles and glows
    pointsPx.forEach((pt) => {
      const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      c.setAttribute('cx', pt.x);
      c.setAttribute('cy', pt.y);
      c.setAttribute('r', '2.8');
      c.setAttribute('class', 'spark');
      c.setAttribute('fill', '#ffffff');
      c.setAttribute('opacity', '0.98');
      svg.appendChild(c);

      const glow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      glow.setAttribute('cx', pt.x);
      glow.setAttribute('cy', pt.y);
      glow.setAttribute('r', '6.4');
      glow.setAttribute('class', 'glow');
      glow.setAttribute('fill', 'none');
      glow.setAttribute('stroke', '#a8c6ff');
      glow.setAttribute('stroke-opacity', '0.12');
      glow.setAttribute('stroke-width', '2');
      svg.appendChild(glow);
    });
  }

  // mount hotspots (buttons) using percent positions inside hotspot-wrap
  function mountHotspots() {
    while (hotspotWrap.firstChild) hotspotWrap.removeChild(hotspotWrap.firstChild);

    starsMeta.forEach((s) => {
      if (typeof s.x !== 'number' || typeof s.y !== 'number' || !s.name) return;

      const btn = document.createElement('button');
      btn.className = 'star-hotspot';
      btn.type = 'button';
      btn.style.left = `${s.x}%`;
      btn.style.top = `${s.y}%`;
      btn.style.transform = 'translate(-50%,-50%)';
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

      // handlers
      const show = () => {
        if (!tooltip) return;
        tooltip.textContent = s.name;
        tooltip.classList.add('visible');
        tooltip.setAttribute('aria-hidden', 'false');
        const r = btn.getBoundingClientRect();
        positionTooltip(r.left + r.width / 2, r.top);
      };
      const move = () => {
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

  // tooltip position helper
  function positionTooltip(cx, topY) {
    if (!tooltip) return;
    const tw = tooltip.offsetWidth || 140;
    const th = tooltip.offsetHeight || 36;
    const margin = 8;
    let left = Math.round(cx - tw / 2);
    let top = Math.round(topY - th - 12);
    if (left < margin) left = margin;
    if (left + tw > window.innerWidth - margin) left = window.innerWidth - tw - margin;
    if (top < margin) top = topY + 20;
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }

  // pin star info into side panel
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
    metaEl.textContent = `Posição aproximada: ${star.x.toFixed(0)}% × ${star.y.toFixed(0)}%`;

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

  // parallax effect: move parallax wrapper and move detail-lines slightly differently
  

  let raf = null;
  detail.addEventListener('mousemove', (e) => {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const rect = detail.getBoundingClientRect();
      const px = (e.clientX - rect.left) / Math.max(1, rect.width) - 0.5;
      const py = (e.clientY - rect.top) / Math.max(1, rect.height) - 0.5;

      const rx = py * 5;
      const ry = px * -5;
      const tx = px * 10;
      const ty = py * 10;
      const tilt = detail.querySelector('.detail-tilt');

      if (tilt) tilt.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
      if (parallaxEl) parallaxEl.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;

      // lines move slightly in opposite direction for depth
      if (detailLines) {
        const lx = px * -6;
        const ly = py * -4;
        detailLines.style.transform = `translate3d(${lx}px, ${ly}px, 0) scale(1.001)`;
      }
    });
  });

  detail.addEventListener('mouseleave', () => {
    const tilt = detail.querySelector('.detail-tilt');
    if (tilt) tilt.style.transform = '';
    if (parallaxEl) parallaxEl.style.transform = '';
    if (detailLines) detailLines.style.transform = '';
    if (tooltip) tooltip.classList.remove('visible');
  });

  // initial render
  drawConstellation();
  mountHotspots();

  // redraw on resize
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      drawConstellation();
      mountHotspots();
      if (tooltip) tooltip.classList.remove('visible');
    }, 140);
  }, { passive: true });

  // hide tooltip on scroll
  document.addEventListener('scroll', () => {
    if (tooltip) tooltip.classList.remove('visible');
  }, { passive: true });
});
