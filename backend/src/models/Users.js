const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    static async create({ email, password, role, department }) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await pool.execute(
            'INSERT INTO users (email, password, role, department) VALUES (?, ?, ?, ?)',
            [email, hashedPassword, role, department]
        );
        return result.insertId;
    }

    static async findByEmail(email) {
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        return rows[0];
    }

    static async verifyPassword(password, hashedPassword) {
        return bcrypt.compare(password, hashedPassword);
    }
}

module.exports = User;
