import app from "./src/app.js";
import { env } from "./src/config/env.js";
import { connectPg } from "./src/config/pg.js";
import { connectMongo } from "./src/config/mongo.js";

async function start() {
  await connectPg();
  await connectMongo();
  app.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err.message);
  process.exit(1);
});