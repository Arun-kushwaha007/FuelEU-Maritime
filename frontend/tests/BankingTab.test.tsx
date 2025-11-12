import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import BankingTab from '../src/adapters/ui/tabs/BankingTab';
import { api } from '../src/adapters/infrastructure/api';

vi.mock('../src/adapters/infrastructure/api');

const mockedApi = api as any;

describe('BankingTab', () => {
  beforeEach(() => {
    mockedApi.get.mockImplementation((url: string) => {
      if (url.startsWith('/compliance/adjusted-cb')) {
        return Promise.resolve({ data: [{ shipId: 'R001', cb_before_g: 1000000 }] });
      }
      if (url.startsWith('/banking/records')) {
        return Promise.resolve({ data: { totalBanked: 500000 } });
      }
      return Promise.reject(new Error('not found'));
    });
    mockedApi.post.mockResolvedValue({ data: {} });
  });

  it('should render the component and display data after fetching', async () => {
    const setSidebarProps = vi.fn();
    render(<BankingTab setSidebarProps={setSidebarProps} />);

    fireEvent.click(screen.getByText('Fetch CB + Bank Data'));

    expect(await screen.findByText(/1.000 tCO₂e/)).toBeInTheDocument();
    expect(await screen.findByText(/0.500 t\)/)).toBeInTheDocument();
  });

  it('should call the bank surplus endpoint when the "Bank Surplus" button is clicked', async () => {
    const setSidebarProps = vi.fn();
    render(<BankingTab setSidebarProps={setSidebarProps} />);

    fireEvent.click(screen.getByText('Fetch CB + Bank Data'));

    // Wait for the button to be enabled
    const bankButton = await screen.findByText('Bank Surplus');
    fireEvent.click(bankButton);
    
    expect(mockedApi.post).toHaveBeenCalledWith('/banking/bank', { shipId: 'R001', year: 2024 });
  });
});
