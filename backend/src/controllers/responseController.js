const Response = require('../models/Response');

const responseController = {
    async submitResponse(req, res) {
        try {
            const { questionnaire_id, question_id, answer } = req.body;
            const user_id = req.user.userId; // ID de l'étudiant connecté

            const responseId = await Response.create({ user_id, questionnaire_id, question_id, answer });
            res.status(201).json({ message: "Réponse soumise avec succès.", id: responseId });
        } catch (error) {
            res.status(500).json({ error: "Erreur lors de la soumission de la réponse." });
        }
    },

    async getResponsesByQuestionnaire(req, res) {
        try {
            const { id } = req.params;
            const responses = await Response.findByQuestionnaire(id);
            res.json(responses);
        } catch (error) {
            res.status(500).json({ error: "Erreur lors de la récupération des réponses." });
        }
    },

    async getUserResponses(req, res) {
        try {
            const user_id = req.user.userId;
            const responses = await Response.findByUser(user_id);
            res.json(responses);
        } catch (error) {
            res.status(500).json({ error: "Erreur lors de la récupération des réponses utilisateur." });
        }
    }
};

module.exports = responseController;
