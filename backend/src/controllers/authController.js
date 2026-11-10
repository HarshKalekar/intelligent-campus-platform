
const { pool } = require("../config/mysql");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTER
async function register(req, res) {
    let connection;
    let transactionStarted = false;

    try {
        const {
            full_name,
            email,
            password,
            role,
            srn,
            department,
            academic_year,
            graduation_year,
            bio,
            organization_name,
            organization_type,
            description
        } = req.body || {};

        // Basic validation
        if (!full_name || !email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: "Full name, email, password and role are required"
            });
        }

        const normalizedName = full_name.trim();
        const normalizedEmail = email.trim().toLowerCase();
        const normalizedRole = role.trim().toUpperCase();

        if (!normalizedName || !normalizedEmail) {
            return res.status(400).json({
                success: false,
                message: "Name and email cannot be empty"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 8 characters"
            });
        }

        if (!["STUDENT", "ORGANIZER"].includes(normalizedRole)) {
            return res.status(400).json({
                success: false,
                message: "Invalid registration role"
            });
        }

        // Role-specific validation
        if (normalizedRole === "STUDENT" && !srn?.trim()) {
            return res.status(400).json({
                success: false,
                message: "SRN is required for student registration"
            });
        }

        if (normalizedRole === "ORGANIZER" && !organization_name?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Organization name is required"
            });
        }

        connection = await pool.getConnection();

        const [existingUsers] = await connection.query(
            "SELECT user_id FROM users WHERE email = ?",
            [normalizedEmail]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        const [roles] = await connection.query(
            "SELECT role_id FROM roles WHERE role_name = ?",
            [normalizedRole]
        );

        if (roles.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Role does not exist"
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        // Begin transaction
        await connection.beginTransaction();
        transactionStarted = true;

        // 1. Create user
        const [userResult] = await connection.query(
            `INSERT INTO users
                (full_name, email, password_hash)
             VALUES (?, ?, ?)`,
            [normalizedName, normalizedEmail, passwordHash]
        );

        const userId = userResult.insertId;

        // 2. Assign role
        await connection.query(
            `INSERT INTO user_roles (user_id, role_id)
             VALUES (?, ?)`,
            [userId, roles[0].role_id]
        );

        // 3. Create the corresponding profile
        if (normalizedRole === "STUDENT") {
            await connection.query(
                `INSERT INTO student_profiles
                    (user_id, srn, department, academic_year,
                     graduation_year, bio)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    userId,
                    srn.trim().toUpperCase(),
                    department?.trim() || null,
                    academic_year || null,
                    graduation_year || null,
                    bio?.trim() || null
                ]
            );
        }

        if (normalizedRole === "ORGANIZER") {
            await connection.query(
                `INSERT INTO organizer_profiles
                    (user_id, organization_name,
                     organization_type, description)
                 VALUES (?, ?, ?, ?)`,
                [
                    userId,
                    organization_name.trim(),
                    organization_type?.trim() || null,
                    description?.trim() || null
                ]
            );
        }

        // Commit only after every insert succeeds
        await connection.commit();
        transactionStarted = false;

        return res.status(201).json({
            success: true,
            message: "Registration successful",
            user: {
                user_id: userId,
                full_name: normalizedName,
                email: normalizedEmail,
                role: normalizedRole
            }
        });

    } catch (error) {
        if (connection && transactionStarted) {
            await connection.rollback();
        }

        console.error("Registration error:", error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "Email or SRN is already registered"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Registration failed"
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
}

// LOGIN
async function login(req, res) {
    try {
        const { email, password } = req.body || {};

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const [users] = await pool.query(
            `SELECT
                u.user_id,
                u.full_name,
                u.email,
                u.password_hash,
                u.is_active,
                r.role_name
             FROM users u
             JOIN user_roles ur ON u.user_id = ur.user_id
             JOIN roles r ON ur.role_id = r.role_id
             WHERE u.email = ?
             LIMIT 1`,
            [email.trim().toLowerCase()]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const user = users[0];

        if (!user.is_active) {
            return res.status(403).json({
                success: false,
                message: "Account is inactive"
            });
        }

        const passwordMatches = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatches) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not configured");
        }

        const token = jwt.sign(
            {
                user_id: user.user_id,
                role: user.role_name
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || "1d"
            }
        );

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                user_id: user.user_id,
                full_name: user.full_name,
                email: user.email,
                role: user.role_name
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            success: false,
            message: "Login failed"
        });
    }
}

module.exports = { register, login };
