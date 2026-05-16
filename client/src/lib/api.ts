import { clearSession, getToken } from "./auth";

export class ApiError extends Error {
	status: number;
	details?: unknown;

	constructor(message: string, status: number, details?: unknown) {
		super(message);
		this.status = status;
		this.details = details;
	}
}

const API_BASE =
	process.env.NEXT_PUBLIC_API_URL ??
	process.env.NEXT_PUBLIC_API_BASE_URL ??
	"http://localhost:4000";

export async function apiFetch<T>(path: string, options: RequestInit = {}) {
	const headers = new Headers(options.headers ?? {});
	const isFormData = options.body instanceof FormData;

	if (!isFormData && !headers.has("Content-Type")) {
		headers.set("Content-Type", "application/json");
	}

	const token = getToken();
	if (token && !headers.has("Authorization")) {
		headers.set("Authorization", `Bearer ${token}`);
	}

	const res = await fetch(`${API_BASE}${path}`, {
		...options,
		headers,
	});

	const contentType = res.headers.get("content-type") ?? "";
	const payload = contentType.includes("application/json") ? await res.json() : null;

	if (!res.ok) {
		if (res.status === 401) {
			clearSession();
			if (typeof window !== "undefined") {
				const path = window.location.pathname;
				if (!path.startsWith("/login") && !path.startsWith("/signup")) {
					window.location.href = "/login";
				}
			}
		}
		const message = payload?.message ?? `Request failed (${res.status})`;
		throw new ApiError(message, res.status, payload);
	}

	return payload as T;
}
