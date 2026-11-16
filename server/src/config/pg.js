import pg from "pg";
import { env } from "./env.js";

export const pool = new pg.Pool({
  connectionString: env.databaseUrl,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
  keepAlive: true,
});

// Without this handler, a dropped idle connection crashes the whole server
pool.on("error", (err) => {
  console.error("Idle Postgres client error:", err.message);
});

export const query = (text, params) => pool.query(text, params);

export async function connectPg() {
  await pool.query("SELECT 1");
  console.log("PostgreSQL connected");
}