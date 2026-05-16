import { Router } from "express";
import {
	applyLoan,
	breCheck,
	disburseLoan,
	listLeads,
	listLoans,
	listMyLoans,
	sanctionLoan,
	uploadSalarySlip,
} from "../controllers/loan.controller";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { salarySlipUpload } from "../utils/upload";

export const loanRouter = Router();

loanRouter.post("/bre-check", requireAuth, requireRole("BORROWER", "ADMIN"), breCheck);
loanRouter.post(
	"/upload-salary-slip",
	requireAuth,
	requireRole("BORROWER", "ADMIN"),
	salarySlipUpload.single("file"),
	uploadSalarySlip
);
loanRouter.post("/apply", requireAuth, requireRole("BORROWER", "ADMIN"), applyLoan);
loanRouter.get("/mine", requireAuth, requireRole("BORROWER", "ADMIN"), listMyLoans);

loanRouter.get("/leads", requireAuth, requireRole("SALES", "ADMIN"), listLeads);
loanRouter.get(
	"/",
	requireAuth,
	requireRole("ADMIN", "SANCTION", "DISBURSEMENT", "COLLECTION"),
	listLoans
);
loanRouter.post(
	"/:loanId/sanction",
	requireAuth,
	requireRole("SANCTION", "ADMIN"),
	sanctionLoan
);
loanRouter.post(
	"/:loanId/disburse",
	requireAuth,
	requireRole("DISBURSEMENT", "ADMIN"),
	disburseLoan
);
