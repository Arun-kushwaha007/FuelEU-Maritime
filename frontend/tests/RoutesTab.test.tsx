import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RoutesTab from '../src/adapters/ui/tabs/RoutesTab';
import { api } from '../src/adapters/infrastructure/api';

vi.mock('../src/adapters/infrastructure/api');

const mockedApi = api as any;

const mockRoutes = [
  {
    routeId: 'R001',
    vesselType: 'Container',
    fuelType: 'HFO',
    year: 2024,
    ghgIntensity: 91.0,
    fuelConsumption_t: 5000,
    distance_km: 12000,
    totalEmissions_t: 4500,
    isBaseline: false,
  },
  {
    routeId: 'R002',
    vesselType: 'BulkCarrier',
    fuelType: 'LNG',
    year: 2024,
    ghgIntensity: 88.0,
    fuelConsumption_t: 4800,
    distance_km: 11500,
    totalEmissions_t: 4200,
    isBaseline: true,
  },
];

describe('RoutesTab', () => {
  beforeEach(() => {
    mockedApi.get.mockResolvedValue({ data: mockRoutes });
    mockedApi.post.mockResolvedValue({ data: {} });
  });

  it('should render the component and display routes', async () => {
    render(<RoutesTab />);

    await waitFor(() => {
      expect(screen.getByText('R001')).toBeInTheDocument();
      expect(screen.getByText('R002')).toBeInTheDocument();
    });
  });
});
