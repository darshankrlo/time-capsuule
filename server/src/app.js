import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: env.clientUrl }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// routes will be added here

app.use(notFound);
app.use(errorHandler);

export default app;