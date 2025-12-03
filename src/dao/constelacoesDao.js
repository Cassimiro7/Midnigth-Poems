const Constelacao = require('../models/Constelacao');

class ConstelacoesDao {
  async findAll() {
    return Constelacao.find().sort({ nome: 1 }).lean();
  }
  async findById(id) {
    return Constelacao.findById(id).lean();
  }
  async create(data) {
    return Constelacao.create(data);
  }
  // editar, deletar...
}

module.exports = new ConstelacoesDao();
