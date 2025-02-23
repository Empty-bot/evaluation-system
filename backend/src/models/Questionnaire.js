const { pool } = require('../config/database');
const Enrollment = require("./Enrollment");

class Questionnaire {
    static async findAll() {
        const [rows] = await pool.execute('SELECT * FROM questionnaires');
        return rows;
    }

    static async findById(id) {
        const [rows] = await pool.execute('SELECT * FROM questionnaires WHERE id = ?', [id]);
        return rows[0] || null;
    }

    static async findByStudent(user_id) {
        const [rows] = await pool.execute(
            `SELECT q.* FROM questionnaires q
             JOIN courses c ON q.course_id = c.id
             JOIN enrollments e ON c.id = e.course_id
             WHERE e.user_id = ?`,
            [user_id]
        );
        return rows;
    }

    static async create({ title, description, status, course_id }) {
        const [result] = await pool.execute(
            'INSERT INTO questionnaires (title, description, status, course_id) VALUES (?, ?, ?, ?)',
            [title, description, status, course_id]
        );
        return result.insertId;
    }

    static async update(id, { title, description, status, course_id }) {
        const [result] = await pool.execute(
            'UPDATE questionnaires SET title = ?, description = ?, status = ?, course_id = ? WHERE id = ?',
            [title, description, status, course_id, id]
        );
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await pool.execute('DELETE FROM questionnaires WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    static async isStudentEnrolled(user_id, questionnaire_id) {
        const [rows] = await pool.execute(
            `SELECT 1 FROM enrollments 
             JOIN courses ON enrollments.course_id = courses.id 
             JOIN questionnaires ON courses.id = questionnaires.course_id 
             WHERE enrollments.user_id = ? AND questionnaires.id = ?`,
            [user_id, questionnaire_id]
        );
        return rows.length > 0;
    }

    static async closeUpdate(id) {
        const [result] = await pool.execute(
            'UPDATE questionnaires SET status = ? WHERE id = ?',
            ['closed', id]
        );
        return result.affectedRows > 0;
    }
}

module.exports = Questionnaire;
