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
  vegaPublicKey: string,
  numberOfConfirmations: number
) => {
  const { addPendingTxs, removePendingTx } = usePendingBalancesStore(
    (state) => ({
      addPendingTxs: state.addPendingTxs,
      removePendingTx: state.removePendingTx,
    })
  );
  const addFilter = useRef(
    contract.filters.Stake_Deposited(null, null, `0x${vegaPublicKey}`)
  );
  const removeFilter = useRef(
    contract.filters.Stake_Removed(null, null, `0x${vegaPublicKey}`)
  );

  useListenForEthPendingBalances(
    numberOfConfirmations,
    contract,
    addFilter.current,
    addPendingTxs,
    removePendingTx
  );

  useListenForEthPendingBalances(
    numberOfConfirmations,
    contract,
    removeFilter.current,
    addPendingTxs,
    removePendingTx
  );
};

export const useListenForEthPendingBalances = (
  numberOfConfirmations: number,
  contract: Contract,
  filter: EventFilter,
  addPendingTxs: (event: Event[]) => void,
  removePendingTx: (event: Event) => void
) => {
  const { provider } = useWeb3React();

  useEffect(() => {
    console.log('add');
    if (!contract) {
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

  const getExistingTransactions = useCallback(async () => {
    const blockNumber = (await provider?.getBlockNumber()) || 0;
    return await contract.queryFilter(
      filter,
      blockNumber - numberOfConfirmations
    );
  }, [contract, filter, numberOfConfirmations, provider]);

  const processWaitForExistingTransactions = useCallback(
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
        processWaitForExistingTransactions([...events], numberOfConfirmations);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [
    addPendingTxs,
    getExistingTransactions,
    numberOfConfirmations,
    processWaitForExistingTransactions,
  ]);
};
