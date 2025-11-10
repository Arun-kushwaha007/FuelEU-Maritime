import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const rows = [
    { routeId:"R001", vesselType:"Container",   fuelType:"HFO", year:2024, ghgIntensity:91.0,  fuelConsumption_t:5000, distance_km:12000, totalEmissions_t:4500, isBaseline:true },
    { routeId:"R002", vesselType:"BulkCarrier", fuelType:"LNG", year:2024, ghgIntensity:88.0,  fuelConsumption_t:4800, distance_km:11500, totalEmissions_t:4200 },
    { routeId:"R003", vesselType:"Tanker",      fuelType:"MGO", year:2024, ghgIntensity:93.5,  fuelConsumption_t:5100, distance_km:12500, totalEmissions_t:4700 },
    { routeId:"R004", vesselType:"RoRo",        fuelType:"HFO", year:2025, ghgIntensity:89.2,  fuelConsumption_t:4900, distance_km:11800, totalEmissions_t:4300 },
    { routeId:"R005", vesselType:"Container",   fuelType:"LNG", year:2025, ghgIntensity:90.5,  fuelConsumption_t:4950, distance_km:11900, totalEmissions_t:4400 },
  ];
  for (const r of rows) {
    await prisma.route.upsert({ where: { routeId: r.routeId }, update: r, create: r });
  }
  console.log("Seeded routes.");
}
main().finally(()=>prisma.$disconnect());
