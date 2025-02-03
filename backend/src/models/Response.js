const { pool } = require('../config/database');

class Response {
    static async create({ anonymous_id, questionnaire_id, question_id, answer }) {
        const [result] = await pool.execute(
            'INSERT INTO responses (anonymous_id, questionnaire_id, question_id, answer) VALUES (?, ?, ?, ?)',
            [anonymous_id, questionnaire_id, question_id, answer]
        );
        return result.insertId;
    }

    static async findByQuestionnaire(questionnaire_id) {
        const [rows] = await pool.execute(
            `SELECT responses.question_id, responses.answer, questions.label 
             FROM responses
             JOIN questions ON responses.question_id = questions.id
             WHERE responses.questionnaire_id = ?`,
            [questionnaire_id]
        );
        return rows;
    }

    static async findByUser(user_id) {
        const [rows] = await pool.execute(
            `SELECT responses.*, questions.label 
             FROM responses 
             JOIN questions ON responses.question_id = questions.id
             WHERE responses.user_id = ?`,
            [user_id]
        );
        return rows;
    }
}

module.exports = Response;
