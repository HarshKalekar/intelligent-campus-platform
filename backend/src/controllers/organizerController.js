
const { pool } = require("../config/mysql");

const allowedTypes = [
    "INTERNSHIP",
    "HACKATHON",
    "WORKSHOP",
    "COMPETITION",
    "RESEARCH",
    "OTHER"
];

// Create opportunity
async function createOpportunity(req, res) {
    try {
        const {
            title,
            description,
            category_id,
            opportunity_type,
            location,
            application_deadline
        } = req.body || {};

        if (!title?.trim() || !description?.trim() ||
            !category_id || !opportunity_type) {
            return res.status(400).json({
                success: false,
                message: "Title, description, category and opportunity type are required"
            });
        }

        if (!allowedTypes.includes(opportunity_type)) {
            return res.status(400).json({
                success: false,
                message: "Invalid opportunity type"
            });
        }

        const [categories] = await pool.query(
            "SELECT category_id FROM categories WHERE category_id = ?",
            [category_id]
        );

        if (!categories.length) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        const [result] = await pool.query(
            `INSERT INTO opportunities
            (title, description, category_id, created_by,
             opportunity_type, location, application_deadline, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'DRAFT')`,
            [
                title.trim(),
                description.trim(),
                category_id,
                req.user.user_id,
                opportunity_type,
                location || null,
                application_deadline || null
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Opportunity created successfully",
            opportunity_id: result.insertId
        });

    } catch (error) {
        console.error("Create opportunity error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create opportunity"
        });
    }
}

// View organizer's opportunities
async function getMyOpportunities(req, res) {
    try {
        const [opportunities] = await pool.query(
            `SELECT o.*, c.category_name
             FROM opportunities o
             JOIN categories c ON o.category_id = c.category_id
             WHERE o.created_by = ?
             ORDER BY o.created_at DESC`,
            [req.user.user_id]
        );

        return res.status(200).json({
            success: true,
            count: opportunities.length,
            opportunities
        });

    } catch (error) {
        console.error("Get opportunities error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch opportunities"
        });
    }
}

// Publish an opportunity
async function publishOpportunity(req, res) {
    try {
        const opportunityId = Number(req.params.id);

        if (!Number.isInteger(opportunityId) || opportunityId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid opportunity ID"
            });
        }

        const [rows] = await pool.query(
            `SELECT opportunity_id, status, application_deadline
             FROM opportunities
             WHERE opportunity_id = ? AND created_by = ?`,
            [opportunityId, req.user.user_id]
        );

        if (!rows.length) {
            return res.status(404).json({
                success: false,
                message: "Opportunity not found or not owned by you"
            });
        }

        if (rows[0].status !== "DRAFT") {
            return res.status(409).json({
                success: false,
                message: "Only draft opportunities can be published"
            });
        }

        if (
            rows[0].application_deadline &&
            new Date(rows[0].application_deadline) <= new Date()
        ) {
            return res.status(400).json({
                success: false,
                message: "Cannot publish an opportunity with an expired deadline"
            });
        }

        await pool.query(
            `UPDATE opportunities
             SET status = 'PUBLISHED'
             WHERE opportunity_id = ? AND created_by = ?`,
            [opportunityId, req.user.user_id]
        );

        return res.status(200).json({
            success: true,
            message: "Opportunity published successfully",
            opportunity_id: opportunityId
        });

    } catch (error) {
        console.error("Publish error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to publish opportunity"
        });
    }
}

