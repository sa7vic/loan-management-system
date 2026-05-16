import type { Role } from "@/types/user";

export const ROLE_LABELS: Record<Role, string> = {
	ADMIN: "Admin",
	SALES: "Sales",
	SANCTION: "Sanction",
	DISBURSEMENT: "Disbursement",
	COLLECTION: "Collection",
	BORROWER: "Borrower",
};

export function isRoleAllowed(role: Role, allowed: Role[]) {
	return allowed.includes(role);
}
