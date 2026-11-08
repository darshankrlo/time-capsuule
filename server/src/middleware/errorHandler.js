export class AppError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function notFound(req, res, next) {
  next(new AppError(404, "NOT_FOUND", `Route ${req.method} ${req.originalUrl} not found`));
}

export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const code = err.code || "INTERNAL_ERROR";

  if (status === 500) console.error(err);

  res.status(status).json({
    error: {
      code,
      message: status === 500 ? "Something went wrong" : err.message,
    },
  });
}