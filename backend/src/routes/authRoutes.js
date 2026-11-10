
const express = require("express");
const router = express.Router();

const { register, login } = require("../controllers/authController");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);

// Protected route: requires a valid JWT
router.get("/me", authenticateToken, (req, res) => {
    res.status(200).json({
        success: true,
        message: "Token verified successfully",
        user: req.user
    });
});

// Example role-protected route: STUDENT only
router.get(
    "/student-only",
    authenticateToken,
    authorizeRoles("STUDENT"),
    (req, res) => {
        res.status(200).json({
            success: true,
            message: "Student access granted",
            user: req.user
        });
    }
);

module.exports = router;
