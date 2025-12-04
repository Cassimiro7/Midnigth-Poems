// src/routes/index.js
const express = require('express');
const router = express.Router();

/**
 * Exemplo de lista de constelações.
 * Perceba que os caminhos aqui apontam para /assets/<Nome>/...
 * que mapeamos no server.js para a sua pasta src/Assets.
 *
 * Ajuste os nomes de arquivo se for diferente (background.png, stars.png, lines.png).
 */

const lista = [
  {
    _id: 'orion',
    nome: 'Órion',
    imagem: '/assets/Orion/stars.png',        // camada de estrelas (PNG transparente)
    background: '/assets/Orion/background.png', // fundo artístico
    formaImg: '/assets/Orion/lines.png',       // opcional: linhas/forma
    comentario: 'Cinturão bem visível no inverno.',
    historia: 'Órion era um caçador na mitologia grega...',
    epocaVisivel: 'Dezembro a Março (Brasil)'
  },
  {
    _id: 'Ursa maior',
    nome: 'Ursa maior',
    imagem: '/assets/Ursa maior/stars.png',
    background: '/assets/Ursa maior/background.png',
    formaImg: '/assets/Escorpiao/lines.png',
    comentario: 'Fácil de identificar por sua cauda curva.',
    historia: 'Escorpião representa o animal que feriu Órion...',
    epocaVisivel: 'Junho a Agosto (Brasil)'
  }
  // adicione mais objetos seguindo o mesmo padrão
];

router.get('/', (req, res) => {
  res.render('index', { lista });
});

module.exports = router;
