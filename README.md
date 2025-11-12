# FuelEU Maritime Compliance Platform

## Overview

This platform implements FuelEU Maritime regulation compliance logic for maritime operators. It calculates vessel emissions against regulatory targets, manages compliance balances, and provides mechanisms for banking surplus credits and pooling deficits across multiple vessels.

**Target Users:** Maritime companies, fleet operators, and compliance officers managing GHG emissions under FuelEU Maritime regulations.

---

## Architecture

The system uses Hexagonal Architecture (Ports and Adapters) to separate business logic from external dependencies.

### Why Hexagonal Architecture

- **core/domain**: Pure business logic (CB calculations, pooling algorithms) with no external dependencies
- **adapters**: Interface implementations (HTTP routes, database queries, UI components)
- **infrastructure**: Framework-specific code (Express server, Prisma client)

This separation allows testing core logic independently and swapping implementations without affecting business rules.

### Dependency Inversion via Ports  
  
The `core/ports/` directory defines **repository interfaces** that the core application depends on. The `adapters/outbound/postgres/` directory provides **concrete implementations** using Prisma ORM. This ensures:  
  
- Core business logic never imports Prisma directly  
- Database implementation can be swapped without changing core code  
- Unit tests can mock repositories without database dependencies  
  **Example flow:**
  routes.ts (HTTP adapter)
  → calls core/application/computeCB.ts
  → uses core/ports/repository.ts interface
  → implemented by adapters/outbound/postgres/repository.ts
  → wraps infrastructure/db/client.ts (Prisma)
---
### System Architecture Diagram
```mermaid
graph TB
    subgraph "Frontend Layer"
        Browser["<b>Browser Client</b>"]
        App["<b>App.tsx</b><br/>Main Application"]
        RoutesTab["<b>RoutesTab</b>"]
        CompareTab["<b>CompareTab</b>"]
        BankingTab["<b>BankingTab</b>"]
        PoolingTab["<b>PoolingTab</b>"]
        Sidebar["<b>KnowledgeSidebar</b>"]
        API_Client["<b>Axios API Client</b>"]
    end
    
    subgraph "Backend Layer - Hexagonal Architecture"
        Express["<b>Express Server</b><br/>Port 4000"]
        
        subgraph "Inbound Adapters"
            HTTPRoutes["<b>routes.ts</b><br/>/api/routes<br/>/api/compliance<br/>/api/banking<br/>/api/pools"]
        end
        
        subgraph "Core Domain"
            subgraph "Application Services"
                ComputeCB["<b>computeCBForRoute()</b>"]
                ComputeComparison["<b>computeComparison()</b>"]
                Banking["<b>bankSurplus()</b><br/>applyBanked()"]
                Pooling["<b>createPoolGreedy()</b>"]
            end
            
            subgraph "Domain Layer"
                DomainTypes["<b>types.ts</b><br/>Route, BankEntry<br/>Pool, ShipCompliance"]
            end
            
            subgraph "Ports (Interfaces)"
                RepositoryPort["<b>Repository Interface</b><br/>getRoutes()<br/>getBankEntries()<br/>createPool()"]
            end
        end
        
        subgraph "Outbound Adapters"
            PrismaRepo["<b>PrismaRepository</b><br/>implements Repository"]
        end
        
        subgraph "Infrastructure"
            PrismaClient["<b>Prisma ORM Client</b>"]
        end
    end
    
    subgraph "Database Layer"
        PostgreSQL["<b>PostgreSQL Database</b>"]
        
        subgraph "Tables"
            RouteTable["<b>routes</b>"]
            ComplianceTable["<b>ship_compliance</b>"]
            BankTable["<b>bank_entries</b>"]
            PoolTable["<b>pools</b>"]
            PoolMemberTable["<b>pool_members</b>"]
        end
    end
    
    %% Frontend connections
    Browser --> App
    App --> RoutesTab
    App --> CompareTab
    App --> BankingTab
    App --> PoolingTab
    App --> Sidebar
    
    RoutesTab --> API_Client
    CompareTab --> API_Client
    BankingTab --> API_Client
    PoolingTab --> API_Client
    
    API_Client -->|"<b>HTTP Requests</b>"| Express
    
    %% Backend layer connections
    Express --> HTTPRoutes
    
    HTTPRoutes --> ComputeCB
    HTTPRoutes --> ComputeComparison
    HTTPRoutes --> Banking
    HTTPRoutes --> Pooling
    
    ComputeCB -.uses.-> DomainTypes
    ComputeComparison -.uses.-> DomainTypes
    Banking -.uses.-> DomainTypes
    Pooling -.uses.-> DomainTypes
    
    Banking --> RepositoryPort
    Pooling --> RepositoryPort
    HTTPRoutes --> RepositoryPort
    
    RepositoryPort -.implemented by.-> PrismaRepo
    PrismaRepo --> PrismaClient
    
    %% Database connections
    PrismaClient --> PostgreSQL
    
    PostgreSQL --> RouteTable
    PostgreSQL --> ComplianceTable
    PostgreSQL --> BankTable
    PostgreSQL --> PoolTable
    PostgreSQL --> PoolMemberTable
    
    %% Styling with better contrast
    classDef coreStyle fill:#e1f5ff,stroke:#0066cc,stroke-width:3px,color:#000
    classDef adapterStyle fill:#fff4e6,stroke:#ff9800,stroke-width:3px,color:#000
    classDef infraStyle fill:#f3e5f5,stroke:#9c27b0,stroke-width:3px,color:#000
    
    class ComputeCB,ComputeComparison,Banking,Pooling,DomainTypes,RepositoryPort coreStyle
    class HTTPRoutes,PrismaRepo adapterStyle
    class PrismaClient,PostgreSQL infraStyle
```
---
### Directory Structure

