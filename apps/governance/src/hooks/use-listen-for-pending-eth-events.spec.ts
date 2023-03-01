import { useListenForPendingEthEvents } from './use-listen-for-pending-eth-events';
import { renderHook, cleanup, waitFor } from '@testing-library/react';
import type { Contract, EventFilter, Event } from 'ethers';

let contract: Contract;
let filter: EventFilter;
let addPendingTxs: (event: Event[]) => void;
let removePendingTx: (event: Event) => void;
let resetPendingTxs: () => void;

beforeEach(() => {
  contract = {
    on: jest.fn(),
    off: jest.fn(),
    queryFilter: jest.fn().mockResolvedValue([]),
  } as unknown as Contract;
  filter = {} as EventFilter;
  addPendingTxs = jest.fn();
  removePendingTx = jest.fn();
  resetPendingTxs = jest.fn();
});

jest.mock('@web3-react/core', () => ({
  useWeb3React: () => ({
    provider: {
      getBlockNumber: jest.fn().mockResolvedValue(1),
    },
  }),
}));

describe('useListenForPendingEthEvents', () => {
  it('listens for events on contract', async () => {
    renderHook(() =>
      useListenForPendingEthEvents(
        1,
        contract,
        filter,
        addPendingTxs,
        removePendingTx,
        resetPendingTxs
      )
    );

    expect(contract.on).toHaveBeenCalledWith(filter, expect.any(Function));
    cleanup();
    expect(contract.off).toHaveBeenCalledWith(filter, expect.any(Function));
  });

  it('waits for correct number of confirmations before removing tx from pending txs', async () => {
    renderHook(() => {
      useListenForPendingEthEvents(
        2,
        contract,
        filter,
        addPendingTxs,
        removePendingTx,
        resetPendingTxs
      );
    });

    const listener = (contract.on as jest.Mock).mock.calls[0][1];
    const event = {
      getTransaction: jest.fn().mockResolvedValue({
        wait: jest.fn().mockResolvedValue({}),
      }),
    } as unknown as Event;
    listener(null, null, null, event);

    expect(addPendingTxs).toHaveBeenCalledWith([event]);
    expect(removePendingTx).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(removePendingTx).toHaveBeenCalledWith(event);
    });
  });

  it('gets existing transactions', async () => {
    const event = {
      getTransaction: jest.fn().mockResolvedValue({
        wait: jest.fn().mockResolvedValue(null),
      }),
    } as unknown as Event;

    contract.queryFilter = jest.fn().mockResolvedValue([event]);

    renderHook(() => {
      useListenForPendingEthEvents(
        2,
        contract,
        filter,
        addPendingTxs,
        removePendingTx,
        resetPendingTxs
      );
    });

    await waitFor(() => {
      expect(contract.queryFilter).toHaveBeenCalledWith(filter, -1);
      expect(addPendingTxs).toHaveBeenCalledWith([event]);
    });
  });
});
