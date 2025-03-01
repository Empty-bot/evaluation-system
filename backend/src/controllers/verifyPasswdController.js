const bcrypt = require('bcrypt');
const Users = require('../models/Users'); // Modèle utilisateur

const verifyPasswdController = {
    async verifyPassword(req, res) {
        try {
            const { currentPassword } = req.body; // Mot de passe saisi par l'utilisateur
            const userId = req.user.userId; // ID de l'utilisateur authentifié

            // Vérifier si l'utilisateur existe
            const user = await Users.findByIdPrime(userId);
            if (!user) {
                return res.status(404).json({ error: "Utilisateur non trouvé." });
            }

            // Comparer le mot de passe fourni avec celui stocké
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(401).json({ error: "Mot de passe incorrect." });
            }

            res.json({ success: true, message: "Mot de passe vérifié avec succès." });
        } catch (error) {
            console.error("Erreur détaillée:", error);
            res.status(500).json({ error: "Erreur lors de la vérification du mot de passe." });
        }
    }
}
module.exports = verifyPasswdController;

