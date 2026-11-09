import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/auth.routes.js";
import capsuleRoutes from "./routes/capsule.routes.js";
import adminRoutes from "./routes/admin.routes.js";

const app = express();
app.set("trust proxy", 1);

app.use(helmet());
app.use(cors({ origin: env.clientUrl }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/capsules", capsuleRoutes);
app.use("/api/admin", adminRoutes);
// routes will be added here

app.use(notFound);
app.use(errorHandler);

export default app;