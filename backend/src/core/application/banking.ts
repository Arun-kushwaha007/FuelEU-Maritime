import { BankEntry, Route, ShipCompliance } from "../domain/types.js";
import { Repository } from "../ports/repository.js";

export async function bankSurplus(
  repository: Repository,
  shipId: string,
  year: number
): Promise<BankEntry> {
  const compliance = await repository.getShipCompliance(shipId, year);
  if (!compliance || compliance.cb_gco2eq <= 0) {
    throw new Error("No surplus to bank.");
  }
  return repository.createBankEntry({
    shipId,
    year,
    amount: compliance.cb_gco2eq,
  });
}

export async function applyBanked(
  repository: Repository,
  shipId: string,
  year: number,
  cbCurrent: number
): Promise<BankEntry> {
  const entries = await repository.getBankEntries(shipId, year);
  const bankTotal = entries.reduce((sum, e) => sum + e.amount, 0);

  if (cbCurrent >= 0) {
    throw new Error("No deficit to apply surplus to.");
  }
  if (bankTotal <= 0) {
    throw new Error("No banked surplus available.");
  }

  const deficit = Math.abs(cbCurrent);
  const applyAmount = Math.min(bankTotal, deficit);

  return repository.createBankEntry({
    shipId,
    year,
    amount: -applyAmount,
  });
}
