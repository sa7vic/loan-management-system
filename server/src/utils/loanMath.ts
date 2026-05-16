export function calculateSimpleInterest(principal: number, annualRate: number, tenureDays: number) {
  const interest = (principal * annualRate * tenureDays) / (365 * 100);
  return roundMoney(interest);
}

export function calculateTotalRepayment(principal: number, simpleInterest: number) {
  return roundMoney(principal + simpleInterest);
}

export function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}
