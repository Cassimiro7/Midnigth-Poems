const express = require("express");
const router = express.Router();

// rota mínima só pra evitar erro
router.get("/", (req, res) => {
  res.send("Contacts OK");
});

module.exports = router;
