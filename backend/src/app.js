const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/database');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const courseRoutes = require('./routes/courses');
const questionnaireRoutes = require('./routes/questionnaires');
const questionRoutes = require('./routes/questions');
const responseRoutes = require('./routes/responses');
const { generalLimiter, authLimiter } = require("./middleware/rateLimit");
const helmet = require("helmet");
const logger = require("./config/logger");
const enrollmentRoutes = require("./routes/enrollments");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(generalLimiter); // Appliquer la limite générale
app.use(helmet()); // Sécuriser les headers HTTP


app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url} - ${req.ip}`);
    next();
});

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/questionnaires', questionnaireRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/responses', responseRoutes);
app.use("/api/enrollments", enrollmentRoutes);

// Test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend server is running' });
});

// Test DB connection
testConnection();

module.exports = app;
