import { AppError } from "./errorHandler.js";

export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const message = result.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join(", ");
    return next(new AppError(400, "VALIDATION_ERROR", message));
  }
  req.body = result.data;
  next();
};