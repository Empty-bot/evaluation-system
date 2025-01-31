const User = require('../models/Users');

const userController = {
    async getAllUsers(req, res) {
        try {
            const users = await User.findAll();
            res.json(users);
        } catch (error) {
            res.status(500).json({ error: "Erreur lors de la récupération des utilisateurs." });
        }
    },

    async getUserById(req, res) {
        try {
            const user = await User.findById(req.params.id);
            if (!user) {
                return res.status(404).json({ error: "Utilisateur non trouvé." });
            }
            res.json(user);
        } catch (error) {
            res.status(500).json({ error: "Erreur lors de la récupération de l'utilisateur." });
        }
    },

    async updateUser(req, res) {
        try {
            const { email, role, department } = req.body;
            const updated = await User.update(req.params.id, { email, role, department });

            if (!updated) {
                return res.status(404).json({ error: "Utilisateur non trouvé." });
            }
            res.json({ message: "Utilisateur mis à jour avec succès." });
        } catch (error) {
            res.status(500).json({ error: "Erreur lors de la mise à jour de l'utilisateur." });
        }
    },

    async deleteUser(req, res) {
        try {
            const deleted = await User.delete(req.params.id);
            if (!deleted) {
                return res.status(404).json({ error: "Utilisateur non trouvé." });
            }
            res.json({ message: "Utilisateur supprimé avec succès." });
        } catch (error) {
            res.status(500).json({ error: "Erreur lors de la suppression de l'utilisateur." });
        }
    }
};

module.exports = userController;
