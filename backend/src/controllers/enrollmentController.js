const Enrollment = require("../models/Enrollment");

const enrollmentController = {
    async enrollStudent(req, res) {
        try {
            const { user_id, course_id } = req.body;
            
            // Vérifier si l'inscription existe déjà
            const isAlreadyEnrolled = await Enrollment.isStudentEnrolled(user_id, course_id);
            if (isAlreadyEnrolled) {
                return res.status(400).json({ error: "L'étudiant est déjà inscrit à ce cours." });
            }

            // Inscrire l'étudiant
            await Enrollment.enrollStudent(user_id, course_id);
            res.status(201).json({ message: "Étudiant inscrit au cours avec succès." });

        } catch (error) {
            console.error("❌ Erreur lors de l'inscription :", error);
            res.status(500).json({ error: "Erreur lors de l'inscription de l'étudiant." });
        }
    }
};

module.exports = enrollmentController;
