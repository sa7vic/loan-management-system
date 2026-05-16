"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearSession, getStoredUser } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/rbac";
import type { AuthUser } from "@/types/auth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const [user, setUser] = useState<AuthUser | null>(null);

	useEffect(() => {
		const stored = getStoredUser();
		if (!stored) {
			router.replace("/login");
			return;
		}
		if (stored.role === "BORROWER") {
			router.replace("/apply");
			return;
		}
		setUser(stored);
	}, [router]);

	function onLogout() {
		clearSession();
		router.push("/login");
	}

	if (!user) {
		return <div className="px-6 py-10 text-sm text-[var(--color-muted)]">Loading...</div>;
	}

	return (
		<div className="min-h-screen">
			<header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
				<div>
					<p className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">Operations</p>
					<h1 className="headline text-2xl">LMS Dashboard</h1>
				</div>
				<div className="flex items-center gap-4 text-sm">
					{user && (
						<span className="rounded-full border border-[var(--color-border)] px-4 py-1">
							{ROLE_LABELS[user.role]}: {user.fullName}
						</span>
					)}
					<button
						onClick={onLogout}
						className="rounded-full bg-[var(--color-ink)] px-4 py-2 text-sm font-semibold text-white"
					>
						Log out
					</button>
				</div>
			</header>
			<main className="mx-auto max-w-6xl px-6 pb-16">{children}</main>
		</div>
	);
}
