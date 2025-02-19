const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class Users {
    static async create({ email, password, role, department, first_name, surname }) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await pool.execute(
            'INSERT INTO users (email, password, role, department, first_name, surname) VALUES (?, ?, ?, ?, ?, ?)',
            [email, hashedPassword, role, department, first_name, surname]
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

    static async searchByEmail(email) {
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        return rows;
    }

    static async verifyPassword(password, hashedPassword) {
        return bcrypt.compare(password, hashedPassword);
    }

    // Récupérer tous les utilisateurs
    static async findAll() {
        const [rows] = await pool.execute('SELECT id, email, role, department, first_name, surname FROM users');
        return rows;
    }

    // Récupérer un utilisateur par ID
    static async findById(id) {
        const [rows] = await pool.execute('SELECT id, email, role, department, first_name, surname FROM users WHERE id = ?', [id]);
        return rows[0] || null;
    }

    // Mettre à jour un utilisateur
    static async update(id, { email, role, department }) {
        const [result] = await pool.execute(
            'UPDATE users SET email = ?, role = ?, department = ?, updated_at = CURRENT_TIMESTAMP, first_name = ?, surname = ? WHERE id = ?',
            [email, role, department, first_name, surname, id]
        );
        return result.affectedRows > 0;
    }

    // Supprimer un utilisateur
    static async delete(id) {
        const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    static async findByCourse(course_id) {
        const [rows] = await pool.execute(
            `SELECT * FROM users 
             JOIN enrollments ON users.id = enrollments.user_id 
             WHERE enrollments.course_id = ? AND users.role = 'student'`,
            [course_id]
        );
        return rows;
    }

    static async findByRole(role) {
        const [rows] = await pool.execute(
            `SELECT * FROM users WHERE role = ?`,
            [role]
        );
        return rows;
    }
}

module.exports = Users;
