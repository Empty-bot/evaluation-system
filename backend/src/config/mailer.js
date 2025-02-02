const nodemailer = require("nodemailer");
require("dotenv").config();
console.log("📩 Email User:", process.env.EMAIL_USER);
console.log("📩 Email Pass:", process.env.EMAIL_PASS ? "EXISTS" : "MISSING");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true pour le port 465, false pour le port 587
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});


// Fonction pour envoyer un email
async function sendEmail(to, subject, text) {
    try {
        await transporter.sendMail({
            from: `"Evaluation System" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text
        });
        console.log(`📩 Email envoyé à ${to} - Sujet: ${subject}`);
    } catch (error) {
        console.error("❌ Erreur d'envoi d'email :", error);
    }
}

module.exports = sendEmail;
