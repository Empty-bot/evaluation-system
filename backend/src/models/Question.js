const { pool } = require('../config/database');

class Question {
    static async findAllByQuestionnaire(questionnaire_id) {
        const [rows] = await pool.execute('SELECT * FROM questions WHERE questionnaire_id = ?', [questionnaire_id]);
        return rows;
    }

    static async findById(question_id) {
        const [rows] = await pool.execute(
            `SELECT id, type, possible_answers FROM questions WHERE id = ?`,
            [question_id]
        );
        return rows.length ? rows[0] : null;
    }    

    static async create({ questionnaire_id, label, type, possible_answers }) {
        const [result] = await pool.execute(
            'INSERT INTO questions (questionnaire_id, label, type, possible_answers) VALUES (?, ?, ?, ?)',
            [questionnaire_id, label, type, JSON.stringify(possible_answers)]
        );
        return result.insertId;
    }

    static async update(id, { label, type, possible_answers }) {
        const [result] = await pool.execute(
            'UPDATE questions SET label = ?, type = ?, possible_answers = ? WHERE id = ?',
            [label, type, JSON.stringify(possible_answers), id]
        );
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await pool.execute('DELETE FROM questions WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
}

module.exports = Question;
