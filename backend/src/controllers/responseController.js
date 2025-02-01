const Question = require('../models/Question');
const Response = require('../models/Response');

const responseController = {
    async submitResponse(req, res) {
        try {
            const { questionnaire_id, question_id, answer } = req.body;
            const user_id = req.user.userId;
    
            // Vérifier si la question existe
            const question = await Question.findById(question_id);
            if (!question) {
                return res.status(400).json({ error: "La question spécifiée n'existe pas." });
            }
    
            // Afficher possible_answers dans les logs pour voir son format
            console.log("🔍 possible_answers brut:", question.possible_answers);
    
            // Validation selon le type de question
            if (question.type === 'multiple_choice') {
                let possibleAnswers = question.possible_answers;
    
                // Vérifier si c'est une chaîne JSON (et pas un tableau JavaScript)
                if (typeof possibleAnswers === 'string') {
                    possibleAnswers = JSON.parse(possibleAnswers); // Convertir en tableau JS
                }
    
                console.log("✅ possibleAnswers après parsing :", possibleAnswers);
    
                if (!possibleAnswers.includes(answer)) {
                    return res.status(400).json({ 
                        error: `Réponse invalide. Options valides : ${possibleAnswers.join(", ")}` 
                    });
                }
            }
    
            const responseId = await Response.create({ user_id, questionnaire_id, question_id, answer });
            res.status(201).json({ message: "Réponse soumise avec succès.", id: responseId });
    
        } catch (error) {
            console.error("❌ Erreur lors de la soumission :", error);
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
