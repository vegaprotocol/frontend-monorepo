import { useWeb3React } from '@web3-react/core';
import type { Contract, EventFilter, Event } from 'ethers';
import uniqBy from 'lodash/uniqBy';
import { useCallback, useEffect, useMemo } from 'react';

import create from 'zustand';

export type EthereumStore = {
  pendingBalances: Event[];
  addPendingTxs: (event: Event[]) => void;
  removePendingTx: (event: Event) => void;
  resetPendingTxs: () => void;
};

export const usePendingBalancesStore = create<EthereumStore>((set, get) => ({
  pendingBalances: [],
  addPendingTxs: (event: Event[]) => {
    set({
      pendingBalances: uniqBy(
        [...get().pendingBalances, ...event],
        'transactionHash'
      ),
    });
  },
  removePendingTx: (event: Event) => {
    set({
      pendingBalances: [
        ...get().pendingBalances.filter(
          ({ transactionHash }) => transactionHash !== event.transactionHash
        ),
      ],
    });
  },
  resetPendingTxs: () => {
    set({ pendingBalances: [] });
  },
}));

export const useListenForStakingEvents = (
  contract: Contract | undefined,
  vegaPublicKey: string | null,
  numberOfConfirmations: number
) => {
  const { addPendingTxs, removePendingTx, resetPendingTxs } =
    usePendingBalancesStore((state) => ({
      addPendingTxs: state.addPendingTxs,
      removePendingTx: state.removePendingTx,
      resetPendingTxs: state.resetPendingTxs,
    }));
  const addFilter = useMemo(
    () =>
      vegaPublicKey && contract
        ? contract.filters.Stake_Deposited(null, null, `0x${vegaPublicKey}`)
        : null,
    [contract, vegaPublicKey]
  );
  const removeFilter = useMemo(
    () =>
      vegaPublicKey && contract
        ? contract.filters.Stake_Removed(null, null, `0x${vegaPublicKey}`)
        : null,
    [contract, vegaPublicKey]
  );

  /**
   * Listen for all add stake events
   */
  useListenForPendingEthEvents(
    numberOfConfirmations,
    contract,
    addFilter,
    addPendingTxs,
    removePendingTx,
    resetPendingTxs
  );

  /**
   * Listen for all remove stake events
   */
  useListenForPendingEthEvents(
    numberOfConfirmations,
    contract,
    removeFilter,
    addPendingTxs,
    removePendingTx,
    resetPendingTxs
  );
};

export const useListenForPendingEthEvents = (
  numberOfConfirmations: number,
  contract: Contract | undefined,
  filter: EventFilter | null,
  addPendingTxs: (event: Event[]) => void,
  removePendingTx: (event: Event) => void,
  resetPendingTxs: () => void
) => {
  const { provider } = useWeb3React();

  /**
   * Add listener for the ethereum events on the contract passed in for the filter passed in.
   * Push the event into the store and wait for the correct number of confirmations before removing it.
   */
  useEffect(() => {
    if (!contract || !filter) {
      return;
    }

    const listener = async (...args: any[]) => {
      const event = args[3] as Event;
      addPendingTxs([event]);
      const tx = await event.getTransaction();
      await tx.wait(numberOfConfirmations);
      removePendingTx(event);
    };

    contract?.on(filter, listener);

    return () => {
      contract?.off(filter, listener);
    };
  }, [addPendingTxs, contract, filter, numberOfConfirmations, removePendingTx]);

  /**
   * Get all transactions that exist on the blockchain but have yet to reach the number of confirmations
   */
  const getExistingTransactions = useCallback(async () => {
    const blockNumber = (await provider?.getBlockNumber()) || 0;
    if (!filter || !contract) {
      return [];
    }
    return await contract.queryFilter(
      filter,
      blockNumber - numberOfConfirmations
    );
  }, [contract, filter, numberOfConfirmations, provider]);

  const waitForExistingTransactions = useCallback(
    (events: Event[], numberOfConfirmations: number) => {
      events.map(async (event) => {
        const tx = await event.getTransaction();

        await tx.wait(Math.max(numberOfConfirmations, 0));

        removePendingTx(event);
      });
    },
    [removePendingTx]
  );

  useEffect(() => {
    let cancelled = false;
    resetPendingTxs();
    getExistingTransactions().then((events) => {
      if (!cancelled) {
        addPendingTxs([...events]);
        waitForExistingTransactions([...events], numberOfConfirmations);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [
    addPendingTxs,
    getExistingTransactions,
    numberOfConfirmations,
    resetPendingTxs,
    waitForExistingTransactions,
  ]);
};
