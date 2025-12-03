const express = require("express");
const router = express.Router();

// rota mínima só pra não quebrar
router.get("/", (req, res) => {
  res.send("Posts OK");
});

module.exports = router;
