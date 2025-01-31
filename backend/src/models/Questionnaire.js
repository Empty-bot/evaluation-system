const { pool } = require('../config/database');

class Questionnaire {
    static async findAll() {
        const [rows] = await pool.execute('SELECT * FROM questionnaires');
        return rows;
    }

    static async findById(id) {
        const [rows] = await pool.execute('SELECT * FROM questionnaires WHERE id = ?', [id]);
        return rows[0] || null;
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
}

module.exports = Questionnaire;
