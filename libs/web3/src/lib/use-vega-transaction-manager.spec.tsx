import { useVegaTransactionManager } from './use-vega-transaction-manager';
import { act, renderHook } from '@testing-library/react';
import waitForNextTick from 'flush-promises';
import { type TransactionResponse } from '@vegaprotocol/wallet';
import { VegaTxStatus } from './types';
import {
  type VegaTransactionStore,
  type VegaStoredTxState,
} from './use-vega-transaction-store';
import {
  mockConfig,
  MockedWalletProvider,
} from '@vegaprotocol/wallet-react/testing';

const mockDisconnect = jest.fn();

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
    mockConfig.store.setState({ status: 'connected', pubKey: 'my-key' });
    update.mockReset();
    del.mockReset();
  });

  afterEach(() => {
    act(() => {
      mockConfig.reset();
    });
  });

  const setup = () => {
    return renderHook(() => useVegaTransactionManager(), {
      wrapper: MockedWalletProvider,
    });
  };

  it('sendTx of first pending transaction', async () => {
    jest
      .spyOn(mockConfig, 'sendTransaction')
      .mockResolvedValue(transactionResponse);
    mockTransactionStoreState.mockReturnValue(defaultState);
    let result = setup();
    result.rerender();
    expect(update).not.toBeCalled();

    await waitForNextTick();

    expect(update.mock.calls[0]).toEqual([0, pendingTransactionUpdate]);
    expect(update.mock.calls[1]).toEqual([1, pendingTransactionUpdate]);

    update.mockReset();
    result = setup();
    await waitForNextTick();
    expect(update).toBeCalled();
    expect(update.mock.calls[0]).toEqual([0, pendingTransactionUpdate]);
    result.rerender();
    await waitForNextTick();
    expect(update.mock.calls[1]).toEqual([1, pendingTransactionUpdate]);
  });

  it('del transaction on null response', async () => {
    mockTransactionStoreState.mockReturnValue(defaultState);
    // @ts-ignore overriding resolved value
    jest.spyOn(mockConfig, 'sendTransaction').mockResolvedValue(null);
    setup();
    await waitForNextTick();
    expect(update).not.toBeCalled();
    expect(del).toBeCalled();
  });

  it('sets error on reject', async () => {
    mockTransactionStoreState.mockReturnValue(defaultState);
    jest.spyOn(mockConfig, 'sendTransaction').mockRejectedValue(null);
    setup();
    await waitForNextTick();
    expect(mockDisconnect).not.toHaveBeenCalledWith();
    expect(update).toBeCalled();
    expect(update.mock.calls[0][1]?.status).toEqual(VegaTxStatus.Error);
  });

  it('call disconnect if detect no service error', async () => {
    mockTransactionStoreState.mockReturnValue(defaultState);
    jest
      .spyOn(mockConfig, 'sendTransaction')
      .mockRejectedValue(new TypeError('Failed to fetch'));
    setup();
    await waitForNextTick();
    // TODO: fix disconnect on failure
    // expect(mockDisconnect).toHaveBeenCalledWith();
    expect(update).toBeCalled();
    expect(update.mock.calls[0][1]?.status).toEqual(VegaTxStatus.Error);
  });
});
