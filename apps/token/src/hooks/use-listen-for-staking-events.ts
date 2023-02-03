import { useMemo } from 'react';
import { usePendingBalancesStore } from './use-pending-balances-manager';
import type { Contract } from 'ethers';
import { useListenForPendingEthEvents } from './use-listen-for-pending-eth-events';
import { prepend0x } from '@vegaprotocol/smart-contracts';

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
        ? contract.filters.Stake_Deposited(null, null, prepend0x(vegaPublicKey))
        : null,
    [contract, vegaPublicKey]
  );
  const removeFilter = useMemo(
    () =>
      vegaPublicKey && contract
        ? contract.filters.Stake_Removed(null, null, prepend0x(vegaPublicKey))
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
