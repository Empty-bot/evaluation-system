const Course = require('../models/Course');

const courseController = {
    async getAllCourses(req, res) {
        try {
            const courses = await Course.findAll();
            res.json({data: courses});
        } catch (error) {
            res.status(500).json({ error: "Erreur lors de la récupération des cours." });
        }
    },

    async getCourseById(req, res) {
        try {
            const course = await Course.findById(req.params.id);
            if (!course) {
                return res.status(404).json({ error: "Cours non trouvé." });
            }
            res.json(course);
        } catch (error) {
            res.status(500).json({ error: "Erreur lors de la récupération du cours." });
        }
    },

    async getByDepartment(req, res) {
        try {
            const { department } = req.params;
    
            // Valider que le département est fourni
            if (!department) {
                return res.status(400).json({ error: "Le département est requis." });
            }
    
            const courses = await Course.findByDepartment(department);
    
            if (!courses || courses.length === 0) {
                return res.json({ message: "Aucun cours trouvé pour ce département.", data: [] });
            }

            res.json({ data: courses });
        } catch (error) {
            res.status(500).json({ error: "Erreur lors de la récupération des cours." });
        }
    },

    async getByDepartmentAndLevel(req, res) {
        try {
            const { department, level } = req.params;
    
            if (!department || !level) {
                return res.status(400).json({ error: "Le département et le niveau sont requis." });
            }

            const courses = await Course.findByDepartmentAndLevel(department, level);
    
            if (!courses || courses.length === 0) {
                return res.json({ message: "Aucun cours trouvé pour ce département et ce niveau.", data: [] });
            }
    
            res.json({ data: courses });
        } catch (error) {
            res.status(500).json({ error: "Erreur lors de la récupération des cours." });
        }
    },

    async createCourse(req, res) {
        try {
            const { code, name, department, level } = req.body;
            const courseId = await Course.create({ code, name, department, level });
            res.status(201).json({ message: "Cours créé avec succès.", id: courseId });
        } catch (error) {
            res.status(500).json({ error: "Erreur lors de la création du cours." });
        }
    },

    async updateCourse(req, res) {
        try {
            const { code, name, department, level } = req.body;
            const updated = await Course.update(req.params.id, { code, name, department, level });

            if (!updated) {
                return res.status(404).json({ error: "Cours non trouvé." });
            }
            res.json({ message: "Cours mis à jour avec succès." });
        } catch (error) {
            res.status(500).json({ error: "Erreur lors de la mise à jour du cours." });
        }
    },

    async deleteCourse(req, res) {
        try {
            const deleted = await Course.delete(req.params.id);
            if (!deleted) {
                return res.status(404).json({ error: "Cours non trouvé." });
            }
            res.json({ message: "Cours supprimé avec succès." });
        } catch (error) {
            res.status(500).json({ error: "Erreur lors de la suppression du cours." });
        }
    }
};

module.exports = courseController;
