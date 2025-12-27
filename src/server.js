require('dotenv').config();
const express = require('express');
const path = require('path');
const db = require('./db');
 // Conexão com o banco de dados

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * Expor diretórios estáticos:
 * - /css  -> public/css
 * - /js   -> public/js
 * - /videos -> public/videos
 * - /img  -> public/img
 * - /assets -> src/Assets (sua pasta com imagens das constelações)
 *
 * OBS: estamos expondo src/Assets em /assets para você não precisar mover imagens agora.
 * Quando for deploy, eu recomendo copiar as imagens para public/.
 */
app.use('/css', express.static(path.join(__dirname, '../public/css')));
app.use('/js', express.static(path.join(__dirname, '../public/js')));
app.use('/videos', express.static(path.join(__dirname, '../public/videos')));
app.use('/img', express.static(path.join(__dirname, '../public/img')));
app.use('/assets', express.static(path.join(__dirname, 'Assets')));

// configurações do EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// rota index
const indexRouter = require('./routes/index');
app.use('/', indexRouter);

// rota de teste rápido (opcional)
app.get('/health', (req, res) => res.send('ok'));

// iniciar servidor
app.listen(PORT, () => {
  console.log(`Server rodando na porta ${PORT}`);
});
