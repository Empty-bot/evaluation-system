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
             WHERE e.user_id = ? AND q.status = 'published'`,
            [user_id]
        );
        return rows;
    }

    static async findByDepartment(department) {
        const [rows] = await pool.execute(
            `SELECT q.*
             FROM questionnaires q
             JOIN courses c ON q.course_id = c.id
             WHERE c.department = ?`,
            [department]
        );
        return rows;
    }

    static async findByDepartmentAndLevel(department, level) {
        const [rows] = await pool.execute(
            `SELECT q.*
             FROM questionnaires q
             JOIN courses c ON q.course_id = c.id
             WHERE c.department = ?
             AND c.level = ?`,
            [department, level]
        );
        return rows;
    }

    static async findByCourseCode(code) {
        const [rows] = await pool.execute(
            `SELECT q.*
             FROM questionnaires q
             JOIN courses c ON q.course_id = c.id
             WHERE c.code = ?`,
            [code]
        );
        return rows;
    }

    static async create({ title, description, status, course_id, deadline }) {
        const [result] = await pool.execute(
            'INSERT INTO questionnaires (title, description, status, course_id, deadline) VALUES (?, ?, ?, ?, ?)',
            [title, description, status, course_id, deadline]
        );
        return result.insertId;
    }

    static async update(id, { title, description, status, course_id, deadline }) {
        const [result] = await pool.execute(
            'UPDATE questionnaires SET title = ?, description = ?, status = ?, course_id = ?, deadline = ? WHERE id = ?',
            [title, description, status, course_id, deadline, id]
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

    static async publishUpdate(id) {
        const [result] = await pool.execute(
            'UPDATE questionnaires SET status = ? WHERE id = ?',
            ['published', id]
        );
        return result.affectedRows > 0;
    }
}

module.exports = Questionnaire;
