// src/routes/index.js
const express = require('express');
const router = express.Router();

// Exemplo: se usar DAO, substitua pelo dao.findAll()
const constelacoesExample = [
  {
    _id: '1',
    nome: 'Órion',
    imagem: '/img/orion.jpg',
    formaImg: '/img/orion_lines.png',
    comentario: 'Cinturão bem visível no inverno.',
    historia: 'Órion era um caçador na mitologia grega...',
    epocaVisivel: 'De dezembro a março (Brasil)'
  },
  {
    _id: '2',
    nome: 'Escorpião',
    imagem: '/img/escorpiao.jpg',
    formaImg: '/img/escorpiao_lines.png',
    comentario: 'Fácil de identificar por sua cauda curva.',
    historia: 'Segundo a lenda...',
    epocaVisivel: 'Junho a agosto (Brasil)'
  },
  // adicione mais
];

router.get('/', async (req, res) => {
  // Se você tiver DAO:
  // const lista = await constelacoesDao.findAll();
  // res.render('index', { lista })

  // Exemplo rápido sem DB:
  res.render('index', { lista: constelacoesExample });
});

module.exports = router;
