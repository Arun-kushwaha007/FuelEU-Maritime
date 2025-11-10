export type Route = {
  routeId: string;
  vesselType: string;
  fuelType: string;
  year: number;
  ghgIntensity: number;
  fuelConsumption_t: number;
  distance_km: number;
  totalEmissions_t: number;
  isBaseline?: boolean;
};
