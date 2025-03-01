const Questionnaire = require('../models/Questionnaire');
const sendEmail = require("../config/mailer");
const Users = require("../models/Users");

const questionnaireController = {
    async getAll(req, res) {
        try {
            let questionnaires;
            if (req.user.role === "admin" || req.user.role === "quality_manager") {
                // L'admin voit tous les questionnaires
                questionnaires = await Questionnaire.findAll();
            } else if (req.user.role === "student") {
                // Un étudiant voit seulement les questionnaires de ses cours
                questionnaires = await Questionnaire.findByStudent(req.user.userId);
            } else {
                return res.status(403).json({ error: "Accès refusé." });
            }
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

    async getByDepartment(req, res) {
        try {
            const { department } = req.params;
    
            // Valider que le département est fourni
            if (!department) {
                return res.status(400).json({ error: "Le département est requis." });
            }
    
            const questionnaires = await Questionnaire.findByDepartment(department);
    
            if (!questionnaires || questionnaires.length === 0) {
                return res.status(404).json({ error: "Aucun questionnaire trouvé pour ce département." });
            }

            res.json(questionnaires);
        } catch (error) {
            res.status(500).json({ error: "Erreur lors de la récupération des questionnaires." });
        }
    },

    async getByDepartmentAndLevel(req, res) {
        try {
            const { department, level } = req.params;
    
            if (!department || !level) {
                return res.status(400).json({ error: "Le département et le niveau sont requis." });
            }
            console.log(department, level)
            const questionnaires = await Questionnaire.findByDepartmentAndLevel(department, level);
    
            if (!questionnaires || questionnaires.length === 0) {
                return res.status(404).json({ error: "Aucun questionnaire trouvé pour ce département et ce niveau." });
            }
    
            res.json(questionnaires);
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: "Erreur lors de la récupération des questionnaires." });
        }
    },

    async create(req, res) {
        try {
          const { title, description, status, course_id, deadline } = req.body;
          const questionnaireId = await Questionnaire.create({ title, description, status, course_id, deadline });
          
          // Envoyer des emails uniquement si le statut est "published"
          if (status === 'published') {
            // Récupérer les étudiants inscrits au cours
            const students = await Users.findByCourse(course_id);
            
            // Envoyer un email uniquement aux étudiants du cours
            students.forEach(student => {
              sendEmail(
                student.email,
                `📚 Nouveau questionnaire disponible : ${title}`,
                `Un nouveau questionnaire a été ajouté pour votre cours. Connectez-vous pour répondre avant cette date: ${deadline}.`
              );
            });
            
            res.status(201).json({ 
              message: "Questionnaire créé et notifications envoyées avec succès.", 
              id: questionnaireId 
            });
          } else {
            // Si le statut n'est pas "published", ne pas envoyer d'emails
            res.status(201).json({ 
              message: "Questionnaire créé avec succès.", 
              id: questionnaireId 
            });
          }
        } catch (error) {
          res.status(500).json({ error: "Erreur lors de la création du questionnaire." });
        }
      },

      async update(req, res) {
        try {
          const { title, description, status, course_id, deadline } = req.body;
          const { id } = req.params;
          
          // Vérifier si le questionnaire existe et récupérer son statut actuel
          const questionnaire = await Questionnaire.findById(id);
          if (!questionnaire) {
            return res.status(404).json({ error: "Questionnaire non trouvé." });
          }
          
          // Empêcher la modification des questionnaires publiés ou clôturés
          if (questionnaire.status !== "draft") {
            return res.status(403).json({ error: "Impossible de modifier un questionnaire publié ou clôturé." });
          }
          
          // Mise à jour du questionnaire
          const updated = await Questionnaire.update(id, { title, description, status, course_id, deadline });
          
          // Vérifier si le statut est passé à "published"
          if (status === 'published' && questionnaire.status !== 'published') {
            // Récupérer les étudiants inscrits au cours
            const students = await Users.findByCourse(course_id);
            
            // Envoyer un email uniquement aux étudiants du cours
            students.forEach(student => {
              sendEmail(
                student.email,
                `📚 Nouveau questionnaire disponible : ${title}`,
                `Un nouveau questionnaire a été ajouté pour votre cours. Connectez-vous pour répondre avant cette date: ${deadline}.`
              );
            });
            
            res.json({ message: "Questionnaire mis à jour et notifications envoyées avec succès." });
          } else {
            res.json({ message: "Questionnaire mis à jour avec succès." });
          }
        } catch (error) {
          console.error("❌ Erreur lors de la mise à jour du questionnaire :", error);
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
    },

    async closeUpdate(req, res) {
        try {
            const { id } = req.params;
            
            // Vérifier si le questionnaire existe et récupérer son statut actuel
            const questionnaire = await Questionnaire.findById(id);
            if (!questionnaire) {
                return res.status(404).json({ error: "Questionnaire non trouvé." });
            }
    
            // Empêcher la fermeture des questionnaires déjà clôturés ou en brouillon
            if (questionnaire.status === "closed") {
                return res.status(403).json({ error: "Le questionnaire est déjà clôturé." });
            }
            if (questionnaire.status === "draft") {
                return res.status(403).json({ error: "Impossible de clôturer un questionnaire en brouillon." });
            }
    
            // Mise à jour du statut du questionnaire
            const updated = await Questionnaire.closeUpdate(id);
            if (!updated) {
                return res.status(500).json({ error: "Échec de la clôture du questionnaire." });
            }
            res.json({ success: true, message: "Questionnaire clôturé avec succès." });
            
        } catch (error) {
            res.status(500).json({ error: "Erreur lors de la clôture du questionnaire." });
        }
    },

    async publishUpdate(req, res) {
        try {
            const { id } = req.params;
            
            // Vérifier si le questionnaire existe et récupérer son statut actuel
            const questionnaire = await Questionnaire.findById(id);
            if (!questionnaire) {
                return res.status(404).json({ error: "Questionnaire non trouvé." });
            }
    
            // Empêcher la fermeture des questionnaires déjà clôturés ou en brouillon
            if (questionnaire.status === "published") {
                return res.status(403).json({ error: "Le questionnaire est déjà publié." });
            }
            if (questionnaire.status === "closed") {
                return res.status(403).json({ error: "Ce questionnaire est déjà clôturé." });
            }
    
            // Mise à jour du statut du questionnaire
            const updated = await Questionnaire.publishUpdate(id);
            if (!updated) {
                return res.status(500).json({ error: "Échec de la publication du questionnaire." });
            }
            res.json({ success: true, message: "Questionnaire publié avec succès." });
            
        } catch (error) {
            res.status(500).json({ error: "Erreur lors de la publication du questionnaire." });
        }
    }
};

module.exports = questionnaireController;
