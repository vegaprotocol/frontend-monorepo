import { useVegaTransactionManager } from './use-vega-transaction-manager';
import { renderHook } from '@testing-library/react';
import waitForNextTick from 'flush-promises';
import { type TransactionResponse } from '@vegaprotocol/wallet';
import { VegaTxStatus } from './types';
import {
  type VegaTransactionStore,
  type VegaStoredTxState,
} from './use-vega-transaction-store';

const mockSendTx = jest.fn();

const pubKey = 'pubKey';

const mockDisconnect = jest.fn();
jest.mock('@vegaprotocol/wallet', () => ({
  ...jest.requireActual('@vegaprotocol/wallet'),
  useVegaWallet: () => ({
    sendTx: mockSendTx,
    pubKey,
    disconnect: mockDisconnect,
  }),
}));

const transactionHash = 'txHash';
const signature = 'signature';
const receivedAt = 'receivedAt';
const sentAt = 'sentAt';
const transactionResponse: TransactionResponse = {
  transactionHash,
  signature,
  receivedAt,
  sentAt,
};

const pendingTransactionUpdate = {
  status: VegaTxStatus.Pending,
  txHash: transactionHash,
  signature,
};

const update = jest.fn();
const del = jest.fn();
const defaultState: Partial<VegaTransactionStore> = {
  transactions: [
    {
      id: 0,
      status: VegaTxStatus.Requested,
    } as VegaStoredTxState,
    {
      id: 1,
      status: VegaTxStatus.Requested,
    } as VegaStoredTxState,
  ],
  update,
  delete: del,
};

const mockTransactionStoreState = jest.fn<Partial<VegaTransactionStore>, []>();

jest.mock('./use-vega-transaction-store', () => ({
  useVegaTransactionStore: (
    selector: (state: Partial<VegaTransactionStore>) => void
  ) => selector(mockTransactionStoreState()),
}));

describe('useVegaTransactionManager', () => {
  beforeEach(() => {
    update.mockReset();
    del.mockReset();
    mockSendTx.mockReset();
    mockTransactionStoreState.mockReset();
  });

  it('sendTx of first pending transaction', async () => {
    mockTransactionStoreState.mockReturnValue(defaultState);
    mockSendTx.mockResolvedValue(transactionResponse);
    let result = renderHook(useVegaTransactionManager);
    result.rerender();
    expect(update).not.toBeCalled();
    await waitForNextTick();
    expect(update.mock.calls[0]).toEqual([0, pendingTransactionUpdate]);
    expect(update.mock.calls[1]).toEqual([1, pendingTransactionUpdate]);

    update.mockReset();
    result = renderHook(useVegaTransactionManager);
    await waitForNextTick();
    expect(update).toBeCalled();
    expect(update.mock.calls[0]).toEqual([0, pendingTransactionUpdate]);
    result.rerender();
    await waitForNextTick();
    expect(update.mock.calls[1]).toEqual([1, pendingTransactionUpdate]);
  });

  it('del transaction on null response', async () => {
    mockTransactionStoreState.mockReturnValue(defaultState);
    mockSendTx.mockResolvedValue(null);
    renderHook(useVegaTransactionManager);
    await waitForNextTick();
    expect(update).not.toBeCalled();
    expect(del).toBeCalled();
  });

  it('sets error on reject', async () => {
    mockTransactionStoreState.mockReturnValue(defaultState);
    mockSendTx.mockRejectedValue(null);
    renderHook(useVegaTransactionManager);
    await waitForNextTick();
    expect(mockDisconnect).not.toHaveBeenCalledWith();
    expect(update).toBeCalled();
    expect(update.mock.calls[0][1]?.status).toEqual(VegaTxStatus.Error);
  });

  it('call disconnect if detect no service error', async () => {
    mockTransactionStoreState.mockReturnValue(defaultState);
    mockSendTx.mockRejectedValue(new TypeError('Failed to fetch'));
    renderHook(useVegaTransactionManager);
    await waitForNextTick();
    expect(mockDisconnect).toHaveBeenCalledWith();
    expect(update).toBeCalled();
    expect(update.mock.calls[0][1]?.status).toEqual(VegaTxStatus.Error);
  });
});
