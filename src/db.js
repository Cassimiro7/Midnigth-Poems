const fs = require('fs');
const path = require('path');
require('dotenv').config();

const Database = require('better-sqlite3');

// caminho do arquivo DB (padrão: data/midnight.db)
const dbFile = process.env.DB_FILE || 'data/midnight.db';
const dbPath = path.join(__dirname, '..', dbFile);

// garante que a pasta exista (cria recursivamente se necessário)
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log('Criada pasta do banco:', dbDir);
}

// abre (ou cria) o arquivo de banco
const db = new Database(dbPath);

// cria tabela de constelacoes (se não existir)
// OBS: adicionei o campo `stars` (TEXT) para armazenar JSON com pontos {x,y,name}
db.prepare(`
  CREATE TABLE IF NOT EXISTS constelacoes (
    id TEXT PRIMARY KEY,
    nome TEXT,
    imagem TEXT,
    background TEXT,
    formaImg TEXT,
    comentario TEXT,
    historia TEXT,
    epocaVisivel TEXT,
    stars TEXT
  )
`).run();

// cria tabela de observacoes (se não existir)
db.prepare(`
  CREATE TABLE IF NOT EXISTS observacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    constelacao_id TEXT,
    ts TEXT DEFAULT (datetime('now'))
  )
`).run();

