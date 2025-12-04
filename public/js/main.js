// public/js/main.js
document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('overlay');
  const grid = document.getElementById('grid');

  if (!grid || !overlay) return;

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
            <img class="main" src="${imagem}" alt="${nome}">
            ${ forma ? `<img class="main" src="${forma}" alt="${nome} - forma">` : '' }
          </div>
          <div>
            <h2>${nome}</h2>
            <div class="meta"><strong>Visível:</strong> ${epoca}</div>
            <p>${historia}</p>
            <hr style="border-color: rgba(255,255,255,0.04)">
            <p style="color:#b8cbe6"><strong>Observação:</strong> clique fora do painel ou no × para fechar.</p>
          </div>
        </div>
      </div>
    `;

    overlay.classList.add('open');

    requestAnimationFrame(() => {
      const panel = overlay.querySelector('.detail-panel');
      if (!panel) return;
      panel.classList.add('show');

      const btn = panel.querySelector('.btn-close-3d');
      if (btn) btn.addEventListener('click', closeDetail);
    });
  }

  function closeDetail() {
    const panel = overlay.querySelector('.detail-panel');
    if (panel) panel.classList.remove('show');
    setTimeout(() => {
      overlay.classList.remove('open');
      overlay.innerHTML = '';
    }, 300);
  }
});
