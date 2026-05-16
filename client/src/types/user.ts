export type Role =
	| "ADMIN"
	| "SALES"
	| "SANCTION"
	| "DISBURSEMENT"
	| "COLLECTION"
	| "BORROWER";

export type User = {
	id: string;
	fullName: string;
	email: string;
	phone?: string;
	role: Role;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
};
