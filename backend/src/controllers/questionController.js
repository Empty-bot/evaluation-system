const Question = require('../models/Question');

const questionController = {
    async getAllByQuestionnaire(req, res) {
        try {
            const { questionnaire_id } = req.params;
            const questions = await Question.findAllByQuestionnaire(questionnaire_id);
            res.json(questions);
        } catch (error) {
            res.status(500).json({ error: "Erreur lors de la récupération des questions." });
        }
    },

    async getById(req, res) {
        try {
            const question = await Question.findById(req.params.id);
            if (!question) {
                return res.status(404).json({ error: "Question non trouvée." });
            }
            res.json(question);
        } catch (error) {
            res.status(500).json({ error: "Erreur lors de la récupération de la question." });
        }
    },

    async create(req, res) {
        try {
            const { questionnaire_id, label, type, possible_answers } = req.body;
            const questionId = await Question.create({ questionnaire_id, label, type, possible_answers });
            res.status(201).json({ message: "Question créée avec succès.", id: questionId });
        } catch (error) {
            res.status(500).json({ error: "Erreur lors de la création de la question." });
        }
    },

    async update(req, res) {
        try {
            const { label, type, possible_answers } = req.body;
            const updated = await Question.update(req.params.id, { label, type, possible_answers });

            if (!updated) {
                return res.status(404).json({ error: "Question non trouvée." });
            }
            res.json({ message: "Question mise à jour avec succès." });
        } catch (error) {
            res.status(500).json({ error: "Erreur lors de la mise à jour de la question." });
        }
    },

    async delete(req, res) {
        try {
            const deleted = await Question.delete(req.params.id);
            if (!deleted) {
                return res.status(404).json({ error: "Question non trouvée." });
            }
            res.json({ message: "Question supprimée avec succès." });
        } catch (error) {
            res.status(500).json({ error: "Erreur lors de la suppression de la question." });
        }
    }
};

module.exports = questionController;
