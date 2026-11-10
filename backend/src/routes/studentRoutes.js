const express = require("express");
const router = express.Router();

const {
    getStudentProfile,
    updateStudentProfile,
    getStudentSkills,
    updateStudentSkills,
    getRecommendedOpportunities
} = require("../controllers/studentController");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

router.use(authenticateToken);
router.use(authorizeRoles("STUDENT"));

router.get("/profile", getStudentProfile);
router.put("/profile", updateStudentProfile);
router.get("/skills", getStudentSkills);
router.put("/skills", updateStudentSkills);
router.get("/recommendations", getRecommendedOpportunities);

module.exports = router;