// src/db.js
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
db.prepare(`
  CREATE TABLE IF NOT EXISTS constelacoes (
    id TEXT PRIMARY KEY,
    nome TEXT,
    imagem TEXT,
    background TEXT,
    formaImg TEXT,
    comentario TEXT,
    historia TEXT,
    epocaVisivel TEXT
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
    (id, nome, imagem, background, formaImg, comentario, historia, epocaVisivel)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const initial = [
    ['orion','Órion','/assets/Orion/stars.png','/assets/Orion/background.png','/assets/Orion/lines.png','Cinturão bem visível no inverno.','Órion era um poderoso caçador da mitologia grega...','Dezembro a Março (Brasil)'],
    ['ursa-maior','Ursa Maior','/assets/Ursa Maior/stars.png','/assets/Ursa Maior/background.png','/assets/Ursa Maior/lines.png','Lar do famoso asterismo "Grande Carro".','Associada a várias lendas, incluindo Calisto, transformada em urso.','Ano inteiro (melhor no outono).'],
    ['ursa-menor','Ursa Menor','/assets/Ursa Menor/stars.png','/assets/Ursa Menor/background.png','/assets/Ursa Menor/lines.png','Abriga a estrela Polaris, a Estrela do Norte.','Na mitologia grega, representa Arcas, filho de Calisto.','Ano inteiro (hemisfério norte).'],
    ['cassiopeia','Cassiopeia','/assets/Cassiopeia/stars.png','/assets/Cassiopeia/background.png','/assets/Cassiopeia/lines.png','Visível como um “W” brilhante no céu.','Rainha vaidosa condenada pelos deuses.','Ano inteiro no hemisfério norte.'],
    ['touro','Touro','/assets/Touro/stars.png','/assets/Touro/background.png','/assets/Touro/lines.png','Lar das Plêiades e das Híades.','Representa Zeus transformado em touro.','Novembro a Março.'],
    ['leao','Leão','/assets/Leão/stars.png','/assets/Leão/background.png','/assets/Leão/lines.png','Associado ao Leão de Neméia.','Primeiro trabalho de Hércules.','Março a Junho.'],
    ['peixes','Peixes','/assets/Peixes/stars.png','/assets/Peixes/background.png','/assets/Peixes/lines.png','Constelação zodiacal com formato de dois peixes atados.','Representa Afrodite e Eros fugindo de Tífon.','Setembro a Janeiro.'],
    ['pegaso','Pégaso','/assets/Pegaso/stars.png','/assets/Pegaso/background.png','/assets/Pegaso/lines.png','Reconhecida pelo “Grande Quadrado de Pégaso”.','O cavalo alado nascido do sangue da Medusa.','Outubro a Janeiro.'],
    ['hydra','Hidra','/assets/Hydra/stars.png','/assets/Hydra/background.png','/assets/Hydra/lines.png','A maior constelação do céu.','Associada à Hidra de Lerna.','Janeiro a Maio.']
  ];

  for (const c of initial) insert.run(...c);
  console.log('Banco populado com constelações iniciais.');
}

module.exports = db;
