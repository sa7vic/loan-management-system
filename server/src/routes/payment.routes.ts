import { Router } from "express";
import { createPayment, listPayments } from "../controllers/payment.controller";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";

export const paymentRouter = Router();

paymentRouter.post(
	"/",
	requireAuth,
	requireRole("COLLECTION", "ADMIN"),
	createPayment
);
paymentRouter.get(
	"/",
	requireAuth,
	requireRole("BORROWER", "COLLECTION", "ADMIN"),
	listPayments
);
