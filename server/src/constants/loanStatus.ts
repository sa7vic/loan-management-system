export const LOAN_STATUS = ["APPLIED", "SANCTIONED", "DISBURSED", "CLOSED", "REJECTED"] as const;

export type LoanStatus = (typeof LOAN_STATUS)[number];