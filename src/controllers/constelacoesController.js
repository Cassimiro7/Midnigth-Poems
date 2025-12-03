module.exports = {
    listarConstelacoes: (req, res) => {
        const lista = [
            { nome: "Órion", descricao: "O Caçador" },
            { nome: "Cassiopeia", descricao: "A Rainha" },
            { nome: "Escorpião", descricao: "O Escorpião" }
        ];

        res.render("constelacoes", { constelacoes: lista });
    }
};
