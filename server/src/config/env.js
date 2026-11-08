import dotenv from "dotenv";

dotenv.config();

const required = ["DATABASE_URL", "MONGO_URI", "JWT_SECRET"];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  port: process.env.PORT || 5000,
  databaseUrl: process.env.DATABASE_URL,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  llmApiKey: process.env.LLM_API_KEY,
  emailApiKey: process.env.EMAIL_API_KEY,
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
};