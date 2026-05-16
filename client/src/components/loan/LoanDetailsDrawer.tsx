"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import type { Loan } from "@/types/loan";
import type { Payment } from "@/types/payment";
import type { Role } from "@/types/user";

function formatDate(value?: string) {
	if (!value) return "Pending";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "Pending";
	return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

type TimelineItem = {
	label: string;
	date?: string;
	note?: string;
};

export default function LoanDetailsDrawer({
	loan,
	role,
	onClose,
}: {
	loan: Loan | null;
	role: Role;
	onClose: () => void;
}) {
	const [payments, setPayments] = useState<Payment[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const canViewPayments = role === "ADMIN" || role === "COLLECTION" || role === "BORROWER";

	const timeline = useMemo<TimelineItem[]>(() => {
		if (!loan) return [];
		if (loan.status === "REJECTED") {
			return [
				{ label: "Applied", date: loan.createdAt },
				{ label: "Rejected", date: loan.rejectedAt, note: loan.rejectionReason },
			];
		}
		return [
			{ label: "Applied", date: loan.createdAt },
			{ label: "Sanctioned", date: loan.sanctionedAt },
			{ label: "Disbursed", date: loan.disbursedAt },
			{ label: "Closed", date: loan.closedAt },
		];
	}, [loan]);

	useEffect(() => {
		if (!loan) return;
		if (!canViewPayments) {
			setPayments([]);
			setError(null);
			return;
		}
		setLoading(true);
		setError(null);
		apiFetch<{ payments: Payment[] }>(`/payments?loanId=${loan.id}`)
			.then((data) => setPayments(data.payments))
			.catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load payments"))
			.finally(() => setLoading(false));
	}, [loan, canViewPayments]);

	if (!loan) return null;

	return (
		<div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={onClose}>
			<div
				className="h-full w-full max-w-lg bg-[var(--color-bg)] p-6 shadow-2xl"
				onClick={(event) => event.stopPropagation()}
			>
				<div className="flex items-start justify-between">
					<div>
						<p className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">Loan details</p>
						<h2 className="headline text-2xl">Rs {loan.principal.toLocaleString("en-IN")}</h2>
					</div>
					<button
						onClick={onClose}
						className="rounded-full border border-[var(--color-ink)] px-3 py-1 text-xs font-semibold"
					>
						Close
					</button>
				</div>

				<div className="mt-6 rounded-2xl border border-[var(--color-border)] bg-white p-4 text-sm">
					<div className="flex items-center justify-between">
						<span>Interest</span>
						<span className="font-semibold">Rs {loan.simpleInterest.toLocaleString("en-IN")}</span>
					</div>
					<div className="mt-2 flex items-center justify-between">
						<span>Total repayment</span>
						<span className="font-semibold">Rs {loan.totalRepayment.toLocaleString("en-IN")}</span>
					</div>
					<div className="mt-2 flex items-center justify-between">
						<span>Outstanding</span>
						<span className="font-semibold">Rs {loan.outstanding.toLocaleString("en-IN")}</span>
					</div>
				</div>

				<div className="mt-6">
					<h3 className="text-sm font-semibold">Status timeline</h3>
					<div className="mt-3 space-y-3">
						{timeline.map((item) => (
							<div key={item.label} className="rounded-2xl border border-[var(--color-border)] bg-white p-3">
								<div className="flex items-center justify-between text-sm">
									<span className="font-semibold">{item.label}</span>
									<span className="text-[var(--color-muted)]">{formatDate(item.date)}</span>
								</div>
								{item.note && (
									<p className="mt-2 text-xs text-[var(--color-muted)]">{item.note}</p>
								)}
							</div>
						))}
					</div>
				</div>

				<div className="mt-6">
					<h3 className="text-sm font-semibold">Payments</h3>
					{!canViewPayments && (
						<p className="mt-2 text-xs text-[var(--color-muted)]">
							Payments are available after disbursement.
						</p>
					)}
					{loading && (
						<p className="mt-2 text-xs text-[var(--color-muted)]">Loading payments...</p>
					)}
					{error && <p className="mt-2 text-xs text-red-600">{error}</p>}
					{!loading && canViewPayments && payments.length === 0 && (
						<p className="mt-2 text-xs text-[var(--color-muted)]">No payments recorded.</p>
					)}
					<div className="mt-3 space-y-2">
						{payments.map((payment) => (
							<div key={payment.id} className="rounded-2xl border border-[var(--color-border)] bg-white p-3">
								<div className="flex items-center justify-between text-sm">
									<span className="font-semibold">Rs {payment.amount.toLocaleString("en-IN")}</span>
									<span className="text-[var(--color-muted)]">{formatDate(payment.paidAt)}</span>
								</div>
								<p className="mt-1 text-xs text-[var(--color-muted)]">UTR {payment.utrNumber}</p>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
