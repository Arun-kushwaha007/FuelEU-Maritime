import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CompareTab from '../src/adapters/ui/tabs/CompareTab';
import { api } from '../src/adapters/infrastructure/api';

vi.mock('../src/adapters/infrastructure/api');

const mockedApi = api as any;

const mockComparisonData = {
  baseline: {
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
  rows: [
    {
      routeId: 'R001',
      baselineIntensity: 88.0,
      comparisonIntensity: 91.0,
      percentDiff: 3.41,
      compliant: false,
    },
  ],
};

describe('CompareTab', () => {
  beforeEach(() => {
    mockedApi.get.mockResolvedValue({ data: mockComparisonData });
  });

  it('should render the component and display comparison data', async () => {
    const setSidebarProps = vi.fn();
    render(<CompareTab setSidebarProps={setSidebarProps} />);

    await waitFor(() => {
      expect(screen.getByText('R001')).toBeInTheDocument();
      expect(screen.getByText('88.000')).toBeInTheDocument();
      expect(screen.getByText('91.000')).toBeInTheDocument();
      expect(screen.getByText('3.41%')).toBeInTheDocument();
      expect(screen.getByText('No')).toBeInTheDocument();
    });
  });
});
