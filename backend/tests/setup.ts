import { before, after } from "node:test";  
import { prisma } from "../src/infrastructure/db/client.js";  
  
before(async () => {  
  // Clear existing data  
  await prisma.poolMember.deleteMany({});  
  await prisma.pool.deleteMany({});  
  await prisma.bankEntry.deleteMany({});  
  await prisma.shipCompliance.deleteMany({});  
  await prisma.route.deleteMany({});  
  
  // Seed test data  
  await prisma.route.createMany({  
    data: [  
      {  
        routeId: "R001",  
        vesselType: "Container",  
        fuelType: "HFO",  
        year: 2024,  
        ghgIntensity: 91.0,  
        fuelConsumption_t: 5000,  
        distance_km: 12000,  
        totalEmissions_t: 4500,  
        isBaseline: false,  
      },  
      {  
        routeId: "R002",  
        vesselType: "BulkCarrier",  
        fuelType: "LNG",  
        year: 2024,  
        ghgIntensity: 88.0,  
        fuelConsumption_t: 4800,  
        distance_km: 11500,  
        totalEmissions_t: 4200,  
        isBaseline: false,  
      },  
      {  
        routeId: "R003",  
        vesselType: "Tanker",  
        fuelType: "MGO",  
        year: 2024,  
        ghgIntensity: 93.5,  
        fuelConsumption_t: 5100,  
        distance_km: 12500,  
        totalEmissions_t: 4700,  
        isBaseline: false,  
      },  
      {  
        routeId: "R004",  
        vesselType: "RoRo",  
        fuelType: "HFO",  
        year: 2025,  
        ghgIntensity: 89.2,  
        fuelConsumption_t: 4900,  
        distance_km: 11800,  
        totalEmissions_t: 4300,  
        isBaseline: false,  
      },  
      {  
        routeId: "R005",  
        vesselType: "Container",  
        fuelType: "LNG",  
        year: 2025,  
        ghgIntensity: 90.5,  
        fuelConsumption_t: 4950,  
        distance_km: 11900,  
        totalEmissions_t: 4400,  
        isBaseline: false,  
      },  
    ],  
  });  
  
  console.log("✓ Test database seeded");  
});  
  
after(async () => {  
  await prisma.$disconnect();  
});