```
backend/  
├── src/  
│   ├── core/  
│   │   ├── domain/          # Types, constants (TARGET_INTENSITY, MJ_PER_TON)  
│   │   ├── application/     # Business logic (computeCB, pooling, comparison, banking)  
│   │   └── ports/           # Repository interfaces (dependency inversion)  
│   ├── adapters/  
│   │   ├── inbound/http/    # Express routes  
│   │   └── outbound/postgres/ # Prisma repository implementations  
│   └── infrastructure/  
│       ├── db/              # Prisma client  
│       └── server/          # Express app setup  
├── prisma/  
│   └── schema.prisma        # Database schema  
└── tests/                   # Unit and integration tests

frontend/
├── src/
│   ├── core/domain/         # Constants, types
│   ├── adapters/
│   │   ├── ui/tabs/         # Routes, Compare, Banking, Pooling tabs
│   │   └── infrastructure/  # API client
│   └── components/ui/       # Reusable UI components
└── tests/                   # Component tests
```

---

## Setup & Run

### Prerequisites

- Node.js v18+
- PostgreSQL

---

### Installation

**1. Clone repository:**
```bash
git clone <repository-url>
```

**2. Install backend dependencies:**
```bash
cd backend && npm install
```

**3. Install frontend dependencies:**
```bash
cd frontend && npm install
```

**4. Configure database:**
- Create PostgreSQL database
- Copy `backend/.env.example` to `backend/.env`
- Update `DATABASE_URL` with connection string

**5. Run migrations and seed data:**
```bash
cd backend
npx prisma migrate dev --name init
npx prisma db seed
```

---

### Running the Application

**Start backend (runs on port 4000):**
```bash
cd backend && npm run dev
```

**Start frontend (runs on port 5173):**
```bash
cd frontend && npm run dev
```

---

## Running Tests

**Backend tests:**
```bash
cd backend && npm test
```

**Frontend tests:**
```bash
cd frontend && npm test
```

---

## Compliance Formulas

### Energy Calculation

```
Energy (MJ) = fuelConsumption_t × 41,000 MJ/t
```

---

### Compliance Balance (CB)

```
CB_g = (TARGET_INTENSITY - actualIntensity) × Energy
CB_t = CB_g / 1,000,000
```

**Where:**
- `TARGET_INTENSITY` = 89.3368 gCO₂e/MJ (2025 target)
- `actualIntensity` = route's GHG intensity (gCO₂e/MJ)
- Positive CB = surplus (compliant)
- Negative CB = deficit (non-compliant)

---

### Percentage Difference (Route Comparison)

