const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth, checkRole } = require('../middleware/auth');
const verifyPasswdController = require('../controllers/verifyPasswdController');

router.post('/register', auth, checkRole(['admin']), authController.register);
//router.post('/register', authController.register);
router.post('/login', authController.login);
router.post("/verify-password", auth, verifyPasswdController.verifyPassword);

// Route protégée de test
router.get('/me', auth, (req, res) => {
    res.json({ user: req.user });
});

module.exports = router;