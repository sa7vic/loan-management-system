import type { Request, Response } from "express";
import { Loan } from "../models/Loan";
import { Payment } from "../models/Payment";

export async function demoReset(_req: Request, res: Response) {
	const loanResult = await Loan.deleteMany({});
	const paymentResult = await Payment.deleteMany({});

	return res.json({
		ok: true,
		removedLoans: loanResult.deletedCount ?? 0,
		removedPayments: paymentResult.deletedCount ?? 0,
	});
}
