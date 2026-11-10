
require("dotenv").config();

const { testMySQLConnection } = require("./config/mysql");
const connectMongoDB = require("./config/mongodb");

async function testConnections() {
    console.log("Testing database connections...\n");

    await testMySQLConnection();

    await connectMongoDB();

    console.log("\nConnection testing completed.");
    process.exit(0);
}

testConnections();
