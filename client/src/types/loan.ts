export type LoanStatus = "APPLIED" | "SANCTIONED" | "DISBURSED" | "CLOSED" | "REJECTED";

export type LoanDocumentMeta = {
	originalName: string;
	mimeType: string;
	sizeBytes: number;
	storage: "LOCAL" | "S3";
	pathOrKey: string;
	uploadedAt: string;
	url?: string;
};

export type PersonalDetails = {
	fullName: string;
	pan: string;
	dob: string;
	monthlySalary: number;
	employmentMode: string;
};

export type Loan = {
	id: string;
	borrowerId: string;
	personalDetailsSnapshot?: PersonalDetails;
	salarySlip?: LoanDocumentMeta;
	principal: number;
	tenureDays: number;
	annualInterestRate: number;
	simpleInterest: number;
	totalRepayment: number;
	status: LoanStatus;
	sanctionedBy?: string;
	sanctionedAt?: string;
	rejectedBy?: string;
	rejectedAt?: string;
	rejectionReason?: string;
	disbursedBy?: string;
	disbursedAt?: string;
	disbursementUtr?: string;
	closedAt?: string;
	totalPaid: number;
	outstanding: number;
	createdAt: string;
	updatedAt: string;
};
