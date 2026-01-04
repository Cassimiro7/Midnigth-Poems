// src/routes/index.js
const express = require('express');
const router = express.Router();

let db;
try {
  // tenta carregar o DB (src/db.js). Se não existir / der erro, seguimos com lista em memória.
  db = require('../db');
} catch (e) {
  db = null;
  console.warn('Aviso: módulo src/db.js não foi carregado. Usando lista em memória como fallback.');
}

/**
 * MAPA DEFINITIVO DE ESTRELAS POR CONSTELAÇÃO
 * (fonte única para hotspots; encaixado na rota de detalhe)
 */
const STARS_BY_CONSTELLATION = {
  'orion': [
    { x: 44, y: 28, name: 'Betelgeuse' },
    { x: 50, y: 44, name: 'Bellatrix' },
    { x: 48, y: 56, name: 'Alnilam (Cinturão)' },
    { x: 44, y: 60, name: 'Alnitak (Cinturão)' },
    { x: 52, y: 60, name: 'Mintaka (Cinturão)' },
    { x: 50, y: 72, name: 'Rigel' },
    { x: 38, y: 72, name: 'Saiph' }
  ],
  'ursa-maior': [
    { x: 73, y: 80, name: 'Dubhe' },
    { x: 55, y: 85, name: 'Merak' },
    { x: 64, y: 76, name: 'Alioth' },
    { x: 64, y: 85, name: 'Phecda' },
    { x: 55, y: 92, name: 'Megrez' }
  ],
  'ursa-menor': [
    { x: 72, y: 52, name: 'Polaris' },
    { x: 66, y: 64, name: 'Kochab' },
    { x: 76, y: 68, name: 'Pherkad' }
  ],
  'cassiopeia': [
    { x: 48, y: 48, name: 'Schedar' },
    { x: 55, y: 42, name: 'Caph' },
    { x: 62, y: 48, name: 'Ruchbah' }
  ],
  'touro': [
    { x: 48, y: 54, name: 'Aldebaran' },
    { x: 56, y: 40, name: 'Alcyone (Plêiades)' },
    { x: 58, y: 36, name: 'Atlas (Plêiades)' }
  ],
  'leao': [
    { x: 54, y: 62, name: 'Regulus' },
    { x: 46, y: 50, name: 'Denebola' }
  ],
  'peixes': [
    { x: 52, y: 52, name: 'Alrescha' }
  ],
  'pegaso': [
    { x: 42, y: 50, name: 'Markab' },
    { x: 50, y: 48, name: 'Scheat' }
  ],
  'hydra': [
    { x: 38, y: 56, name: 'Alphard' }
  ]
};

/**
 * Lista em memória (fallback). Mantive sua estrutura original com campo `stars`.
 * Caso o banco esteja disponível, as rotas irão preferir os dados do DB.
 */
