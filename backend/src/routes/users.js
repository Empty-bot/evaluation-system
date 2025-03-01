const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth, checkRole } = require('../middleware/auth');

router.get('/', auth, checkRole(['admin']), userController.getAllUsers);
router.get('/:id', auth, checkRole(['admin']), userController.getUserById);
router.put('/:id', auth, checkRole(['admin']), userController.updateUser);
router.put('/updatePersonal/:id', auth, userController.personalUpdate);
router.put('/updatePassword/:id', auth, userController.passwordUpdate);
router.delete('/:id', auth, checkRole(['admin']), userController.deleteUser);
router.get("/course/:id", auth, checkRole(["admin"]), userController.getUsersByCourse);
router.get("/role/:role", auth, checkRole(["admin"]), userController.getUsersByRole);
router.get("/email/:email", auth, checkRole(["admin"]), userController.getUsersByEmail);
router.get("/emailsearch/:email", auth, checkRole(["admin"]), userController.searchUsersByEmail);

module.exports = router;

