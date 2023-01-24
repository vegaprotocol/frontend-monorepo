import { useListenForPendingEthEvents } from './use-listen-for-pending-eth-events';
import { renderHook } from '@testing-library/react';
import { Web3ReactProvider } from '@web3-react/core';
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

    // mock that event is confirmed
    event.getTransaction = jest.fn().mockResolvedValue({
      wait: jest.fn().mockResolvedValue(null),
    });
    await listener(null, null, null, event);
    expect(removePendingTx).toHaveBeenCalledWith(event);
  });

  it('gets existing transactions and waits for confirmations', async () => {
    contract.queryFilter = jest.fn().mockResolvedValue([{} as Event]);

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

    expect(contract.queryFilter).toHaveBeenCalledWith(filter, -1);
    expect(addPendingTxs).toHaveBeenCalledWith([{} as Event]);
    expect(removePendingTx).not.toHaveBeenCalled();

    // mock that event is confirmed
    const event = {
      getTransaction: jest.fn().mockResolvedValue({
        wait: jest.fn().mockResolvedValue(null),
      }),
    } as unknown as Event;

    event.getTransaction = jest.fn().mockResolvedValue({
      wait: jest.fn().mockResolvedValue(null),
    });
    await renderHook(async () => {
      await (useListenForPendingEthEvents as any)(
        2,
        contract,
        filter,
        addPendingTxs,
        removePendingTx,
        resetPendingTxs
      ).waitForExistingTransactions([event], 2);
    });
    expect(removePendingTx).toHaveBeenCalledWith(event);
  });
});
