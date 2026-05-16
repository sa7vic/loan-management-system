import type { Request, Response } from "express";
import { Payment } from "../models/Payment";
import { Loan } from "../models/Loan";
import { createPaymentSchema, listPaymentsSchema } from "../validators/payment.validators";
import { badRequest, notFound } from "../utils/http";
import { roundMoney } from "../utils/loanMath";

function serializePayment(payment: any) {
  return {
    id: String(payment._id),
    loanId: String(payment.loanId),
    borrowerId: String(payment.borrowerId),
    utrNumber: payment.utrNumber,
    amount: payment.amount,
    paidAt: payment.paidAt,
    recordedBy: String(payment.recordedBy),
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
  };
}

export async function createPayment(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  const parsed = createPaymentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Validation error", issues: parsed.error.issues });
  }

  const { loanId, utrNumber, amount, paidAt } = parsed.data;

  const existingUtr = await Payment.findOne({ utrNumber }).lean();
  if (existingUtr) return res.status(400).json({ message: "UTR already exists" });

  const loan = await Loan.findById(loanId);
  if (!loan) throw notFound("Loan not found");
  if (loan.status !== "DISBURSED") {
    return res.status(400).json({ message: "Payments allowed only for DISBURSED loans" });
  }

  if (amount > loan.outstanding) {
    throw badRequest("Payment amount exceeds outstanding");
  }

  const payment = await Payment.create({
    loanId: loan._id,
    borrowerId: loan.borrowerId,
    utrNumber,
    amount,
    paidAt,
    recordedBy: req.user.id,
  });

  const nextTotalPaid = roundMoney(loan.totalPaid + amount);
  const cappedTotalPaid = Math.min(nextTotalPaid, loan.totalRepayment);
  const nextOutstanding = roundMoney(loan.totalRepayment - cappedTotalPaid);

  loan.totalPaid = cappedTotalPaid;
  loan.outstanding = Math.max(0, nextOutstanding);

  if (loan.outstanding <= 0) {
    loan.status = "CLOSED";
    loan.closedAt = new Date();
  }

  await loan.save();

  return res.status(201).json({ payment: serializePayment(payment), loanId: String(loan._id) });
}

export async function listPayments(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  const parsed = listPaymentsSchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ message: "Validation error", issues: parsed.error.issues });
  }

  const { loanId } = parsed.data;
  const loan = await Loan.findById(loanId).lean();
  if (!loan) throw notFound("Loan not found");

  if (req.user.role === "BORROWER" && String(loan.borrowerId) !== req.user.id) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const payments = await Payment.find({ loanId }).sort({ paidAt: -1 }).lean();
  return res.json({ payments: payments.map(serializePayment) });
}
