
const express = require("express");
const router = express.Router();

const {
    createOpportunity,
    getMyOpportunities,
    getOpportunityApplicants,
    updateApplicationStatus,
    publishOpportunity,
    updateOpportunity,
    deleteOpportunity
} = require("../controllers/organizerController");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

router.use(authenticateToken);
router.use(authorizeRoles("ORGANIZER"));

router.post("/opportunities", createOpportunity);
router.get("/opportunities/my", getMyOpportunities);
router.get("/applicants", getOpportunityApplicants);
router.patch("/applications/:applicationId/status", updateApplicationStatus);
router.patch("/opportunities/:id/publish", publishOpportunity);
router.put("/opportunities/:id", updateOpportunity);
router.delete("/opportunities/:id", deleteOpportunity);

module.exports = router;