```
percentDiff = ((comparisonIntensity / baselineIntensity) - 1) × 100
compliant = (comparisonIntensity ≤ TARGET_INTENSITY)
```

---

## API Endpoints

### GET /api/routes

Retrieve all routes.

**Response:**
```json
[
  {
    "routeId": "R001",
    "vesselType": "Container",
    "fuelType": "HFO",
    "year": 2024,
    "ghgIntensity": 91.0,
    "fuelConsumption_t": 5000,
    "distance_km": 12000,
    "totalEmissions_t": 4500,
    "isBaseline": false
  }
]
```

---

### POST /api/routes/:routeId/baseline

Set a route as baseline for comparison.

**Request:**
```
POST /api/routes/R001/baseline
```

**Response:**
```json
{
  "routeId": "R001",
  "isBaseline": true,
  ...
}
```

---

### GET /api/routes/comparison

Compare all routes against the baseline.

**Response:**
```json
{
  "baseline": { "routeId": "R001", "ghgIntensity": 91.0, ... },
  "rows": [
    {
      "routeId": "R002",
      "baselineIntensity": 91.0,
      "comparisonIntensity": 88.0,
      "percentDiff": -3.30,
      "compliant": true
    }
  ]
}
```

---

### GET /api/compliance/cb?routeId=R001

Calculate compliance balance for a route.

**Response:**
```json
{
  "shipId": "R001",
  "year": 2024,
  "targetIntensity": 89.3368,
  "actualIntensity": 91.0,
  "energy_MJ": 205000000,
  "complianceBalance_gco2eq": -340956000
}
```

---

### POST /api/banking/bank

Bank surplus compliance balance.

**Request:**
```json
{
  "shipId": "R002",
  "year": 2024
}
```

**Response:**
```json
{
  "message": "Banked",
  "amount_banked": 150000000,
  "entry": { ... }
}
```

---

### POST /api/banking/apply

Apply banked credits to cover deficit.

**Request:**
```json
{
  "shipId": "R001",
  "year": 2024
}
```

**Response:**
```json
{
  "shipId": "R001",
  "year": 2024,
  "cb_before_g": -340956000,
  "applied_g": 150000000,
  "cb_after_g": -190956000,
  "remaining_bank_g": 0
}
```

---

### POST /api/pools

Create compliance pool with greedy redistribution algorithm.

**Request:**
```json
{
  "year": 2024,
  "members": [
    { "shipId": "R001", "cb_before_g": 200000000 },
    { "shipId": "R002", "cb_before_g": -150000000 }
  ]
}
```

**Response:**
```json
{
  "poolId": 1,
  "year": 2024,
  "members": [
    { "shipId": "R001", "cb_before": 200000000, "cb_after": 50000000 },
    { "shipId": "R002", "cb_before": -150000000, "cb_after": 0 }
  ]
}
```

---

## Feature Summary

| Tab | Purpose | Key Actions |
|-----|---------|-------------|
| **Routes** | View all vessel routes and set baseline | View routes, filter by vessel/fuel/year, set baseline, calculate CB |
| **Compare** | Compare routes against baseline | View percentage differences, check compliance status, visualize intensity chart |
| **Banking** | Manage surplus/deficit over time (Article 20) | Bank surplus CB, apply banked credits to deficits, view banking history |
| **Pooling** | Redistribute CB across vessels (Article 21) | Select pool members, validate pool sum ≥ 0, create pool with greedy algorithm |

---

## Screenshots
### Routes
![Routes](assets/routes.png)
Routes tab showing vessel data and baseline selection
### Compare Tab
![Routes](assets/compare.png)
Compare tab with baseline vs comparison chart
### Banking Tab
![Routes](assets/banking.png)
Banking tab with CB calculation and banking actions
### Pooling Tab
![Routes](assets/pooling.png)
Pooling tab with member selection and pool creation

---

## Notes

The system implements core FuelEU Maritime compliance mechanisms: CB calculation, banking (temporal flexibility), and pooling (collective compliance). All formulas use `TARGET_INTENSITY_2025 = 89.3368 gCO₂e/MJ` and `MJ_PER_TON = 41,000`. The pooling algorithm uses a greedy approach to redistribute surplus to deficits, requiring total pool CB ≥ 0.