import type { AuthUser } from "@/types/auth";

const TOKEN_KEY = "lms_token";
const USER_KEY = "lms_user";

function safeStorage() {
	if (typeof window === "undefined") return null;
	return window.localStorage;
}

export function setSession(token: string, user: AuthUser) {
	const storage = safeStorage();
	if (!storage) return;
	storage.setItem(TOKEN_KEY, token);
	storage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
	const storage = safeStorage();
	if (!storage) return;
	storage.removeItem(TOKEN_KEY);
	storage.removeItem(USER_KEY);
}

export function getToken() {
	const storage = safeStorage();
	return storage?.getItem(TOKEN_KEY) ?? null;
}

export function getStoredUser(): AuthUser | null {
	const storage = safeStorage();
	const raw = storage?.getItem(USER_KEY);
	if (!raw) return null;
	try {
		return JSON.parse(raw) as AuthUser;
	} catch {
		return null;
	}
}
