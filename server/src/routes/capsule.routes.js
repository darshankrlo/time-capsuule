import { Router } from "express";
import { z } from "zod";
import {
  createCapsule,
  listCapsules,
  getCapsule,
  updateCapsule,
  deleteCapsule,
} from "../controllers/capsule.controller.js";
import { auth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { upload } from "../middleware/upload.js";
import { createCapsuleLimiter } from "../middleware/rateLimit.js";

const router = Router();

const futureDate = z.coerce
  .date()
  .refine((d) => d > new Date(), { message: "must be in the future" });

const createSchema = z.object({
  title: z.string().trim().min(1).max(150),
  content: z.string().trim().min(20).max(10000),
  unlockAt: futureDate,
});

const updateSchema = z.object({
  title: z.string().trim().min(1).max(150).optional(),
  content: z.string().trim().min(20).max(10000).optional(),
  unlockAt: futureDate.optional(),
});

router.use(auth);

router.get("/", listCapsules);
router.post("/", createCapsuleLimiter, upload, validate(createSchema), createCapsule);
router.get("/:id", getCapsule);
router.put("/:id", validate(updateSchema), updateCapsule);
router.delete("/:id", deleteCapsule);

export default router;