const listaFallback = [
  {
    _id: 'orion',
    nome: 'Órion',
    imagem: '/assets/Orion/stars.png',
    background: '/assets/Orion/background.png',
    formaImg: '/assets/Orion/lines.png',
    comentario: 'Cinturão bem visível no inverno.',
    historia: 'Órion era um poderoso caçador da mitologia grega. Em várias versões, sua arrogância irritou os deuses; em outras, era amigo dos deuses. Muitas lendas explicam as estrelas de Órion como marcas de seu cinturão, espada e pés, e sua posição no céu está associada a diversas histórias envolvendo Artemis, Gaia e o Escorpião. Astronomicamente, Órion contém Betelgeuse, Rigel e o famoso Cinturão (Alnitak, Alnilam, Mintaka), além da Nebulosa de Órion (M42).',
    epocaVisivel: 'Dezembro a Março (Brasil)',
    stars: [
      { x: 44, y: 28, name: 'Betelgeuse' },
      { x: 50, y: 44, name: 'Bellatrix' },
      { x: 48, y: 56, name: 'Alnilam (Cinturão)' },
      { x: 44, y: 60, name: 'Alnitak (Cinturão)' },
      { x: 52, y: 60, name: 'Mintaka (Cinturão)' },
      { x: 50, y: 72, name: 'Rigel' },
      { x: 38, y: 72, name: 'Saiph' }
    ]
  },
  {
    _id: 'ursa-maior',
    nome: 'Ursa Maior',
    imagem: '/assets/Ursa Maior/stars.png',
    background: '/assets/Ursa Maior/background.png',
    formaImg: '/assets/Ursa Maior/lines.png',
    comentario: 'Lar do famoso asterismo "Grande Carro".',
    historia: 'Ursa Maior é conhecida pelo asterismo do Grande Carro e por funções de navegação (aponta para Polaris). Nas mitologias aparece associada a Calisto. Estrelas importantes: Dubhe, Merak, Phecda, Megrez, Alioth, Mizar, Alkaid.',
    epocaVisivel: 'Ano inteiro (melhor no outono).',
    stars: [
      { x: 73, y: 80, name: 'Dubhe' },
      { x: 55, y: 85, name: 'Merak' },
      { x: 64, y: 76, name: 'Alioth' },
      { x: 64, y: 85, name: 'Phecda' },
      { x: 55, y: 92, name: 'Megrez' }
    ]
  },
  {
    _id: 'ursa-menor',
    nome: 'Ursa Menor',
    imagem: '/assets/Ursa Menor/stars.png',
    background: '/assets/Ursa Menor/background.png',
    formaImg: '/assets/Ursa Menor/lines.png',
    comentario: 'Abriga a estrela Polaris, a Estrela do Norte.',
    historia: 'Ursa Menor contém Polaris, ponto de referência para orientação no Hemisfério Norte. Mitologicamente relacionada a Arcas.',
    epocaVisivel: 'Ano inteiro (hemisfério norte).',
    stars: [
      { x: 72, y: 52, name: 'Polaris' },
      { x: 66, y: 64, name: 'Kochab' },
      { x: 76, y: 68, name: 'Pherkad' }
    ]
  },
  {
    _id: 'cassiopeia',
    nome: 'Cassiopeia',
    imagem: '/assets/Cassiopeia/stars.png',
    background: '/assets/Cassiopeia/background.png',
    formaImg: '/assets/Cassiopeia/lines.png',
    comentario: 'Visível como um “W” brilhante no céu.',
    historia: 'Cassiopeia era a rainha vaidosa; sua figura forma um W fácil de localizar no céu boreal. A constelação está associada à lenda de Andrômeda e Perseu.',
    epocaVisivel: 'Ano inteiro no hemisfério norte.',
    stars: [
      { x: 48, y: 48, name: 'Schedar' },
      { x: 55, y: 42, name: 'Caph' },
      { x: 62, y: 48, name: 'Ruchbah' }
    ]
  },
  {
    _id: 'touro',
    nome: 'Touro',
    imagem: '/assets/Touro/stars.png',
    background: '/assets/Touro/background.png',
    formaImg: '/assets/Touro/lines.png',
    comentario: 'Lar das Plêiades e das Híades.',
    historia: 'Touro contém as Plêiades (M45) e as Híades, com a brilhante Aldebaran marcando o olho do touro. Mitologicamente é associado ao touro de Zeus que raptou Europa.',
    epocaVisivel: 'Novembro a Março.',
    stars: [
      { x: 48, y: 54, name: 'Aldebaran' },
      { x: 56, y: 40, name: 'Alcyone (Plêiades)' }
    ]
  },
  {
    _id: 'leao',
    nome: 'Leão',
    imagem: '/assets/Leão/stars.png',
    background: '/assets/Leão/background.png',
    formaImg: '/assets/Leão/lines.png',
    comentario: 'Associado ao Leão de Neméia.',
    historia: 'Leão é reconhecível pelo seu formato e pela estrela Regulus. Lenda ligada ao Leão de Neméia, derrotado por Hércules.',
    epocaVisivel: 'Março a Junho.',
    stars: [
      { x: 54, y: 62, name: 'Regulus' },
      { x: 46, y: 50, name: 'Denebola' }
    ]
  },
  {
    _id: 'peixes',
    nome: 'Peixes',
    imagem: '/assets/Peixes/stars.png',
    background: '/assets/Peixes/background.png',
    formaImg: '/assets/Peixes/lines.png',
    comentario: 'Constelação zodiacal com formato de dois peixes atados.',
    historia: 'Peixes aparece em mitos ligados a Afrodite e Eros transformados em peixes; é uma constelação zodiacal conhecida nas tradições antigas.',
    epocaVisivel: 'Setembro a Janeiro.',
    stars: [
      { x: 52, y: 52, name: 'Alrescha' }
    ]
  },
  {
    _id: 'pegaso',
    nome: 'Pégaso',
    imagem: '/assets/Pegaso/stars.png',
    background: '/assets/Pegaso/background.png',
    formaImg: '/assets/Pegaso/lines.png',
    comentario: 'Reconhecida pelo “Grande Quadrado de Pégaso”.',
    historia: 'Pégaso é o cavalo alado nascido do sangue da Medusa; o Grande Quadrado ajuda a localizar regiões como Andrômeda.',
    epocaVisivel: 'Outubro a Janeiro.',
    stars: [
      { x: 42, y: 50, name: 'Markab' },
      { x: 50, y: 48, name: 'Scheat' }
    ]
  },
  {
    _id: 'hydra',
    nome: 'Hidra',
    imagem: '/assets/Hydra/stars.png',
    background: '/assets/Hydra/background.png',
    formaImg: '/assets/Hydra/lines.png',
    comentario: 'A maior constelação do céu.',
    historia: 'Hidra é a maior constelação por área e se relaciona à Hidra de Lerna na mitologia. Abriga algumas estrelas notáveis como Alphard.',
    epocaVisivel: 'Janeiro a Maio.',
    stars: [
      { x: 38, y: 56, name: 'Alphard' }
    ]
  }
];

