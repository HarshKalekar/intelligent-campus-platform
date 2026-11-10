
const { pool } = require("../config/mysql");

// Apply for an opportunity
async function applyForOpportunity(req, res) {
    try {
        const { opportunity_id } = req.body;
        const student_id = req.user.user_id;

        // Validate opportunity ID
        if (!opportunity_id || !Number.isInteger(Number(opportunity_id))) {
            return res.status(400).json({
                success: false,
                message: "A valid opportunity_id is required"
            });
        }

        // Check whether opportunity exists
        const [opportunities] = await pool.query(
            `SELECT opportunity_id, status, application_deadline
             FROM opportunities
             WHERE opportunity_id = ?`,
            [opportunity_id]
        );

        if (opportunities.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Opportunity not found"
            });
        }

        // Prevent duplicate applications
        const [existing] = await pool.query(
            `SELECT application_id
             FROM applications
             WHERE opportunity_id = ? AND student_id = ?`,
            [opportunity_id, student_id]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: "You have already applied for this opportunity"
            });
        }

        // Insert application
        const [result] = await pool.query(
            `INSERT INTO applications (opportunity_id, student_id)
             VALUES (?, ?)`,
            [opportunity_id, student_id]
        );

        return res.status(201).json({
            success: true,
            message: "Application submitted successfully",
            application_id: result.insertId
        });

    } catch (error) {
        if (error.sqlMessage?.includes("Cannot apply")) {
            return res.status(400).json({
                success: false,
                message: error.sqlMessage
            });
        }

        console.error("Application error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to submit application"
        });
    }
}

// Get applications belonging to the logged-in student
async function getMyApplications(req, res) {
    try {
        const student_id = req.user.user_id;

        const [applications] = await pool.query(
            `SELECT
                a.application_id,
                a.application_status AS status,
                a.applied_at,
                o.opportunity_id,
                o.title,
                o.opportunity_type,
                o.location,
                o.application_deadline
             FROM applications a
             JOIN opportunities o
                ON a.opportunity_id = o.opportunity_id
             WHERE a.student_id = ?
             ORDER BY a.applied_at DESC`,
            [student_id]
        );

        return res.status(200).json({
            success: true,
            count: applications.length,
            applications
        });

    } catch (error) {
        console.error("Fetch applications error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch applications"
        });
    }
}

module.exports = {
    applyForOpportunity,
    getMyApplications
};
