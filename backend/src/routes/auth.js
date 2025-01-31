const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth, checkRole } = require('../middleware/auth');

router.post('/register', auth, checkRole(['admin']), authController.register);
//router.post('/register', authController.register);
router.post('/login', authController.login);

// Route protégée de test
router.get('/me', auth, (req, res) => {
    res.json({ user: req.user });
});

module.exports = router;