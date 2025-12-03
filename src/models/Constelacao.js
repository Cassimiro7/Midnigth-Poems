const mongoose = require('mongoose');

const ConstelacaoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  imagem: String,
  estrelas: [String],
  descricao: String,
  historia: String,
  epocaVisivel: String,
  ra: String,
  dec: String
}, { timestamps: true });

module.exports = mongoose.model('Constelacao', ConstelacaoSchema);
