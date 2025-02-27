const jwt = require('jsonwebtoken');
const Users = require('../models/Users');

const authController = {
    async register(req, res) {
        try {
            const { email, password, role, department, first_name, surname } = req.body;
            
            // Vérifier si l'utilisateur existe déjà
            const existingUser = await Users.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({ error: 'Cet email est déjà utilisé.' });
            }

            // Créer le nouvel utilisateur
            const userId = await Users.create({ email, password, role, department, first_name, surname });
            
            res.status(201).json({ message: 'Utilisateur créé avec succès.' });
        } catch (error) {
            res.status(500).json({ error: 'Erreur lors de l\'inscription.' });
        }
    },

    async login(req, res) {
        try {
            const { email, password } = req.body;
            
            // Trouver l'utilisateur
            const user = await Users.findByEmail(email);
            if (!user) {
                return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
            }

            // Vérifier le mot de passe
            const isValid = await Users.verifyPassword(password, user.password);
            if (!isValid) {
                return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
            }

            // Créer le token
            const token = jwt.sign(
                { userId: user.id, email: user.email, role: user.role, first_name: user.first_name, surname: user.surname },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({ token, user: {
                id: user.id,
                email: user.email,
                role: user.role,
                department: user.department,
                first_name: user.first_name,
                surname: user.surname
            }});
        } catch (error) {
            res.status(500).json({ error: 'Erreur lors de la connexion.' });
        }
    }
};

module.exports = authController;