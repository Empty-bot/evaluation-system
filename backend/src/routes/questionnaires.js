const express = require('express');
const router = express.Router();
const questionnaireController = require('../controllers/questionnaireController');
const { auth, checkRole } = require('../middleware/auth');

router.get('/', auth, questionnaireController.getAll);
router.get('/:id', auth, questionnaireController.getById);
router.post('/', auth, checkRole(['admin']), questionnaireController.create);
router.put('/:id', auth, checkRole(['admin']), questionnaireController.update);
router.put('/:id/close', auth, checkRole(['admin']), questionnaireController.closeUpdate);
router.delete('/:id', auth, checkRole(['admin']), questionnaireController.delete);

module.exports = router;
