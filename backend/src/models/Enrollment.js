const { pool } = require('../config/database');

class Enrollment {
    static async enrollStudent(user_id, course_id) {
        const [result] = await pool.execute(
            'INSERT INTO enrollments (user_id, course_id) VALUES (?, ?)',
            [user_id, course_id]
        );
        return result.insertId;
    }

    static async isStudentEnrolled(user_id, course_id) {
        const [rows] = await pool.execute(
            'SELECT 1 FROM enrollments WHERE user_id = ? AND course_id = ?',
            [user_id, course_id]
        );
        return rows.length > 0;
    }
}

module.exports = Enrollment;
