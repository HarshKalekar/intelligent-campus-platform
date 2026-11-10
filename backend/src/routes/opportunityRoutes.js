const express = require("express");
const router = express.Router();

const {
    getAllOpportunities
} = require("../controllers/opportunityController");

// Public route: view all published opportunities
router.get("/", getAllOpportunities);

module.exports = router;