// helper: converte uma linha do DB para o formato esperado pelo template
function mapRowToConstel(row) {
  if (!row) return null;
  // row.stars pode ser string JSON ou já um array (dependendo de como foi inserido)
  let stars = [];
  try {
    if (row.stars) {
      if (Array.isArray(row.stars)) stars = row.stars;
      else stars = JSON.parse(row.stars);
    }
  } catch (e) {
    // se parse falhar, fallback para array vazio
    stars = [];
  }

  return {
    _id: row.id || row._id || '',
    nome: row.nome || '',
    imagem: row.imagem || '',
    background: row.background || '',
    formaImg: row.formaImg || '',
    comentario: row.comentario || '',
    historia: row.historia || '',
    epocaVisivel: row.epocaVisivel || '',
    stars: stars
  };
}

router.get('/', (req, res) => {
  // tenta obter lista do DB; se falhar, usa fallback em memória
  if (db) {
    try {
      const rows = db.prepare('SELECT * FROM constelacoes ORDER BY nome COLLATE NOCASE').all();
      if (rows && rows.length) {
        const listaFromDb = rows.map(mapRowToConstel);
        return res.render('index', { lista: listaFromDb });
      }
    } catch (err) {
      console.error('Erro ao ler constelacoes do DB:', err);
      // continue para fallback
    }
  }

  // fallback
  res.render('index', { lista: listaFallback });
});

router.get('/constellation/:id', (req, res) => {
  const id = req.params.id;

  // tenta buscar no DB primeiro
  if (db) {
    try {
      const row = db.prepare('SELECT * FROM constelacoes WHERE id = ?').get(id);
      if (row) {
        const item = mapRowToConstel(row);

        // ACOPLAR as estrelas do mapa STARS_BY_CONSTELLATION
        // Se houver mapeamento explícito, use-o; caso contrário mantenha item.stars (se fornecido no DB)
        if (STARS_BY_CONSTELLATION[id]) {
          item.stars = STARS_BY_CONSTELLATION[id];
        } else {
          item.stars = item.stars || [];
        }

        return res.render('constellation', { c: item });
      }
    } catch (err) {
      console.error('Erro ao buscar constelacao no DB:', err);
      // segue para fallback
    }
  }

  // fallback: procura na lista em memória
  const item = listaFallback.find(c => c._id === id);
  if (!item) return res.status(404).send('Constelação não encontrada');

  // se houver mapeamento extra, priorize STARS_BY_CONSTELLATION (assim mantém fonte única)
  item.stars = STARS_BY_CONSTELLATION[id] || item.stars || [];

  res.render('constellation', { c: item });
});

module.exports = router;
