import { render, screen } from '@testing-library/react';
import { MemoryRouter, useParams } from 'react-router-dom';

import { useTransactionsStore } from '@/stores/transactions-store';
import { mockStore } from '@/test-helpers/mock-store';
import { silenceErrors } from '@/test-helpers/silence-errors';

import { TransactionDetails } from './details';

jest.mock('./transaction-data', () => ({
  TransactionData: () => <div data-testid="transaction-data" />,
}));
jest.mock('./transaction-metadata', () => ({
  TransactionMetadata: () => <div data-testid="transaction-metadata" />,
}));
jest.mock('@/stores/transactions-store');

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));

const renderComponent = () => {
  return render(
    <MemoryRouter>
      <TransactionDetails />
    </MemoryRouter>
  );
};

describe('TransactionDetails', () => {
  it('throws error if transaction is not found', async () => {
    silenceErrors();
    mockStore(useTransactionsStore, { transactions: [] });
    (useParams as jest.Mock).mockReturnValue({ id: undefined });
    expect(() => renderComponent()).toThrow(
      'Could not find transaction with id undefined'
    );
  });
  it('renders the transaction metadata and transaction data', async () => {
    mockStore(useTransactionsStore, {
      transactions: [{ id: '1', transaction: { transfer: {} } }],
    });
    (useParams as jest.Mock).mockReturnValue({ id: '1' });
    renderComponent();
    expect(screen.getByTestId('transaction-metadata')).toBeInTheDocument();
    expect(screen.getByTestId('transaction-data')).toBeInTheDocument();
  });
});
