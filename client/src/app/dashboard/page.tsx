"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import { getStoredUser } from "@/lib/auth";
import LoanDetailsDrawer from "@/components/loan/LoanDetailsDrawer";
import { useToast } from "@/components/ui/Toast";
import type { Loan } from "@/types/loan";
import type { AuthUser } from "@/types/auth";
import type { Role } from "@/types/user";

type Lead = {
	_id: string;
	fullName: string;
	email: string;
	phone?: string;
	createdAt: string;
};

function formatCurrency(value: number) {
	return `Rs ${value.toLocaleString("en-IN")}`;
}

export default function DashboardPage() {
	const [user, setUser] = useState<AuthUser | null>(null);
	const role = user?.role as Role | undefined;
	const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

	useEffect(() => {
		const stored = getStoredUser();
		if (stored) setUser(stored);
	}, []);

	if (!role) {
		return <div className="text-sm text-[var(--color-muted)]">Loading dashboard...</div>;
	}

	let content: React.ReactNode;
	if (role === "BORROWER") content = <BorrowerModule onOpenLoan={setSelectedLoan} />;
	else if (role === "SALES") content = <SalesModule />;
	else if (role === "SANCTION") content = <SanctionModule onOpenLoan={setSelectedLoan} />;
	else if (role === "DISBURSEMENT") content = <DisbursementModule onOpenLoan={setSelectedLoan} />;
	else if (role === "COLLECTION") content = <CollectionModule onOpenLoan={setSelectedLoan} />;
	else content = <AdminModule onOpenLoan={setSelectedLoan} />;

	return (
		<div className="space-y-6">
			{content}
			<LoanDetailsDrawer loan={selectedLoan} role={role} onClose={() => setSelectedLoan(null)} />
		</div>
	);
}

function ModuleShell({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<section className="card-surface rounded-3xl p-6">
			<h2 className="headline text-2xl">{title}</h2>
			<div className="mt-4">{children}</div>
		</section>
	);
}

