"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { clearSession, getStoredUser } from "@/lib/auth";
import { validateBorrowerDetails } from "@/lib/validators";
import LoanDetailsDrawer from "@/components/loan/LoanDetailsDrawer";
import { useToast } from "@/components/ui/Toast";
import type { Loan, LoanDocumentMeta, PersonalDetails } from "@/types/loan";
import type { AuthUser } from "@/types/auth";

const initialDetails: PersonalDetails = {
	fullName: "",
	pan: "",
	dob: "",
	monthlySalary: 25000,
	employmentMode: "Salaried",
};

export default function ApplyPage() {
	const router = useRouter();
	const [user, setUser] = useState<AuthUser | null>(null);
	const [step, setStep] = useState(1);
	const [details, setDetails] = useState<PersonalDetails>(initialDetails);
	const [breErrors, setBreErrors] = useState<string[]>([]);
	const [breStatus, setBreStatus] = useState<"idle" | "pass" | "fail">("idle");
	const [salarySlip, setSalarySlip] = useState<LoanDocumentMeta | null>(null);
	const [principal, setPrincipal] = useState(100000);
	const [tenureDays, setTenureDays] = useState(90);
	const [loading, setLoading] = useState(false);
	const [applyResult, setApplyResult] = useState<Loan | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [myLoans, setMyLoans] = useState<Loan[]>([]);
	const [loanLoading, setLoanLoading] = useState(false);
	const [loanError, setLoanError] = useState<string | null>(null);
	const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
	const { push } = useToast();

	useEffect(() => {
		const stored = getStoredUser();
		if (!stored) return;
		if (stored.role !== "BORROWER") {
			router.replace("/dashboard");
			return;
		}
		setUser(stored);
		setStep(2);
	}, []);

	useEffect(() => {
		if (!user) return;
		loadLoans();
	}, [user]);

	function loadLoans() {
		if (!user) return;
		setLoanLoading(true);
		setLoanError(null);
		apiFetch<{ loans: Loan[] }>("/loans/mine")
			.then((data) => setMyLoans(data.loans))
			.catch((err) =>
				setLoanError(err instanceof ApiError ? err.message : "Failed to load loans")
			)
			.finally(() => setLoanLoading(false));
	}

	function handleLogout() {
		clearSession();
		setUser(null);
		setStep(1);
		router.push("/login");
	}

	const simpleInterest = useMemo(() => {
		const interest = (principal * 12 * tenureDays) / (365 * 100);
		return Math.round(interest * 100) / 100;
	}, [principal, tenureDays]);

	const totalRepayment = useMemo(() => {
		return Math.round((principal + simpleInterest) * 100) / 100;
	}, [principal, simpleInterest]);

	async function runBre() {
		setError(null);
		setBreStatus("idle");
		const localErrors = validateBorrowerDetails({
			fullName: details.fullName,
			pan: details.pan,
			dob: details.dob,
			monthlySalary: details.monthlySalary,
			employmentMode: details.employmentMode,
		});
		if (localErrors.length > 0) {
			setBreErrors(localErrors.map((e) => e.message));
			setBreStatus("fail");
			return false;
		}

		try {
			await apiFetch("/loans/bre-check", {
				method: "POST",
				body: JSON.stringify({
					...details,
					pan: details.pan.toUpperCase(),
					monthlySalary: Number(details.monthlySalary),
				}),
			});
			setBreErrors([]);
			setBreStatus("pass");
			return true;
		} catch (err) {
			if (err instanceof ApiError && (err.details as any)?.errors) {
				setBreErrors((err.details as any).errors as string[]);
			} else {
				setBreErrors(["BRE check failed"]);
			}
			setBreStatus("fail");
			return false;
		}
	}

	async function handleDetailsSubmit(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		const ok = await runBre();
		setLoading(false);
		if (ok) setStep(3);
	}

	async function handleUpload(e: React.FormEvent) {
		e.preventDefault();
		if (!user) return router.push("/login");
		setError(null);
		setLoading(true);

		const input = (e.currentTarget as HTMLFormElement).elements.namedItem(
			"salarySlip"
		) as HTMLInputElement | null;
		const file = input?.files?.[0];
		if (!file) {
			setError("Select a file to upload");
			setLoading(false);
			return;
		}

		const form = new FormData();
		form.append("file", file);

		try {
			const data = await apiFetch<{ salarySlip: LoanDocumentMeta }>(
				"/loans/upload-salary-slip",
				{ method: "POST", body: form }
			);
			setSalarySlip(data.salarySlip);
			setStep(4);
		} catch (err) {
			const message = err instanceof ApiError ? err.message : "Upload failed";
			setError(message);
		} finally {
			setLoading(false);
		}
	}

	async function handleApply() {
		if (!salarySlip) return;
		setError(null);
		setLoading(true);

		try {
			const data = await apiFetch<{ loan: Loan }>("/loans/apply", {
				method: "POST",
				body: JSON.stringify({
					personalDetails: {
						...details,
						pan: details.pan.toUpperCase(),
						monthlySalary: Number(details.monthlySalary),
					},
					salarySlip,
					principal,
					tenureDays,
					annualInterestRate: 12,
				}),
			});
			setApplyResult(data.loan);
			push({ message: "Application submitted", variant: "success" });
			loadLoans();
		} catch (err) {
			const message = err instanceof ApiError ? err.message : "Application failed";
			setError(message);
		} finally {
			setLoading(false);
		}
	}

	return (
		<main className="max-w-5xl mx-auto px-6 py-12">
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div>
					<p className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">Borrower Portal</p>
					<h1 className="headline text-3xl sm:text-4xl">Apply for a new loan</h1>
				</div>
				<div className="flex flex-wrap items-center gap-3 text-sm text-[var(--color-muted)]">
					<span>Step {step} of 4</span>
					{user && (
						<button
							onClick={handleLogout}
							className="rounded-full border border-[var(--color-ink)] px-3 py-1 text-xs font-semibold text-[var(--color-ink)]"
						>
							Log out
						</button>
					)}
				</div>
			</div>

			<div className="mt-8 grid gap-6">
				<section className="card-surface rounded-3xl p-6">
					<h2 className="headline text-xl">Step 1: Account</h2>
					{!user ? (
						<div className="mt-4 flex flex-col gap-3 sm:flex-row">
							<a
								href="/login"
								className="rounded-full bg-[var(--color-ink)] px-5 py-2 text-sm font-semibold text-white"
							>
								Log in
							</a>
							<a
								href="/signup"
								className="rounded-full border border-[var(--color-ink)] px-5 py-2 text-sm font-semibold"
							>
								Create borrower account
							</a>
						</div>
					) : (
						<div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-[var(--color-muted)]">
							<span>Signed in as {user.fullName}</span>
							<button
								onClick={handleLogout}
								className="rounded-full border border-[var(--color-ink)] px-3 py-1 text-xs font-semibold text-[var(--color-ink)]"
							>
								Switch account
							</button>
						</div>
					)}
				</section>

			<section className="card-surface rounded-3xl p-6">
				<h2 className="headline text-xl">My applications</h2>
				{loanLoading && (
					<p className="mt-3 text-sm text-[var(--color-muted)]">Loading your loans...</p>
				)}
				{loanError && <p className="mt-3 text-sm text-red-600">{loanError}</p>}
				{!loanLoading && myLoans.length === 0 && (
					<p className="mt-3 text-sm text-[var(--color-muted)]">No loan applications yet.</p>
				)}
				<div className="mt-4 grid gap-3">
					{myLoans.map((loan) => (
						<div key={loan.id} className="rounded-2xl border border-[var(--color-border)] bg-white p-4">
							<div className="flex items-center justify-between">
								<p className="text-sm font-semibold">Rs {loan.principal.toLocaleString("en-IN")}</p>
								<span className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
									{loan.status}
								</span>
							</div>
							<p className="mt-2 text-xs text-[var(--color-muted)]">
								Repayment Rs {loan.totalRepayment.toLocaleString("en-IN")}
							</p>
							<button
								onClick={() => setSelectedLoan(loan)}
								className="mt-3 rounded-full border border-[var(--color-ink)] px-3 py-1 text-xs font-semibold"
							>
								View details
							</button>
						</div>
					))}
				</div>
			</section>

				<section className="card-surface rounded-3xl p-6">
					<h2 className="headline text-xl">Step 2: Personal details + BRE</h2>
					<form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={handleDetailsSubmit}>
						<label className="block sm:col-span-2">
							<span className="text-xs uppercase tracking-wide text-[var(--color-muted)]">Full name</span>
							<input
								type="text"
								value={details.fullName}
								onChange={(e) => setDetails({ ...details, fullName: e.target.value })}
								required
								className="mt-2 w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm"
							/>
						</label>
						<label className="block">
							<span className="text-xs uppercase tracking-wide text-[var(--color-muted)]">PAN</span>
							<input
								type="text"
								value={details.pan}
								onChange={(e) => setDetails({ ...details, pan: e.target.value.toUpperCase() })}
								required
								className="mt-2 w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm"
							/>
						</label>
						<label className="block">
							<span className="text-xs uppercase tracking-wide text-[var(--color-muted)]">Date of birth</span>
							<input
								type="date"
								value={details.dob}
								onChange={(e) => setDetails({ ...details, dob: e.target.value })}
								required
								className="mt-2 w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm"
							/>
						</label>
						<label className="block">
							<span className="text-xs uppercase tracking-wide text-[var(--color-muted)]">Monthly salary</span>
							<input
								type="number"
								min={0}
								value={details.monthlySalary}
								onChange={(e) => setDetails({ ...details, monthlySalary: Number(e.target.value) })}
								required
								className="mt-2 w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm"
							/>
						</label>
						<label className="block">
							<span className="text-xs uppercase tracking-wide text-[var(--color-muted)]">Employment mode</span>
							<select
								value={details.employmentMode}
								onChange={(e) => setDetails({ ...details, employmentMode: e.target.value })}
								className="mt-2 w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm"
							>
								<option>Salaried</option>
								<option>Self-Employed</option>
								<option>Contract</option>
								<option>Unemployed</option>
							</select>
						</label>
						<div className="sm:col-span-2 flex flex-wrap items-center gap-4">
							<button
								type="submit"
								disabled={!user || loading}
								className="rounded-full bg-[var(--color-ink)] px-6 py-2 text-sm font-semibold text-white disabled:opacity-60"
							>
								{loading ? "Checking..." : "Run eligibility check"}
							</button>
							{breStatus === "pass" && (
								<p className="text-sm text-emerald-600">
									Eligibility passed. Continue to upload salary slip.
								</p>
							)}
							{breErrors.length > 0 && (
								<div className="text-sm text-red-600">
									{breErrors.map((err) => (
										<p key={err}>{err}</p>
									))}
								</div>
							)}
						</div>
					</form>
				</section>

				<section className="card-surface rounded-3xl p-6">
					<h2 className="headline text-xl">Step 3: Upload salary slip</h2>
					<form className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center" onSubmit={handleUpload}>
						<input
							name="salarySlip"
							type="file"
							accept="application/pdf,image/png,image/jpeg"
							className="flex-1 text-sm"
						/>
						<button
							type="submit"
							disabled={step < 3 || loading}
							className="rounded-full bg-[var(--color-ink)] px-6 py-2 text-sm font-semibold text-white disabled:opacity-60"
						>
							{loading ? "Uploading..." : "Upload"}
						</button>
					</form>
					{salarySlip && (
						<p className="mt-3 text-sm text-[var(--color-muted)]">Uploaded {salarySlip.originalName}</p>
					)}
				</section>

				<section className="card-surface rounded-3xl p-6">
					<h2 className="headline text-xl">Step 4: Configure loan</h2>
					<div className="mt-4 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
						<div className="space-y-4">
							<label className="block">
								<span className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
									Loan amount (Rs)
								</span>
								<input
									type="range"
									min={50000}
									max={500000}
									step={5000}
									value={principal}
									onChange={(e) => setPrincipal(Number(e.target.value))}
									className="mt-3 w-full"
								/>
								<p className="mt-2 text-sm font-semibold">{principal.toLocaleString("en-IN")}</p>
							</label>
							<label className="block">
								<span className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
									Tenure (days)
								</span>
								<input
									type="range"
									min={30}
									max={365}
									step={5}
									value={tenureDays}
									onChange={(e) => setTenureDays(Number(e.target.value))}
									className="mt-3 w-full"
								/>
								<p className="mt-2 text-sm font-semibold">{tenureDays} days</p>
							</label>
						</div>
						<div className="rounded-2xl border border-[var(--color-border)] bg-white p-4 text-sm">
							<p className="text-xs uppercase tracking-wide text-[var(--color-muted)]">Summary</p>
							<div className="mt-3 space-y-2">
								<div className="flex items-center justify-between">
									<span>Interest (12% p.a.)</span>
									<span className="font-semibold">Rs {simpleInterest.toLocaleString("en-IN")}</span>
								</div>
								<div className="flex items-center justify-between">
									<span>Total repayment</span>
									<span className="font-semibold">Rs {totalRepayment.toLocaleString("en-IN")}</span>
								</div>
							</div>
							<button
								type="button"
								disabled={!salarySlip || loading}
								onClick={handleApply}
								className="mt-6 w-full rounded-full bg-[var(--color-ink)] px-6 py-2 text-sm font-semibold text-white disabled:opacity-60"
							>
								{loading ? "Submitting..." : "Apply"}
							</button>
						</div>
					</div>
					{error && <p className="mt-4 text-sm text-red-600">{error}</p>}
					{applyResult && (
						<div className="mt-4 rounded-2xl bg-white/80 p-4 text-sm text-[var(--color-muted)]">
							Application submitted. Status: <strong>{applyResult.status}</strong>.
						</div>
					)}
				</section>
			</div>
			<LoanDetailsDrawer loan={selectedLoan} role="BORROWER" onClose={() => setSelectedLoan(null)} />
		</main>
	);
}
