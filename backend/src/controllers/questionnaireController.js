const Questionnaire = require('../models/Questionnaire');

const questionnaireController = {
    async getAll(req, res) {
        try {
            const questionnaires = await Questionnaire.findAll();
            res.json(questionnaires);
        } catch (error) {
            res.status(500).json({ error: "Erreur lors de la récupération des questionnaires." });
        }
    },

    async getById(req, res) {
        try {
            const questionnaire = await Questionnaire.findById(req.params.id);
            if (!questionnaire) {
                return res.status(404).json({ error: "Questionnaire non trouvé." });
            }
            res.json(questionnaire);
        } catch (error) {
            res.status(500).json({ error: "Erreur lors de la récupération du questionnaire." });
        }
    },

    async create(req, res) {
        try {
            const { title, description, status, course_id } = req.body;
            const questionnaireId = await Questionnaire.create({ title, description, status, course_id });
            res.status(201).json({ message: "Questionnaire créé avec succès.", id: questionnaireId });
        } catch (error) {
            res.status(500).json({ error: "Erreur lors de la création du questionnaire." });
        }
    },

    async update(req, res) {
        try {
            const { title, description, status, course_id } = req.body;
            const updated = await Questionnaire.update(req.params.id, { title, description, status, course_id });

            if (!updated) {
                return res.status(404).json({ error: "Questionnaire non trouvé." });
            }
            res.json({ message: "Questionnaire mis à jour avec succès." });
        } catch (error) {
            res.status(500).json({ error: "Erreur lors de la mise à jour du questionnaire." });
        }
    },

    async delete(req, res) {
        try {
            const deleted = await Questionnaire.delete(req.params.id);
            if (!deleted) {
                return res.status(404).json({ error: "Questionnaire non trouvé." });
            }
            res.json({ message: "Questionnaire supprimé avec succès." });
        } catch (error) {
            res.status(500).json({ error: "Erreur lors de la suppression du questionnaire." });
        }
    }
};

module.exports = questionnaireController;
