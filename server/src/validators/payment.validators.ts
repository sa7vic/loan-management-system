import { z } from "zod";

export const createPaymentSchema = z.object({
  loanId: z.string().min(1),
  utrNumber: z.string().min(6).max(50),
  amount: z.number().min(1),
  paidAt: z.preprocess((value) => {
    if (value instanceof Date) return value;
    if (typeof value === "string" || typeof value === "number") {
      const parsed = new Date(value);
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }
    return value;
  }, z.date()),
});

export const listPaymentsSchema = z.object({
  loanId: z.string().min(1),
});
