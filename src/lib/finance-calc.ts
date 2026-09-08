export type FeeType = 'none' | 'percentage' | 'fixed';

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

// Client-side mirror of ServerHeat's computeFee, used only for the live
// preview as the admin fills out a form -- the backend independently
// recomputes/validates on save, this never has to be authoritative.
export function computeFee(gross: number, feeType: FeeType, feeValue: number): number {
  if (feeType === 'percentage') return round2((gross * feeValue) / 100);
  if (feeType === 'fixed') return round2(feeValue);
  return 0;
}
