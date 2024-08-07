import { render, screen } from '@testing-library/react';

import { useTransactionsStore } from '@/stores/transactions-store';
import { mockStore } from '@/test-helpers/mock-store';

import { TransactionsIndex } from '.';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Outlet: () => <div data-testid="outlet" />,
}));

const mockRequest = jest.fn().mockResolvedValue(null);

jest.mock('@/contexts/json-rpc/json-rpc-context', () => ({
  useJsonRpcClient: () => ({
    request: mockRequest,
  }),
}));
jest.mock('@/stores/transactions-store');

const renderComponent = () => {
  return render(<TransactionsIndex />);
};

describe('TransactionsIndex', () => {
  it('renders nothing while loading transactions', async () => {
    const loadTransactions = jest.fn();
    mockStore(useTransactionsStore, {
      transactions: [],
      loading: true,
      loadTransactions,
    });
    const view = renderComponent();
    expect(view.container).toBeEmptyDOMElement();
    expect(loadTransactions).toHaveBeenCalledWith(mockRequest);
    expect(loadTransactions).toHaveBeenCalledTimes(1);
  });
  it('renders outlet after loading has completed', async () => {
    const loadTransactions = jest.fn();
    mockStore(useTransactionsStore, {
      transactions: [],
      loading: false,
      loadTransactions,
    });
    renderComponent();
    expect(screen.getByTestId('outlet')).toBeInTheDocument();
  });
});
