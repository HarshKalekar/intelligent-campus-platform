
require("dotenv").config();

const express = require("express");
const categoryRoutes = require("./routes/categoryRoutes");
const cors = require("cors");

const { testMySQLConnection } = require("./config/mysql");
const connectMongoDB = require("./config/mongodb");

const opportunityRoutes = require("./routes/opportunityRoutes");
const authRoutes = require("./routes/authRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const organizerRoutes = require("./routes/organizerRoutes");
const studentRoutes = require("./routes/studentRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/opportunities", opportunityRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/organizer", organizerRoutes);
app.use("/api/student", studentRoutes);

// Home route
app.get("/", (req, res) => {
    res.json({
        message: "Intelligent Campus Platform API is running!",
        status: "success"
    });
});

// Health check
app.get("/api/health", (req, res) => {
    res.json({
        server: "running",
        databases: {
            mysql: "configured",
            mongodb: "configured"
        }
    });
});

// Start server
const PORT = process.env.PORT || 5001;

async function startServer() {
    try {
        await testMySQLConnection();
        await connectMongoDB();

        app.listen(PORT, () => {
            console.log(`\nServer running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Server startup failed:", error);
        process.exit(1);
    }
}

startServer();