function BorrowerModule({ onOpenLoan }: { onOpenLoan: (loan: Loan) => void }) {
	const [loans, setLoans] = useState<Loan[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	function loadLoans() {
		setLoading(true);
		setError(null);
		apiFetch<{ loans: Loan[] }>("/loans/mine")
			.then((data) => setLoans(data.loans))
			.catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load loans"))
			.finally(() => setLoading(false));
	}

	useEffect(() => {
		loadLoans();
	}, []);

	return (
		<ModuleShell title="My loans">
			<div className="flex flex-wrap items-center gap-3">
				<a
					href="/apply"
					className="inline-flex rounded-full bg-[var(--color-ink)] px-5 py-2 text-sm font-semibold text-white"
				>
					Start new application
				</a>
				<button
					onClick={loadLoans}
					className="rounded-full border border-[var(--color-ink)] px-4 py-2 text-xs font-semibold"
				>
					Refresh
				</button>
			</div>
			{error && <p className="mt-4 text-sm text-red-600">{error}</p>}
			<div className="mt-6 grid gap-4">
				{loading && <p className="text-sm text-[var(--color-muted)]">Loading loans...</p>}
				{loans.map((loan) => (
					<div key={loan.id} className="rounded-2xl border border-[var(--color-border)] bg-white p-4">
						<div className="flex items-center justify-between">
							<p className="text-sm font-semibold">{formatCurrency(loan.principal)}</p>
							<span className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
								{loan.status}
							</span>
						</div>
						<p className="mt-2 text-xs text-[var(--color-muted)]">
							Total repayment {formatCurrency(loan.totalRepayment)}
						</p>
						<button
							onClick={() => onOpenLoan(loan)}
							className="mt-3 rounded-full border border-[var(--color-ink)] px-3 py-1 text-xs font-semibold"
						>
							View details
						</button>
					</div>
				))}
				{!loading && loans.length === 0 && (
					<p className="text-sm text-[var(--color-muted)]">No loans yet.</p>
				)}
			</div>
		</ModuleShell>
	);
}

function SalesModule() {
	const [leads, setLeads] = useState<Lead[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	function loadLeads() {
		setLoading(true);
		setError(null);
		apiFetch<{ leads: Lead[] }>("/loans/leads")
			.then((data) => setLeads(data.leads))
			.catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load leads"))
			.finally(() => setLoading(false));
	}

	useEffect(() => {
		loadLeads();
	}, []);

	return (
		<ModuleShell title="Sales leads">
			<button
				onClick={loadLeads}
				className="rounded-full border border-[var(--color-ink)] px-4 py-2 text-xs font-semibold"
			>
				Refresh
			</button>
			{error && <p className="text-sm text-red-600">{error}</p>}
			<div className="mt-4 grid gap-3">
				{loading && <p className="text-sm text-[var(--color-muted)]">Loading leads...</p>}
				{leads.map((lead) => (
					<div key={lead._id} className="rounded-2xl border border-[var(--color-border)] bg-white p-4">
						<p className="text-sm font-semibold">{lead.fullName}</p>
						<p className="text-xs text-[var(--color-muted)]">{lead.email}</p>
						{lead.phone && <p className="text-xs text-[var(--color-muted)]">{lead.phone}</p>}
					</div>
				))}
				{!loading && leads.length === 0 && (
					<p className="text-sm text-[var(--color-muted)]">No fresh leads.</p>
				)}
			</div>
		</ModuleShell>
	);
}

function SanctionModule({ onOpenLoan }: { onOpenLoan: (loan: Loan) => void }) {
	const [loans, setLoans] = useState<Loan[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [reasons, setReasons] = useState<Record<string, string>>({});
	const [loadingId, setLoadingId] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const { push } = useToast();

	function loadLoans() {
		setLoading(true);
		setError(null);
		apiFetch<{ loans: Loan[] }>("/loans?status=APPLIED")
			.then((data) => setLoans(data.loans))
			.catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load loans"))
			.finally(() => setLoading(false));
	}

	useEffect(() => {
		loadLoans();
	}, []);

	async function handleAction(loanId: string, action: "APPROVE" | "REJECT") {
		setLoadingId(loanId);
		setError(null);
		try {
			await apiFetch(`/loans/${loanId}/sanction`, {
				method: "POST",
				body: JSON.stringify({ action, reason: reasons[loanId] }),
			});
			push({
				message: action === "APPROVE" ? "Loan sanctioned" : "Loan rejected",
				variant: "success",
			});
			loadLoans();
		} catch (err) {
			setError(err instanceof ApiError ? err.message : "Sanction failed");
			push({ message: "Sanction failed", variant: "error" });
		} finally {
			setLoadingId(null);
		}
	}

	return (
		<ModuleShell title="Sanction queue">
			<button
				onClick={loadLoans}
				className="rounded-full border border-[var(--color-ink)] px-4 py-2 text-xs font-semibold"
			>
				Refresh
			</button>
			{error && <p className="text-sm text-red-600">{error}</p>}
			<div className="mt-4 grid gap-4">
				{loading && <p className="text-sm text-[var(--color-muted)]">Loading loans...</p>}
				{loans.map((loan) => (
					<div key={loan.id} className="rounded-2xl border border-[var(--color-border)] bg-white p-4">
						<div className="flex flex-wrap items-center justify-between gap-2">
							<div>
								<p className="text-sm font-semibold">{formatCurrency(loan.principal)}</p>
								<p className="text-xs text-[var(--color-muted)]">
									Tenure {loan.tenureDays} days · Repayment {formatCurrency(loan.totalRepayment)}
								</p>
							</div>
							<div className="flex gap-2">
								<button
									onClick={() => onOpenLoan(loan)}
									className="rounded-full border border-[var(--color-ink)] px-4 py-1.5 text-xs font-semibold"
								>
									Details
								</button>
								<button
									disabled={loadingId === loan.id}
									onClick={() => handleAction(loan.id, "APPROVE")}
									className="rounded-full bg-[var(--color-ink)] px-4 py-1.5 text-xs font-semibold text-white"
								>
									Approve
								</button>
								<button
									disabled={loadingId === loan.id}
									onClick={() => handleAction(loan.id, "REJECT")}
									className="rounded-full border border-[var(--color-ink)] px-4 py-1.5 text-xs font-semibold"
								>
									Reject
								</button>
							</div>
						</div>
						<input
							type="text"
							placeholder="Rejection reason (if rejecting)"
							value={reasons[loan.id] ?? ""}
							onChange={(e) => setReasons((prev) => ({ ...prev, [loan.id]: e.target.value }))}
							className="mt-3 w-full rounded-2xl border border-[var(--color-border)] bg-white px-3 py-2 text-xs"
						/>
					</div>
				))}
				{!loading && loans.length === 0 && (
					<p className="text-sm text-[var(--color-muted)]">No loans awaiting sanction.</p>
				)}
			</div>
		</ModuleShell>
	);
}

function DisbursementModule({ onOpenLoan }: { onOpenLoan: (loan: Loan) => void }) {
	const [loans, setLoans] = useState<Loan[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [utrById, setUtrById] = useState<Record<string, string>>({});
	const [loadingId, setLoadingId] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const { push } = useToast();

	function loadLoans() {
		setLoading(true);
		setError(null);
		apiFetch<{ loans: Loan[] }>("/loans?status=SANCTIONED")
			.then((data) => setLoans(data.loans))
			.catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load loans"))
			.finally(() => setLoading(false));
	}

	useEffect(() => {
		loadLoans();
	}, []);

	async function disburse(loanId: string) {
		setLoadingId(loanId);
		setError(null);
		try {
			await apiFetch(`/loans/${loanId}/disburse`, {
				method: "POST",
				body: JSON.stringify({ utr: utrById[loanId] }),
			});
			push({ message: "Loan disbursed", variant: "success" });
			loadLoans();
		} catch (err) {
			setError(err instanceof ApiError ? err.message : "Disbursement failed");
			push({ message: "Disbursement failed", variant: "error" });
		} finally {
			setLoadingId(null);
		}
	}

	return (
		<ModuleShell title="Disbursement queue">
			<button
				onClick={loadLoans}
				className="rounded-full border border-[var(--color-ink)] px-4 py-2 text-xs font-semibold"
			>
				Refresh
			</button>
			{error && <p className="text-sm text-red-600">{error}</p>}
			<div className="mt-4 grid gap-4">
				{loading && <p className="text-sm text-[var(--color-muted)]">Loading loans...</p>}
				{loans.map((loan) => (
					<div key={loan.id} className="rounded-2xl border border-[var(--color-border)] bg-white p-4">
						<div className="flex items-center justify-between">
							<p className="text-sm font-semibold">{formatCurrency(loan.principal)}</p>
							<button
								onClick={() => onOpenLoan(loan)}
								className="rounded-full border border-[var(--color-ink)] px-3 py-1 text-xs font-semibold"
							>
								Details
							</button>
						</div>
						<p className="text-xs text-[var(--color-muted)]">Repayment {formatCurrency(loan.totalRepayment)}</p>
						<div className="mt-3 flex flex-wrap gap-2">
							<input
								type="text"
								placeholder="Disbursement UTR"
								value={utrById[loan.id] ?? ""}
								onChange={(e) => setUtrById((prev) => ({ ...prev, [loan.id]: e.target.value }))}
								className="flex-1 rounded-2xl border border-[var(--color-border)] bg-white px-3 py-2 text-xs"
							/>
							<button
								disabled={loadingId === loan.id}
								onClick={() => disburse(loan.id)}
								className="rounded-full bg-[var(--color-ink)] px-4 py-2 text-xs font-semibold text-white"
							>
								Mark disbursed
							</button>
						</div>
					</div>
				))}
				{!loading && loans.length === 0 && (
					<p className="text-sm text-[var(--color-muted)]">No loans ready for disbursement.</p>
				)}
			</div>
		</ModuleShell>
	);
}

function CollectionModule({ onOpenLoan }: { onOpenLoan: (loan: Loan) => void }) {
	const [loans, setLoans] = useState<Loan[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [formById, setFormById] = useState<Record<string, { utr: string; amount: string; date: string }>>({});
	const [loadingId, setLoadingId] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const { push } = useToast();

	function loadLoans() {
		setLoading(true);
		setError(null);
		apiFetch<{ loans: Loan[] }>("/loans?status=DISBURSED")
			.then((data) => setLoans(data.loans))
			.catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load loans"))
			.finally(() => setLoading(false));
	}

	useEffect(() => {
		loadLoans();
	}, []);

	async function recordPayment(loanId: string) {
		const form = formById[loanId];
		if (!form) return;
		setLoadingId(loanId);
		setError(null);
		try {
			await apiFetch("/payments", {
				method: "POST",
				body: JSON.stringify({
					loanId,
					utrNumber: form.utr,
					amount: Number(form.amount),
					paidAt: form.date,
				}),
			});
			setFormById((prev) => ({ ...prev, [loanId]: { utr: "", amount: "", date: "" } }));
			push({ message: "Payment recorded", variant: "success" });
			loadLoans();
		} catch (err) {
			setError(err instanceof ApiError ? err.message : "Payment failed");
			push({ message: "Payment failed", variant: "error" });
		} finally {
			setLoadingId(null);
		}
	}

	return (
		<ModuleShell title="Collections">
			<button
				onClick={loadLoans}
				className="rounded-full border border-[var(--color-ink)] px-4 py-2 text-xs font-semibold"
			>
				Refresh
			</button>
			{error && <p className="text-sm text-red-600">{error}</p>}
			<div className="mt-4 grid gap-4">
				{loading && <p className="text-sm text-[var(--color-muted)]">Loading loans...</p>}
				{loans.map((loan) => {
					const form = formById[loan.id] ?? { utr: "", amount: "", date: "" };
					return (
						<div key={loan.id} className="rounded-2xl border border-[var(--color-border)] bg-white p-4">
							<div className="flex items-center justify-between">
								<p className="text-sm font-semibold">{formatCurrency(loan.principal)}</p>
								<span className="text-xs text-[var(--color-muted)]">
									Outstanding {formatCurrency(loan.outstanding)}
								</span>
							</div>
							<button
								onClick={() => onOpenLoan(loan)}
								className="mt-2 rounded-full border border-[var(--color-ink)] px-3 py-1 text-xs font-semibold"
							>
								View details
							</button>
							<div className="mt-3 grid gap-2 sm:grid-cols-3">
								<input
									type="text"
									placeholder="UTR"
									value={form.utr}
									onChange={(e) =>
										setFormById((prev) => ({
											...prev,
											[loan.id]: { ...form, utr: e.target.value },
										}))
									}
									className="rounded-2xl border border-[var(--color-border)] bg-white px-3 py-2 text-xs"
								/>
								<input
									type="number"
									placeholder="Amount"
									value={form.amount}
									onChange={(e) =>
										setFormById((prev) => ({
											...prev,
											[loan.id]: { ...form, amount: e.target.value },
										}))
									}
									className="rounded-2xl border border-[var(--color-border)] bg-white px-3 py-2 text-xs"
								/>
								<input
									type="date"
									value={form.date}
									onChange={(e) =>
										setFormById((prev) => ({
											...prev,
											[loan.id]: { ...form, date: e.target.value },
										}))
									}
									className="rounded-2xl border border-[var(--color-border)] bg-white px-3 py-2 text-xs"
								/>
							</div>
							<button
								disabled={loadingId === loan.id}
								onClick={() => recordPayment(loan.id)}
								className="mt-3 rounded-full bg-[var(--color-ink)] px-4 py-2 text-xs font-semibold text-white"
							>
								Record payment
							</button>
						</div>
					);
				})}
				{!loading && loans.length === 0 && (
					<p className="text-sm text-[var(--color-muted)]">No disbursed loans pending payment.</p>
				)}
			</div>
		</ModuleShell>
	);
}

function AdminModule({ onOpenLoan }: { onOpenLoan: (loan: Loan) => void }) {
	const { push } = useToast();
	const [resetting, setResetting] = useState(false);
	const modules = useMemo(
		() => [
			{ key: "sales", label: "Sales", component: <SalesModule /> },
			{ key: "sanction", label: "Sanction", component: <SanctionModule onOpenLoan={onOpenLoan} /> },
			{ key: "disbursement", label: "Disbursement", component: <DisbursementModule onOpenLoan={onOpenLoan} /> },
			{ key: "collection", label: "Collection", component: <CollectionModule onOpenLoan={onOpenLoan} /> },
		],
		[onOpenLoan]
	);
	const [active, setActive] = useState(modules[0].key);

	async function handleDemoReset() {
		setResetting(true);
		try {
			await apiFetch("/admin/demo-reset", { method: "POST" });
			push({ message: "Demo data reset", variant: "success" });
		} catch (err) {
			push({ message: "Demo reset failed", variant: "error" });
		} finally {
			setResetting(false);
		}
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center gap-3">
				<button
					onClick={handleDemoReset}
					disabled={resetting}
					className="rounded-full bg-[var(--color-ink)] px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
				>
					{resetting ? "Resetting..." : "Reset demo data"}
				</button>
				<div className="flex flex-wrap gap-2">
				{modules.map((module) => (
					<button
						key={module.key}
						onClick={() => setActive(module.key)}
						className={`rounded-full px-4 py-2 text-xs font-semibold ${
							active === module.key
								? "bg-[var(--color-ink)] text-white"
								: "border border-[var(--color-ink)] text-[var(--color-ink)]"
						}`}
					>
						{module.label}
					</button>
				))}
				</div>
			</div>
			{modules.find((module) => module.key === active)?.component}
		</div>
	);
}
