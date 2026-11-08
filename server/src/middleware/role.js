import { AppError } from "./errorHandler.js";

export const requireRole = (role) => (req, res, next) => {
  if (!req.user || req.user.role !== role) {
    return next(new AppError(403, "FORBIDDEN", "You do not have access to this resource"));
  }
  next();
};