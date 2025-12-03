require('dotenv').config();
const express = require('express');
const path = require('path');
const connectDB = require('./config/db');

const app = express();
connectDB();

// middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// routers
const indexRouter = require('./routes/index');
const postsRouter = require('./routes/posts');
const constRouter = require('./routes/constelacoes');
const contactRouter = require('./routes/contacts');

app.use('/', indexRouter);
app.use('/posts', postsRouter);
app.use('/constelacoes', constRouter);
app.use('/contacts', contactRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server rodando na porta ${PORT}`));
