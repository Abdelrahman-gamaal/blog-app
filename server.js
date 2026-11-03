import "dotenv/config";
import app from "./src/app.js";
import env from "./src/config/env.js";
import sequelize from "./src/config/database.js";
import "./src/models/index.js";
import "./src/models/associations.js";

import connectDatabase from "./src/config/connectDatabase.js";

await connectDatabase();

app.listen(env.port, () => {
  console.log(`Server running on port ${env.port}`);
  console.log(`Environment: ${env.nodeEnv}`);
});
