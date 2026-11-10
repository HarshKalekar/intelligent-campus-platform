
const { pool } = require("../config/mysql");

// Get the logged-in student's profile
async function getStudentProfile(req, res) {
    try {
        const userId = req.user.user_id;

        const [rows] = await pool.query(
            `SELECT
                u.user_id,
                u.full_name,
                u.email,
                sp.srn,
                sp.department,
                sp.academic_year,
                sp.graduation_year,
                sp.bio
             FROM users u
             LEFT JOIN student_profiles sp
                ON u.user_id = sp.user_id
             WHERE u.user_id = ?`,
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        return res.status(200).json({
            success: true,
            profile: rows[0]
        });
    } catch (error) {
        console.error("Get student profile error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch student profile"
        });
    }
}

// Create or update the logged-in student's profile
async function updateStudentProfile(req, res) {
    try {
        const userId = req.user.user_id;

        const {
            srn,
            department,
            academic_year,
            graduation_year,
            bio
        } = req.body;

        if (!srn || !srn.trim()) {
            return res.status(400).json({
                success: false,
                message: "SRN is required"
            });
        }

        await pool.query(
            `INSERT INTO student_profiles
                (user_id, srn, department, academic_year, graduation_year, bio)
             VALUES (?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
                srn = VALUES(srn),
                department = VALUES(department),
                academic_year = VALUES(academic_year),
                graduation_year = VALUES(graduation_year),
                bio = VALUES(bio)`,
            [
                userId,
                srn.trim(),
                department || null,
                academic_year || null,
                graduation_year || null,
                bio || null
            ]
        );

        return res.status(200).json({
            success: true,
            message: "Student profile updated successfully"
        });
    } catch (error) {
        console.error("Update student profile error:", error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "This SRN is already registered"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to update student profile"
        });
    }
}

// Get all available skills and the logged-in student's selected skills
async function getStudentSkills(req, res) {
    try {
        const userId = req.user.user_id;

        const [allSkills] = await pool.query(
            `SELECT skill_id, skill_name
             FROM skills
             ORDER BY skill_name`
        );

        const [mySkills] = await pool.query(
            `SELECT 
                s.skill_id,
                s.skill_name,
                ss.proficiency
             FROM student_skills ss
             JOIN skills s ON ss.skill_id = s.skill_id
             WHERE ss.user_id = ?
             ORDER BY s.skill_name`,
            [userId]
        );

        return res.status(200).json({
            success: true,
            availableSkills: allSkills,
            mySkills
        });
    } catch (error) {
        console.error("Get student skills error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch student skills"
        });
    }
}


// Replace the logged-in student's selected skills
async function updateStudentSkills(req, res) {
    const userId = req.user.user_id;
    const { skills } = req.body;

    const validProficiencies = [
        "BEGINNER",
        "INTERMEDIATE",
        "ADVANCED"
    ];

    if (!Array.isArray(skills)) {
        return res.status(400).json({
            success: false,
            message: "Skills must be an array"
        });
    }

    for (const skill of skills) {
        if (
            !Number.isInteger(Number(skill.skill_id)) ||
            Number(skill.skill_id) <= 0 ||
            !validProficiencies.includes(skill.proficiency)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid skill ID or proficiency level"
            });
        }
    }

    const skillIds = skills.map(skill => Number(skill.skill_id));

    if (new Set(skillIds).size !== skillIds.length) {
        return res.status(400).json({
            success: false,
            message: "Duplicate skills are not allowed"
        });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        if (skillIds.length > 0) {
            const placeholders = skillIds.map(() => "?").join(",");

            const [existingSkills] = await connection.query(
                `SELECT skill_id FROM skills
                 WHERE skill_id IN (${placeholders})`,
                skillIds
            );

            if (existingSkills.length !== skillIds.length) {
                await connection.rollback();

                return res.status(400).json({
                    success: false,
                    message: "One or more selected skills do not exist"
                });
            }
        }

        await connection.query(
            "DELETE FROM student_skills WHERE user_id = ?",
            [userId]
        );

        if (skills.length > 0) {
            const values = skills.map(skill => [
                userId,
                Number(skill.skill_id),
                skill.proficiency
            ]);

            await connection.query(
                `INSERT INTO student_skills
                    (user_id, skill_id, proficiency)
                 VALUES ?`,
                [values]
            );
        }

        await connection.commit();

        return res.status(200).json({
            success: true,
            message: "Student skills updated successfully"
        });
    } catch (error) {
        await connection.rollback();

        console.error("Update student skills error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update student skills"
        });
    } finally {
        connection.release();
    }
}

// Get personalized opportunity recommendations
async function getRecommendedOpportunities(req, res) {
    try {
        const userId = req.user.user_id;

        const [recommendations] = await pool.query(
            `SELECT
                o.opportunity_id,
                o.title,
                o.description,
                o.opportunity_type,
                o.location,
                o.application_deadline,
                c.category_name,

                COUNT(DISTINCT os.skill_id) AS total_required_skills,

                COUNT(DISTINCT ss.skill_id) AS matching_skills,

                CASE
                    WHEN COUNT(DISTINCT os.skill_id) = 0 THEN 0
                    ELSE ROUND(
                        COUNT(DISTINCT ss.skill_id) * 100.0 /
                        COUNT(DISTINCT os.skill_id),
                        2
                    )
                END AS match_percentage

            FROM opportunities o

            JOIN categories c
                ON o.category_id = c.category_id

            LEFT JOIN opportunity_skills os
                ON o.opportunity_id = os.opportunity_id

            LEFT JOIN student_skills ss
                ON os.skill_id = ss.skill_id
                AND ss.user_id = ?

            WHERE o.status = 'PUBLISHED'

            GROUP BY
                o.opportunity_id,
                o.title,
                o.description,
                o.opportunity_type,
                o.location,
                o.application_deadline,
                c.category_name

            ORDER BY
                match_percentage DESC,
                o.created_at DESC`,
            [userId]
        );

        return res.status(200).json({
            success: true,
            count: recommendations.length,
            recommendations
        });

    } catch (error) {
        console.error("Get recommendations error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to generate recommendations"
        });
    }
}

module.exports = {
    getStudentProfile,
    updateStudentProfile,
    getStudentSkills,
    updateStudentSkills,
    getRecommendedOpportunities
};
