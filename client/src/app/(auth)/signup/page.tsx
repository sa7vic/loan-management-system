"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { clearSession, setSession, getStoredUser } from "@/lib/auth";
import type { AuthResponse } from "@/types/auth";
import type { AuthUser } from "@/types/auth";

export default function SignupPage() {
	const router = useRouter();
	const [fullName, setFullName] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [existingUser, setExistingUser] = useState<AuthUser | null>(null);

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
			const data = await apiFetch<AuthResponse>("/auth/signup", {
				method: "POST",
				body: JSON.stringify({
					fullName,
					email,
					phone: phone.trim() || undefined,
					password,
				}),
			});
			setSession(data.accessToken, data.user);
			router.push("/apply");
		} catch (err) {
			const message = err instanceof ApiError ? err.message : "Signup failed";
			setError(message);
		} finally {
			setLoading(false);
		}
	}

	return (
		<main className="min-h-screen flex items-center justify-center px-6 py-16">
			<div className="card-surface w-full max-w-lg rounded-3xl p-8 fade-up">
				<h1 className="headline text-3xl">Create borrower account</h1>
				<p className="mt-2 text-sm text-[var(--color-muted)]">
					Start your loan application in minutes.
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
						<span className="text-xs uppercase tracking-wide text-[var(--color-muted)]">Full name</span>
						<input
							type="text"
							value={fullName}
							onChange={(e) => setFullName(e.target.value)}
							required
							className="mt-2 w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm"
						/>
					</label>
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
						<span className="text-xs uppercase tracking-wide text-[var(--color-muted)]">Phone (optional)</span>
						<input
							type="tel"
							value={phone}
							onChange={(e) => setPhone(e.target.value)}
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
						{loading ? "Creating account..." : "Create account"}
					</button>
				</form>

				<p className="mt-6 text-center text-sm text-[var(--color-muted)]">
					Already registered? <a className="font-semibold text-[var(--color-ink)]" href="/login">Sign in</a>
				</p>
			</div>
		</main>
	);
}
