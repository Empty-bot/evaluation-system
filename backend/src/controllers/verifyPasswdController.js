const Users = require("../models/Users");
const userController = require('../controllers/userController');

const verifyPasswdController = {
    async verify(req, res) {
        try {
            const { adminId, password } = req.body;

            // Récupérer le mot de passe hashé en base de données
            const hashedPassword = await Users.findPasswordById(adminId);
            if (!hashedPassword) {
            return res.status(404).json({ error: "Administrateur non trouvé." });
            }

            // Vérifier si le mot de passe correspond
            const isValid = await Users.verifyPassword(password, hashedPassword);
            if (!isValid) {
            return res.status(401).json({ error: "Mot de passe administrateur incorrect." });
            }

            res.status(200).json({ message: "Mot de passe valide." });
        } catch (error) {
            res.status(500).json({ error: "Erreur lors de la vérification du mot de passe." });
        }
    }
};

module.exports = verifyPasswdController;
