import type { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { Loan } from "../models/Loan";
import { User } from "../models/User";
import { LOAN_STATUS, type LoanStatus } from "../constants/loanStatus";
import {
  applyLoanSchema,
  breCheckSchema,
  disburseSchema,
  personalDetailsSchema,
  sanctionSchema,
} from "../validators/loan.validators";
import { badRequest, notFound } from "../utils/http";
import { calculateSimpleInterest, calculateTotalRepayment } from "../utils/loanMath";
import { uploadDir } from "../utils/upload";

function serializeLoan(loan: any) {
  return {
    id: String(loan._id),
    borrowerId: String(loan.borrowerId),
    personalDetailsSnapshot: loan.personalDetailsSnapshot,
    salarySlip: loan.salarySlip,
    principal: loan.principal,
    tenureDays: loan.tenureDays,
    annualInterestRate: loan.annualInterestRate,
    simpleInterest: loan.simpleInterest,
    totalRepayment: loan.totalRepayment,
    status: loan.status,
    sanctionedBy: loan.sanctionedBy ? String(loan.sanctionedBy) : undefined,
    sanctionedAt: loan.sanctionedAt,
    rejectedBy: loan.rejectedBy ? String(loan.rejectedBy) : undefined,
    rejectedAt: loan.rejectedAt,
    rejectionReason: loan.rejectionReason,
    disbursedBy: loan.disbursedBy ? String(loan.disbursedBy) : undefined,
    disbursedAt: loan.disbursedAt,
    disbursementUtr: loan.disbursementUtr,
    closedAt: loan.closedAt,
    totalPaid: loan.totalPaid,
    outstanding: loan.outstanding,
    createdAt: loan.createdAt,
    updatedAt: loan.updatedAt,
  };
}

function calculateAge(dob: Date) {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age;
}

function runBre(details: zodInfer<typeof personalDetailsSchema>) {
  const errors: string[] = [];
  const age = calculateAge(details.dob);
  if (age < 23 || age > 50) errors.push("Age must be between 23 and 50");
  if (details.monthlySalary < 25000) errors.push("Monthly salary must be at least 25000");
  if (details.employmentMode.toLowerCase() === "unemployed") {
    errors.push("Employment mode cannot be Unemployed");
  }
  return errors;
}

type zodInfer<T> = T extends { _output: infer Out } ? Out : never;

export async function breCheck(req: Request, res: Response) {
  const parsed = breCheckSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Validation error", issues: parsed.error.issues });
  }

  const errors = runBre(parsed.data);
  if (errors.length > 0) {
    return res.status(400).json({ message: "BRE failed", errors });
  }

  return res.json({ ok: true });
}

export async function uploadSalarySlip(req: Request, res: Response) {
  if (!req.file) throw badRequest("Missing salary slip file");

  const file = req.file;
  return res.status(201).json({
    salarySlip: {
      originalName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      storage: "LOCAL",
      pathOrKey: file.filename,
      uploadedAt: new Date(),
      url: `/uploads/${file.filename}`,
    },
  });
}

export async function applyLoan(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  const parsed = applyLoanSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Validation error", issues: parsed.error.issues });
  }

  const { personalDetails, principal, tenureDays, annualInterestRate, salarySlip } = parsed.data;
  const breErrors = runBre(personalDetails);
  if (breErrors.length > 0) {
    return res.status(400).json({ message: "BRE failed", errors: breErrors });
  }

  const basename = path.basename(salarySlip.pathOrKey);
  if (basename !== salarySlip.pathOrKey) {
    throw badRequest("Invalid salary slip reference");
  }

  const slipPath = path.join(uploadDir, basename);
  if (!fs.existsSync(slipPath)) {
    throw badRequest("Salary slip file not found");
  }

  const rate = annualInterestRate ?? 12;
  const simpleInterest = calculateSimpleInterest(principal, rate, tenureDays);
  const totalRepayment = calculateTotalRepayment(principal, simpleInterest);

  const loan = await Loan.create({
    borrowerId: req.user.id,
    personalDetailsSnapshot: personalDetails,
    salarySlip,
    principal,
    tenureDays,
    annualInterestRate: rate,
    simpleInterest,
    totalRepayment,
    status: "APPLIED",
    totalPaid: 0,
    outstanding: totalRepayment,
  });

  await User.findByIdAndUpdate(req.user.id, {
    $set: {
      fullName: personalDetails.fullName,
      pan: personalDetails.pan,
      dob: personalDetails.dob,
      monthlySalary: personalDetails.monthlySalary,
      employmentMode: personalDetails.employmentMode,
    },
  });

  return res.status(201).json({ loan: serializeLoan(loan) });
}

export async function listMyLoans(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  const loans = await Loan.find({ borrowerId: req.user.id }).sort({ createdAt: -1 }).lean();
  return res.json({ loans: loans.map(serializeLoan) });
}

export async function listLoans(req: Request, res: Response) {
  const status = (req.query.status as string | undefined) ?? undefined;
  const query: Record<string, unknown> = {};
  if (status) {
    if (!LOAN_STATUS.includes(status as LoanStatus)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    query.status = status;
  }

  const loans = await Loan.find(query).sort({ createdAt: -1 }).lean();
  return res.json({ loans: loans.map(serializeLoan) });
}

export async function listLeads(_req: Request, res: Response) {
  const borrowerIds = await Loan.distinct("borrowerId");
  const leads = await User.find({ role: "BORROWER", _id: { $nin: borrowerIds } })
    .select("fullName email phone createdAt")
    .sort({ createdAt: -1 })
    .lean();

  return res.json({ leads });
}

export async function sanctionLoan(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  const parsed = sanctionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Validation error", issues: parsed.error.issues });
  }

  const loan = await Loan.findById(req.params.loanId);
  if (!loan) throw notFound("Loan not found");
  if (loan.status !== "APPLIED") {
    return res.status(400).json({ message: "Only APPLIED loans can be sanctioned" });
  }

  if (parsed.data.action === "REJECT") {
    if (!parsed.data.reason) return res.status(400).json({ message: "Rejection reason required" });
    loan.status = "REJECTED";
    loan.rejectedBy = req.user.id as any;
    loan.rejectedAt = new Date();
    loan.rejectionReason = parsed.data.reason;
  } else {
    loan.status = "SANCTIONED";
    loan.sanctionedBy = req.user.id as any;
    loan.sanctionedAt = new Date();
  }

  await loan.save();
  return res.json({ loan: serializeLoan(loan) });
}

export async function disburseLoan(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  const parsed = disburseSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Validation error", issues: parsed.error.issues });
  }

  const loan = await Loan.findById(req.params.loanId);
  if (!loan) throw notFound("Loan not found");
  if (loan.status !== "SANCTIONED") {
    return res.status(400).json({ message: "Only SANCTIONED loans can be disbursed" });
  }

  loan.status = "DISBURSED";
  loan.disbursedBy = req.user.id as any;
  loan.disbursedAt = new Date();
  loan.disbursementUtr = parsed.data.utr;

  await loan.save();
  return res.json({ loan: serializeLoan(loan) });
}
