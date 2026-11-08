import pg from "pg";
import { env } from "./env.js";

export const pool = new pg.Pool({
  connectionString: env.databaseUrl,
  ssl: { rejectUnauthorized: false },
});

export const query = (text, params) => pool.query(text, params);

export async function connectPg() {
  await pool.query("SELECT 1");
  console.log("PostgreSQL connected");
}