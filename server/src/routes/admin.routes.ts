import { Router } from "express";
import { demoReset } from "../controllers/admin.controller";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";

export const adminRouter = Router();

adminRouter.post("/demo-reset", requireAuth, requireRole("ADMIN"), demoReset);