// Update an opportunity
async function updateOpportunity(req, res) {
    try {
        const opportunityId = Number(req.params.id);
        const {
            title,
            description,
            category_id,
            opportunity_type,
            location,
            application_deadline
        } = req.body || {};

        if (!Number.isInteger(opportunityId) || opportunityId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid opportunity ID"
            });
        }

        if (!title?.trim() || !description?.trim() ||
            !category_id || !opportunity_type) {
            return res.status(400).json({
                success: false,
                message: "Title, description, category and opportunity type are required"
            });
        }

        if (!allowedTypes.includes(opportunity_type)) {
            return res.status(400).json({
                success: false,
                message: "Invalid opportunity type"
            });
        }

        const [owned] = await pool.query(
            `SELECT opportunity_id FROM opportunities
             WHERE opportunity_id = ? AND created_by = ?`,
            [opportunityId, req.user.user_id]
        );

        if (!owned.length) {
            return res.status(404).json({
                success: false,
                message: "Opportunity not found or not owned by you"
            });
        }

        const [categories] = await pool.query(
            "SELECT category_id FROM categories WHERE category_id = ?",
            [category_id]
        );

        if (!categories.length) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        await pool.query(
            `UPDATE opportunities
             SET title = ?, description = ?, category_id = ?,
                 opportunity_type = ?, location = ?,
                 application_deadline = ?
             WHERE opportunity_id = ? AND created_by = ?`,
            [
                title.trim(),
                description.trim(),
                category_id,
                opportunity_type,
                location || null,
                application_deadline || null,
                opportunityId,
                req.user.user_id
            ]
        );

        return res.status(200).json({
            success: true,
            message: "Opportunity updated successfully",
            opportunity_id: opportunityId
        });

    } catch (error) {
        console.error("Update error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update opportunity"
        });
    }
}

// Delete a draft opportunity
async function deleteOpportunity(req, res) {
    try {
        const opportunityId = Number(req.params.id);

        if (!Number.isInteger(opportunityId) || opportunityId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid opportunity ID"
            });
        }

        const [result] = await pool.query(
            `DELETE FROM opportunities
             WHERE opportunity_id = ?
             AND created_by = ?
             AND status = 'DRAFT'`,
            [opportunityId, req.user.user_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Draft opportunity not found or not owned by you"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Draft opportunity deleted successfully",
            opportunity_id: opportunityId
        });

    } catch (error) {
        console.error("Delete error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete opportunity"
        });
    }
}

// View applicants for the organizer's opportunities
async function getOpportunityApplicants(req, res) {
    try {
        const [applicants] = await pool.query(
            `SELECT
                a.application_id,
                a.application_status AS status,
                a.applied_at,
                u.user_id AS student_id,
                u.full_name,
                u.email,
                o.opportunity_id,
                o.title AS opportunity_title
             FROM applications a
             JOIN users u
                ON a.student_id = u.user_id
             JOIN opportunities o
                ON a.opportunity_id = o.opportunity_id
             WHERE o.created_by = ?
             ORDER BY a.applied_at DESC`,
            [req.user.user_id]
        );

        return res.status(200).json({
            success: true,
            count: applicants.length,
            applicants
        });
    } catch (error) {
        console.error("Get applicants error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch applicants"
        });
    }
}

// Update the status of a student application
async function updateApplicationStatus(req, res) {
    try {
        const { applicationId } = req.params;
        const { status } = req.body;

        const allowedStatuses = [
            "SHORTLISTED",
            "ACCEPTED",
            "REJECTED"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid application status"
            });
        }

        // Verify that this application belongs to the organizer
        const [applications] = await pool.query(
            `SELECT a.application_id
             FROM applications a
             JOIN opportunities o
                ON a.opportunity_id = o.opportunity_id
             WHERE a.application_id = ?
             AND o.created_by = ?`,
            [applicationId, req.user.user_id]
        );

        if (applications.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Application not found"
            });
        }

        // Update application status
        await pool.query(
            `UPDATE applications
             SET application_status = ?
             WHERE application_id = ?`,
            [status, applicationId]
        );

        return res.status(200).json({
            success: true,
            message: "Application status updated successfully",
            status
        });

    } catch (error) {
        console.error("Update application status error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update application status"
        });
    }
}

module.exports = {
    createOpportunity,
    getMyOpportunities,
    getOpportunityApplicants,
    updateApplicationStatus,
    publishOpportunity,
    updateOpportunity,
    deleteOpportunity
};
