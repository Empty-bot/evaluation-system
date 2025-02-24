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
    
            // Validation du type et des possible_answers
            if (!["text", "multiple_choice", "boolean"].includes(type)) {
                return res.status(400).json({ error: "Type de question invalide" });
            }
    
            let validatedAnswers = [];
    
            // Validation selon le type
            if (type === "text") {
                validatedAnswers = [];
            } 
            else if (type === "multiple_choice") {
                if (!Array.isArray(possible_answers) || possible_answers.length < 2) {
                    return res.status(400).json({ 
                        error: "Les questions à choix multiples nécessitent au moins 2 réponses possibles" 
                    });
                }
                validatedAnswers = possible_answers.filter(answer => answer.trim() !== "");
                
                if (validatedAnswers.length < 2) {
                    return res.status(400).json({ 
                        error: "Les questions à choix multiples nécessitent au moins 2 réponses valides" 
                    });
                }
            } 
            else if (type === "boolean") {
                // Pour boolean, exactement 2 valeurs personnalisées
                if (!Array.isArray(possible_answers) || possible_answers.length !== 2 || 
                    !possible_answers[0].trim() || !possible_answers[1].trim()) {
                    return res.status(400).json({ 
                        error: "Les questions booléennes nécessitent exactement 2 réponses valides" 
                    });
                }
                validatedAnswers = possible_answers.map(answer => answer.trim());
            }
    
            const questionId = await Question.create({ 
                questionnaire_id, 
                label, 
                type, 
                possible_answers: validatedAnswers 
            });
    
            res.status(201).json({ 
                message: "Question créée avec succès.", 
                id: questionId 
            });
        } catch (error) {
            res.status(500).json({ error: "Erreur lors de la création de la question." });
        }
    },

    async update(req, res) {
        try {
            const { label, type, possible_answers } = req.body;
    
            // Validation du type
            if (!["text", "multiple_choice", "boolean"].includes(type)) {
                return res.status(400).json({ error: "Type de question invalide" });
            }
    
            let validatedAnswers = [];
    
            // Validation selon le type
            if (type === "text") {
                validatedAnswers = [];
            } 
            else if (type === "multiple_choice") {
                if (!Array.isArray(possible_answers) || possible_answers.length < 2) {
                    return res.status(400).json({ 
                        error: "Les questions à choix multiples nécessitent au moins 2 réponses possibles" 
                    });
                }
                validatedAnswers = possible_answers.filter(answer => answer.trim() !== "");
                
                if (validatedAnswers.length < 2) {
                    return res.status(400).json({ 
                        error: "Les questions à choix multiples nécessitent au moins 2 réponses valides" 
                    });
                }
            } 
            else if (type === "boolean") {
                if (!Array.isArray(possible_answers) || possible_answers.length !== 2 || 
                    !possible_answers[0].trim() || !possible_answers[1].trim()) {
                    return res.status(400).json({ 
                        error: "Les questions booléennes nécessitent exactement 2 réponses valides" 
                    });
                }
                validatedAnswers = possible_answers.map(answer => answer.trim());
            }
    
            const updated = await Question.update(req.params.id, { 
                label, 
                type, 
                possible_answers: validatedAnswers 
            });
    
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
