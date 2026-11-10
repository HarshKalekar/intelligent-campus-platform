
const express = require("express");
const router = express.Router();

const {
    applyForOpportunity,
    getMyApplications
} = require("../controllers/applicationController");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

router.post(
    "/",
    authenticateToken,
    authorizeRoles("STUDENT"),
    applyForOpportunity
);

router.get(
    "/my",
    authenticateToken,
    authorizeRoles("STUDENT"),
    getMyApplications
);

module.exports = router;
