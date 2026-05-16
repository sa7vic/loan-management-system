import { z } from "zod";

export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

const dateSchema = z.preprocess((value) => {
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return value;
}, z.date());

export const personalDetailsSchema = z.object({
  fullName: z.string().min(2).max(120),
  pan: z.string().regex(PAN_REGEX),
  dob: dateSchema,
  monthlySalary: z.number().min(0),
  employmentMode: z.string().min(2).max(40),
});

export const breCheckSchema = personalDetailsSchema;

export const loanDocumentSchema = z.object({
  originalName: z.string().min(1),
  mimeType: z.string().min(1),
  sizeBytes: z.number().min(1),
  storage: z.enum(["LOCAL", "S3"]),
  pathOrKey: z.string().min(1),
});

export const applyLoanSchema = z.object({
  principal: z.number().min(50000).max(500000),
  tenureDays: z.number().min(30).max(365),
  annualInterestRate: z.number().min(0).max(100).optional(),
  personalDetails: personalDetailsSchema,
  salarySlip: loanDocumentSchema,
});

export const sanctionSchema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
  reason: z.string().min(3).max(500).optional(),
});

export const disburseSchema = z.object({
  utr: z.string().min(6).max(50),
});
