const rateLimit = require("express-rate-limit");

// Limite générale (100 requêtes max par IP toutes les 15 minutes)
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requêtes max par IP
    message: "Trop de requêtes, veuillez réessayer plus tard.",
    headers: true
});

// Limite stricte pour les routes sensibles (authentification)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Max 5 tentatives
    message: { error: "Trop de tentatives de connexion. Réessayez plus tard." },
    standardHeaders: true, // Renvoie des infos de rate limit dans les headers
    legacyHeaders: false, // Désactive les headers X-RateLimit obsolètes
});

module.exports = { generalLimiter, authLimiter };
