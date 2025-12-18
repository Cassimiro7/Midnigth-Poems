// src/routes/index.js
const express = require('express');
const router = express.Router();

const lista = [
  {
    _id: 'orion',
    nome: 'Órion',
    imagem: '/assets/Orion/stars.png',
    background: '/assets/Orion/background.png',
    formaImg: '/assets/Orion/lines.png',
    comentario: 'Cinturão bem visível no inverno.',
    historia: 'Órion era um poderoso caçador da mitologia grega...',
    epocaVisivel: 'Dezembro a Março (Brasil)'
  },

  {
    _id: 'ursa-maior',
    nome: 'Ursa Maior',
    imagem: '/assets/Ursa Maior/stars.png',
    background: '/assets/Ursa Maior/background.png',
    formaImg: '/assets/Ursa Maior/lines.png',
    comentario: 'Lar do famoso asterismo "Grande Carro".',
    historia: 'Associada a várias lendas, incluindo Calisto, transformada em urso.',
    epocaVisivel: 'Ano inteiro (melhor no outono).'
  },

  {
    _id: 'ursa-menor',
    nome: 'Ursa Menor',
    imagem: '/assets/Ursa Menor/stars.png',
    background: '/assets/Ursa Menor/background.png',
    formaImg: '/assets/Ursa Menor/lines.png',
    comentario: 'Abriga a estrela Polaris, a Estrela do Norte.',
    historia: 'Na mitologia grega, representa Arcas, filho de Calisto.',
    epocaVisivel: 'Ano inteiro (hemisfério norte).'
  },

  {
    _id: 'cassiopeia',
    nome: 'Cassiopeia',
    imagem: '/assets/Cassiopeia/stars.png',
    background: '/assets/Cassiopeia/background.png',
    formaImg: '/assets/Cassiopeia/lines.png',
    comentario: 'Visível como um “W” brilhante no céu.',
    historia: 'Rainha vaidosa condenada pelos deuses.',
    epocaVisivel: 'Ano inteiro no hemisfério norte.'
  },

  {
    _id: 'touro',
    nome: 'Touro',
    imagem: '/assets/Touro/stars.png',
    background: '/assets/Touro/background.png',
    formaImg: '/assets/Touro/lines.png',
    comentario: 'Lar das Plêiades e das Híades.',
    historia: 'Representa Zeus transformado em touro.',
    epocaVisivel: 'Novembro a Março.'
  },

  {
    _id: 'leao',
    nome: 'Leão',
    imagem: '/assets/Leão/stars.png',
    background: '/assets/Leão/background.png',
    formaImg: '/assets/Leão/lines.png',
    comentario: 'Associado ao Leão de Neméia.',
    historia: 'Primeiro trabalho de Hércules.',
    epocaVisivel: 'Março a Junho.'
  },

  {
    _id: 'peixes',
    nome: 'Peixes',
    imagem: '/assets/Peixes/stars.png',
    background: '/assets/Peixes/background.png',
    formaImg: '/assets/Peixes/lines.png',
    comentario: 'Constelação zodiacal com formato de dois peixes atados.',
    historia: 'Representa Afrodite e Eros fugindo de Tífon.',
    epocaVisivel: 'Setembro a Janeiro.'
  },

  {
    _id: 'pegaso',
    nome: 'Pégaso',
    imagem: '/assets/Pégaso/stars.png',
    background: '/assets/Pégaso/background.png',
    formaImg: '/assets/Pégaso/lines.png',
    comentario: 'Reconhecida pelo “Grande Quadrado de Pégaso”.',
    historia: 'O cavalo alado nascido do sangue da Medusa.',
    epocaVisivel: 'Outubro a Janeiro.'
  },

  {
    _id: 'hydra',
    nome: 'Hidra',
    imagem: '/assets/Hydra/stars.png',
    background: '/assets/Hydra/background.png',
    formaImg: '/assets/Hydra/lines.png',
    comentario: 'A maior constelação do céu.',
    historia: 'Associada à Hidra de Lerna.',
    epocaVisivel: 'Janeiro a Maio.'
  }
];

router.get('/', (req, res) => {
  res.render('index', { lista });
});

module.exports = router;
