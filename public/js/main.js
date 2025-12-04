// public/js/main.js
document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('overlay');
  const grid = document.getElementById('grid');

  if (!grid || !overlay) return;

  // tilt / parallax on mouse for cards
  document.addEventListener('mousemove', (e) => {
    const cx = innerWidth/2, cy = innerHeight/2;
    const dx = (e.clientX - cx)/cx;
    const dy = (e.clientY - cy)/cy;
    document.querySelectorAll('.card-media .layer-bg').forEach(el=>{
      el.style.transform = `translate(${dx*6}px, ${dy*4}px) scale(${1 + Math.abs(dx+dy)/150})`;
    });
    document.querySelectorAll('.card-media .layer-stars').forEach(el=>{
      el.style.transform = `translate(${dx*10}px, ${dy*6}px) scale(${1 + Math.abs(dx+dy)/400})`;
    });
  });

  grid.addEventListener('click', (ev) => {
    const card = ev.target.closest('.card');
    if (!card) return;
    openDetail(card);
  });

  overlay.addEventListener('click', (ev) => {
    if (ev.target === overlay) closeDetail();
  });

  function openDetail(card) {
    const nome = card.dataset.nome || '—';
    const imagem = card.dataset.imagem || '/img/placeholder.png';
    const forma = card.dataset.forma || '';
    const historia = card.dataset.historia || 'Sem descrição.';
    const epoca = card.dataset.epoca || 'Desconhecida';

    overlay.innerHTML = `
      <div class="detail-panel" role="dialog" aria-modal="true">
        <button class="btn-close-3d" title="Fechar" aria-label="Fechar">&times;</button>
        <div class="detail-grid">
          <div>
            <div style="border-radius:12px; overflow:hidden">
              <img class="main" src="${imagem}" alt="${nome}">
              ${ forma ? `<img class="main" src="${forma}" alt="${nome} - forma">` : '' }
            </div>
          </div>
          <div>
            <h2>${nome}</h2>
            <div class="meta"><strong>Visível:</strong> ${epoca}</div>
            <p style="line-height:1.6">${historia}</p>
          </div>
        </div>
      </div>
    `;

    overlay.classList.add('open');
    requestAnimationFrame(()=>{
      const panel = overlay.querySelector('.detail-panel');
      if (panel) panel.classList.add('show');
      const btn = panel.querySelector('.btn-close-3d');
      if (btn) btn.addEventListener('click', closeDetail);
    });
  }

  function closeDetail() {
    const panel = overlay.querySelector('.detail-panel');
    if (panel) panel.classList.remove('show');
    setTimeout(()=>{ overlay.classList.remove('open'); overlay.innerHTML = ''; }, 280);
  }
});
