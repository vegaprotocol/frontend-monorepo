import { type TransactionMessage } from '@/lib/transactions';

import { useInteractionStore } from './interaction-store';

const initialState = useInteractionStore.getState();

const mockTransaction = {
  transaction: {},
  publicKey: 'foo',
  name: 'bar',
  wallet: 'baz',
  sendingMode: 'TYPE_SYNC',
  origin: 'qux',
  receivedAt: new Date().toISOString(),
} as TransactionMessage;

describe('InteractionStore', () => {
  beforeEach(() => {
    useInteractionStore.setState(initialState);
  });
  it('transaction modal sets modal as open and resolves promise with value', () => {
    expect(useInteractionStore.getState().transactionModalOpen).toBe(false);
    expect(useInteractionStore.getState().transactionPromise).toBeNull();
    const promise = useInteractionStore
      .getState()
      .handleTransaction(mockTransaction);
    expect(useInteractionStore.getState().transactionModalOpen).toBe(true);
    expect(useInteractionStore.getState().transactionPromise).not.toBeNull();
    useInteractionStore.getState().handleTransactionDecision(true);
    expect(useInteractionStore.getState().transactionModalOpen).toBe(false);
    expect(useInteractionStore.getState().transactionPromise).toBeNull();
    expect(useInteractionStore.getState().currentTransactionDetails).toBeNull();
    return expect(promise).resolves.toBe(true);
  });
  it('transaction resolves with false if not approved', () => {
    expect(useInteractionStore.getState().transactionModalOpen).toBe(false);
    expect(useInteractionStore.getState().transactionPromise).toBeNull();
    const promise = useInteractionStore
      .getState()
      .handleTransaction(mockTransaction);
    expect(useInteractionStore.getState().transactionModalOpen).toBe(true);
    expect(useInteractionStore.getState().transactionPromise).not.toBeNull();
    useInteractionStore.getState().handleTransactionDecision(false);
    expect(useInteractionStore.getState().transactionModalOpen).toBe(false);
    expect(useInteractionStore.getState().transactionPromise).toBeNull();
    expect(useInteractionStore.getState().currentTransactionDetails).toBeNull();
    return expect(promise).resolves.toBe(false);
  });
  it('transaction clears state when promise could not be found', () => {
    useInteractionStore.setState({
      transactionModalOpen: true,
      transactionPromise: null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      currentTransactionDetails: {} as any,
    });
    useInteractionStore.getState().handleTransactionDecision(false);
    expect(useInteractionStore.getState().transactionModalOpen).toBe(false);
    expect(useInteractionStore.getState().transactionPromise).toBeNull();
    expect(useInteractionStore.getState().currentTransactionDetails).toBeNull();
  });
  it('checks the transaction', async () => {
    const request = jest.fn();
    await useInteractionStore
      .getState()
      .checkTransaction(
        request,
        { transfer: {} },
        '0'.repeat(64),
        'https://foo.com'
      );
    expect(request).toHaveBeenCalledWith(
      'admin.check_transaction',
      {
        transaction: { transfer: {} },
        origin: 'https://foo.com',
        publicKey: '0'.repeat(64),
      },
      true
    );
  });
});
