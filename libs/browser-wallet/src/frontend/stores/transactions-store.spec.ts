import { useTransactionsStore } from './transactions-store';

const initialState = useTransactionsStore.getState();

describe('TransactionStore', () => {
  beforeEach(() => {
    useTransactionsStore.setState(initialState);
  });

  it('loads transactions', async () => {
    const state = useTransactionsStore.getState();
    expect(state.loading).toBe(true);
    const mockRequest = jest.fn().mockResolvedValue({
      transactions: [
        {
          id: 'some-id',
        },
      ],
    });
    await state.loadTransactions(mockRequest);
    expect(useTransactionsStore.getState().transactions).toHaveLength(1);
  });
  it('sets loading to false on error', async () => {
    const state = useTransactionsStore.getState();
    const mockRequest = jest.fn().mockRejectedValue(new Error('test error'));
    try {
      await state.loadTransactions(mockRequest);
    } catch {}
    expect(useTransactionsStore.getState().loading).toBe(false);
  });
});
