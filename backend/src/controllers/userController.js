const Users = require('../models/Users');

const userController = {
    async getAllUsers(req, res) {
        try {
            const users = await Users.findAll();
            res.json(users);
        } catch (error) {
            res.status(500).json({ error: "Erreur lors de la récupération des utilisateurs." });
        }
    },

    async getUserById(req, res) {
        try {
            const user = await Users.findById(req.params.id);
            if (!user) {
                return res.status(404).json({ error: "Utilisateur non trouvé." });
            }
            res.json(user);
        } catch (error) {
            res.status(500).json({ error: "Erreur lors de la récupération de l'utilisateur." });
        }
    },

    async getUsersByEmail(req, res) {
        try {
            const { email } = req.params;
            const users = await Users.findByEmail(email);
            res.json(users);
        } catch (error) {
            res.status(500).json({ error: "Erreur lors de la récupération des utilisateurs." });
        }
    },

    async searchUsersByEmail(req, res) {
        try {
            const { email } = req.params;
            const users = await Users.searchByEmail(email);
            res.json(users);
        } catch (error) {
            res.status(500).json({ error: "Erreur lors de la récupération des utilisateurs." });
        }
    },

    async getUsersByCourse(req, res) {
        try {
            const { id } = req.params;
            const students = await Users.findByCourse(id);
            res.json(students);
        } catch (error) {
            res.status(500).json({ error: "Erreur lors de la récupération des étudiants du cours." });
        }
    },

    async getUsersByRole(req, res) {
        try {
            const { role } = req.params;
            const users = await Users.findByRole(role);
            res.json(users);
        } catch (error) {
            res.status(500).json({ error: "Erreur lors de la récupération des utilisateurs." });
        }
    },

    async updateUser(req, res) {
        try {
            const { email, role, department, first_name, surname } = req.body;

            const updated = await Users.update(req.params.id, { email, role, department, first_name, surname });

            if (!updated) {
                return res.status(404).json({ error: "Utilisateur non trouvé." });
            }
            res.json({ message: "Utilisateur mis à jour avec succès." });
        } catch (error) {
            res.status(500).json({ error: "Erreur lors de la mise à jour de l'utilisateur." });
        }
    },

    async personalUpdate(req, res) {
        try {
          const { department, first_name, surname } = req.body;
          const userId = req.params.id; // ID de l'utilisateur à mettre à jour
          const authenticatedUserId = req.user.userId; // ID extrait du token JWT
          
          if (String(authenticatedUserId) !== String(userId)) {
            return res.status(403).json({ error: "Action non autorisée." });
          }
          
          // Mise à jour des informations
          const updated = await Users.personalUpdate(userId, { department, first_name, surname });
          if (!updated) {
            return res.status(404).json({ error: "Utilisateur non trouvé." });
          }
          
          res.json({ success: true, message: "Utilisateur mis à jour avec succès." });
        } catch (error) {
          res.status(500).json({ error: "Erreur lors de la mise à jour de l'utilisateur." });
        }
      },

    async passwordUpdate(req, res) {
        try {
            const { password } = req.body;
            const userId = req.params.id;  // ID de l'utilisateur à mettre à jour
            const authenticatedUserId = req.user.userId; // ID extrait du token JWT
    
            // Vérification : Un utilisateur ne peut modifier que ses propres infos (sauf admin)
            if (String(authenticatedUserId) !== String(userId)) {
                return res.status(403).json({ error: "Action non autorisée." });
            }
    
            // Mise à jour des informations
            const updated = await Users.passwordUpdate(userId, { password });
    
            if (!updated) {
                return res.status(404).json({ error: "Utilisateur non trouvé." });
            }
    
            res.json({ message: "Mot de passe mis à jour avec succès." });
        } catch (error) {
            res.status(500).json({ error: "Erreur lors de la mise à jour du mot de passe." });
        }
    },

    async deleteUser(req, res) {
        try {
            const deleted = await Users.delete(req.params.id);
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
