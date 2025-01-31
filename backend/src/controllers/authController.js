const jwt = require('jsonwebtoken');
const User = require('../models/Users');

const authController = {
    async register(req, res) {
        try {
            const { email, password, role, department } = req.body;
            
            // Vérifier si l'utilisateur existe déjà
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({ error: 'Cet email est déjà utilisé.' });
            }

            // Créer le nouvel utilisateur
            const userId = await User.create({ email, password, role, department });
            
            res.status(201).json({ message: 'Utilisateur créé avec succès.' });
        } catch (error) {
            res.status(500).json({ error: 'Erreur lors de l\'inscription.' });
        }
    },

    async login(req, res) {
        try {
            const { email, password } = req.body;
            
            // Trouver l'utilisateur
            const user = await User.findByEmail(email);
            if (!user) {
                return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
            }

            // Vérifier le mot de passe
            const isValid = await User.verifyPassword(password, user.password);
            if (!isValid) {
                return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
            }

            // Créer le token
            const token = jwt.sign(
                { userId: user.id, email: user.email, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({ token, user: {
                id: user.id,
                email: user.email,
                role: user.role,
                department: user.department
            }});
        } catch (error) {
            res.status(500).json({ error: 'Erreur lors de la connexion.' });
        }
    }
};

module.exports = authController;