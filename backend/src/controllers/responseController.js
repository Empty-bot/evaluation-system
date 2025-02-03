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
    
            // Validation selon le type de question
            if (question.type === 'multiple_choice') {
                let possibleAnswers = question.possible_answers;
    
                // Vérifier si c'est une chaîne JSON (et pas un tableau JavaScript)
                if (typeof possibleAnswers === 'string') {
                    possibleAnswers = JSON.parse(possibleAnswers); // Convertir en tableau JS
                }
    
    
                if (!possibleAnswers.includes(answer)) {
                    return res.status(400).json({ 
                        error: `Réponse invalide. Options valides : ${possibleAnswers.join(", ")}` 
                    });
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


            //Logs pour vérification
            console.log("🔍 Debug - questionnaire_id:", questionnaire_id);
            console.log("🔍 Debug - question_id:", question_id);
            console.log("🔍 Debug - answer:", answer);
            console.log("🔍 Debug - user_id:", req.user.userId);
            console.log("🔍 Debug - anonymous_id:", anonymous_id);
            console.log("🔍 Debug - Generated anonymous_id:", anonymous_id);


    
            const responseId = await Response.create({ anonymous_id, questionnaire_id, question_id, answer });

            // Récupérer les emails des admins
            const admins = await Users.findByRole("admin");

            // Envoyer un email aux admins
            admins.forEach(admin => {
                sendEmail(
                    admin.email,
                    `📊 Nouvelle réponse soumise`,
                    `Un étudiant a répondu à un questionnaire. Connectez-vous pour voir les résultats.`
                );
            });

            res.status(201).json({ message: "Réponse soumise avec succès.", id: responseId });
    
        } catch (error) {
            console.error("❌ Erreur lors de la soumission :", error);
            res.status(500).json({ error: "Erreur lors de la soumission de la réponse." });
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
