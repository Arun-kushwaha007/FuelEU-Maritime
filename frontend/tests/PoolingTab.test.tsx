import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PoolingTab from '../src/adapters/ui/tabs/PoolingTab';
import { api } from '../src/adapters/infrastructure/api';

vi.mock('../src/adapters/infrastructure/api');

const mockedApi = api as any;

const mockMembers = [
  { shipId: 'R001', cb_before_g: 1000000 },
  { shipId: 'R002', cb_before_g: -500000 },
];

describe('PoolingTab', () => {
  beforeEach(() => {
    mockedApi.get.mockResolvedValue({ data: mockMembers });
    mockedApi.post.mockResolvedValue({ data: { members: [] } });
  });

  it('should render the component and display pool members', async () => {
    const setSidebarProps = vi.fn();
    render(<PoolingTab setSidebarProps={setSidebarProps} />);

    await waitFor(() => {
      expect(screen.getByText('R001')).toBeInTheDocument();
      expect(screen.getByText('R002')).toBeInTheDocument();
    });
  });

  it('should enable the "Create Pool" button when a valid pool is selected', async () => {
    const setSidebarProps = vi.fn();
    render(<PoolingTab setSidebarProps={setSidebarProps} />);

    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);
      fireEvent.click(checkboxes[1]);
    });

    expect(screen.getByText('Create Pool')).toBeEnabled();
  });
});
