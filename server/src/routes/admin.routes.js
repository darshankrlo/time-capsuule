import { Router } from "express";
import { getStats } from "../controllers/admin.controller.js";
import { auth } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";

const router = Router();

router.get("/stats", auth, requireRole("admin"), getStats);

export default router;