import mongoose from "mongoose";
import { connectPg, pool } from "../config/pg.js";
import { connectMongo } from "../config/mongo.js";
import { unlockDueCapsules } from "./unlock.job.js";

await connectPg();
await connectMongo();
await unlockDueCapsules();
await pool.end();
await mongoose.disconnect();