const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test de connexion
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Base de données connectée avec succès !');
        connection.release();
    } catch (error) {
        console.error('Erreur de connexion à la base de données:', error);
        process.exit(1);
    }
}

module.exports = {
    pool,
    testConnection
};