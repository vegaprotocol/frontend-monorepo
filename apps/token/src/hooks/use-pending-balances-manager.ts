import { useWeb3React } from '@web3-react/core';
import type { Contract, EventFilter, Event } from 'ethers';
import uniqBy from 'lodash/uniqBy';
import { useCallback, useEffect, useRef } from 'react';

import create from 'zustand';

export type EthereumStore = {
  pendingBalances: Event[];
  addPendingTxs: (event: Event[]) => void;
  removePendingTx: (event: Event) => void;
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
}));

export const useListenForStakingEvents = (
  contract: Contract,
  vegaPublicKey: string | null,
  numberOfConfirmations: number
) => {
  const { addPendingTxs, removePendingTx } = usePendingBalancesStore(
    (state) => ({
      addPendingTxs: state.addPendingTxs,
      removePendingTx: state.removePendingTx,
    })
  );
  const addFilter = useRef(
    vegaPublicKey
      ? contract.filters.Stake_Deposited(null, null, `0x${vegaPublicKey}`)
      : null
  );
  const removeFilter = useRef(
    vegaPublicKey
      ? contract.filters.Stake_Removed(null, null, `0x${vegaPublicKey}`)
      : null
  );

  /**
   * Listen for all add stake events
   */
  useListenForPendingEthEvents(
    numberOfConfirmations,
    contract,
    addFilter.current,
    addPendingTxs,
    removePendingTx
  );

  /**
   * Listen for all remove stake events
   */
  useListenForPendingEthEvents(
    numberOfConfirmations,
    contract,
    removeFilter.current,
    addPendingTxs,
    removePendingTx
  );
};

export const useListenForPendingEthEvents = (
  numberOfConfirmations: number,
  contract: Contract,
  filter: EventFilter | null,
  addPendingTxs: (event: Event[]) => void,
  removePendingTx: (event: Event) => void
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
    if (!filter) {
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
    waitForExistingTransactions,
  ]);
};
