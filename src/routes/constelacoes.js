const express = require("express");
const router = express.Router();
const constelacoesController = require("../controllers/constelacoesController");

router.get("/", constelacoesController.listarConstelacoes);

module.exports = router;
