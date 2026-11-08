import rateLimit from "express-rate-limit";

const tooMany = {
  error: { code: "RATE_LIMITED", message: "Too many requests, try again later" },
};

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: tooMany,
  standardHeaders: true,
  legacyHeaders: false,
});

export const createCapsuleLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  message: tooMany,
  standardHeaders: true,
  legacyHeaders: false,
});