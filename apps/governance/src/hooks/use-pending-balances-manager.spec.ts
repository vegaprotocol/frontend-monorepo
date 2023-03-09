import { act } from '@testing-library/react';
import { usePendingBalancesStore } from './use-pending-balances-manager';
import type { Event } from 'ethers';

afterEach(() => {
  usePendingBalancesStore.setState((state) => ({
    ...state,
    pendingBalances: [],
  }));
});

const event1 = { transactionHash: 'tx1' } as Event;
const event2 = { transactionHash: 'tx2' } as Event;

describe('usePendingBalancesStore', () => {
  it('should add new events to the pendingBalances state and remove duplicates', () => {
    const { addPendingTxs } = usePendingBalancesStore.getState();
    const duplicateEvent = { transactionHash: 'tx1' } as Event;

    act(() => {
      addPendingTxs([event1, duplicateEvent]);
    });

    expect(usePendingBalancesStore.getState().pendingBalances).toEqual([
      event1,
    ]);

    act(() => {
      addPendingTxs([event2]);
    });

    expect(usePendingBalancesStore.getState().pendingBalances).toEqual([
      event1,
      event2,
    ]);
  });

  it('should remove a specific event from the pendingBalances state', () => {
    const { addPendingTxs, removePendingTx } =
      usePendingBalancesStore.getState();
    const eventToRemove = { transactionHash: 'tx1' } as Event;

    act(() => {
      addPendingTxs([eventToRemove, event2]);
    });
    expect(usePendingBalancesStore.getState().pendingBalances).toEqual([
      eventToRemove,
      event2,
    ]);

    act(() => {
      removePendingTx(eventToRemove);
    });
    expect(usePendingBalancesStore.getState().pendingBalances).toEqual([
      event2,
    ]);
  });

  it('should reset the pendingBalances state', () => {
    const { addPendingTxs, resetPendingTxs } =
      usePendingBalancesStore.getState();

    act(() => {
      addPendingTxs([event1, event2]);
    });
    expect(usePendingBalancesStore.getState().pendingBalances).toEqual([
      event1,
      event2,
    ]);

    act(() => {
      resetPendingTxs();
    });
    expect(usePendingBalancesStore.getState().pendingBalances).toEqual([]);
  });
});
