
const { pool } = require("../config/mysql");

// Get all published opportunities (public API)
async function getAllOpportunities(req, res) {
    try {
        const [opportunities] = await pool.query(`
            SELECT
                o.opportunity_id,
                o.title,
                o.description,
                o.opportunity_type,
                o.status,
                o.application_deadline,
                o.location,
                c.category_name
            FROM opportunities o
            JOIN categories c
                ON o.category_id = c.category_id
            WHERE o.status = 'PUBLISHED'
            ORDER BY o.created_at DESC
        `);

        return res.status(200).json({
            success: true,
            count: opportunities.length,
            opportunities
        });

    } catch (error) {
        console.error("Error fetching opportunities:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch opportunities"
        });
    }
}

// Get opportunities created by the logged-in organizer
async function getMyOpportunities(req, res) {
    try {
        const organizer_id = req.user.user_id;

        const [opportunities] = await pool.query(`
            SELECT
                o.opportunity_id,
                o.title,
                o.description,
                o.opportunity_type,
                o.status,
                o.application_deadline,
                o.location,
                c.category_name
            FROM opportunities o
            JOIN categories c
                ON o.category_id = c.category_id
            WHERE o.created_by = ?
            ORDER BY o.created_at DESC
        `, [organizer_id]);

        return res.status(200).json({
            success: true,
            count: opportunities.length,
            opportunities
        });

    } catch (error) {
        console.error("Error fetching organizer opportunities:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch your opportunities"
        });
    }
}

// Publish a draft opportunity created by the logged-in organizer
async function publishOpportunity(req, res) {
    try {
        const opportunity_id = Number(req.params.id);
        const organizer_id = req.user.user_id;

        if (!Number.isInteger(opportunity_id) || opportunity_id <= 0) {
            return res.status(400).json({
                success: false,
                message: "A valid opportunity ID is required"
            });
        }

        const [opportunities] = await pool.query(
            `SELECT opportunity_id, status
             FROM opportunities
             WHERE opportunity_id = ?
               AND created_by = ?`,
            [opportunity_id, organizer_id]
        );

        if (opportunities.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Opportunity not found or you do not own it"
            });
        }

        if (opportunities[0].status !== "DRAFT") {
            return res.status(409).json({
                success: false,
                message: "Only draft opportunities can be published"
            });
        }

        await pool.query(
            `UPDATE opportunities
             SET status = 'PUBLISHED'
             WHERE opportunity_id = ?
               AND created_by = ?`,
            [opportunity_id, organizer_id]
        );

        return res.status(200).json({
            success: true,
            message: "Opportunity published successfully",
            opportunity_id
        });

    } catch (error) {
        console.error("Publish opportunity error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to publish opportunity"
        });
    }
}

module.exports = {
    getAllOpportunities,
    getMyOpportunities,
    publishOpportunity
};
