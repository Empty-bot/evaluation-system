const jwt = require('jsonwebtoken');
const Users = require('../models/Users');
const crypto = require('crypto');
const sendEmail = require('../config/mailer');

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

            // Contenu de l'email
            const subject = 'Création de compte utilisateur';
            const text = `
        Bonjour,

        Un compte utilisateur a été créé sur la plateforme d'évaluation des enseignements de Polytech Diamniadio avec cet adresse email.

        Cordialement,
        L'équipe de la plateforme d'évaluation des enseignements - Polytech Diamniadio
            `;
            
            // Envoyer l'email avec votre fonction existante
            await sendEmail(email, subject, text);
            
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
    },

    async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            
            // Vérifier si l'utilisateur existe
            const user = await Users.findByEmail(email);
            if (!user) {
            // Pour des raisons de sécurité, on ne révèle pas si l'email existe ou non
            return res.status(200).json({ message: 'Si cet email existe, un lien de réinitialisation vous sera envoyé.' });
            }
            
            // Générer un token unique
            const resetToken = crypto.randomBytes(32).toString('hex');
            const resetTokenExpiry = Date.now() + 3600000; // 1 heure
            
            // Stocker le token dans la base de données
            await Users.storeResetToken(user.id, resetToken, resetTokenExpiry);
            
            // URL de réinitialisation (frontend)
            const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
            
            // Contenu de l'email
            const subject = 'Réinitialisation de votre mot de passe';
            const text = `
        Bonjour,

        Vous avez demandé à réinitialiser votre mot de passe.

        Cliquez sur le lien ci-dessous pour définir un nouveau mot de passe :
        ${resetUrl}

        Ce lien est valable pendant 1 heure.

        Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.

        Cordialement,
        L'équipe de la plateforme d'évaluation des enseignements - Polytech Diamniadio
            `;
            
            // Envoyer l'email avec votre fonction existante
            await sendEmail(email, subject, text);
            
            res.status(200).json({ message: 'Si cet email existe, un lien de réinitialisation vous sera envoyé.' });
        } catch (error) {
            console.error('Erreur lors de la demande de réinitialisation :', error);
            res.status(500).json({ error: 'Erreur lors de la demande de réinitialisation.' });
        }
    },

    async verifyResetToken(req, res) {
        try {
            const { token } = req.params;
            
            // Vérifier si le token existe et est valide
            const user = await Users.findByResetToken(token);
            
            if (!user || user.reset_token_expiry < Date.now()) {
            return res.status(400).json({ error: 'Le token est invalide ou a expiré.' });
            }
            
            res.status(200).json({ message: 'Token valide.' });
        } catch (error) {
            res.status(500).json({ error: 'Erreur lors de la vérification du token.' });
        }
    },

    async resetPassword(req, res) {
        try {
            const { token } = req.params;
            const { password } = req.body;
            
            // Vérifier si le token existe et est valide
            const user = await Users.findByResetToken(token);
            
            if (!user || user.reset_token_expiry < Date.now()) {
            return res.status(400).json({ error: 'Le token est invalide ou a expiré.' });
            }
            
            // Mettre à jour le mot de passe et supprimer le token de réinitialisation
            await Users.updatePassword(user.id, password);
            
            res.status(200).json({ message: 'Mot de passe réinitialisé avec succès.' });
        } catch (error) {
            res.status(500).json({ error: 'Erreur lors de la réinitialisation du mot de passe.' });
        }
    }
};

module.exports = authController;