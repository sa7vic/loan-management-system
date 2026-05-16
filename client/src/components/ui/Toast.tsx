"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

type ToastVariant = "success" | "error" | "info";

type ToastInput = {
	title?: string;
	message: string;
	variant?: ToastVariant;
};

type ToastItem = ToastInput & {
	id: string;
	variant: ToastVariant;
};

type ToastContextValue = {
	push: (toast: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
	const [toasts, setToasts] = useState<ToastItem[]>([]);

	const push = useCallback((toast: ToastInput) => {
		const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
		const item: ToastItem = {
			id,
			message: toast.message,
			variant: toast.variant ?? "info",
			title: toast.title,
		};
		setToasts((prev) => [...prev, item]);
		window.setTimeout(() => {
			setToasts((prev) => prev.filter((entry) => entry.id !== id));
		}, 3500);
	}, []);

	const value = useMemo(() => ({ push }), [push]);

	return (
		<ToastContext.Provider value={value}>
			{children}
			<div className="fixed right-6 top-6 z-50 space-y-3">
				{toasts.map((toast) => (
					<div
						key={toast.id}
						className={`w-72 rounded-2xl border px-4 py-3 text-sm shadow-lg ${
							toast.variant === "success"
								? "border-emerald-200 bg-emerald-50 text-emerald-900"
								: toast.variant === "error"
								? "border-red-200 bg-red-50 text-red-900"
								: "border-slate-200 bg-white text-slate-900"
						}`}
					>
						{toast.title && <p className="text-xs font-semibold uppercase">{toast.title}</p>}
						<p className={toast.title ? "mt-1" : ""}>{toast.message}</p>
					</div>
				))}
			</div>
		</ToastContext.Provider>
	);
}

export function useToast() {
	const context = useContext(ToastContext);
	if (!context) {
		return { push: (_toast: ToastInput) => {} };
	}
	return context;
}
