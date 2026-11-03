import sequelize from "./database.js";

async function connectDatabase() {
  try {
    await sequelize.authenticate();
    console.log("Database connection established successfully.");

    await sequelize.sync();
    console.log("All tables synchronized successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error.message);
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("SQL:", error.sql);
    console.error("Database error:", error.original?.sqlMessage);

    process.exit(1);
  }
}

export default connectDatabase;
