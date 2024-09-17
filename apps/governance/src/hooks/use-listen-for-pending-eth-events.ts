import { useWeb3React } from '@web3-react/core';
import { useCallback, useEffect } from 'react';
import type { Contract, Event, EventFilter } from 'ethers';

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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const listener = async (...args: any[]) => {
      try {
        const event = args[3] as Event;
        addPendingTxs([event]);
        const tx = await event.getTransaction();
        await tx.wait(numberOfConfirmations);
        removePendingTx(event);
      } catch (e) {
        console.error(`Error listening for pending eth events ${e}`);
      }
    };

    contract.on(filter, listener);

    return () => {
      contract.off(filter, listener);
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
    try {
      return await contract.queryFilter(
        filter,
        blockNumber - numberOfConfirmations
      );
    } catch (e) {
      console.error(`Error getting existing transactions ${e}`);
      return [];
    }
  }, [contract, filter, numberOfConfirmations, provider]);

  const waitForExistingTransactions = useCallback(
    (events: Event[], numberOfConfirmations: number) => {
      events.map(async (event) => {
        try {
          const tx = await event.getTransaction();

          await tx.wait(Math.max(numberOfConfirmations, 0));

          removePendingTx(event);
        } catch (e) {
          console.error(`Error waiting for existing transactions ${e}`);
        }
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
