export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

export type BreError = {
	field: string;
	message: string;
};

export function validateBorrowerDetails(input: {
	fullName: string;
	pan: string;
	dob: string;
	monthlySalary: number;
	employmentMode: string;
}) {
	const errors: BreError[] = [];

	if (input.fullName.trim().length < 2) {
		errors.push({ field: "fullName", message: "Enter full name" });
	}

	if (!PAN_REGEX.test(input.pan.toUpperCase())) {
		errors.push({ field: "pan", message: "PAN format is invalid" });
	}

	const dob = new Date(input.dob);
	if (Number.isNaN(dob.getTime())) {
		errors.push({ field: "dob", message: "Date of birth is invalid" });
	} else {
		const today = new Date();
		let age = today.getFullYear() - dob.getFullYear();
		const m = today.getMonth() - dob.getMonth();
		if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age -= 1;
		if (age < 23 || age > 50) {
			errors.push({ field: "dob", message: "Age must be between 23 and 50" });
		}
	}

	if (input.monthlySalary < 25000) {
		errors.push({ field: "monthlySalary", message: "Salary must be at least 25000" });
	}

	if (input.employmentMode.trim().toLowerCase() === "unemployed") {
		errors.push({ field: "employmentMode", message: "Employment cannot be Unemployed" });
	}

	return errors;
}
