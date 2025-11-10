export function bankSurplus(currentBank_g: number, surplus_g: number) {
  if (surplus_g <= 0) throw new Error("Only positive surplus can be banked");
  return currentBank_g + surplus_g;
}
export function applyBanked(availableBank_g: number, applyAmount_g: number) {
  if (applyAmount_g <= 0) throw new Error("Amount must be positive");
  if (applyAmount_g > availableBank_g) throw new Error("Insufficient banked amount");
  return { applied: applyAmount_g, remainingBank: availableBank_g - applyAmount_g };
}
