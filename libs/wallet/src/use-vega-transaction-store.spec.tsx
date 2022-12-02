import {
  useVegaTransactionStore,
  useVegaWalletTransactionUpdater,
  useVegaWalletTransactionManager,
} from './use-vega-transaction-store';
import { VegaTxStatus } from './use-vega-transaction';
import type { OrderCancellationBody } from './connectors/vega-connector';

jest.mock('zustand');

describe('useVegaTransactionStore', () => {
  it('exists', () => {
    expect(useVegaTransactionStore).toBeTruthy();
  });

  it('creates transaction with default values', () => {
    const orderCancellation: OrderCancellationBody = { orderCancellation: {} };
    expect(useVegaTransactionStore).toBeTruthy();
    useVegaTransactionStore.getState().create(orderCancellation);
    const transaction = useVegaTransactionStore.getState().transactions[0];
    expect(transaction?.createdAt).toBeTruthy();
    expect(transaction?.status).toEqual(VegaTxStatus.Requested);
    expect(transaction?.body).toEqual(orderCancellation);
    expect(transaction?.dialogOpen).toEqual(true);
  });
  it('updates transaction by index/id', () => {
    expect(true).toEqual(false);
  });
  it('sets dialogOpen to false on dismiss', () => {
    expect(true).toEqual(false);
  });
  it('updates withdrawal', () => {
    expect(true).toEqual(false);
  });
  it('updates transaction result', () => {
    expect(true).toEqual(false);
  });
});

describe('useVegaWalletTransactionManager', () => {
  it('sendTx of first pending transaction', () => {
    expect(true).toEqual(false);
  });
});

describe('useVegaWalletTransactionUpdater', () => {
  it('calls updateOrder on order bus event', () => {
    expect(true).toEqual(false);
  });

  it('calls updateWithdrawal on withdrawal bus event', () => {
    expect(true).toEqual(false);
  });

  it('calls updateTransaction on transaction event', () => {
    expect(true).toEqual(false);
  });
});
