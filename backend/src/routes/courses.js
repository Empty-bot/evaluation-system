const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { auth, checkRole } = require('../middleware/auth');

router.get('/', auth, courseController.getAllCourses);
router.get('/:id', auth, courseController.getCourseById);
router.post('/', auth, checkRole(['admin']), courseController.createCourse);
router.put('/:id', auth, checkRole(['admin']), courseController.updateCourse);
router.delete('/:id', auth, checkRole(['admin']), courseController.deleteCourse);
router.get('/by-department/:department', auth, checkRole(['admin']), courseController.getByDepartment);
router.get('/by-department-and-level/:department/:level', auth, checkRole(['admin']), courseController.getByDepartmentAndLevel);
router.get('/by-course-code/:code', auth, checkRole(['admin']), courseController.getByCode);
module.exports = router;
