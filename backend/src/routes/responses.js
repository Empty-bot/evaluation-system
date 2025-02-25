const express = require('express');
const router = express.Router();
const responseController = require('../controllers/responseController');
const { auth, checkRole } = require('../middleware/auth');

router.post('/', auth, responseController.submitResponse);
router.get('/questionnaire/:id', auth, checkRole(['admin', 'teacher', 'quality_manager']), responseController.getResponsesByQuestionnaire);
router.get('/question/:id', auth, checkRole(['admin', 'teacher', 'quality_manager']), responseController.getByQuestion);
router.get('/user', auth, responseController.getUserResponses);

module.exports = router;
