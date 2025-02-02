const express = require("express");
const router = express.Router();
const enrollmentController = require("../controllers/enrollmentController");
const { auth, checkRole } = require("../middleware/auth");

// Route pour inscrire un étudiant à un cours (admin uniquement)
router.post("/", auth, checkRole(["admin"]), enrollmentController.enrollStudent);

module.exports = router;
