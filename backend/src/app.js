const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/database');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const courseRoutes = require('./routes/courses');
const questionnaireRoutes = require('./routes/questionnaires');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/questionnaires', questionnaireRoutes);

// Test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend server is running' });
});

// Test DB connection
testConnection();

module.exports = app;
