const Question = require('../models/Question');
const Response = require('../models/Response');
const Questionnaire = require("../models/Questionnaire");
const Users = require("../models/Users");
const sendEmail = require("../config/mailer");
const crypto = require("crypto");
const SALT_SECRET = process.env.SALT_SECRET || "random_salt"; // Utiliser un sel pour sécuriser les hashes

const responseController = {
    async submitResponse(req, res) {
        try {
            const { questionnaire_id, question_id, answer } = req.body;
            const user_id = req.user.userId;
    
            // Vérifier si le questionnaire est toujours ouvert
            const questionnaire = await Questionnaire.findById(questionnaire_id);
            if (!questionnaire) {
                return res.status(404).json({ error: "Questionnaire non trouvé." });
            }
            if (questionnaire.status === "closed") {
                return res.status(403).json({ error: "Ce questionnaire est clôturé et ne peut plus être rempli." });
            }
    
            // Vérifier si l'étudiant est inscrit au cours du questionnaire
            const isEnrolled = await Questionnaire.isStudentEnrolled(user_id, questionnaire_id);
            if (!isEnrolled) {
                return res.status(403).json({ error: "Vous n'êtes pas inscrit à ce cours." });
            }
    
            // Vérifier si la question existe
            const question = await Question.findById(question_id);
            if (!question) {
                return res.status(400).json({ error: "La question spécifiée n'existe pas." });
            }
    
            // Obtenir les possibles réponses sous forme de tableau
            let possibleAnswers = question.possible_answers;
            if (typeof possibleAnswers === 'string') {
                try {
                    possibleAnswers = JSON.parse(possibleAnswers);
                } catch (error) {
                    console.error("Erreur lors du parsing des réponses possibles:", error);
                    return res.status(500).json({ 
                        error: "Erreur lors de la validation de la réponse." 
                    });
                }
            }
    
            // Validation selon le type de question
            if (question.type === 'text') {
                // Pour le type texte, on vérifie juste que la réponse n'est pas vide
                if (!answer || answer.trim() === '') {
                    return res.status(400).json({ 
                        error: "La réponse ne peut pas être vide pour une question de type texte." 
                    });
                }
            } else if (question.type === 'single_choice') {
                // Gestion du type single_choice 
                if (!Array.isArray(possibleAnswers) || possibleAnswers.length < 2) {
                    return res.status(500).json({ 
                        error: "Configuration invalide pour une question à choix unique." 
                    });
                }
                
                if (!possibleAnswers.includes(answer)) {
                    return res.status(400).json({ 
                        error: `Réponse invalide. Les options possibles sont : ${possibleAnswers.join(", ")}` 
                    });
                }
            } else if (question.type === 'multiple_choice') {
                // Gérer un tableau de réponses pour multiple_choice
                if (!Array.isArray(possibleAnswers) || possibleAnswers.length < 2) {
                    return res.status(500).json({ 
                        error: "Configuration invalide pour une question à choix multiples." 
                    });
                }
    
                // Vérifier si answer est un tableau
                if (!Array.isArray(answer)) {
                    return res.status(400).json({
                        error: "Les réponses pour une question à choix multiples doivent être envoyées sous forme de tableau."
                    });
                }
    
                // Vérifier que chaque réponse est valide
                for (const singleAnswer of answer) {
                    if (!possibleAnswers.includes(singleAnswer)) {
                        return res.status(400).json({ 
                            error: `Réponse invalide: "${singleAnswer}". Options valides : ${possibleAnswers.join(", ")}` 
                        });
                    }
                }
            }
            
            // Générer un identifiant anonymisé (SHA256)
            const anonymous_id = crypto.createHash("sha256")
                .update(`${user_id}-${questionnaire_id}-${SALT_SECRET}`)
                .digest("hex");
    
            // Vérifier si l'étudiant a déjà répondu à cette question
            const alreadyAnswered = await Response.hasAlreadyAnswered(anonymous_id, question_id);
            if (alreadyAnswered) {
                return res.status(400).json({ error: "Vous avez déjà répondu à cette question." });
            }
    
            // Logs pour vérification
            console.log("🔍 Debug - questionnaire_id:", questionnaire_id);
            console.log("🔍 Debug - question_id:", question_id);
            console.log("🔍 Debug - answer:", answer);
            console.log("🔍 Debug - user_id:", req.user.userId);
            console.log("🔍 Debug - anonymous_id:", anonymous_id);
    
            let responseId;
            
            // Gestion spéciale pour les réponses multiples
            if (question.type === 'multiple_choice' && Array.isArray(answer)) {
                // Convertir le tableau en JSON et le stocker
                const answerString = JSON.stringify(answer);
                responseId = await Response.create({ 
                    anonymous_id, 
                    questionnaire_id, 
                    question_id, 
                    answer: answerString 
                });
            } else {
                // Pour les questions non-multiple_choice, comportement normal
                responseId = await Response.create({ 
                    anonymous_id, 
                    questionnaire_id, 
                    question_id, 
                    answer 
                });
            }
    
            // Récupérer les emails des admins et envoyer notifications
            const admins = await Users.findByRole("admin");
            admins.forEach(admin => {
                sendEmail(
                    admin.email,
                    `📊 Nouvelle réponse soumise`,
                    `Un étudiant a répondu au questionnaire [${questionnaire.title}]. Connectez-vous pour voir les résultats.`
                );
            });
    
            res.status(201).json({ message: "Réponse soumise avec succès.", id: responseId });
    
        } catch (error) {
            console.error("❌ Erreur lors de la soumission :", error);
            res.status(500).json({ error: "Erreur lors de la soumission de la réponse." });
        }
    },

    async submitFullQuestionnaire(req, res) {
        try {
            const { questionnaire_id, responses } = req.body;
            const user_id = req.user.userId;
    
            // Vérifier si le questionnaire existe et est ouvert
            const questionnaire = await Questionnaire.findById(questionnaire_id);
            if (!questionnaire) {
                return res.status(404).json({ error: "Questionnaire non trouvé." });
            }
            if (questionnaire.status === "closed") {
                return res.status(403).json({ error: "Ce questionnaire est clôturé et ne peut plus être rempli." });
            }
    
            // Vérifier si l'étudiant est inscrit au cours du questionnaire
            const isEnrolled = await Questionnaire.isStudentEnrolled(user_id, questionnaire_id);
            if (!isEnrolled) {
                return res.status(403).json({ error: "Vous n'êtes pas inscrit à ce cours." });
            }
    
            // Générer un identifiant anonymisé (SHA256) une seule fois pour toutes les réponses
            const anonymous_id = crypto.createHash("sha256")
                .update(`${user_id}-${questionnaire_id}-${SALT_SECRET}`)
                .digest("hex");
    
            // Valider et enregistrer chaque réponse
            const createdResponses = [];
            for (const responseData of responses) {
                const { question_id, answer } = responseData;
    
                // Vérifier si la question existe
                const question = await Question.findById(question_id);
                if (!question) {
                    return res.status(400).json({ error: `La question ID:${question_id} n'existe pas.` });
                }
    
                // Obtenir les possibles réponses sous forme de tableau
                let possibleAnswers = question.possible_answers;
                if (typeof possibleAnswers === 'string') {
                    try {
                        possibleAnswers = JSON.parse(possibleAnswers);
                    } catch (error) {
                        console.error("Erreur lors du parsing des réponses possibles:", error);
                        return res.status(500).json({ 
                            error: `Erreur lors de la validation de la réponse pour la question ID:${question_id}.` 
                        });
                    }
                }
    
                // Validation selon le type de question
                if (question.type === 'text') {
                    if (!answer || answer.trim() === '') {
                        return res.status(400).json({ 
                            error: `La réponse ne peut pas être vide pour la question de type texte ID:${question_id}.` 
                        });
                    }
                } else if (question.type === 'single_choice') {
                    if (!Array.isArray(possibleAnswers) || possibleAnswers.length < 2) {
                        return res.status(500).json({ 
                            error: `Configuration invalide pour la question à choix unique ID:${question_id}.` 
                        });
                    }
                    
                    if (!possibleAnswers.includes(answer)) {
                        return res.status(400).json({ 
                            error: `Réponse invalide pour la question ID:${question_id}. Les options possibles sont : ${possibleAnswers.join(", ")}` 
                        });
                    }
                } else if (question.type === 'multiple_choice') {
                    if (!Array.isArray(possibleAnswers) || possibleAnswers.length < 2) {
                        return res.status(500).json({ 
                            error: `Configuration invalide pour la question à choix multiples ID:${question_id}.` 
                        });
                    }
    
                    if (!Array.isArray(answer)) {
                        return res.status(400).json({
                            error: `Les réponses pour la question à choix multiples ID:${question_id} doivent être envoyées sous forme de tableau.`
                        });
                    }
    
                    for (const singleAnswer of answer) {
                        if (!possibleAnswers.includes(singleAnswer)) {
                            return res.status(400).json({ 
                                error: `Réponse invalide: "${singleAnswer}" pour la question ID:${question_id}. Options valides : ${possibleAnswers.join(", ")}` 
                            });
                        }
                    }
                }
    
                // Vérifier si l'étudiant a déjà répondu à cette question
                const alreadyAnswered = await Response.hasAlreadyAnswered(anonymous_id, question_id);
                if (alreadyAnswered) {
                    return res.status(400).json({ error: `Vous avez déjà répondu à la question ID:${question_id}.` });
                }
    
                // Préparation de la réponse à sauvegarder
                let responseToSave = { 
                    anonymous_id, 
                    questionnaire_id, 
                    question_id
                };
    
                // Gestion spéciale pour les réponses multiples
                if (question.type === 'multiple_choice' && Array.isArray(answer)) {
                    responseToSave.answer = JSON.stringify(answer);
                } else {
                    responseToSave.answer = answer;
                }
    
                // Ajouter à la liste des réponses à créer
                createdResponses.push(responseToSave);
            }
    
            // Enregistrer toutes les réponses en base de données
            const savedResponseIds = [];
            for (const responseToSave of createdResponses) {
                const responseId = await Response.create(responseToSave);
                savedResponseIds.push(responseId);
            }
    
            // Envoyer une seule notification aux admins après avoir enregistré toutes les réponses
            const admins = await Users.findByRole("admin");
            admins.forEach(admin => {
                sendEmail(
                    admin.email,
                    `📊 Questionnaire complété`,
                    `Un étudiant a complété le questionnaire [${questionnaire.title}]. Connectez-vous pour voir les résultats.`
                );
            });
    
            res.status(201).json({ 
                message: "Toutes les réponses ont été soumises avec succès.", 
                response_ids: savedResponseIds 
            });
    
        } catch (error) {
            console.error("❌ Erreur lors de la soumission du questionnaire complet:", error);
            res.status(500).json({ error: "Erreur lors de la soumission des réponses." });
        }
    },

    async getResponsesByQuestionnaire(req, res) {
        try {
            const { id } = req.params;


            console.log("🔍 Debug - questionnaire_id:",id);

            const responses = await Response.findByQuestionnaire(id);

            console.log("🔍 Debug - Responses found:", responses);

            // Ne pas montrer `anonymous_id`
            const anonymizedResponses = responses.map(r => ({
                question_id: r.question_id,
                label: r.label,
                answer: r.answer
            }));

            res.json(anonymizedResponses);
        } catch (error) {
            console.error("❌ Erreur lors de la récupération des réponses :", error);
            res.status(500).json({ error: "Erreur lors de la récupération des réponses." });
        }
    },

    async getByQuestion(req, res) {
        try {
            const { id } = req.params; // id de la question
            
            // Récupérer les réponses pour cette question
            const responses = await Response.findByQuestion(id);
            
            if (!responses || responses.length === 0) {
                return res.status(404).json({ 
                    error: "Aucune réponse trouvée pour cette question." 
                });
            }

            const anonymizedResponses = responses.map(r => ({
                question_id: r.question_id,
                label: r.label,
                answer: r.answer
            }));
    
            res.json(anonymizedResponses);
            
        } catch (error) {
            console.error("❌ Erreur lors de la récupération des réponses :", error);
            res.status(500).json({ 
                error: "Erreur lors de la récupération des réponses pour cette question." 
            });
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
