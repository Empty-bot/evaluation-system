const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const { auth, checkRole } = require('../middleware/auth');

router.get('/questionnaire/:questionnaire_id', auth, questionController.getAllByQuestionnaire);
router.get('/:id', auth, questionController.getById);
router.post('/', auth, checkRole(['admin']), questionController.create);
router.put('/:id', auth, checkRole(['admin']), questionController.update);
router.delete('/:id', auth, checkRole(['admin']), questionController.delete);

module.exports = router;
