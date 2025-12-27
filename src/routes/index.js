const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  // Busca todas as constelações no banco de dados
  const constellations = db
    .prepare(`
      SELECT 
        id AS _id,
        nome,
        imagem,
        background,
        formaImg,
        comentario,
        historia,
        epocaVisivel
      FROM constelacoes
    `)
    .all();

  res.render('index', { lista: constellations });
});

module.exports = router;
