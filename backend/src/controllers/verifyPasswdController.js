const bcrypt = require('bcrypt');
const Users = require('../models/Users'); 

const verifyPasswdController = {
    async verifyPassword(req, res) {
        try {
            const { currentPassword } = req.body; // Mot de passe saisi par l'utilisateur
            const userId = req.user.userId; // ID de l'utilisateur authentifié

            // Vérifier si l'utilisateur existe
            const user = await Users.findByIdPrime(userId);
            if (!user || !user.password) {
                return res.status(404).json({ error: " Mot de passe utilisateur non trouvé." });
            }

            if (!currentPassword) {
                return res.status(400).json({ error: "Le mot de passe actuel est requis." });
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

