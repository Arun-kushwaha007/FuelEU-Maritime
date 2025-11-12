export type Route = {
  routeId: string; vesselType: string; fuelType: string; year: number;
  ghgIntensity: number; fuelConsumption_t: number; distance_km: number;
  totalEmissions_t: number; isBaseline?: boolean;
};
export type CBResult = {
  shipId: string; year: number; targetIntensity: number;
  actualIntensity: number; energy_MJ: number; complianceBalance_gco2eq: number;
};
export const MJ_PER_TON = 41000;

export type BankEntry = {
  shipId: string;
  year: number;
  amount: number;
};

export type Pool = {
  year: number;
  members: {
    shipId: string;
    cb_before: number;
    cb_after: number;
  }[];
};

export type ShipCompliance = {
  shipId: string;
  year: number;
  cb_gco2eq: number;
};
