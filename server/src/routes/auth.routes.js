import { Router } from "express";
import { z } from "zod";
import { register, login, me } from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.js";
import { auth } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimit.js";

const router = Router();

const registerSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(100),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);
router.get("/me", auth, me);

export default router;