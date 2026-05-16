import type { User } from "./user";

export type AuthUser = User;

export type AuthResponse = {
	user: AuthUser;
	accessToken: string;
};
