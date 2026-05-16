"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { clearSession, setSession, getStoredUser } from "@/lib/auth";
import type { AuthResponse } from "@/types/auth";
import type { AuthUser } from "@/types/auth";

export default function LoginPage() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [existingUser, setExistingUser] = useState<AuthUser | null>(null);

	const demoAccounts = [
		{ role: "Admin", email: "admin@lms.local", password: "Admin@123" },
		{ role: "Sales", email: "sales@lms.local", password: "Sales@123" },
		{ role: "Sanction", email: "sanction@lms.local", password: "Sanction@123" },
		{ role: "Disbursement", email: "disbursement@lms.local", password: "Disbursement@123" },
		{ role: "Collection", email: "collection@lms.local", password: "Collection@123" },
		{ role: "Borrower", email: "borrower@lms.local", password: "Borrower@123" },
	];

	useEffect(() => {
		setExistingUser(getStoredUser());
	}, [router]);

	function handleContinue() {
		if (!existingUser) return;
		const target = existingUser.role === "BORROWER" ? "/apply" : "/dashboard";
		router.push(target);
	}

	function handleSwitchAccount() {
		clearSession();
		setExistingUser(null);
	}

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError(null);
		setLoading(true);

		try {
			const data = await apiFetch<AuthResponse>("/auth/login", {
				method: "POST",
				body: JSON.stringify({ email, password }),
			});
			setSession(data.accessToken, data.user);
			const target = data.user.role === "BORROWER" ? "/apply" : "/dashboard";
			router.push(target);
		} catch (err) {
			const message = err instanceof ApiError ? err.message : "Login failed";
			setError(message);
		} finally {
			setLoading(false);
		}
	}

	function fillDemo(emailValue: string, passwordValue: string) {
		setEmail(emailValue);
		setPassword(passwordValue);
		setError(null);
	}

	return (
		<main className="min-h-screen flex items-center justify-center px-6 py-16">
			<div className="card-surface w-full max-w-md rounded-3xl p-8 fade-up">
				<h1 className="headline text-3xl">Welcome back</h1>
				<p className="mt-2 text-sm text-[var(--color-muted)]">
					Sign in to continue your loan workflow.
				</p>

				{existingUser && (
					<div className="mt-4 rounded-2xl border border-[var(--color-border)] bg-white/70 p-4 text-sm">
						<p className="text-[var(--color-muted)]">
							You are signed in as <span className="font-semibold">{existingUser.fullName}</span>.
						</p>
						<div className="mt-3 flex flex-wrap gap-3">
							<button
								type="button"
								onClick={handleContinue}
								className="rounded-full bg-[var(--color-ink)] px-4 py-2 text-xs font-semibold text-white"
							>
								Continue
							</button>
							<button
								type="button"
								onClick={handleSwitchAccount}
								className="rounded-full border border-[var(--color-ink)] px-4 py-2 text-xs font-semibold"
							>
								Switch account
							</button>
						</div>
					</div>
				)}

				<form className="mt-6 space-y-4" onSubmit={onSubmit}>
					<label className="block">
						<span className="text-xs uppercase tracking-wide text-[var(--color-muted)]">Email</span>
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							className="mt-2 w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm"
						/>
					</label>
					<label className="block">
						<span className="text-xs uppercase tracking-wide text-[var(--color-muted)]">Password</span>
						<input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							className="mt-2 w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm"
						/>
					</label>
					{error && <p className="text-sm text-red-600">{error}</p>}
					<button
						type="submit"
						disabled={loading}
						className="w-full rounded-full bg-[var(--color-ink)] py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:opacity-60"
					>
						{loading ? "Signing in..." : "Sign in"}
					</button>
				</form>

				<div className="mt-6">
					<p className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
						Demo accounts
					</p>
					<div className="mt-3 grid gap-2 sm:grid-cols-2">
						{demoAccounts.map((account) => (
							<button
								key={account.role}
								type="button"
								onClick={() => fillDemo(account.email, account.password)}
								className="flex items-center justify-between rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-left text-xs"
							>
								<span className="font-semibold text-[var(--color-ink)]">{account.role}</span>
								<span className="text-[var(--color-muted)]">Click to fill</span>
							</button>
						))}
					</div>
					<p className="mt-3 text-xs text-[var(--color-muted)]">
					</p>
				</div>

				<p className="mt-6 text-center text-sm text-[var(--color-muted)]">
					New borrower? <a className="font-semibold text-[var(--color-ink)]" href="/signup">Create account</a>
				</p>
			</div>
		</main>
	);
}
