import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "./errorHandler.js";

export function auth(req, res, next) {
  const [scheme, token] = (req.headers.authorization || "").split(" ");

  if (scheme !== "Bearer" || !token) {
    return next(new AppError(401, "UNAUTHORIZED", "Missing or malformed token"));
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch {
    next(new AppError(401, "INVALID_TOKEN", "Invalid or expired token"));
  }
}