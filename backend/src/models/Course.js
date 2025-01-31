const { pool } = require('../config/database');

class Course {
    static async findAll() {
        const [rows] = await pool.execute('SELECT * FROM courses');
        return rows;
    }

    static async findById(id) {
        const [rows] = await pool.execute('SELECT * FROM courses WHERE id = ?', [id]);
        return rows[0] || null;
    }

    static async create({ code, name, department }) {
        const [result] = await pool.execute(
            'INSERT INTO courses (code, name, department) VALUES (?, ?, ?)',
            [code, name, department]
        );
        return result.insertId;
    }

    static async update(id, { code, name, department }) {
        const [result] = await pool.execute(
            'UPDATE courses SET code = ?, name = ?, department = ? WHERE id = ?',
            [code, name, department, id]
        );
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await pool.execute('DELETE FROM courses WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
}

module.exports = Course;