// seed automático: insere dados iniciais se tabela vazia
const count = db.prepare('SELECT COUNT(*) AS cnt FROM constelacoes').get();
if (!count || count.cnt === 0) {
  const insert = db.prepare(`
    INSERT INTO constelacoes
    (id, nome, imagem, background, formaImg, comentario, historia, epocaVisivel, stars)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // initial data: última posição é um array JS com pontos {x,y,name}
  const initial = [
    [
      'orion',
      'Órion',
      '/assets/Orion/stars.png',
      '/assets/Orion/background.png',
      '/assets/Orion/lines.png',
      'Cinturão bem visível no inverno.',
      `Órion é uma das constelações mais famosas e fáceis de reconhecer no céu noturno, visível em latitudes médias durante o inverno no hemisfério norte (e no verão no hemisfério sul). Na mitologia grega, Órion é descrito como um caçador gigante e formidável — existem várias versões da lenda: em algumas ele é filho de Poseidon, em outras um companheiro de caça dos deuses. Em muitas narrativas ele atraiu a ira da deusa Ártemis ou foi morto por um escorpião (a razão pela qual a constelação de Escorpião nasce quando Órion se põe). Astronomicamente, Órion contém estrelas brilhantes e bem conhecidas: Betelgeuse (uma supergigante vermelha que marca o ombro), Rigel (uma estrela azul-branca muito brilhante que marca o pé), Bellatrix e Saiph, além do famoso Cinturão de Órion — três estrelas quase alinhadas (Alnitak, Alnilam, Mintaka). A região também abriga a famosa Nebulosa de Órion (M42), uma das regiões de formação estelar mais estudadas. Culturalmente, a figura do caçador aparece em tradições de várias culturas antigas (sumérios, egípcios e nativos americanos), e suas estrelas serviram de referência para navegação e calendários locais.`,
      'Dezembro a Março (Brasil)',
      // stars array (Betelgeuse & Rigel included)
      [
        { "x": 44, "y": 28, "name": "Betelgeuse" },
        { "x": 50, "y": 44, "name": "Bellatrix" },
        { "x": 48, "y": 56, "name": "Alnilam (Cinturão)" },
        { "x": 44, "y": 60, "name": "Alnitak (Cinturão)" },
        { "x": 52, "y": 60, "name": "Mintaka (Cinturão)" },
        { "x": 50, "y": 72, "name": "Rigel" },
        { "x": 38, "y": 72, "name": "Saiph" }
      ]
    ],

    [
      'ursa-maior',
      'Ursa Maior',
      '/assets/Ursa Maior/stars.png',
      '/assets/Ursa Maior/background.png',
      '/assets/Ursa Maior/lines.png',
      'Lar do famoso asterismo "Grande Carro".',
      `A Ursa Maior (Ursa Major) é uma das constelações mais antigas registradas e é conhecida por abrigar o asterismo do "Grande Carro" (Big Dipper). Na mitologia grega, a história mais comum liga a constelação a Calisto, uma ninfa transformada em urso por Hera (ou por Zeus para protegê-la); seu filho Arcas quase a matou durante uma caçada, mas ambos foram colocados entre as estrelas por Zeus. Astronomicamente, destacam-se as estrelas Dubhe e Merak (usadas como "guardas" que apontam para Polaris, a Estrela do Norte), além de outras componentes brilhantes que formam o carro e a cauda. Ursa Maior tem grande importância cultural ao redor do mundo — povos do norte, eslavos, nativos da América do Norte e vários povos asiáticos desenvolveram mitos próprios sobre a forma do urso ou do carro. A constelação tem sido usada historicamente para orientação (indicar o norte) e para marcar épocas do ano em calendários populares.`,
      'Ano inteiro (melhor no outono).',
      [
        { "x": 73, "y": 80, "name": "Dubhe" },
        { "x": 55, "y": 85, "name": "Merak" },
        { "x": 64, "y": 76, "name": "Alioth" },
        { "x": 64, "y": 85, "name": "Phecda" },
        { "x": 55, "y": 92, "name": "Megrez" }
      ]
    ],

    [
      'ursa-menor',
      'Ursa Menor',
      '/assets/Ursa Menor/stars.png',
      '/assets/Ursa Menor/background.png',
      '/assets/Ursa Menor/lines.png',
      'Abriga a estrela Polaris, a Estrela do Norte.',
      `A Ursa Menor (Ursa Minor) contém Polaris, conhecida como Estrela do Norte (quando suficientemente próxima ao pólo celeste), que serviu por séculos como referência para navegação e orientação no hemisfério norte. Na tradição grega, Ursa Menor é frequentemente associada a Arcas, filho de Calisto (vinculada à Ursa Maior), e sua colocação nas estrelas está ligada à mesma narrativa mitológica que explica Ursa Maior. A constelação é relativamente discreta em brilho, mas extremamente útil devido à presença de Polaris — embora a estrela não esteja exatamente no pólo, sua posição se aproxima bastante no céu atual. Além do papel prático, Ursa Menor aparece em mitos e lendas de várias culturas do hemisfério norte e foi usada para marcar direções e estações. Observacionalmente é visível durante boa parte do ano nas latitudes médias e altas do norte; no hemisfério sul só é visível em latitudes mais baixas do norte.`,
      'Ano inteiro (hemisfério norte).',
      [
        { "x": 72, "y": 52, "name": "Polaris" },
        { "x": 66, "y": 64, "name": "Kochab" },
        { "x": 76, "y": 68, "name": "Pherkad" }
      ]
    ],

    [
      'cassiopeia',
      'Cassiopeia',
      '/assets/Cassiopeia/stars.png',
      '/assets/Cassiopeia/background.png',
      '/assets/Cassiopeia/lines.png',
      'Visível como um “W” brilhante no céu.',
      `Cassiopeia é facilmente identificável pelo seu padrão em "W" (ou "M", dependendo da rotação) e está associada na mitologia grega à rainha Cassiopeia, esposa do rei Cefeu e mãe de Andrômeda; Cassiopeia era famosa por sua vaidade — segundo a lenda, ela se gabou de que sua beleza (ou a de sua filha) era superior à das Nereidas, provocando a ira de Poseidon e causando calamidades que só foram resolvidas com o sacrifício de Andrômeda. Como punição, Cassiopeia foi colocada no céu, às vezes representada acorrentada ou sentada, e sua posição circular faz com que pareça virar de cabeça para baixo em certos períodos. Estrelas notáveis incluem Schedar e Caph; a constelação também marca a região onde se localiza a Galáxia de Andrômeda (próxima no céu) e vários objetos de interesse do céu profundo. Cassiopeia possui grande presença em mitos do Mediterrâneo e também serviu como marco para navegação estelar em latitudes setentrionais.`,
      'Ano inteiro (hemisfério norte).',
      [
        { "x": 48, "y": 48, "name": "Schedar" },
        { "x": 55, "y": 42, "name": "Caph" },
        { "x": 62, "y": 48, "name": "Ruchbah" }
      ]
    ],

    [
      'touro',
      'Touro',
      '/assets/Touro/stars.png',
      '/assets/Touro/background.png',
      '/assets/Touro/lines.png',
      'Lar das Plêiades e das Híades.',
      `Touro (Taurus) é uma constelação zodiacal proeminente, facilmente reconhecível pela presença da brilhante estrela Aldebaran (um gigante alaranjado que marca o "olho" do touro) e pelos aglomerados estelares das Plêiades (M45) e das Híades. Na mitologia grega, Touro é frequentemente associado a Zeus, que se transformou num touro magnífico para raptar Europa; outra interpretação o liga a antigas imagens de touro na arte e religião neolítica (por exemplo, em cavernas e monumentos megalíticos). Astronomicamente, Touro é importante por abrigar jovens enxames estelares e nebulosas — as Plêiades e Híades são objetos visíveis a olho nu e estudados como protótipos de aglomerados abertos. Culturas antigas do Oriente Médio, Mediterrâneo e Ásia reconheceram o touro como um símbolo de fertilidade e força; sua posição no zodíaco o tornou também um marcador importante em calendários agrícolas e rituais. Em termos de observação, é melhor visível entre novembro e março nas latitudes médias do norte.`,
      'Novembro a Março.',
      [
        { "x": 48, "y": 54, "name": "Aldebaran" },
        { "x": 56, "y": 40, "name": "Alcyone (Plêiades)" },
        { "x": 58, "y": 36, "name": "Atlas (Plêiades)" }
      ]
    ],

    [
      'leao',
      'Leão',
      '/assets/Leão/stars.png',
      '/assets/Leão/background.png',
      '/assets/Leão/lines.png',
      'Associado ao Leão de Neméia.',
      `Leão (Leo) é uma constelação zodiacal associada, na mitologia grega, ao Leão de Neméia — a fera invulnerável que foi o primeiro dos Doze Trabalhos de Hércules, e cujo couro resistente só pôde ser penetrado pelo próprio Hércules. Astronomicamente, Leo contém estrelas brilhantes como Regulus (no peito do leão) e Denebola (na cauda), além de vários objetos de galáxias famosas que aparecem na região (por exemplo, a galáxia M66 e o grupo de galáxias do Leão). Historicamente, a imagem do leão é antiga e aparece em arte e religião do Egito, Mesopotâmia e mediterrâneo; durante a antiguidade, a aparição do Leão no céu era usada para marcar estações e influenciar calendários sazonais. Como constelação zodiacal, o Sol atravessa Leo no período correspondente do zodíaco, e os observadores de latitudes médias o veem bem entre a primavera e o início do verão boreal.`,
      'Março a Junho.',
      [
        { "x": 54, "y": 62, "name": "Regulus" },
        { "x": 46, "y": 50, "name": "Denebola" }
      ]
    ],

    [
      'peixes',
      'Peixes',
      '/assets/Peixes/stars.png',
      '/assets/Peixes/background.png',
      '/assets/Peixes/lines.png',
      'Constelação zodiacal com formato de dois peixes atados.',
      `Peixes (Pisces) é uma constelação zodiacal que simboliza dois peixes ligados por uma fita — na mitologia grega ligada ao mito de Afrodite e Eros (ou, em versões mesopotâmicas, ao par de peixes que ajudou a deusa); em algumas tradições, os peixes salvam divindades de perigos aquáticos. Astronomicamente, a constelação não tem estrelas muito brilhantes, mas contém objetos interessantes, como a Galáxia do Bocal (NGC 520) e pontos de interesse usados por observadores amadores. Em astrologia e em calendários antigos, Peixes tem papel como signo do zodíaco; culturalmente aparece com significados ligados a água, fertilidade e transformação. A constelação é mais discreta que outros signos zodiacais, exigindo céu escuro para observação detalhada, e é melhor vista entre o outono e o inverno no hemisfério norte.`,
      'Setembro a Janeiro.',
      [
        { "x": 52, "y": 52, "name": "Alrescha" }
      ]
    ],

    [
      'pegaso',
      'Pégaso',
      '/assets/Pegaso/stars.png',
      '/assets/Pegaso/background.png',
      '/assets/Pegaso/lines.png',
      'Reconhecida pelo “Grande Quadrado de Pégaso”.',
      `Pégaso é a constelação que representa o cavalo alado nascido do sangue da Górgona Medusa quando Perseu a decapitou, segundo a mitologia grega; Pégaso esteve associado a vários heróis, incluindo Belerofonte, que o domou com a ajuda de Atena. No céu, Pégaso é reconhecível pelo "Grande Quadrado" (formado por três estrelas de Pégaso e uma estrela de Andrômeda), que serve de referência para localizar muitas galáxias e objetos de céu profundo. Estrelas notáveis da constelação incluem Scheat, Markab e Algenib (parte do quadrado) e Enif (na cabeça/corpo do cavalo). Em várias tradições, a imagem do cavalo alado simboliza inspiração, voo e aspirações; em termos observacionais, Pégaso é proeminente durante o outono boreal e abriga diversos alvos para astrônomos amadores e profissionais.`,
      'Outubro a Janeiro.',
      [
        { "x": 42, "y": 50, "name": "Markab" },
        { "x": 50, "y": 48, "name": "Scheat" }
      ]
    ],

    [
      'hydra',
      'Hidra',
      '/assets/Hydra/stars.png',
      '/assets/Hydra/background.png',
      '/assets/Hydra/lines.png',
      'A maior constelação do céu.',
      `Hidra (Hydra) é a maior constelação do céu, estendendo-se ao longo de uma faixa longa e sinuosa; na mitologia grega, está associada à Hidra de Lerna, o monstro aquático de várias cabeças que Hércules teve de derrotar como um de seus trabalhos (cada cabeça cortada muitas vezes produzia duas no lugar). A constelação inclui estrelas individuais pouco brilhantes perto de um extenso território estelar e contém alguns aglomerados e nebulosas estudados por astrônomos; a estrela Alphard é a mais brilhante da Hidra, conhecida como "a Solitária" por sua posição isolada. Hidra tem papeis diferentes em tradições culturais, frequentemente ligada a criaturas aquáticas e ao simbolismo de renovação (devido à regeneração das cabeças na lenda). Por ocupar uma área tão extensa, parte dela é melhor visível em diferentes épocas do ano dependendo da longitude e latitude do observador.`,
      'Janeiro a Maio.',
      [
        { "x": 38, "y": 56, "name": "Alphard" }
      ]
    ]
  ];

  // Inserir convertendo a coluna stars para JSON string
  for (const c of initial) {
    try {
      insert.run(
        c[0], // id
        c[1], // nome
        c[2], // imagem
        c[3], // background
        c[4], // formaImg
        c[5], // comentario
        c[6], // historia
        c[7], // epocaVisivel
        JSON.stringify(c[8] || [])
      );
    } catch (err) {
      console.error('Erro ao inserir constelacao seed:', c[0], err);
    }
  }

  console.log('Banco populado com constelações iniciais (inclui campo stars).');
}

module.exports = db;
